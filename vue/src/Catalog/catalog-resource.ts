export interface CatalogResource {
  isLoading: boolean
  error: string | null
  data: { id: string; title: string }[]
}
