import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/monsters',
    },
    {
      path: '/monsters',
      name: 'monsters',
      component: () => import('@/views/MonstersView.vue'),
    },
    {
      path: '/monsters/:id',
      name: 'monster-detail',
      component: () => import('@/views/MonsterDetailView.vue'),
    },
  ],
})

export default router
