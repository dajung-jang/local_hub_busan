<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import busanCharacter from '../assets/busan-charactor.png'
import { buildContext, formatContextForPrompt, getTopPlaces } from '../composables/useChatContext'
import { askChatbot } from '../services/openai'

const STORAGE_KEY = 'localhub_chat_messages'
const GREETING = { role: 'bot', text: '안녕하세요! 부산 여행 정보가 궁금하신가요?' }

const QUICK_SUGGESTIONS = [
  '부산 관광지 추천해줘',
  '부산 축제 추천해줘',
  '숙박 추천해줘',
  '쇼핑하기 좋은 곳은?',
]

const open = ref(false)
const input = ref('')
const loading = ref(false)
const listRef = ref(null)
const inputRef = ref(null)

const messages = ref(loadMessages())

const showSuggestions = computed(() => !loading.value && messages.value.length <= 1)

function loadMessages() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {
    // 손상된 데이터는 무시하고 인사말로 시작
  }
  return [GREETING]
}

watch(
  messages,
  (val) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

async function toggle() {
  open.value = !open.value
  if (open.value) {
    scrollToBottom()
    await nextTick()
    inputRef.value?.focus()
  }
}

function resetChat() {
  messages.value = [GREETING]
  sessionStorage.removeItem(STORAGE_KEY)
}

async function scrollToBottom() {
  await nextTick()
  if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
}

function toApiHistory() {
  return messages.value.slice(-6).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }))
}

async function sendText(text) {
  if (!text || loading.value) return

  messages.value.push({ role: 'user', text })
  input.value = ''
  loading.value = true
  scrollToBottom()

   try {
    const context = buildContext(text)
    // 데이터 없음(noData)인 쿼리는 로컬에서 안내만 하고 API 호출은 생략
    if (context.noData) {
      messages.value.push({ role: 'bot', text: context.note })
      loading.value = false
      return
    }
    const contextText = formatContextForPrompt(context)
    const history = toApiHistory()
    const intro = await askChatbot(text, contextText, history)
    const places = getTopPlaces(context)
    messages.value.push({ role: 'bot', text: intro, places })
  } catch (err) {
    if (err.message === 'NO_API_KEY') {
      messages.value.push({
        role: 'bot',
        text: '챗봇 API 키가 설정되지 않았어요. .env 파일에 VITE_OPENAI_API_KEY를 추가해주세요.',
      })
    } else if (err.message === 'EMPTY_RESPONSE_LENGTH') {
      messages.value.push({
        role: 'bot',
        text: '답변이 길어서 잘렸어요. 조금 더 짧게 다시 질문해주시겠어요?',
      })
    } else {
      console.error(err)
      messages.value.push({
        role: 'bot',
        text: '죄송해요, 지금은 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.',
      })
    }
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function send() {
  sendText(input.value.trim())
}

function sendSuggestion(text) {
  sendText(text)
}
</script>

<template>
  <button class="fab" @click="toggle" :aria-expanded="open">
    <img v-if="!open" :src="busanCharacter" alt="챗봇 열기" class="fab-avatar" />
    <span v-else class="fab-close">✕</span>
    <span class="fab-label">챗봇</span>
  </button>

  <Transition name="panel">
    <div v-if="open" class="chat-panel card">
      <div class="chat-header">
        <span class="chat-header-title">
          <img :src="busanCharacter" alt="" class="header-avatar" />
          LocalHub 챗봇
        </span>
        <div class="header-actions">
          <button class="icon-btn" title="대화 초기화" @click="resetChat">↺</button>
          <button class="icon-btn" title="닫기" @click="toggle">✕</button>
        </div>
      </div>

      <div class="chat-body" ref="listRef">
        <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
          <p class="msg-text">{{ m.text }}</p>
          <ol v-if="m.places?.length" class="place-list">
            <li v-for="p in m.places" :key="p.id">
              <span class="place-title">{{ p.title }}</span>
              <span v-if="p.address" class="place-address">{{ p.address }}</span>
            </li>
          </ol>
        </div>
        <div v-if="loading" class="msg bot typing-msg">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>

        <div v-if="showSuggestions" class="suggestions">
          <button
            v-for="s in QUICK_SUGGESTIONS"
            :key="s"
            class="suggestion-chip"
            @click="sendSuggestion(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <div class="chat-input-row">
        <input
          ref="inputRef"
          v-model="input"
          type="text"
          placeholder="메시지를 입력하세요"
          :disabled="loading"
          @keyup.enter="send"
        />
        <button class="btn btn-primary" :disabled="loading || !input.trim()" @click="send">
          전송
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--navy-900);
  color: var(--white);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(14, 42, 61, 0.3);
  z-index: 40;
  overflow: hidden;
  padding: 0;
}

.fab-avatar {
  width: 46px;
  height: 46px;
  object-fit: contain;
  object-position: top;
  margin-top: 4px;
}

.fab-close {
  font-size: 20px;
}

.fab-label {
  font-size: 9px;
  margin-top: -2px;
}

.chat-panel {
  position: fixed;
  right: 24px;
  bottom: 92px;
  width: 320px;
  height: 440px;
  display: flex;
  flex-direction: column;
  z-index: 40;
  overflow: hidden;
  transform-origin: bottom right;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.chat-header {
  background: var(--navy-900);
  color: var(--white);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.chat-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-avatar {
  width: 24px;
  height: 24px;
  object-fit: contain;
  object-position: top;
  border-radius: 50%;
  background: var(--white);
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 4px;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--white);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.msg {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1.5;
}

.msg.bot {
  background: var(--sand-100);
  align-self: flex-start;
}

.msg.user {
  background: var(--coral-500);
  color: var(--white);
  align-self: flex-end;
}

.msg-text {
  margin: 0;
}

.place-list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.place-list li {
  font-size: 12px;
}

.place-title {
  font-weight: 600;
}

.place-address {
  display: block;
  color: var(--ink-500);
  font-size: 11px;
}

.typing-msg {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-500);
  opacity: 0.5;
  animation: blink 1.1s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes blink {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.suggestion-chip {
  align-self: flex-start;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--navy-700);
  font-size: 12px;
  text-align: left;
}

.suggestion-chip:hover {
  background: var(--sand-100);
  border-color: var(--teal-500);
}

.chat-input-row {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}

.chat-input-row input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.chat-input-row input:disabled,
.chat-input-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chat-panel {
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
</style>