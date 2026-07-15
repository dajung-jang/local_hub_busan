<script setup>
import { computed } from 'vue'
import { CATEGORIES } from '../composables/usePlaces'
import { usePosts } from '../composables/usePosts'
import busanCharacter from '../assets/busan-charactor.png'

const { getRecent } = usePosts()
const recent = computed(() => getRecent(6))

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
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

  <section class="container section">
    <h2 class="section-title">카테고리 둘러보기</h2>
    <div class="category-grid">
      <RouterLink
        v-for="cat in CATEGORIES"
        :key="cat.key"
        :to="`/board/${cat.key}`"
        class="category-card card"
      >
        <span class="category-label">{{ cat.label }}</span>
        <span class="category-go">바로가기 →</span>
      </RouterLink>
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
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--navy-900), var(--navy-700));
  color: var(--white);
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
  color: var(--white);
  font-size: 36px;
  line-height: 1.3;
  margin-bottom: 12px;
}

.hero-desc {
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
  margin: 0;
}

.section {
  padding: 40px 0;
}

.section-title {
  font-size: 20px;
  margin-bottom: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.category-card {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.15s ease;
}

.category-card:hover {
  transform: translateY(-3px);
}

.category-label {
  font-weight: 700;
  font-size: 16px;
  color: var(--navy-900);
}

.category-go {
  font-size: 13px;
  color: var(--teal-500);
  font-weight: 600;
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
  background: rgba(28, 124, 130, 0.1);
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
