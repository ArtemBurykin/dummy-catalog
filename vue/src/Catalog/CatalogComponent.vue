<script setup lang="ts">
import { computed, onWatcherCleanup, ref, shallowRef, watch, type ShallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CatalogResource } from './catalog-resource'
import type { CatalogResponse } from './catalog-response'

const route = useRoute()
const router = useRouter()

const titleFilter = ref('')
const pagesCount = ref(1)
const activePageIdx = ref(1)

const currentPageQuery = computed<string>({
  get() {
    return (route.query.page as string) ?? '1'
  },
  set(page) {
    router.replace({ query: { title: route.query.title, page } })
  },
})

const titleQuery = computed<string>({
  get() {
    return (route.query.title as string) ?? ''
  },
  set(title) {
    router.replace({ query: { title, page: '1' } })
  },
})

const itemsResource: ShallowRef<CatalogResource> = shallowRef({
  isLoading: true,
  error: null,
  data: [],
})

const fetchData = (title: string, page: string) => {
  const url = `/api/items?title=${title}&page=${page}`

  fetch(url)
    .then((res) => {
      return res.json()
    })
    .then((respData: CatalogResponse) => {
      itemsResource.value = {
        isLoading: false,
        error: null,
        data: respData.items,
      }

      pagesCount.value = respData.pages
    })
}

watch(
  [titleQuery, currentPageQuery],
  ([title, page]) => {
    titleFilter.value = title
    activePageIdx.value = +page

    const controller = new AbortController()

    fetchData(title, page)

    onWatcherCleanup(() => {
      controller.abort()
    })
  },
  { immediate: true },
)

const submitFilter = () => {
  titleQuery.value = titleFilter.value
}

const goToPage = (page: number) => {
  currentPageQuery.value = page.toString()
}
</script>

<template>
  <section class="catalog-page">
    <div class="catalog-page__filter filter">
      <label for="title">Title:</label>
      <input type="text" name="title" id="title" v-model="titleFilter" />
      <div @click="submitFilter" class="filter__btn">Search</div>
    </div>

    <div class="catalog-page__list">
      <div v-if="!itemsResource.isLoading">
        <p v-if="!itemsResource.data.length">No items found</p>
        <div class="items-list">
          <div v-for="item in itemsResource.data" :key="item.id" class="items-list__item">
            {{ item.title }}
          </div>
        </div>
        <div class="catalog-page__pagination pagination">
          <div
            class="pagination__page"
            v-for="idx in pagesCount"
            :key="idx"
            @click="goToPage(idx)"
            :class="{ 'pagination__page--active': activePageIdx === idx }"
          >
            {{ idx }}
          </div>
        </div>
      </div>
      <div v-if="itemsResource.isLoading">Loading..</div>
    </div>
  </section>
</template>

<style scoped>
.catalog-page {
  display: flex;
  gap: 20px;
}
.catalog-page__filter {
  border-right: 1px solid gray;
  padding: 20px;
  width: fit-content;
}
.filter__btn {
  margin-top: 10px;
  padding: 7px 15px;
  border: 1px solid gray;
  cursor: pointer;
  display: block;
  width: fit-content;
}
.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.items-list__item {
  width: 100px;
  height: 50px;
  border: 1px solid gray;
  align-content: center;
  text-align: center;
}
.catalog-page__pagination {
  margin-top: 20px;
}
.pagination {
  display: flex;
  gap: 20px;
}
.pagination__page {
  border: 1px solid black;
  cursor: pointer;
  padding: 5px 10px;
}
.pagination__page--active {
  background: lightblue;
}
</style>
