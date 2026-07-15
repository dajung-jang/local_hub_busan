<template>
  <div class="social-share">
    <button class="copy" @click="copyLink" aria-label="링크 복사">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M16 1H5a2 2 0 0 0-2 2v11" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="8" y="6" width="13" height="13" rx="2" stroke-width="1.6"/>
      </svg>
      <span>링크 복사</span>
    </button>

    <button class="native" :class="{unsupported: !canNative}" @click="nativeShare" :disabled="!canNative" aria-label="기기 공유">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 3v13" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 7l4-4 4 4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>기기 공유</span>
    </button>

    <div v-if="msg" class="msg">{{ msg }}</div>
  </div>

  <div v-if="fallbackVisible" class="fallback">
    <label>복사 가능한 링크 (수동 복사):</label>
    <div class="fallback-row">
      <input ref="fallbackInput" class="fallback-input" :value="fallbackValue" readonly />
      <button class="btn" @click="selectFallback">선택</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' // 1. onMounted 추가
const props = defineProps({ title: String, description: String, image: String, url: String })
const msg = ref('')
const fallbackVisible = ref(false)
const fallbackValue = ref('')
const fallbackInput = ref(null)

// 2. 반응형 ref로 변경하고 초기값은 false로 설정
const canNative = ref(false)

onMounted(() => {
  // 3. 브라우저 환경(Client-side)이 되었을 때 Web Share API 지원 여부 판단
  canNative.value = typeof navigator !== 'undefined' && !!navigator.share
})

async function copyLink(){
  const u = props.url || ((typeof window !== 'undefined' && window.location) ? window.location.href : '')
  try{
    await navigator.clipboard.writeText(u)
    msg.value = '링크가 복사되었습니다.'
    fallbackVisible.value = false
    setTimeout(()=> msg.value = '', 2000)
  }catch(e){
    fallbackValue.value = u
    fallbackVisible.value = true
    setTimeout(()=> {
      try{ fallbackInput.value && fallbackInput.value.select() }catch(e){}
    }, 50)
    msg.value = '자동 복사 실패 — 아래 링크를 수동으로 복사하세요.'
  }
}

function nativeShare(){
  if(!canNative.value) return // 4. .value로 접근 수정
  const shareUrl = props.url || (typeof window !== 'undefined' ? window.location.href : '')
  navigator.share({ title: props.title || document.title, text: props.description || '', url: shareUrl })
}

function selectFallback(){
  try{ fallbackInput.value && fallbackInput.value.select() }catch(e){}
}
</script>

<style scoped>
.social-share { display:flex; gap:0.6rem; align-items:center; margin-top:0.8rem }
.social-share { flex-wrap:wrap }
.social-share button { display:inline-flex; gap:0.6rem; align-items:center; padding:0.55rem 0.95rem; border-radius:999px; border:none; cursor:pointer; font-weight:700 }
.social-share button svg { flex-shrink:0 }
.social-share button span { font-size:14px; color: inherit; display:inline-block }
.copy{ background:#eef6ff; color:var(--main-color); border:1px solid rgba(6,60,120,0.06); box-shadow:0 6px 12px rgba(6,60,120,0.06) }
.native{ background:var(--main-color) !important; color:#ffffff !important; box-shadow:0 6px 18px rgba(7,85,140,0.12) !important }
.native span { color: #ffffff !important }
.social-share button { min-width: 96px; justify-content:center }
.copy, .native { text-align:center }
.native.unsupported{ opacity:0.85; cursor:not-allowed; box-shadow:none !important; background:#9fb9d9 !important }
.copy, .copy span { color: var(--main-color) !important }

/* 강제 색상 규칙: 텍스트가 보이지 않는 이슈 해소 */
.copy, .copy span { color: var(--main-color) !important }
.native, .native span { color: #ffffff !important }
.social-share button svg path, .social-share button svg rect { stroke: currentColor }
.msg{ margin-left:0.6rem; color:#2b6cb0 }
.fallback{ margin-top:0.6rem }
.fallback-row{ display:flex; gap:0.6rem; align-items:center }
.fallback{ margin-top:0.6rem; width:100% }
.fallback-row{ width:100%; display:flex; gap:0.6rem; align-items:center }
.fallback-input{ flex:1; padding:0.5rem; border:1px solid #dfe6ee; border-radius:6px }
.fallback .btn{ padding:0.45rem 0.7rem; border-radius:8px; border:none; background:#f0f6ff; cursor:pointer }
.native.unsupported{ opacity:0.6; cursor:not-allowed; box-shadow:none; background:#9fb9d9 }
.native.unsupported span {
  color: #556a85 !important;
}
</style>
