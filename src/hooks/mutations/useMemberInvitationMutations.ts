import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type {
  MemberLoginRequest,
  MemberLoginResponse,
  MemberRegistrationRequest,
  MemberRegistrationResponse,
  MemberSignupRequest,
  ProjectMemberRegistrationRequest,
  ProjectMemberRegistrationResponse,
} from '@/types/memberInvitationType'
import Api from '@/api/memberInvitationApi'
import useAuthStore from '@/store/authStore'
import { showNotification } from '@/utils/notification'

export function useMemberLoginMutation() {
  return useMutation({
    mutationFn: (data: MemberLoginRequest) => Api.memberLogin(data),
    onSuccess: (data: MemberLoginResponse) => {
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

export function useMemberSignupMutation() {
  return useMutation({
    mutationFn: (data: MemberSignupRequest) => Api.memberSignup(data),
    onSuccess: () => {
      showNotification('success', 'Signup successful')
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

export function useMemberRegistrationMutation() {
  return useMutation({
    mutationFn: (data: MemberRegistrationRequest) =>
      Api.memberRegistration(data),
    onSuccess: (data: MemberRegistrationResponse) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('tokenExpiry', data.expire)
      localStorage.setItem('name', data.name)
      localStorage.setItem('role', data.role_id)
      localStorage.setItem('email', data.email)
      localStorage.setItem('user_id', data.id)
      localStorage.setItem('workspace_id', data.workspace_id)
      localStorage.setItem('workspace_name', data.workspace_name)
      localStorage.setItem('workspace_role', data.workspace_role)

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
      })

      showNotification('success', 'Registered successfully')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Registration failed',
        )
      }
    },
  })
}

export function useProjectMemberRegistrationMutation() {
  return useMutation({
    mutationFn: (data: ProjectMemberRegistrationRequest) =>
      Api.projectMemberRegistration(data),
    onSuccess: (data: ProjectMemberRegistrationResponse) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('tokenExpiry', data.expire)
      localStorage.setItem('name', data.name)
      localStorage.setItem('role', data.role_id)
      localStorage.setItem('email', data.email)
      localStorage.setItem('user_id', data.id)
      localStorage.setItem('workspace_id', data.workspace_id)
      localStorage.setItem('workspace_name', data.workspace_name)
      localStorage.setItem('workspace_role', data.workspace_role)

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
      })

      showNotification('success', 'Project member registered successfully')
    },
    onError: error => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Project member registration failed',
        )
      }
    },
  })
}
