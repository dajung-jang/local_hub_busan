<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SocialShare from './SocialShare.vue'
import { getCategory } from '../composables/usePlaces'
import { usePosts } from '../composables/usePosts'

const route = useRoute()
const router = useRouter()
const { getById, verifyPassword, remove, isLiked, toggleLike, isBookmarked, toggleBookmark } = usePosts()

const categoryKey = computed(() => route.params.category)
const categoryLabel = computed(() => getCategory(categoryKey.value)?.label || categoryKey.value)
const post = computed(() => getById(route.params.id))

const showModal = ref(false)
const pendingAction = ref(null) // 'edit' | 'delete'
const passwordInput = ref('')
const errorMsg = ref('')

const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

function openModal(action) {
  pendingAction.value = action
  passwordInput.value = ''
  errorMsg.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function confirmPassword() {
  if (!verifyPassword(post.value.id, passwordInput.value)) {
    errorMsg.value = '비밀번호가 일치하지 않습니다'
    return
  }
  if (pendingAction.value === 'edit') {
    router.push(`/board/${categoryKey.value}/edit/${post.value.id}`)
  } else if (pendingAction.value === 'delete') {
    remove(post.value.id, passwordInput.value)
    router.push(`/board/${categoryKey.value}`)
  }
  showModal.value = false
}

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : ''
}
</script>

<template>
  <section class="container detail" v-if="post">
    <p class="breadcrumb">
      홈 &gt; {{ categoryLabel }} 게시판 &gt; 게시글 상세
    </p>

    <div class="card detail-body" :class="{ 'has-image': post.image }">
      <div class="detail-main">
        <h1 class="post-title">{{ post.title }}</h1>
        <p class="post-meta">작성일: {{ formatDate(post.created_at) }}</p>
        <div class="post-content">{{ post.content }}</div>

        <div v-if="post.tags?.length" class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
        </div>

        <div class="interaction-row">
          <button
            class="interact-btn"
            :class="{ active: isLiked(post.id) }"
            @click="toggleLike(post.id)"
          >
            {{ isLiked(post.id) ? '❤️' : '🤍' }} {{ post.likes || 0 }}
          </button>
          <button
            class="interact-btn"
            :class="{ active: isBookmarked(post.id) }"
            @click="toggleBookmark(post.id)"
          >
            {{ isBookmarked(post.id) ? '🔖' : '📑' }} 북마크
          </button>
        </div>

        <div class="post-share">
          <SocialShare
            :title="post.title"
            :description="post.content"
            :image="'/src/assets/busan_charactor.png'"
            :url="currentUrl"
          />
        </div>
      </div>

      <div v-if="post.image" class="detail-image">
        <img :src="post.image" alt="게시글 첨부 이미지" />
      </div>

      <div class="detail-actions">
        <RouterLink :to="`/board/${categoryKey}`" class="btn btn-ghost">목록으로</RouterLink>
        <div class="right-actions">
          <button class="btn btn-ghost" @click="openModal('edit')">수정</button>
          <button class="btn btn-danger" @click="openModal('delete')">삭제</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal card">
        <h3>비밀번호 확인</h3>
        <input
          v-model="passwordInput"
          type="password"
          placeholder="비밀번호 입력"
          class="modal-input"
          @keyup.enter="confirmPassword"
        />
        <p v-if="errorMsg" class="modal-error">{{ errorMsg }}</p>
        <div class="modal-buttons">
          <button class="btn btn-primary" @click="confirmPassword">확인</button>
          <button class="btn btn-ghost" @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </section>

  <section class="container detail" v-else>
    <p class="not-found">게시글을 찾을 수 없습니다.</p>
    <RouterLink :to="`/board/${categoryKey}`" class="btn btn-ghost">목록으로</RouterLink>
  </section>
</template>

<style scoped>
.detail {
  padding: 32px 0 60px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 16px;
}

.detail-body {
  padding: 28px;
}

.detail-body.has-image {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
  align-items: start;
}

.detail-main {
  min-width: 0;
}

.detail-image {
  width: 100%;
  height: 100%;
  min-height: 260px;
  max-height: 480px;
  background: var(--sand-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 720px) {
  .detail-body.has-image {
    grid-template-columns: 1fr;
  }

  .detail-image {
    order: -1;
    max-height: 320px;
  }
}

.post-title {
  font-size: 22px;
  margin-bottom: 6px;
}

.post-meta {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 20px;
}

.post-content {
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink-900);
  white-space: pre-wrap;
  min-height: 120px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--line);
}

.post-share { margin-top: 12px }

.detail-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  grid-column: 1 / -1;
}

.right-actions {
  display: flex;
  gap: 8px;
}

.not-found {
  padding: 60px 0;
  text-align: center;
  color: var(--ink-500);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 42, 61, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: 300px;
  padding: 24px;
}

.modal h3 {
  font-size: 16px;
  margin-bottom: 14px;
}

.modal-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 14px;
  margin-bottom: 8px;
}

.modal-error {
  color: #c94a3a;
  font-size: 12px;
  margin: 0 0 8px;
}

.modal-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.modal-buttons .btn {
  flex: 1;
}

.post-image {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin: 16px 0;
}

.post-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 4px 0 16px;
}

.tag-chip {
  font-size: 12px;
  font-weight: 600;
  color: var(--teal-500);
  background: rgba(174, 216, 220, 0.35);
  padding: 3px 10px;
  border-radius: 999px;
}

.interaction-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.interact-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--white);
  font-size: 13px;
}

.interact-btn.active {
  border-color: var(--coral-500);
  background: rgba(255, 122, 80, 0.08);
}
</style>
