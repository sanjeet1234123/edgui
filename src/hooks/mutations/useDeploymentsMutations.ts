import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deploymentsKeys } from '../queries/useDeploymentsQueries'
import deploymentsApi from '@/api/deploymentsApi'
import { showNotification } from '@/utils/notification'

export function useDeleteDeploymentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deploymentsApi.deleteDeployment(id),
    onSuccess: () => {
      showNotification('success', 'Deployment deleted successfully')
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.list() })
    },
    onError: () => {
      showNotification('error', 'Failed to delete deployment')
    },
  })
}
