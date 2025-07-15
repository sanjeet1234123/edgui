import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import projectApi from '@/api/projectApi'
import { showNotification } from '@/utils/notification'

// Invite Project Member
export const useInviteProjectMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => projectApi.inviteProjectMember(data),
    onSuccess: () => {
      showNotification('success', 'Project member invited successfully')
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] })
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Error inviting project member',
        )
      }
    },
  })
}

// Delete Project
export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(projectId),
    onSuccess: () => {
      showNotification('success', 'Project deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Error deleting project',
        )
      }
    },
  })
}
