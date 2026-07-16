import festivalsData from '../../docs/data/부산_축제공연행사.json'
// 간단한 색상 팔레트 (보기 편한 색들)
const PALETTE = [
  '#FF9F80',
  '#FFD580',
  '#B8E986',
  '#76D7EA',
  '#A6A6F6',
  '#FFB3E6',
  '#FFDDC1',
  '#C3F0C8',
]

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  const srgb = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function readableTextColor(hex) {
  return luminance(hex) > 0.6 ? '#111827' : '#ffffff'
}

function parseDateFromTimeString(timestr) {
  if (!timestr) return null
  // YYYYMMDDHHmmss -> YYYY-MM-DD
  const d = timestr.slice(0, 8)
  return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`
}

function parseYMD(ymd) {
  if (!ymd) return null
  // YYYYMMDD -> YYYY-MM-DD
  const s = String(ymd)
  if (s.length < 8) return null
  return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
}

function extractDistrict(addr) {
  if (!addr) return '기타'
  // 우선 '구' 또는 '군'을 찾고, 없으면 시 단위로 대체
  let m = addr.match(/([^\s]+구|[^\s]+군)/)
  if (m) return m[0]
  m = addr.match(/([^\s]+시)/)
  return m ? m[0] : '기타'
}

export function useFestivals() {
  const items = (festivalsData && festivalsData.items) || []
  // 먼저 각 항목의 시작일(월 키)을 계산하고 그룹핑
  const prepared = items.map((it) => {
    const start = parseYMD(it.eventstartdate) || parseDateFromTimeString(it.createdtime) || undefined
    const end = parseYMD(it.eventenddate) || undefined
    const monthKey = start ? start.slice(0, 7) : 'none'
    return { raw: it, start, end, monthKey }
  })

  const groups = {}
  prepared.forEach((p) => {
    if (!groups[p.monthKey]) groups[p.monthKey] = []
    groups[p.monthKey].push(p)
  })

  // HSL -> hex 변환
  function hslToHex(h, s, l) {
    // Standard HSL -> RGB conversion
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const hp = h / 60
    const x = c * (1 - Math.abs((hp % 2) - 1))
    let r1 = 0, g1 = 0, b1 = 0
    if (0 <= hp && hp < 1) { r1 = c; g1 = x; b1 = 0 }
    else if (1 <= hp && hp < 2) { r1 = x; g1 = c; b1 = 0 }
    else if (2 <= hp && hp < 3) { r1 = 0; g1 = c; b1 = x }
    else if (3 <= hp && hp < 4) { r1 = 0; g1 = x; b1 = c }
    else if (4 <= hp && hp < 5) { r1 = x; g1 = 0; b1 = c }
    else if (5 <= hp && hp < 6) { r1 = c; g1 = 0; b1 = x }
    const m = l - c / 2
    const r = Math.round((r1 + m) * 255)
    const g = Math.round((g1 + m) * 255)
    const b = Math.round((b1 + m) * 255)
    const toHex = (v) => v.toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // n개의 서로 다른 파스텔 색 생성
  function generateColors(n) {
    const colors = []
    for (let i = 0; i < n; i++) {
      const hue = Math.round((360 * i) / n)
      // 원래 파스텔 톤: 채도 약 70%, 명도 80%
      colors.push(hslToHex(hue, 70, 80))
    }
    return colors
  }

  const events = []
  // 각 그룹별로 고유 색을 결정적(해시 기반)으로 생성해 할당 — 같은 달 내 중복 없음 보장
  function hashString(str) {
    let h = 2166136261 >>> 0
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0
    }
    return h
  }

  Object.keys(groups).forEach((monthKey) => {
    const list = groups[monthKey]
    const used = new Set()
    list.forEach((p) => {
      const it = p.raw
      const seed = hashString(it.contentid || it.title || JSON.stringify(it))
      let color = null
      // 시도하면서 사용되지 않은 색을 찾음 (최대 360 시도)
      for (let attempt = 0; attempt < 360; attempt++) {
        // 이전 동작: 증분 47, 파스텔 톤(h=70,s=70,l=80)
        const hue = (seed + attempt * 47) % 360
        const c = hslToHex(hue, 70, 80)
        if (!used.has(c)) {
          color = c
          used.add(c)
          break
        }
      }
      // 극히 드문 경우(모두 사용) fallback
      if (!color) color = PALETTE[(seed % PALETTE.length)]

      events.push({
        id: it.contentid,
        title: it.title,
        start: p.start,
        end: p.end,
        backgroundColor: color,
        borderColor: color,
        textColor: readableTextColor(color),
        extendedProps: {
          addr1: it.addr1,
          tel: it.tel,
          district: extractDistrict(it.addr1),
          firstimage: it.firstimage || it.firstimage2 || '',
          firstimage2: it.firstimage2 || '',
          mapx: it.mapx,
          mapy: it.mapy,
          eventplace: it.eventplace,
          playtime: it.playtime,
          program: it.program,
          eventhomepage: it.eventhomepage,
          agelimit: it.agelimit,
        },
      })
    })
  })

  const districts = Array.from(new Set(events.map((e) => e.extendedProps.district))).sort()

  return {
    raw: items,
    events,
    districts,
  }
}

export default useFestivals
