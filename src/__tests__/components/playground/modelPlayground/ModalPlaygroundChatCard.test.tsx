// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModalPlaygroundChatCard from '@/components/playground/modelPlayground/ModalPlaygroundChatCard'

// Mock dependencies
jest.mock('@/hooks/mutations/usePlaygroundMutations', () => ({
  useSendChatMessageMutation: jest.fn(),
}))

jest.mock('@/store/modelStore', () => ({
  useModelStore: jest.fn(),
}))

jest.mock(
  '@/components/playground/modelPlayground/chatCardData/ChatCardHeader',
  () => ({
    __esModule: true,
    default: ({ setModelStatus, modelStatus }) => (
      <div data-testid="chat-card-header">
        <button
          data-testid="toggle-model-status"
          onClick={() => setModelStatus(!modelStatus)}
        >
          Toggle Model Status
        </button>
        <span data-testid="model-status">
          {modelStatus ? 'Active' : 'Inactive'}
        </span>
      </div>
    ),
  }),
)

jest.mock(
  '@/components/playground/modelPlayground/chatCardData/ChatCardBody',
  () => ({
    __esModule: true,
    default: ({ messages, isLoading, isError, error }) => (
      <div data-testid="chat-card-body">
        {messages.map((msg, index) => (
          <div key={index} data-testid={`message-${index}`}>
            {msg.role}: {msg.content}
          </div>
        ))}
        {isLoading && <div data-testid="loading-indicator">Loading...</div>}
        {isError && (
          <div data-testid="error-message">{error?.message || 'Error'}</div>
        )}
      </div>
    ),
  }),
)

jest.mock(
  '@/components/playground/modelPlayground/chatCardData/ChatCardInput',
  () => ({
    __esModule: true,
    default: ({
      message,
      setMessage,
      handleKeyDown,
      handleSendMessage,
      isLoading,
      disabled,
    }) => (
      <div data-testid="chat-card-input">
        <input
          data-testid="message-input"
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          data-testid="send-button"
          onClick={handleSendMessage}
          disabled={isLoading || disabled}
        >
          Send
        </button>
      </div>
    ),
  }),
)

describe('ModalPlaygroundChatCard', () => {
  const mockSliderValues = {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 50,
    output_length: 1000,
  }

  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup model store mock
    require('@/store/modelStore').useModelStore.mockImplementation(selector => {
      const state = {
        currentModel: { model_name: 'test-model' },
        ingressUrl: 'https://api.example.com',
      }
      return selector(state)
    })

    // Setup mutation mock
    require('@/hooks/mutations/usePlaygroundMutations').useSendChatMessageMutation.mockReturnValue(
      {
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      },
    )
  })

  it('renders the component correctly', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    expect(screen.getByTestId('chat-card-header')).toBeInTheDocument()
    expect(screen.getByTestId('chat-card-body')).toBeInTheDocument()
    expect(screen.getByTestId('chat-card-input')).toBeInTheDocument()
  })

  it('starts with model status inactive and send button disabled', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    expect(screen.getByTestId('model-status')).toHaveTextContent('Inactive')
    expect(screen.getByTestId('send-button')).toBeDisabled()
  })

  it('enables send button when model status is active', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    expect(screen.getByTestId('model-status')).toHaveTextContent('Active')
    expect(screen.getByTestId('send-button')).not.toBeDisabled()
  })

  it('updates message input when typing', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'Hello, world!' } })

    expect(input).toHaveValue('Hello, world!')
  })

  it('sends a message when send button is clicked', async () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    // Type a message
    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'Hello, world!' } })

    // Click send button
    const sendButton = screen.getByTestId('send-button')
    fireEvent.click(sendButton)

    // Check that the message is added to the UI
    await waitFor(() => {
      expect(screen.getByTestId('message-0')).toHaveTextContent(
        'user: Hello, world!',
      )
    })

    // Check that the mutation was called with correct arguments
    expect(mockMutate).toHaveBeenCalledWith({
      message: 'Hello, world!',
      model: 'test-model',
      ingress_url: 'https://api.example.com/v1',
      temprature: 0.7,
      top_p: 0.9,
      max_length: 1000,
    })

    // The input should be cleared
    expect(input).toHaveValue('')
  })

  it('sends a message when Enter key is pressed', async () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    // Type a message
    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'Hello from keyboard!' } })

    // Press Enter key
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    // Check that the message is added to the UI
    await waitFor(() => {
      expect(screen.getByTestId('message-0')).toHaveTextContent(
        'user: Hello from keyboard!',
      )
    })

    // Check that the mutation was called with correct arguments
    expect(mockMutate).toHaveBeenCalledWith({
      message: 'Hello from keyboard!',
      model: 'test-model',
      ingress_url: 'https://api.example.com/v1',
      temprature: 0.7,
      top_p: 0.9,
      max_length: 1000,
    })

    // The input should be cleared
    expect(input).toHaveValue('')
  })

  it('does not send message on Enter if model status is inactive', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Type a message, but don't activate model
    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'This should not send' } })

    // Press Enter key
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    // Verify mutation was not called and message wasn't added
    expect(mockMutate).not.toHaveBeenCalled()
    expect(screen.queryByTestId('message-0')).not.toBeInTheDocument()
  })

  it('does not send message if input is empty', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    // Leave input empty
    const input = screen.getByTestId('message-input')

    // Click send button
    const sendButton = screen.getByTestId('send-button')
    fireEvent.click(sendButton)

    // Verify mutation was not called
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('does not send message on Enter+Shift key combo', () => {
    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    // Type a message
    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'With shift key' } })

    // Press Enter+Shift key combo
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true })

    // Verify mutation was not called and message wasn't added
    expect(mockMutate).not.toHaveBeenCalled()
    expect(screen.queryByTestId('message-0')).not.toBeInTheDocument()
  })

  it('handles pending state during message sending', async () => {
    // Mock pending state
    require('@/hooks/mutations/usePlaygroundMutations').useSendChatMessageMutation.mockReturnValue(
      {
        mutate: mockMutate,
        isPending: true,
        isError: false,
        error: null,
      },
    )

    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    // Should show loading indicator in the chat body
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

    // Send button should be disabled during loading
    expect(screen.getByTestId('send-button')).toBeDisabled()
  })

  it('handles error state after message sending fails', async () => {
    const errorMessage = 'Network error occurred'

    // Mock error state
    require('@/hooks/mutations/usePlaygroundMutations').useSendChatMessageMutation.mockReturnValue(
      {
        mutate: mockMutate,
        isPending: false,
        isError: true,
        error: new Error(errorMessage),
      },
    )

    render(<ModalPlaygroundChatCard sliderValues={mockSliderValues} />)

    // Toggle model status to active
    fireEvent.click(screen.getByTestId('toggle-model-status'))

    // Should show error message in the chat body
    expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
  })
})
