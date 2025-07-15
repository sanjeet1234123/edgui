import { useMutation } from '@tanstack/react-query'
import headerApi from '@/api/headerApi'
import { showNotification } from '@/utils/notification'
import type { UpdateTokenParams, UpdateTokenResponse } from '@/types/headerType'

export const useUpdateTokenMutation = () => {
  return useMutation<UpdateTokenResponse, Error, UpdateTokenParams>({
    mutationFn: (params: UpdateTokenParams) => {
      // Ensure both required parameters are included
      return headerApi.updateToken({
        project_id: params.project_id,
        environment: params.environment,
      })
    },
    onError: (error) => {
      console.error('Token update error:', error)
      showNotification('error', 'Failed to update project')
    },
  })
}
