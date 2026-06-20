import { describe, it, beforeEach, vitest, afterEach, expect } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import PageBtn from '@/app/components/PageBtn';

const mockPush = vitest.fn();

vitest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams({title: 'test'}),
}));

describe('PageBtn', () => {
  const fetchMock = vitest.fn()

  beforeEach(() => {
    window.fetch = fetchMock
  })

  afterEach(() => {
    fetchMock.mockReset()
      vitest.clearAllMocks();
    cleanup();
  })

  it('should show no items label if nothing is received', async () => {
    const component = PageBtn({page: '3'});
    render(component);

    const pageBtn = screen.getByText('3');
    fireEvent.click(pageBtn);
    expect(mockPush).toHaveBeenCalledWith('?title=test&page=3');
  })
})

