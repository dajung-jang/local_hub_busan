// 부산 권역 TourAPI 4.0 원본 데이터 로딩 및 정규화
// docs/data/SCHEMA.md 기준 필드 매핑
import busanTour from '../../docs/data/부산_관광지.json'
import busanCulture from '../../docs/data/부산_문화시설.json'
import busanFestival from '../../docs/data/부산_축제공연행사.json'
import busanCourse from '../../docs/data/부산_여행코스.json'
import busanSports from '../../docs/data/부산_레포츠.json'
import busanStay from '../../docs/data/부산_숙박.json'
import busanShopping from '../../docs/data/부산_쇼핑.json'

// contentTypeId 참고: 12 관광지 / 14 문화시설 / 15 축제공연행사
// 25 여행코스 / 28 레포츠 / 32 숙박 / 38 쇼핑 / 39 음식점(데이터 미제공)
export const CATEGORIES = [
  { key: 'tour', label: '관광지', data: busanTour },
  { key: 'culture', label: '문화시설', data: busanCulture },
  { key: 'festival', label: '축제·공연', data: busanFestival },
  { key: 'course', label: '여행코스', data: busanCourse },
  { key: 'sports', label: '레포츠', data: busanSports },
  { key: 'stay', label: '숙박', data: busanStay },
  { key: 'shopping', label: '쇼핑', data: busanShopping },
]

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key)
}

export function getPlaces(key) {
  const cat = getCategory(key)
  if (!cat || !cat.data || !cat.data.items) return []
  function parseYMD(ymd) {
    if (!ymd) return null
    const s = String(ymd)
    if (s.length < 8) return null
    return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
  }

  return cat.data.items.map((item) => {
    const base = {
      id: item.contentid,
      title: item.title,
      address: [item.addr1, item.addr2].filter(Boolean).join(' '),
      tel: item.tel,
      image: item.firstimage || item.firstimage2 || '',
      firstimage: item.firstimage || '',
      firstimage2: item.firstimage2 || '',
      lat: item.mapy ? parseFloat(item.mapy) : null,
      lng: item.mapx ? parseFloat(item.mapx) : null,
    }

    if (key === 'festival') {
      return {
        ...base,
        eventstart: parseYMD(item.eventstartdate) || null,
        eventend: parseYMD(item.eventenddate) || null,
        playtime: item.playtime || '',
        eventplace: item.eventplace || '',
        program: item.program || '',
        usetimefestival: item.usetimefestival || '',
      }
    }

    return base
  })
}

export function getPlaceById(key, id) {
  return getPlaces(key).find((p) => String(p.id) === String(id))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getRandomPlaces(key, count = 5) {
  return shuffle(getPlaces(key)).slice(0, count)
}
