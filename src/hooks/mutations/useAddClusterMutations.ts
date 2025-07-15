import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clustersKeys } from '../queries/useClustersQueries'
import type {
  AddClusterRequest,
  AssignPermissionsRequest,
  GCPOnboardRequest,
  ManagedClusterRequest,
  RegisterClusterRequest,
} from '@/types/addClusterType'
import addClusterApi from '@/api/addClusterApi'
import { showNotification } from '@/utils/notification'

export function useUploadClusterFileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddClusterRequest) =>
      addClusterApi.uploadClusterFile(payload),
    onSuccess: () => {
      showNotification('success', 'Cluster file uploaded successfully')
      queryClient.invalidateQueries({ queryKey: clustersKeys.list() })
    },
    onError: () => {
      showNotification('error', 'Failed to upload cluster file')
    },
  })
}

export function useManagedClusterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ManagedClusterRequest) =>
      addClusterApi.managedCluster(payload),
    onSuccess: () => {
      showNotification('success', 'Cluster onboarded successfully')
      queryClient.invalidateQueries({ queryKey: clustersKeys.list() })
    },
    onError: () => {
      showNotification('error', 'Failed to onboard cluster')
    },
  })
}

export function useAssignPermissionsMutation() {
  return useMutation({
    mutationFn: (payload: AssignPermissionsRequest) =>
      addClusterApi.assignPermissions(payload),
    onSuccess: () => {
      showNotification('success', 'Permissions assigned successfully')
    },
    onError: () => {
      showNotification('error', 'Failed to assign permissions')
    },
  })
}

export function useGetAWSInstancesMutation() {
  return useMutation({
    mutationFn: (user_id: number) => addClusterApi.getAWSInstances(user_id),
    onError: () => {
      showNotification('error', 'Failed to get AWS instances')
    },
  })
}

export function useRegisterClusterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterClusterRequest) =>
      addClusterApi.registerCluster(payload),
    onSuccess: () => {
      showNotification('success', 'Account onboarded successfully')
    },
    onError: () => {
      showNotification('error', 'Failed to onboard account')
    },
  })
}

export function useGCPOnboardMutation() {
  return useMutation({
    mutationFn: (payload: GCPOnboardRequest) =>
      addClusterApi.gcpOnboard(payload),
    onSuccess: () => {
      showNotification('success', 'GCP onboarded successfully')
    },
    onError: () => {
      showNotification('error', 'Failed to onboard GCP')
    },
  })
}
