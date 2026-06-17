export interface ItemsResource {
  isLoading: boolean
  error: string | null
  data: { id: string; title: string }[],
  pages: number[],
}
