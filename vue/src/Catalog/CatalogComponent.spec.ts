import { routes } from '@/routes'
import { describe, it, expect, beforeEach, vitest, afterEach } from 'vitest'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { mount, flushPromises } from '@vue/test-utils'
import CatalogComponent from './CatalogComponent.vue'

describe('CatalogComponent', () => {
  let router: Router

  const fetchMock = vitest.fn()

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: routes,
    })

    window.fetch = fetchMock
  })

  afterEach(() => {
    fetchMock.mockReset()
  })

  it('should load data from the server', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [{ id: 1, title: 'test 1' }], pages: 1 }),
      ok: true,
    })

    router.replace({ query: { title: 'test', page: '1' } })
    await router.isReady()

    const wrapper = mount(CatalogComponent, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('Loading..')

    await flushPromises()

    expect(wrapper.html()).toContain('test 1')
  })

  it('should show an error if occurred', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ error: 'an error' }),
      ok: false,
    })

    router.replace({ query: { title: 'test', page: '1' } })
    await router.isReady()

    const wrapper = mount(CatalogComponent, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('Loading..')

    await flushPromises()

    expect(wrapper.html()).toContain('an error')
  })

  it('should show no items label if nothing is received', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [], pages: 1 }),
      ok: true,
    })

    router.replace({ query: { title: 'test', page: '1' } })
    await router.isReady()

    const wrapper = mount(CatalogComponent, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('Loading..')

    await flushPromises()

    expect(wrapper.html()).toContain('No items found')
  })

  it('should navigate to the page', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [{ id: 1, title: 'test 1' }], pages: 2 }),
      ok: true,
    })

    router.replace({ query: { title: 'test', page: '1' } })
    await router.isReady()

    const wrapper = mount(CatalogComponent, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    fetchMock.mockClear()

    await wrapper.findAll('.pagination__page')[1].trigger('click')

    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/items?title=test&page=2')
  })

  it('should apply the title filter', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [{ id: 1, title: 'test 1' }], pages: 2 }),
      ok: true,
    })

    router.replace({ query: { title: 'test', page: '1' } })
    await router.isReady()

    const wrapper = mount(CatalogComponent, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    fetchMock.mockClear()

    await wrapper.find('#title').setValue('te')

    await wrapper.find('.filter__btn').trigger('click')

    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/items?title=te&page=1')
  })
})
