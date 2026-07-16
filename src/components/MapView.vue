<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { CATEGORIES, getPlaces } from '../composables/usePlaces'
import PlaceModal from './PlaceModal.vue'

// Vite 번들 환경에서 Leaflet 기본 마커 아이콘 경로가 깨지는 문제 보정
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const BUSAN_CENTER = [35.1796, 129.0756]

const activeCategory = ref('tour')
const mapEl = ref(null)
let map = null
let markerLayer = null

const selectedPlace = ref(null)
const selectedCategoryKey = ref(null)

const places = computed(() =>
  getPlaces(activeCategory.value).filter((p) => p.lat && p.lng)
)

function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

function openModal(place) {
  console.log('마커 클릭됨:', place) // 임시 디버그용
  selectedCategoryKey.value = activeCategory.value
  selectedPlace.value = place
}

function closeModal() {
  selectedPlace.value = null
  selectedCategoryKey.value = null
}

function renderMarkers() {
  if (!map) return
  markerLayer.clearLayers()

  places.value.forEach((p) => {
    const marker = L.marker([p.lat, p.lng])
    // 클릭 시 홈 화면과 동일한 PlaceModal을 띄움 (Leaflet 기본 팝업 대신)
    marker.on('click', () => openModal(p))
    markerLayer.addLayer(marker)
  })

  if (places.value.length > 0) {
    const bounds = L.latLngBounds(places.value.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
  }
}

onMounted(async () => {
  await nextTick()
  map = L.map(mapEl.value).setView(BUSAN_CENTER, 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  renderMarkers()
})

onUnmounted(() => {
  if (map) map.remove()
})

watch(activeCategory, renderMarkers)
</script>

<template>
  <section class="container map-page">
    <p class="breadcrumb">홈 &gt; 지도 시각화</p>

    <div class="filter-tabs">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.key"
        class="filter-tab"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <p class="result-count">{{ places.length }}개 장소 표시 중 · 마커를 클릭하면 상세 정보가 열려요</p>

    <div ref="mapEl" class="map-container card"></div>
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
.map-page {
  padding: 32px 0 60px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 16px;
}

.filter-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.filter-tab {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--navy-700);
}

.filter-tab:hover {
  background: var(--sand-100);
}

.filter-tab.active {
  background: var(--navy-900);
  border-color: var(--navy-900);
  color: var(--white);
}

.result-count {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 12px;
}

.map-container {
  width: 100%;
  height: 560px;
  overflow: hidden;
}

@media (max-width: 640px) {
  .map-container {
    height: 420px;
  }
}
</style>