import { useSuspenseQuery } from '@tanstack/react-query'
import marketplaceApi from '@/api/marketplaceApi'

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  list: (category: string) =>
    [...marketplaceKeys.all, 'list', category] as const,
}

export const prefetchModels = (category: string) => ({
  queryKey: marketplaceKeys.list(category),
  queryFn: () => marketplaceApi.getModels(category),
})

export function useModelsQuery(category: string) {
  return useSuspenseQuery(prefetchModels(category))
}
