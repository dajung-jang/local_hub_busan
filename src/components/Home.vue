<script setup>
import { computed, onMounted, ref } from 'vue'
import { CATEGORIES, getRandomPlaces } from '../composables/usePlaces'
import { usePosts } from '../composables/usePosts'
import busanCharacter from '../assets/busan-charactor.png'
import PlaceModal from './PlaceModal.vue'

const { getRecent } = usePosts()
const recent = computed(() => getRecent(6))

const recommendations = ref({})
const selectedPlace = ref(null)
const selectedCategoryKey = ref(null)

onMounted(() => {
  const result = {}
  CATEGORIES.forEach((cat) => {
    result[cat.key] = getRandomPlaces(cat.key, 5)
  })
  recommendations.value = result
})

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

function openModal(categoryKey, place) {
  selectedCategoryKey.value = categoryKey
  selectedPlace.value = place
}

function closeModal() {
  selectedPlace.value = null
  selectedCategoryKey.value = null
}
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-text">
        <p class="eyebrow">공공데이터 기반 지역 정보 공유 커뮤니티</p>
        <h1>부산, 아는 만큼 보이는 도시</h1>
        <p class="hero-desc">관광지부터 숙박·쇼핑까지, 부산의 생생한 정보를 익명으로 나눠보세요</p>
      </div>
      <img :src="busanCharacter" alt="LocalHub 부산 마스코트" class="hero-character" />
    </div>
  </section>

  <section
    v-for="cat in CATEGORIES"
    :key="cat.key"
    class="container section reco-section"
  >
    <div class="section-header">
      <h2 class="section-title">{{ cat.label }} 추천</h2>
      <RouterLink :to="`/board/${cat.key}`" class="community-link">
        {{ cat.label }} 커뮤니티 바로가기 →
      </RouterLink>
    </div>

    <div class="reco-row">
      <div
        v-for="place in recommendations[cat.key] || []"
        :key="place.id"
        class="reco-card card"
        role="button"
        tabindex="0"
        @click="openModal(cat.key, place)"
        @keyup.enter="openModal(cat.key, place)"
      >
        <div class="reco-image">
          <img v-if="place.image" :src="place.image" :alt="place.title" loading="lazy" />
          <div v-else class="reco-placeholder">
            <svg viewBox="0 0 48 48" width="28" height="28">
              <rect x="4" y="8" width="40" height="32" rx="4" fill="none" stroke="var(--line)" stroke-width="2"></rect>
              <circle cx="16" cy="18" r="4" fill="var(--line)"></circle>
              <path d="M6 34 L18 22 L26 30 L34 20 L42 34 Z" fill="var(--line)"></path>
            </svg>
          </div>
        </div>
        <div class="reco-body">
          <p class="reco-title">{{ place.title }}</p>
          <p class="reco-address">{{ place.address || '주소 정보 없음' }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="container section">
    <h2 class="section-title">최근 게시글</h2>
    <div class="card recent-list">
      <p v-if="recent.length === 0" class="empty">아직 등록된 게시글이 없습니다</p>
      <RouterLink
        v-for="post in recent"
        :key="post.id"
        :to="`/board/${post.category}/${post.id}`"
        class="recent-row"
      >
        <span class="recent-category">{{ categoryLabel(post.category) }}</span>
        <span class="recent-title">{{ post.title }}</span>
        <span class="recent-date">{{ post.created_at?.slice(0, 10) }}</span>
      </RouterLink>
    </div>
  </section>

  <PlaceModal
    v-if="selectedPlace"
    :place="selectedPlace"
    :category-key="selectedCategoryKey"
    :category-label="categoryLabel(selectedCategoryKey)"
    @close="closeModal"
  />
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--sky-light), var(--sky-mid)); /* 기존 var(--navy-900), var(--navy-700) */
  color: var(--header-text); /* 추가 */
  padding: 56px 0 64px;
}

.hero-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.hero-text {
  max-width: 520px;
  padding-bottom: 8px;
}

.hero-character {
  width: 150px;
  height: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.25));
}

@media (max-width: 640px) {
  .hero-inner {
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .hero-text {
    max-width: 100%;
  }

  .hero-character {
    width: 110px;
  }
}

.eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--coral-500);
  margin: 0 0 10px;
}

.hero h1 {
  color: var(--header-text); /* 기존 var(--white) */
  font-size: 36px;
  line-height: 1.3;
  margin-bottom: 12px;
}

.hero-desc {
 color: rgba(18, 59, 66, 0.75); /* 기존 rgba(255, 255, 255, 0.75) */
  font-size: 15px;
  margin: 0;
}

.section {
  padding: 32px 0;
}

.reco-section {
  padding: 20px 0;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: 19px;
}

.community-link {
  font-size: 12px;
  font-weight: 700;
  color: var(--white);
  background: var(--navy-900);
  padding: 6px 14px;
  border-radius: 999px;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.community-link:hover {
  background: var(--coral-500);
}

.reco-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.reco-card {
  overflow: hidden;
  transition: transform 0.15s ease;
  cursor: pointer;
}

.reco-card:hover {
  transform: translateY(-3px);
}

.reco-card:focus-visible {
  outline: 2px solid var(--coral-500);
  outline-offset: 2px;
}

.reco-image {
  width: 100%;
  height: 110px;
  background: var(--sand-100);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.reco-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reco-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.reco-body {
  padding: 10px 12px 12px;
}

.reco-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--navy-900);
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reco-address {
  font-size: 11px;
  color: var(--ink-500);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-list {
  padding: 8px 0;
}

.empty {
  padding: 24px;
  text-align: center;
  color: var(--ink-500);
}

.recent-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}

.recent-row:last-child {
  border-bottom: none;
}

.recent-row:hover {
  background: var(--sand-100);
}

.recent-category {
  font-size: 12px;
  font-weight: 700;
  color: var(--teal-500);
   background: rgba(174, 216, 220, 0.35);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.recent-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-date {
  font-size: 12px;
  color: var(--ink-500);
}
</style>