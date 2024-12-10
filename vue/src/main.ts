import { createApp } from 'vue'
import App from './App.vue'
import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import CatalogComponent from './Catalog/CatalogComponent.vue'

const routes: RouteRecordRaw[] = [{ path: '/', component: CatalogComponent }]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
