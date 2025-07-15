import { useQuery } from '@tanstack/react-query'
import playgroundApi from '@/api/playgroundApi'
import type { ModelStatusRequest } from '@/types/playgroundType'

export function useGetModelStatusQuery(data: ModelStatusRequest) {
  return useQuery({
    queryKey: ['modelStatus'],
    queryFn: () => playgroundApi.getModelStatus(data),
    refetchInterval: 1000 * 5, // 5 seconds
  })
}

export function useGetModelVulnerabilityQuery(modelName: string) {
  return useQuery({
    queryKey: ['modelVulnerability'],
    queryFn: () => playgroundApi.getModelVulnerability(modelName),
    enabled: !!modelName,
  })
}
