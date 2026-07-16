import { CATEGORIES, getPlaces } from './usePlaces'
import { usePosts } from './usePosts'

const CATEGORY_KEYWORDS = {
  tour: ['관광지', '관광', '여행지', '가볼만한', '명소'],
  culture: ['문화시설', '박물관', '전시', '미술관', '갤러리'],
  festival: ['축제', '공연', '행사', '페스티벌', '이벤트'],
  course: ['여행코스', '코스', '일정', '루트'],
  sports: ['레포츠', '액티비티', '체험'],
  stay: ['숙박', '숙소', '호텔', '펜션', '게스트하우스', '모텔', '리조트', '잠잘', '잘만한'],
  shopping: ['쇼핑', '시장', '아울렛', '백화점'],
}

const FOOD_KEYWORDS = ['맛집', '음식점', '식당', '먹을']

// 부산 주요 지역명 — 메시지에 포함되면 해당 지역 주소를 우선 필터링
const LOCATION_KEYWORDS = [
  '해운대', '광안리', '광안', '서면', '남포동', '남포',
  '태종대', '송정', '기장', '동래', '연산', '사상', '하단',
  'centum', '센텀', '영도', '감천', '금정', '북구', '수영',
]

function matchCategory(message) {
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => message.includes(kw))) return key
  }
  return null
}

function matchLocation(message) {
  return LOCATION_KEYWORDS.find((loc) => message.includes(loc)) || null
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
  const location = matchLocation(message)

  // 카테고리나 지역명이 전혀 언급되지 않은 일반 대화(인사, 잡담 등)는
  // 장소 데이터를 붙이지 않고 일반 응답만 하도록 함
  if (!categoryKey && !location) {
    return { noData: false, generic: true, category: null, location: null, places: [], posts: [] }
  }

  let places
  if (categoryKey) {
    const all = getPlaces(categoryKey)
    if (location) {
      const matched = all.filter((p) => p.address?.includes(location))
      const rest = all.filter((p) => !p.address?.includes(location))
      places = [...matched, ...rest].slice(0, 8)
    } else {
      places = all.slice(0, 8)
    }
  } else {
    places = CATEGORIES.flatMap((c) => getPlaces(c.key).filter((p) => p.address?.includes(location)))
      .slice(0, 8)
  }

  const { posts } = usePosts()
  const matchedPosts = posts.value
    .filter((p) => p.title.includes(message) || p.content.includes(message))
    .slice(0, 3)

  return { noData: false, category: categoryKey, location, places, posts: matchedPosts }
}

export function formatContextForPrompt(context) {
  if (context.noData) return context.note
   if (context.generic) return '이 질문은 특정 장소 카테고리나 지역과 무관한 일반 대화입니다. 장소 데이터 없이 자연스럽게 답하세요.'

  const placeLines = context.places
    .map((p) => `- [${p.title}] 주소: ${p.address || '정보없음'}`)
    .join('\n')

  const postLines = context.posts.length
    ? context.posts.map((p) => `- (게시글) ${p.title}: ${p.content.slice(0, 60)}`).join('\n')
    : '관련 게시글 없음'

  return `[제공 장소 데이터]\n${placeLines}\n\n[관련 커뮤니티 게시글]\n${postLines}`
}

export function getTopPlaces(context, limit = 3) {
  if (context.noData || context.generic || !context.places?.length) return []
  return context.places.slice(0, limit)
}