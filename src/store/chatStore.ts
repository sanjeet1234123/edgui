import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Message = {
  id: string
  content: string
  isUser: boolean
  timestamp: number
}

type ChatStore = {
  messages: Array<Message>
  addMessage: (content: string, isUser: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    set => ({
      messages: [
        {
          id: 'initial-greeting',
          content: 'How can I help you?',
          isUser: false,
          timestamp: Date.now(),
        },
      ],
      addMessage: (content: string, isUser: boolean) =>
        set(state => ({
          messages: [
            ...state.messages,
            {
              id: `msg-${Date.now()}`,
              content,
              isUser,
              timestamp: Date.now(),
            },
          ],
        })),
      clearMessages: () =>
        set({
          messages: [
            {
              id: 'initial-greeting',
              content: 'How can I help you?',
              isUser: false,
              timestamp: Date.now(),
            },
          ],
        }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
