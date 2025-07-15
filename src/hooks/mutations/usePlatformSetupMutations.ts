import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type {
  CheckWorkspaceAvailabilityRequest,
  InviteMembersRequest,
  WorkspaceCreationRequest,
} from '@/types/platformSetupType'
import Api from '@/api/platformSetupApi'
import { showNotification } from '@/utils/notification'

export function useCreateWorkspaceMutation() {
  return useMutation({
    mutationFn: (data: WorkspaceCreationRequest) => Api.createWorkspace(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      showNotification('success', 'Workspace created successfully')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Workspace creation failed',
        )
      }
    },
  })
}

export function useCheckWorkspaceAvailabilityMutation() {
  return useMutation({
    mutationFn: (data: CheckWorkspaceAvailabilityRequest) =>
      Api.checkWorkspaceAvailability(data),
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Workspace creation failed',
        )
      }
    },
  })
}

export function useInviteMembersMutation() {
  return useMutation({
    mutationFn: (data: InviteMembersRequest) => Api.inviteMembers(data),
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Invite members failed',
        )
      }
    },
  })
}
