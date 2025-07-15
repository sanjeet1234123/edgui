import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clustersKeys } from '../queries/useClustersQueries'
import clustersApi from '@/api/clustersApi'
import { showNotification } from '@/utils/notification'

export function useDeleteClusterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => clustersApi.deleteCluster(id),
    onSuccess: () => {
      showNotification('success', 'Cluster deleted successfully')
      queryClient.invalidateQueries({ queryKey: clustersKeys.list() })
    },
    onError: () => {
      showNotification('error', 'Failed to delete cluster')
    },
  })
}
