<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Chatbot from './components/Chatbot.vue'

const route = useRoute()
</script>

<template>
  <header class="site-header">
    <div class="container header-row">
      <RouterLink to="/" class="logo">
        LocalHub <span class="logo-sub">부산</span>
      </RouterLink>
      <nav class="tabs">
        <RouterLink to="/map" class="tab" :class="{ active: route.path === '/map' }">
          🗺️ 지도
        </RouterLink>
        <RouterLink to="/bookmarks" class="tab" :class="{ active: route.path === '/bookmarks' }">
          🔖 북마크
        </RouterLink>
        <RouterLink to="/board/all" class="tab" :class="{ active: route.path.startsWith('/board') }">
          📝 게시글
        </RouterLink>
      </nav>
    </div>
    <svg class="wave" viewBox="0 0 1200 40" preserveAspectRatio="none">
      <path
        d="M0,20 C150,40 350,0 600,20 C850,40 1050,0 1200,20 L1200,40 L0,40 Z"
        fill="var(--sky-light)"
      />
    </svg>
  </header>

  <main>
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>© LocalHub 교육 프로젝트 · 본 화면은 초안 와이어프레임입니다</p>
    </div>
  </footer>

  <Chatbot />
</template>

<style scoped>
.site-header {
  background: var(--sky-light); 
  position: relative;
  padding-bottom: 6px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-top: 16px;
  padding-bottom: 14px;
  flex-wrap: wrap;
}

.logo {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--header-text); /* 기존 var(--white) */
  white-space: nowrap;
}

.logo-sub {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--coral-500);
  margin-left: 6px;
  vertical-align: middle;
}

.tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(18, 59, 66, 0.65); /* 기존 rgba(255, 255, 255, 0.75) */
  white-space: nowrap;
}

.tab:hover {
  color: var(--header-text); /* 기존 var(--white) */
  background: rgba(18, 59, 66, 0.08); /* 기존 rgba(255, 255, 255, 0.08) */
}

.tab.active {
  background: var(--coral-500);
  color: var(--white);
}

.wave {
  display: block;
  width: 100%;
  height: 16px;
}

main {
  min-height: calc(100vh - 220px);
}

.site-footer {
  border-top: 1px solid var(--line);
  padding: 24px 0;
  margin-top: 40px;
  color: var(--ink-500);
  font-size: 13px;
  text-align: center;
}
</style>
