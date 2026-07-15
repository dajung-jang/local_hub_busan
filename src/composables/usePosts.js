import { ref } from 'vue'
import seedPosts from '../../docs/data/posts.json'

// 주의: 별도 백엔드가 없어 비밀번호는 암호화 없이 브라우저(localStorage)에
// 저장·비교됩니다. RFP III-2-나에 명시된 "교육 목적의 의도된 설계"입니다.
const STORAGE_KEY = 'localhub_posts_busan'

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
    return posts.value
      .filter((p) => p.category === category)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
      (p) => p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw)
    )
  }

  function create({ category, title, content, password }) {
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

  function update(id, { title, content, password }) {
    const post = getById(id)
    if (!post) return { ok: false, reason: 'not_found' }
    if (post.password !== password) return { ok: false, reason: 'wrong_password' }
    post.title = title
    post.content = content
    persist()
    return { ok: true }
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
  }
}
