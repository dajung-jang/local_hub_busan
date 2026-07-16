<script setup>
import { computed, ref } from 'vue'
import { CATEGORIES } from '../composables/usePlaces'
import { usePosts } from '../composables/usePosts'
import { usePlaceBookmarks } from '../composables/usePlaceBookmarks'
import PlaceModal from './PlaceModal.vue'

const { getBookmarkedPosts } = usePosts()
const { getBookmarkedPlaces } = usePlaceBookmarks()

const activeTab = ref('posts') // 'posts' | 'places'
const bookmarkedPosts = computed(() => getBookmarkedPosts())
const bookmarkedPlacesList = computed(() => getBookmarkedPlaces())

const selectedPlace = ref(null)
const selectedCategoryKey = ref(null)

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

function openModal(place) {
  selectedCategoryKey.value = place.category
  selectedPlace.value = place
}

function closeModal() {
  selectedPlace.value = null
  selectedCategoryKey.value = null
}
</script>

<template>
  <section class="container bookmark-page">
    <p class="breadcrumb">홈 &gt; 북마크</p>
    <h1 class="page-title">북마크 List</h1>

    <div class="tab-row">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'posts' }"
        @click="activeTab = 'posts'"
      >
        게시글 ({{ bookmarkedPosts.length }})
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'places' }"
        @click="activeTab = 'places'"
      >
        장소 ({{ bookmarkedPlacesList.length }})
      </button>
    </div>

    <div v-if="activeTab === 'posts'" class="card list">
      <p v-if="bookmarkedPosts.length === 0" class="empty">북마크한 게시글이 없어요</p>
      <RouterLink
        v-for="post in bookmarkedPosts"
        :key="post.id"
        :to="`/board/${post.category}/${post.id}`"
        class="row"
      >
        <span class="category">{{ categoryLabel(post.category) }}</span>
        <span class="title">{{ post.title }}</span>
        <span class="date">{{ post.created_at?.slice(0, 10) }}</span>
      </RouterLink>
    </div>

    <div v-else class="card list">
      <p v-if="bookmarkedPlacesList.length === 0" class="empty">북마크한 장소가 없어요</p>
      <div
        v-for="place in bookmarkedPlacesList"
        :key="`${place.category}-${place.id}`"
        class="place-row"
        @click="openModal(place)"
      >
        <div class="place-thumb">
          <img v-if="place.image" :src="place.image" :alt="place.title" loading="lazy" />
          <div v-else class="place-thumb-empty">
            <svg viewBox="0 0 48 48" width="18" height="18">
              <rect x="4" y="8" width="40" height="32" rx="4" fill="none" stroke="var(--line)" stroke-width="2"></rect>
              <circle cx="16" cy="18" r="4" fill="var(--line)"></circle>
              <path d="M6 34 L18 22 L26 30 L34 20 L42 34 Z" fill="var(--line)"></path>
            </svg>
          </div>
        </div>
        <div class="place-info">
          <span class="category">{{ categoryLabel(place.category) }}</span>
          <p class="place-name">{{ place.title }}</p>
          <p class="place-addr">{{ place.address || '주소 정보 없음' }}</p>
        </div>
      </div>
    </div>

    <PlaceModal
      v-if="selectedPlace"
      :place="selectedPlace"
      :category-key="selectedCategoryKey"
      :category-label="categoryLabel(selectedCategoryKey)"
      @close="closeModal"
    />
  </section>
</template>

<style scoped>
.bookmark-page {
  padding: 32px 0 60px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 12px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 16px;
}

.tab-row {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--navy-700);
}

.tab-btn.active {
  background: var(--navy-900);
  border-color: var(--navy-900);
  color: var(--white);
}

.list {
  padding: 8px 0;
}

.empty {
  padding: 40px;
  text-align: center;
  color: var(--ink-500);
}

.full-span {
  grid-column: 1 / -1;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}

.row:last-child {
  border-bottom: none;
}

.row:hover {
  background: var(--sand-100);
}

.category {
  font-size: 12px;
  font-weight: 700;
  color: var(--teal-500);
  background: rgba(174, 216, 220, 0.35);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.place-info .category {
  align-self: flex-start;
}

.title {
  flex: 1;
  font-size: 14px;
}

.date {
  font-size: 12px;
  color: var(--ink-500);
}

.place-card:hover {
  transform: translateY(-3px);
}

.place-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}

.place-row:last-child {
  border-bottom: none;
}

.place-row:hover {
  background: var(--sand-100);
}

.place-thumb {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--sand-100);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.place-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.place-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-addr {
  font-size: 12px;
  color: var(--ink-500);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>