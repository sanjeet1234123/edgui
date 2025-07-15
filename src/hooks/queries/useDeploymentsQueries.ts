import { useSuspenseQuery } from '@tanstack/react-query'
import deploymentsApi from '@/api/deploymentsApi'

export const deploymentsKeys = {
  all: ['deployments'] as const,
  list: () => [...deploymentsKeys.all, 'list'] as const,
}

export const prefetchDeployments = {
  queryKey: deploymentsKeys.list(),
  queryFn: () => deploymentsApi.getDeployments(),
}

export const useDeploymentsQuery = () => {
  return useSuspenseQuery(prefetchDeployments)
}
