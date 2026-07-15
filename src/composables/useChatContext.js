import { CATEGORIES, getPlaces } from './usePlaces'
import { usePosts } from './usePosts'

const CATEGORY_KEYWORDS = {
  tour: ['관광지', '관광', '여행지', '가볼만한'],
  culture: ['문화시설', '박물관', '전시', '미술관'],
  festival: ['축제', '공연', '행사', '페스티벌', '이벤트'],
  course: ['여행코스', '코스', '일정', '루트'],
  sports: ['레포츠', '액티비티', '체험'],
  stay: ['숙박', '호텔', '펜션', '게스트하우스', '잠잘'],
  shopping: ['쇼핑', '시장', '아울렛', '백화점'],
}

const FOOD_KEYWORDS = ['맛집', '음식점', '식당', '먹을']

function matchCategory(message) {
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => message.includes(kw))) return key
  }
  return null
}

function isFoodQuery(message) {
  return FOOD_KEYWORDS.some((kw) => message.includes(kw))
}

export function buildContext(message) {
  if (isFoodQuery(message)) {
    return {
      noData: true,
      note: '맛집/음식점 데이터는 제공되지 않았습니다. 이 사실을 사용자에게 안내하세요.',
    }
  }

  const categoryKey = matchCategory(message)
  const places = categoryKey
    ? getPlaces(categoryKey).slice(0, 8)
    : CATEGORIES.flatMap((c) => getPlaces(c.key).slice(0, 2)).slice(0, 8)

  const { posts } = usePosts()
  const matchedPosts = posts.value
    .filter((p) => p.title.includes(message) || p.content.includes(message))
    .slice(0, 3)

  return { noData: false, category: categoryKey, places, posts: matchedPosts }
}

export function formatContextForPrompt(context) {
  if (context.noData) return context.note

  const placeLines = context.places
    .map((p) => `- [${p.title}] 주소: ${p.address || '정보없음'}`)
    .join('\n')

  const postLines = context.posts.length
    ? context.posts.map((p) => `- (게시글) ${p.title}: ${p.content.slice(0, 60)}`).join('\n')
    : '관련 게시글 없음'

  return `[제공 장소 데이터]\n${placeLines}\n\n[관련 커뮤니티 게시글]\n${postLines}`
}

export function getTopPlaces(context, limit = 3) {
  if (context.noData || !context.places?.length) return []
  return context.places.slice(0, limit)
}