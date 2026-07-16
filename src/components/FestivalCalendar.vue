<template>
  <div class="festival-calendar">
    <div class="controls">
      <label class="filter-label">권역 필터</label>
      <div class="select-wrap">
        <select class="district-select" v-model="selectedDistrict">
          <option value="All">전체</option>
          <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
    </div>

    <FullCalendar :options="options" />
    <PlaceModal v-if="showModal" :place="modalPlace" categoryKey="festival" categoryLabel="축제/공연" @close="showModal = false" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useFestivals } from '../composables/useFestivals'
import PlaceModal from './PlaceModal.vue'

export default {
  name: 'FestivalCalendar',
  components: { FullCalendar, PlaceModal },
  setup() {
    const { events, districts } = useFestivals()
    const selectedDistrict = ref('All')
    const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin]
    const showModal = ref(false)
    const modalPlace = ref(null)

    const filteredEvents = computed(() => {
      if (selectedDistrict.value === 'All') return events
      return events.filter((e) => e.extendedProps.district === selectedDistrict.value)
    })

    const options = computed(() => ({
      plugins,
      initialView: 'dayGridMonth',
      headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
      events: filteredEvents.value,
      // 고정된 적당한 높이로 화면 꽉참 방지
      height: 650,
      eventClick: (info) => {
        const ev = info.event
        const p = ev.extendedProps || {}
        const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null)
        modalPlace.value = {
          id: ev.id,
          title: ev.title,
          addr1: p.addr1,
          address: p.addr1,
          tel: p.tel,
          firstimage: p.firstimage || p.image || null,
          firstimage2: p.firstimage2 || null,
          lat: p.mapy || p.lat,
          lng: p.mapx || p.lng,
          eventstart: fmt(ev.start) || p.eventstart || null,
          eventend: fmt(ev.end) || p.eventend || null,
          playtime: p.playtime,
          eventplace: p.eventplace,
          program: p.program,
          usetimefestival: p.usetimefestival,
          eventhomepage: p.eventhomepage,
        }
        showModal.value = true
      },
    }))

    return { options, districts, selectedDistrict, showModal, modalPlace }
  },
}
</script>

<style scoped>
.festival-calendar { padding: 12px }
.controls { margin-bottom: 8px }
select { padding: 4px 8px }

.festival-calendar {
  max-width: 1100px;
  margin: 18px auto;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(10,20,30,0.06);
  padding: 16px;
}

.festival-calendar .fc {
  background: #ffffff;
}

.festival-calendar .fc .fc-daygrid-event {
  border-radius: 6px;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-label {
  font-weight: 700;
  color: #334155;
}

.select-wrap {
  position: relative;
}

.district-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 8px 36px 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(16,24,40,0.08);
  background: linear-gradient(180deg,#ffffff,#fbfbfd);
  box-shadow: 0 6px 12px rgba(16,24,40,0.04);
  font-weight: 600;
  color: #0f172a;
}

.select-wrap::after {
  content: '';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-image: linear-gradient(45deg, transparent 50%, #334155 50%), linear-gradient(-45deg, transparent 50%, #334155 50%);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 6px 6px, 6px 6px;
  pointer-events: none;
}
</style>
