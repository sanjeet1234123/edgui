import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type {
  DeployClusterRequest,
  DeploymentPodStatusRequest,
  DownscaleModelRequest,
} from '@/types/deploymentType'
import deploymentApi from '@/api/deploymentApi'
import { showNotification } from '@/utils/notification'

// pod status mutation
export const useDeploymentPodStatusMutation = () => {
  return useMutation({
    mutationFn: (payload: DeploymentPodStatusRequest) =>
      deploymentApi.handleDeploymentPodStatus(payload),
    onSuccess: () => {
      showNotification('success', 'Pod status updated successfully')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data.message || 'error fetching pod status',
        )
      }
    },
  })
}

// deploy cluster mutation
export const useDeployClusterMutation = () => {
  return useMutation({
    mutationFn: (payload: DeployClusterRequest) =>
      deploymentApi.deployCluster(payload),
    onSuccess: () => {
      showNotification('success', 'Cluster deployed successfully')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data.message || 'error deploying cluster',
        )
      }
    },
  })
}

// downscale model mutation
export const useDownscaleModelMutation = () => {
  return useMutation({
    mutationFn: (payload: DownscaleModelRequest) =>
      deploymentApi.handleDownscaleModel(payload),
    onSuccess: () => {
      showNotification('success', 'Model downscaled successfully')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data.message || 'error downscaling model',
        )
      }
    },
  })
}
