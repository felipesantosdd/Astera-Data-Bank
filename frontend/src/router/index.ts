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
    {
      path: '/decorations',
      name: 'decorations',
      component: () => import('@/views/DecorationsView.vue'),
    },
    {
      path: '/planner',
      name: 'planner',
      component: () => import('@/views/HuntPlannerView.vue'),
    },
    {
      path: '/equipment',
      name: 'equipment',
      component: () => import('@/views/EquipmentView.vue'),
    },
    {
      path: '/regions',
      name: 'regions',
      component: () => import('@/views/RegionsView.vue'),
    },
    {
      path: '/regions/:id',
      name: 'region-detail',
      component: () => import('@/views/RegionDetailView.vue'),
    },
  ],
})

export default router
