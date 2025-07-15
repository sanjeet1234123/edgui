import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import workspaceApi from '@/api/workspaceApi'
import { showNotification } from '@/utils/notification'
import type { InviteWorkspaceMembersRequest } from '@/types/workspaceType'

export function useInviteWorkspaceMembersMutation() {
  return useMutation({
    mutationFn: (data: InviteWorkspaceMembersRequest) =>
      workspaceApi.inviteWorkspaceMembers(data),
    onSuccess: () => {
      showNotification('success', 'Workspace members invited successfully')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification('error', error.response?.data?.message)
      }
    },
  })
}
