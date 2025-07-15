import { useMutation } from '@tanstack/react-query'
import playgroundApi from '@/api/playgroundApi'
import type { sendChatMessageRequest } from '@/types/playgroundType'

export function useSendChatMessageMutation() {
  return useMutation({
    mutationFn: (data: sendChatMessageRequest) =>
      playgroundApi.sendChatMessage(data),
  })
}
