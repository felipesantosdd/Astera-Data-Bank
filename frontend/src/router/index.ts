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
    {
      path: '/materials',
      name: 'materials',
      component: () => import('@/views/MaterialsView.vue'),
    },
  ],
})

export default router
