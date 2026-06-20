import { describe, it, beforeEach, vitest, afterEach, expect } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import PageBtn from '@/app/components/PageBtn';

const mockPush = vitest.fn();

vitest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams({ title: 'test' }),
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

  it('should render the component with active flag and redirect if the btn is pushed', async () => {
    const component = PageBtn({ page: '3', isActive: true });
    render(component);

    const pageBtn = screen.getByText('3');
    expect(pageBtn.classList).toContain('pagination__btn--active');
    fireEvent.click(pageBtn);
    expect(mockPush).toHaveBeenCalledWith('?title=test&page=3');
  })

  it('should render the component without active flag', async () => {
    const component = PageBtn({ page: '3', isActive: false });
    render(component);

    const pageBtn = screen.getByText('3');
    expect(pageBtn.classList).not.toContain('pagination__btn--active');
  })
})

