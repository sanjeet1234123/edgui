import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { marketplaceKeys } from '../queries/useMarketplaceQueries'
import type {
  LoadModelRequest,
  UpscaleModelRequest,
} from '@/types/marketplaceType'
import Api from '@/api/marketplaceApi'
import { showNotification } from '@/utils/notification'

export function useUpscaleModelMutation() {
  return useMutation({
    mutationFn: (data: UpscaleModelRequest) => Api.upscaleModel(data),
    onSuccess: () => {
      showNotification('success', 'Model upscaled successfully')
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Failed to upscale model',
        )
      }
    },
  })
}

export function useLoadModelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoadModelRequest) => Api.loadModel(data),
    onSuccess: () => {
      showNotification('success', 'Model loaded successfully')
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.list() })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        showNotification(
          'error',
          error.response?.data?.message || 'Failed to load model',
        )
      }
    },
  })
}
