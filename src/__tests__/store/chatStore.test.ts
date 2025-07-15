// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { useChatStore } from '@/store/chatStore'

describe('useChatStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear()
    useChatStore.setState({
      messages: [
        {
          id: 'initial-greeting',
          content: 'How can I help you?',
          isUser: false,
          timestamp: 0,
        },
      ],
    })
  })

  it('should have initial greeting message on init', () => {
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].id).toBe('initial-greeting')
    expect(state.messages[0].content).toBe('How can I help you?')
    expect(state.messages[0].isUser).toBe(false)
  })

  it('should add a user message', () => {
    useChatStore.getState().addMessage('Hello', true)
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(2)
    expect(state.messages[1].content).toBe('Hello')
    expect(state.messages[1].isUser).toBe(true)
    expect(state.messages[1].id).toMatch(/^msg-/)
  })

  it('should add a bot message', () => {
    useChatStore.getState().addMessage('Hi there!', false)
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(2)
    expect(state.messages[1].content).toBe('Hi there!')
    expect(state.messages[1].isUser).toBe(false)
  })

  it('should clear messages and reset to initial greeting', () => {
    useChatStore.getState().addMessage('Test', true)
    useChatStore.getState().clearMessages()
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].id).toBe('initial-greeting')
    expect(state.messages[0].content).toBe('How can I help you?')
    expect(state.messages[0].isUser).toBe(false)
  })

  it('should persist messages to localStorage', () => {
    useChatStore.getState().addMessage('Persisted message', true)
    const persisted = JSON.parse(localStorage.getItem('chat-storage'))
    expect(persisted.state.messages.length).toBe(2)
    expect(persisted.state.messages[1].content).toBe('Persisted message')
  })
})
