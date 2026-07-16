import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import BoardList from '../components/BoardList.vue'
import PostDetail from '../components/PostDetail.vue'
import PostCreate from '../components/PostCreate.vue'
import MapView from '../components/MapView.vue'
import BookmarksPage from '../components/BookmarksPage.vue'
import FestivalCalendar from '../components/FestivalCalendar.vue'


const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/board', redirect: '/board/all' },
  { path: '/map', name: 'map', component: MapView },
  { path: '/calendar', name: 'calendar', component: FestivalCalendar },
  { path: '/board/:category', name: 'board-list', component: BoardList, props: true },
  { path: '/board/:category/write', name: 'post-write', component: PostCreate, props: true },
  { path: '/board/:category/edit/:id', name: 'post-edit', component: PostCreate, props: true },
  { path: '/board/:category/:id', name: 'post-detail', component: PostDetail, props: true },
 { path: '/bookmarks', name: 'bookmarks', component: BookmarksPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
