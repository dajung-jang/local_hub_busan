<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePosts, BOARD_CATEGORIES } from '../composables/usePosts'

const route = useRoute()
const { search, isBookmarked, toggleBookmark, bookmarkedIds } = usePosts()

const sortOption = ref('latest')
const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'likes', label: '좋아요순' },
  { value: 'bookmarks', label: '북마크순' },
]

const keyword = ref('')
const page = ref(1)
const perPage = 7

const categoryKey = computed(() => route.params.category)
const categoryLabel = computed(
  () => BOARD_CATEGORIES.find((c) => c.key === categoryKey.value)?.label || categoryKey.value
)

const filtered = computed(() => search(categoryKey.value, keyword.value))

const sorted = computed(() => {
  const list = [...filtered.value]
  if (sortOption.value === 'oldest') {
    return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }
  if (sortOption.value === 'likes') {
    return list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }
  if (sortOption.value === 'bookmarks') {
    return list.sort((a, b) => {
      const aBookmarked = isBookmarked(a.id) ? 1 : 0
      const bBookmarked = isBookmarked(b.id) ? 1 : 0
      return bBookmarked - aBookmarked
    })
  }
  // latest (기본값) — search()가 이미 최신순 정렬을 해서 반환하므로 그대로 사용
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)))
const paged = computed(() => {
  const start = (page.value - 1) * perPage
  return sorted.value.slice(start, start + perPage)
})

// 카테고리 이동 또는 검색어 변경 시 1페이지로
watch([categoryKey, keyword, sortOption], () => {
  page.value = 1
})

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : ''
}
</script>

<template>
  <section class="container board">
    <p class="breadcrumb">홈 &gt; {{ categoryLabel }} 게시판</p>

    <div class="sub-tabs">
      <RouterLink
        v-for="cat in BOARD_CATEGORIES"
        :key="cat.key"
        :to="`/board/${cat.key}`"
        class="sub-tab"
        :class="{ active: cat.key === categoryKey }"
      >
        {{ cat.label }}
      </RouterLink>
    </div>

    <div class="board-toolbar">
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="게시글 검색어를 입력하세요"
      />
      <select v-model="sortOption" class="sort-select">
        <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <RouterLink :to="`/board/${categoryKey}/write`" class="btn btn-primary">
        + 글쓰기
      </RouterLink>
    </div>

    <div class="card table-wrap">
      <table class="post-table">
        <thead>
          <tr>
            <th class="col-no">번호</th>
            <th>제목</th>
            <th class="col-likes">❤️</th>
            <th class="col-date">작성일</th>
            <th class="col-bookmark">북마크</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paged.length === 0">
            <td colspan="3" class="empty-cell">
              등록된 게시글이 없습니다. 첫 게시글을 작성해보세요.
            </td>
          </tr>
          <tr
            v-for="post in paged"
            :key="post.id"
            class="post-row"
            @click="$router.push(`/board/${categoryKey}/${post.id}`)"
          >
            <td class="col-no">{{ post.id }}</td>
            <td class="post-title-cell">
              {{ post.title }}
              <span v-for="tag in post.tags?.slice(0, 2)" :key="tag" class="mini-tag">#{{ tag }}</span>
            </td>
            <td class="col-likes">{{ post.likes || 0 }}</td>
            <td class="col-date">{{ formatDate(post.created_at) }}</td>
            <td class="col-bookmark">
              <button
                class="bookmark-toggle"
                :class="{ active: isBookmarked(post.id) }"
                @click.stop="toggleBookmark(post.id)"
              >
                {{ isBookmarked(post.id) ? '🔖' : '📑' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page === 1" @click="page--">&lt;</button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="page-btn"
        :class="{ active: p === page }"
        @click="page = p"
      >
        {{ p }}
      </button>
      <button class="page-btn" :disabled="page === totalPages" @click="page++">&gt;</button>
    </div>
  </section>
</template>

<style scoped>
.board {
  padding: 32px 0 60px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 16px;
}

.board-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-body);
}

.table-wrap {
  overflow: hidden;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
}

.post-table thead {
  background: var(--sand-100);
}

.post-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--ink-500);
  font-weight: 600;
}

.col-no,
.col-date {
  width: 120px;
  text-align: center;
}

.post-row {
  cursor: pointer;
  border-top: 1px solid var(--line);
}

.post-row:hover {
  background: var(--sand-100);
}

.post-row td {
  padding: 12px 16px;
  font-size: 14px;
}

.post-title-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 1px;
}

.col-date {
  text-align: center;
  color: var(--ink-500);
  font-size: 13px;
}

.empty-cell {
  text-align: center;
  padding: 40px 16px;
  color: var(--ink-500);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  background: var(--white);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--navy-900);
  color: var(--white);
  border-color: var(--navy-900);
}

.col-likes,
.col-bookmark {
  width: 70px;
  text-align: center;
}

.mini-tag {
  font-size: 11px;
  color: var(--teal-500);
  margin-left: 6px;
}

.bookmark-toggle {
  background: none;
  border: none;
  font-size: 14px;
}

.bookmark-toggle.active {
  filter: saturate(1.4);
}

.sub-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.sub-tab {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--navy-700);
}

.sub-tab:hover {
  background: var(--sand-100);
}

.sub-tab.active {
  background: var(--navy-900);
  border-color: var(--navy-900);
  color: var(--white);
}

.sort-select {
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font-body);
  background: var(--white);
  color: var(--navy-700);
}
</style>
