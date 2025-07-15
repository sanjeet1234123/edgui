// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatInput from '@/components/playground/serverPlayground/ChatArea/ChatInput'
import { useWebSocketStore } from '@/store/websocketStore'

// Mock the WebSocket store
jest.mock('@/store/websocketStore', () => ({
  useWebSocketStore: jest.fn(),
}))

// Mock the AddFiles component
jest.mock('@/components/playground/serverPlayground/ChatArea/AddFiles', () => ({
  __esModule: true,
  default: () => <div data-testid="add-files">Add Files</div>,
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, disabled, onClick }) => (
    <button data-testid="action-icon" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  Group: ({ children, justify }) => (
    <div data-justify={justify}>{children}</div>
  ),
  Select: ({ value, onChange, disabled, data }) => (
    <select
      data-testid="model-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
    >
      {data.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Textarea: ({ value, onChange, onKeyDown, disabled, placeholder }) => (
    <textarea
      data-testid="chat-input"
      value={value}
      onChange={e => onChange(e)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
    />
  ),
  Tooltip: ({ children, label }) => (
    <div data-testid="tooltip" data-label={label}>
      {children}
    </div>
  ),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconArrowUp: () => <div data-testid="arrow-up">Arrow Up</div>,
  IconChevronDown: () => <div data-testid="chevron-down">Chevron Down</div>,
}))

describe('ChatInput', () => {
  const mockSendMessage = jest.fn()
  const mockIsConnected = true

  beforeEach(() => {
    jest.clearAllMocks()
    useWebSocketStore.mockReturnValue({
      sendMessage: mockSendMessage,
      isConnected: mockIsConnected,
    })
  })

  it('renders the chat input component correctly', () => {
    render(<ChatInput />)

    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
    expect(screen.getByTestId('model-select')).toBeInTheDocument()
    expect(screen.getByTestId('action-icon')).toBeInTheDocument()
    expect(screen.getByTestId('add-files')).toBeInTheDocument()
  })

  it('handles input change correctly', () => {
    render(<ChatInput />)

    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Hello, world!' } })

    expect(input.value).toBe('Hello, world!')
  })

  it('sends message when clicking the send button', () => {
    render(<ChatInput />)

    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('action-icon')

    // First type a message
    fireEvent.change(input, { target: { value: 'Test message' } })

    // Then click send
    fireEvent.click(sendButton)

    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    expect(input.value).toBe('') // Input should be cleared
  })

  it('sends message when pressing Enter without Shift', () => {
    render(<ChatInput />)

    const input = screen.getByTestId('chat-input')

    // Type a message
    fireEvent.change(input, { target: { value: 'Test message' } })

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    expect(input.value).toBe('') // Input should be cleared
  })

  it('does not send message when pressing Shift+Enter', () => {
    render(<ChatInput />)

    const input = screen.getByTestId('chat-input')

    // Type a message
    fireEvent.change(input, { target: { value: 'Test message' } })

    // Press Shift+Enter
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(mockSendMessage).not.toHaveBeenCalled()
    expect(input.value).toBe('Test message') // Input should not be cleared
  })

  it('does not send empty messages', () => {
    render(<ChatInput />)

    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('action-icon')

    // Try to send empty message
    fireEvent.click(sendButton)

    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('handles model selection correctly', () => {
    render(<ChatInput />)

    const select = screen.getByTestId('model-select')
    fireEvent.change(select, { target: { value: 'gpt-4o' } })

    expect(select.value).toBe('gpt-4o')
  })

  it('disables input when WebSocket is disconnected', () => {
    useWebSocketStore.mockReturnValue({
      sendMessage: mockSendMessage,
      isConnected: false,
    })

    render(<ChatInput disabled={true} />)

    const input = screen.getByTestId('chat-input')
    const select = screen.getByTestId('model-select')
    const sendButton = screen.getByTestId('action-icon')

    expect(input).toBeDisabled()
    expect(select).toBeDisabled()
    expect(sendButton).toBeDisabled()
    expect(input.placeholder).toBe('WebSocket disconnected...')
  })

  it('shows correct tooltip based on connection status', () => {
    render(<ChatInput />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-label', 'Send message')

    // Test disconnected state
    useWebSocketStore.mockReturnValue({
      sendMessage: mockSendMessage,
      isConnected: false,
    })

    render(<ChatInput disabled={true} />)

    const disconnectedTooltip = screen.getAllByTestId('tooltip')[1]
    expect(disconnectedTooltip).toHaveAttribute('data-label', 'Disconnected')
  })

  it('handles disabled prop correctly', () => {
    render(<ChatInput disabled={true} />)

    const input = screen.getByTestId('chat-input')
    const select = screen.getByTestId('model-select')
    const sendButton = screen.getByTestId('action-icon')

    expect(input).toBeDisabled()
    expect(select).toBeDisabled()
    expect(sendButton).toBeDisabled()
    expect(input.placeholder).toBe('WebSocket disconnected...')
  })

  it('does not send message when disabled', () => {
    render(<ChatInput disabled={true} />)

    const input = screen.getByTestId('chat-input')
    const sendButton = screen.getByTestId('action-icon')

    // Try to type and send a message
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})
