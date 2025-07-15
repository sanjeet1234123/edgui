import { useQuery } from '@tanstack/react-query'
import deploymentApi from '@/api/deploymentApi'

export const useGetClustersQuery = (hfModelName: string) => {
  return useQuery({
    queryKey: ['deployment', hfModelName],
    queryFn: () => deploymentApi.getClusters(hfModelName),
    enabled: !!hfModelName,
  })
}
