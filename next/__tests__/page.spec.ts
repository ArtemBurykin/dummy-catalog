import { describe, it, beforeEach, vitest, afterEach, expect } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import CatalogPage from '../app/page';

vitest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vitest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe('CatalogPage', () => {
  const fetchMock = vitest.fn()

  beforeEach(() => {
    window.fetch = fetchMock
  })

  afterEach(() => {
    fetchMock.mockReset()
      vitest.clearAllMocks();
    cleanup();
  })

  it('should load data from the server', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [{ id: 1, title: 'test 1' }], pages: 1 }),
      ok: true,
    });

    const resolvedComponent = await CatalogPage({ searchParams: Promise.resolve({ title: 'test', page: '1' }) });
    render(resolvedComponent);

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/items?title=test&page=1');
    expect(screen.queryByText('test 1')).toBeTruthy();
  })

  it('should show an error if occurred', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ error: 'an error' }),
      ok: false,
    });

    const resolvedComponent = await CatalogPage({ searchParams: Promise.resolve({ title: 'test', page: '1' }) });
    render(resolvedComponent);

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/items?title=test&page=1');

    expect(screen.queryByText('test 1')).toBeFalsy();
    expect(screen.queryByText('an error')).toBeTruthy();
  });

  it('should show no items label if nothing is received', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [], pages: 1 }),
      ok: true,
    })

    const resolvedComponent = await CatalogPage({ searchParams: Promise.resolve({ title: 'test', page: '1' }) });
    render(resolvedComponent);

    expect(screen.queryByText('Nothing found...')).toBeTruthy();
  })

  it('should populate the form state with the title filter', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ items: [{ id: 1, title: 'test 1' }], pages: 2 }),
      ok: true,
    });

    const resolvedComponent = await CatalogPage({ searchParams: Promise.resolve({ title: 'test', page: '1' }) });
    render(resolvedComponent);

    const input = screen.getByLabelText('Title:') as HTMLInputElement;
    expect(input.value).toBe('test');
  })
})
