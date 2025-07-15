import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type { LoginRequest, LoginResponse } from '@/types/loginType'
import type { SignupRequest } from '@/types/signupType'
import type {
  ConfirmEmailRequest,
  RequestVerificationCodeRequest,
} from '@/types/confirmEmailType'
import type { ForgetWorkspaceRequest } from '@/types/forgetWorkspaceType'
import type { ForgetPasswordRequest } from '@/types/forgetPasswordType'
import Api from '@/api/authApi'
import useAuthStore from '@/store/authStore'
import { showNotification } from '@/utils/notification'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: LoginRequest) => Api.login(data),
    onSuccess: (data: LoginResponse) => {
      // store token and token expiry in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('tokenExpiry', data.expire)
      localStorage.setItem('name', data.name)
      localStorage.setItem('role', data.role_id)
      localStorage.setItem('email', data.email)
      localStorage.setItem('user_id', data.id)
      localStorage.setItem('workspace_id', data.workspace_id)
      localStorage.setItem('workspace_name', data.workspace_name)
      localStorage.setItem('workspace_role', data.workspace_role)
      localStorage.setItem('phone', data.phone)

      useAuthStore.getState().setAuth({
        token: data.token,
        tokenExpiry: data.expire,
        name: data.name,
        role: data.role_id,
        email: data.email,
        userId: data.id,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name,
        workspaceRole: data.workspace_role,
        phone: data.phone,
      })

      showNotification('success', 'Login successful')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Login failed',
        )
      }
    },
  })
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (data: SignupRequest) => Api.signup(data),
    onSuccess: () => {
      showNotification('success', 'Signup successful')

      sessionStorage.setItem('signup_completed', 'true')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Signup failed',
        )
      }
    },
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => Api.logout(),
    onSuccess: () => {
      // remove all localStorage items
      localStorage.clear()

      useAuthStore.getState().clearAuth()

      showNotification('success', 'Logout successful')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Logout failed',
        )
      }
    },
  })
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (data: ConfirmEmailRequest) => Api.verifyEmail(data),
    onSuccess: data => {
      // store token and token expiry in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('tokenExpiry', data.expire)
      localStorage.setItem('name', data.name)
      localStorage.setItem('role', data.role_id)
      localStorage.setItem('email', data.email)
      localStorage.setItem('user_id', data.id)
      localStorage.setItem('workspace_id', data.workspace_id)
      localStorage.setItem('workspace_name', data.workspace_name)
      localStorage.setItem('workspace_role', data.workspace_role)

      sessionStorage.setItem('verified_email', 'true')

      useAuthStore.getState().setAuth({
        token: data.token,
        tokenExpiry: data.expire,
        name: data.name,
        role: data.role_id,
        email: data.email,
        userId: data.id,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name,
        workspaceRole: data.workspace_role,
        phone: data.phone,
      })

      showNotification('success', 'Email verified successfully')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Email verification failed',
        )
      }
    },
  })
}

export function useRequestVerificationCodeMutation() {
  return useMutation({
    mutationFn: (data: RequestVerificationCodeRequest) =>
      Api.requestVerificationCode(data),
    onSuccess: () => {
      showNotification('success', 'Verification code sent successfully')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Verification code request failed',
        )
      }
    },
  })
}

export function useForgetPasswordMutation() {
  return useMutation({
    mutationFn: (data: ForgetPasswordRequest) => Api.forgetPassword(data),
    onSuccess: () => {
      showNotification('success', 'Password reset successful')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Password reset failed',
        )
      }
    },
  })
}

export function useForgetWorkspaceMutation() {
  return useMutation({
    mutationFn: (data: ForgetWorkspaceRequest) => Api.forgetWorkspace(data),
    onSuccess: () => {
      showNotification(
        'success',
        'Workspace reset instructions sent successfully',
      )
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message ||
            'Workspace reset instructions request failed',
        )
      }
    },
  })
}
