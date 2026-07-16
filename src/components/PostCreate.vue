<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts, BOARD_CATEGORIES } from '../composables/usePosts'
import { fileToResizedDataUrl } from '../utils/image'

const route = useRoute()
const router = useRouter()
const { getById, create, update } = usePosts()

const categoryOptions = BOARD_CATEGORIES.filter((c) => c.key !== 'all')
const routeCategory = computed(() => route.params.category)
const isEdit = computed(() => route.name === 'post-edit')
const existing = computed(() => (isEdit.value ? getById(route.params.id) : null))

const selectedCategory = ref(
  existing.value?.category ||
    (routeCategory.value !== 'all' ? routeCategory.value : categoryOptions[0].key)
)

const title = ref(existing.value?.title || '')
const content = ref(existing.value?.content || '')
const password = ref('')
const errorMsg = ref('')

const tagsInput = ref(existing.value?.tags?.join(', ') || '')
const imageDataUrl = ref(existing.value?.image || null)
const imageError = ref('')

async function handleImageChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    imageError.value = '이미지 파일만 첨부할 수 있어요'
    return
  }
  try {
    imageDataUrl.value = await fileToResizedDataUrl(file)
    imageError.value = ''
  } catch {
    imageError.value = '이미지를 불러오지 못했어요'
  }
}

function removeImage() {
  imageDataUrl.value = null
}

function parseTags() {
  return [
    ...new Set(
      tagsInput.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    ),
  ].slice(0, 5)
}

function submit() {
  errorMsg.value = ''

  if (!title.value.trim() || !content.value.trim()) {
    errorMsg.value = '제목과 내용을 입력해주세요'
    return
  }
  if (!/^\d{4,}$/.test(password.value)) {
    errorMsg.value = '수정용 비밀번호는 숫자 4자리 이상으로 입력해주세요'
    return
  }

  if (isEdit.value) {
    const result = update(existing.value.id, {
      title: title.value,
      content: content.value,
      password: password.value,
      tags: parseTags(),
      image: imageDataUrl.value,
      category: selectedCategory.value,
    })
    if (!result.ok) {
      errorMsg.value =
        result.reason === 'wrong_password' ? '비밀번호가 일치하지 않습니다' : '게시글을 찾을 수 없습니다'
      return
    }
    router.push(`/board/${selectedCategory.value}/${existing.value.id}`)
  } else {
    const post = create({
      category: selectedCategory.value,
      title: title.value,
      content: content.value,
      password: password.value,
      tags: parseTags(),
      image: imageDataUrl.value,
    })
    router.push(`/board/${selectedCategory.value}/${post.id}`)
  }
}

function cancel() {
  router.back()
}
</script>

<template>
  <section class="container write">
    <p class="breadcrumb">
      홈 &gt; 게시판 &gt; {{ isEdit ? '글수정' : '글쓰기' }}
    </p>

    <div class="card write-form">
      <label class="field-label">카테고리</label>
      <select v-model="selectedCategory" class="field-input">
        <option v-for="cat in categoryOptions" :key="cat.key" :value="cat.key">
          {{ cat.label }}
        </option>
      </select>

      <label class="field-label">제목</label>
      <input v-model="title" type="text" class="field-input" placeholder="제목을 입력하세요" />

      <label class="field-label">내용</label>
      <textarea
        v-model="content"
        class="field-textarea"
        rows="10"
        placeholder="내용을 입력하세요"
      ></textarea>

      <label class="field-label">태그 (쉼표로 구분, 최대 5개)</label>
      <input
        v-model="tagsInput"
        type="text"
        class="field-input"
        placeholder="예: 야경, 데이트, 무료입장"
      />

      <label class="field-label">사진 첨부 (선택)</label>
      <input type="file" accept="image/*" class="field-file" @change="handleImageChange" />
      <p v-if="imageError" class="form-error">{{ imageError }}</p>
      <div v-if="imageDataUrl" class="image-preview-wrap">
        <img :src="imageDataUrl" class="image-preview" alt="첨부 이미지 미리보기" />
        <button type="button" class="btn btn-ghost" @click="removeImage">사진 제거</button>
      </div>

      <label class="field-label">수정용 비밀번호</label>
      <input
        v-model="password"
        type="password"
        class="field-input"
        placeholder="숫자 4자리 이상"
      />
      <p class="field-hint">※ 수정·삭제 시 동일하게 입력해야 함</p>

      <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

      <div class="form-actions">
        <button class="btn btn-ghost" @click="cancel">취소</button>
        <button class="btn btn-primary" @click="submit">{{ isEdit ? '수정 완료' : '등록' }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.write {
  padding: 32px 0 60px;
}

.breadcrumb {
  font-size: 13px;
  color: var(--ink-500);
  margin: 0 0 16px;
}

.write-form {
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--navy-900);
  margin-bottom: 6px;
}

.field-input,
.field-textarea {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  font-family: var(--font-body);
  margin-bottom: 18px;
  width: 100%;
  resize: vertical;
  background: var(--white);
}

.field-textarea {
  line-height: 1.6;
}

.field-file {
  margin-bottom: 12px;
  font-size: 13px;
}

.image-preview-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.image-preview {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
}

.field-hint {
  font-size: 12px;
  color: var(--ink-500);
  margin: -12px 0 18px;
}

.form-error {
  color: #c94a3a;
  font-size: 13px;
  margin: -6px 0 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>