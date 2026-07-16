import { ref } from 'vue'
import seedPosts from '../../docs/data/posts.json'
import { CATEGORIES as PLACE_CATEGORIES } from './usePlaces'

// 주의: 별도 백엔드가 없어 비밀번호는 암호화 없이 브라우저(localStorage)에
// 저장·비교됩니다. RFP III-2-나에 명시된 "교육 목적의 의도된 설계"입니다.

export const BOARD_CATEGORIES = [
  { key: 'all', label: '전체' },
  ...PLACE_CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
]

const STORAGE_KEY = 'localhub_posts_busan'
const LIKED_KEY = 'localhub_liked_ids'
const BOOKMARK_KEY = 'localhub_bookmarked_ids'

function loadIdList(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const likedIds = ref(loadIdList(LIKED_KEY))
const bookmarkedIds = ref(loadIdList(BOOKMARK_KEY))

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // 파싱 실패 시 시드 데이터로 재구성
    }
  }
  const seeded = seedPosts.map((p) => ({
    category: p.category || 'tour',
    password: p.password || '0000',
    tags: p.tags || [],
    image: p.image || null,
    likes: p.likes || 0,
    ...p,
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

const posts = ref(loadPosts())

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
}

export function usePosts() {
  function getByCategory(category) {
    const list =
      category === 'all' ? posts.value : posts.value.filter((p) => p.category === category)
    return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  function getById(id) {
    return posts.value.find((p) => String(p.id) === String(id))
  }

  function getRecent(limit = 5) {
    return [...posts.value]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  }

  function search(category, keyword) {
    const list = getByCategory(category)
    if (!keyword) return list
    const kw = keyword.toLowerCase()
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.content.toLowerCase().includes(kw) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(kw))
    )
  }
  
  function create({ category, title, content, password, tags = [], image = null }) {
    const nextId = posts.value.length
      ? Math.max(...posts.value.map((p) => Number(p.id))) + 1
      : 1
    const post = {
      id: nextId,
      region: '부산',
      category,
      title,
      content,
      password,
      tags,
      image,
      likes: 0,
      author: '익명',
      created_at: new Date().toISOString(),
    }
    posts.value.push(post)
    persist()
    return post
  }

  function verifyPassword(id, password) {
    const post = getById(id)
    return !!post && post.password === password
  }

  function update(id, { title, content, password, tags = [], image = null, category }) {
    const post = getById(id)
    if (!post) return { ok: false, reason: 'not_found' }
    if (post.password !== password) return { ok: false, reason: 'wrong_password' }
    post.title = title
    post.content = content
    post.tags = tags
    post.image = image
    if (category) post.category = category
    persist()
    return { ok: true }
  }

  function isLiked(id) {
  return likedIds.value.includes(String(id))
}

function toggleLike(id) {
  const post = getById(id)
  if (!post) return
  const key = String(id)
  if (likedIds.value.includes(key)) {
    likedIds.value = likedIds.value.filter((i) => i !== key)
    post.likes = Math.max(0, (post.likes || 0) - 1)
  } else {
    likedIds.value = [...likedIds.value, key]
    post.likes = (post.likes || 0) + 1
  }
  localStorage.setItem(LIKED_KEY, JSON.stringify(likedIds.value))
  persist()
}

function isBookmarked(id) {
  return bookmarkedIds.value.includes(String(id))
}

function toggleBookmark(id) {
  const key = String(id)
  if (bookmarkedIds.value.includes(key)) {
    bookmarkedIds.value = bookmarkedIds.value.filter((i) => i !== key)
  } else {
    bookmarkedIds.value = [...bookmarkedIds.value, key]
  }
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarkedIds.value))
}

function getBookmarkedPosts() {
  return posts.value.filter((p) => bookmarkedIds.value.includes(String(p.id)))
}

  function remove(id, password) {
    const post = getById(id)
    if (!post) return { ok: false, reason: 'not_found' }
    if (post.password !== password) return { ok: false, reason: 'wrong_password' }
    posts.value = posts.value.filter((p) => String(p.id) !== String(id))
    persist()
    return { ok: true }
  }

  return {
    posts,
    getByCategory,
    getById,
    getRecent,
    search,
    create,
    verifyPassword,
    update,
    remove,
    isLiked,
    toggleLike,
    isBookmarked,
    toggleBookmark,
    getBookmarkedPosts,
  }
}
