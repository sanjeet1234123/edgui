import { useSuspenseQuery } from '@tanstack/react-query'
import clustersApi from '@/api/clustersApi'

export const clustersKeys = {
  all: ['clusters'] as const,
  list: () => [...clustersKeys.all, 'list'] as const,
}

export const prefetchClusters = {
  queryKey: clustersKeys.list(),
  queryFn: () => clustersApi.getClusters(),
}

export const useClustersQuery = () => {
  return useSuspenseQuery(prefetchClusters)
}
