import { useMutation } from '@tanstack/react-query'
import type {
  ChangePasswordRequest,
  UpdateDetailsRequest,
} from '@/types/accountDetailsType'
import userDetailsApi from '@/api/userDetailsApi'
import { showNotification } from '@/utils/notification'

export function useUpdateUserDetailsMutation() {
  return useMutation({
    mutationFn: (data: UpdateDetailsRequest) =>
      userDetailsApi.updateUserDetails(data),
    onSuccess: () => {
      showNotification('success', 'User details updated successfully')
    },
    onError: () => {
      showNotification('error', 'Failed to update user details')
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      userDetailsApi.changePassword(data),
    onSuccess: () => {
      showNotification('success', 'Password changed successfully')
    },
    onError: () => {
      showNotification('error', 'Failed to change password')
    },
  })
}
