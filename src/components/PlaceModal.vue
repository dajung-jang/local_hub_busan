<script setup>
import { usePlaceBookmarks } from '../composables/usePlaceBookmarks'

const { isBookmarked, toggleBookmark } = usePlaceBookmarks()

const props = defineProps({
  place: { type: Object, required: true },
  categoryKey: { type: String, required: true },
  categoryLabel: { type: String, required: true },
})

const emit = defineEmits(['close'])

// 단일 이미지 사용: 대표 이미지 하나만 로드
function mainImageFor(p) {
  if (!p) return null
  return p.firstimage || p.image || p.firstimage2 || null
}

function mapSearchUrl(place) {
  if (place.lat && place.lng) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(place.title)},${place.lat},${place.lng}`
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(place.title)}`
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal card">
      <button class="modal-close" @click="emit('close')">✕</button>
      <div class="modal-image">
        <img v-if="mainImageFor(place)" :src="mainImageFor(place)" :alt="place.title" />
        <div v-else class="modal-placeholder">
          <svg viewBox="0 0 48 48" width="36" height="36">
            <rect x="4" y="8" width="40" height="32" rx="4" fill="none" stroke="var(--line)" stroke-width="2"></rect>
            <circle cx="16" cy="18" r="4" fill="var(--line)"></circle>
            <path d="M6 34 L18 22 L26 30 L34 20 L42 34 Z" fill="var(--line)"></path>
          </svg>
        </div>
      </div>

      <div class="modal-body">
        <span class="modal-category">{{ categoryLabel }}</span>
        <h3 class="modal-title">{{ place.title }}</h3>

        <p class="modal-row" v-if="place.addr1 || place.address">
          <span class="modal-icon">📍</span>{{ place.addr1 || place.address }}
        </p>
        <p class="modal-row" v-if="place.tel">
          <span class="modal-icon">☎</span>{{ place.tel }}
        </p>

        <p class="modal-row" v-if="place.eventstart || place.eventend">
          <span class="modal-icon">📅</span>{{ place.eventstart || '-' }} — {{ place.eventend || '-' }}
        </p>

        <p class="modal-row" v-if="place.playtime">
          <span class="modal-icon">⏰</span>{{ place.playtime }}
        </p>

        <p class="modal-row" v-if="place.eventplace">
          <span class="modal-icon">📌</span>{{ place.eventplace }}
        </p>

          <div class="modal-row" v-if="place.program">
            <strong>프로그램:</strong>
            <div class="program-content">{{ place.program }}</div>
          </div>

        <p class="modal-row" v-if="place.usetimefestival">
          <span class="modal-icon">💰</span>{{ place.usetimefestival }}
        </p>

        <div class="modal-actions">
          <button
            class="btn btn-ghost bookmark-btn"
            :class="{ active: isBookmarked(categoryKey, place.id) }"
            @click="toggleBookmark(categoryKey, place.id)"
          >
            {{ isBookmarked(categoryKey, place.id) ? '🔖 북마크됨' : '📑 북마크' }}
          </button>
          <a v-if="place.lat && place.lng" :href="mapSearchUrl(place)" target="_blank" rel="noopener" class="btn btn-ghost">지도에서 보기</a>
        </div>
        <RouterLink :to="`/board/${categoryKey}/write`" class="btn btn-primary full-width" @click="emit('close')">커뮤니티에 후기 남기기</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 42, 61, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(14, 42, 61, 0.55);
  color: var(--white);
  font-size: 13px;
  z-index: 2;
}

.modal-image {
  width: 100%;
  height: 200px;
  background: var(--sand-100);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-image .img-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: rgba(0,0,0,0.35);
  color: #fff;
  font-size: 20px;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 3;
  cursor: pointer;
  transition: background-color 120ms ease, transform 120ms ease;
}

.modal-image .img-nav.left { left: 10px }
.modal-image .img-nav.right { right: 10px }

.modal-image .img-nav:hover {
  background: rgba(0,0,0,0.6);
  transform: translateY(-50%) scale(1.05);
}

.modal-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.modal-category {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--teal-500);
  background: rgba(174, 216, 220, 0.35);
  padding: 3px 8px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.modal-title {
  font-size: 18px;
  margin-bottom: 12px;
}

.modal-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 6px;
  line-height: 1.5;
}

.program-content {
  margin-top: 6px;
  white-space: pre-wrap;
  line-height: 1.4;
  max-height: calc(1.4em * 6); /* 약 6줄 */
  overflow: auto;
  padding-right: 6px;
}

.modal-icon {
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions .btn {
  flex: 1;
  font-size: 13px;
}

.bookmark-btn.active {
  border-color: var(--coral-500);
  background: rgba(255, 122, 80, 0.08);
  color: var(--coral-600);
}

.full-width {
  width: 100%;
  margin-top: 8px;
}
</style>