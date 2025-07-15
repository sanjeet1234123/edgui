// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatCardInput from '@/components/playground/modelPlayground/chatCardData/ChatCardInput'

// Mock the CSS module
jest.mock(
  '@/components/playground/modelPlayground/chatCardData/chatCard.module.css',
  () => ({
    searchInput: 'searchInput',
  }),
)

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, disabled, onClick, rightSection }) => (
    <button data-testid="send-button" disabled={disabled} onClick={onClick}>
      {children}
      {rightSection}
    </button>
  ),
  Card: ({ children, padding }) => (
    <div data-testid="card" data-padding={padding}>
      {children}
    </div>
  ),
  Group: ({ children, justify, mt }) => (
    <div data-testid="group" data-justify={justify} data-mt={mt}>
      {children}
    </div>
  ),
  Textarea: ({
    value,
    onChange,
    onKeyDown,
    placeholder,
    autosize,
    minRows,
    maxRows,
    classNames,
  }) => (
    <textarea
      data-testid="chat-input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      data-autosize={autosize}
      data-min-rows={minRows}
      data-max-rows={maxRows}
      className={classNames?.input}
    />
  ),
}))

// Mock the IconSend component
jest.mock('@tabler/icons-react', () => ({
  IconSend: () => <div data-testid="send-icon">Send Icon</div>,
}))

describe('ChatCardInput', () => {
  const mockProps = {
    message: '',
    setMessage: jest.fn(),
    handleKeyDown: jest.fn(),
    handleSendMessage: jest.fn(),
    isLoading: false,
    disabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with all required elements', () => {
    render(<ChatCardInput {...mockProps} />)

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
    expect(screen.getByTestId('group')).toBeInTheDocument()
    expect(screen.getByTestId('send-button')).toBeInTheDocument()
    expect(screen.getByTestId('send-icon')).toBeInTheDocument()
  })

  it('displays the correct placeholder text', () => {
    render(<ChatCardInput {...mockProps} />)

    expect(screen.getByTestId('chat-input')).toHaveAttribute(
      'placeholder',
      'How can I help you?',
    )
  })

  it('handles message input changes', () => {
    render(<ChatCardInput {...mockProps} />)

    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Hello' } })

    expect(mockProps.setMessage).toHaveBeenCalledWith('Hello')
  })

  it('handles key down events', () => {
    render(<ChatCardInput {...mockProps} />)

    const input = screen.getByTestId('chat-input')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockProps.handleKeyDown).toHaveBeenCalled()
  })

  it('handles send button click', () => {
    render(<ChatCardInput {...mockProps} />)

    const sendButton = screen.getByTestId('send-button')
    fireEvent.click(sendButton)

    expect(mockProps.handleSendMessage).toHaveBeenCalled()
  })

  it('disables send button when loading', () => {
    render(<ChatCardInput {...mockProps} isLoading={true} />)

    const sendButton = screen.getByTestId('send-button')
    expect(sendButton).toBeDisabled()
  })

  it('disables send button when disabled prop is true', () => {
    render(<ChatCardInput {...mockProps} disabled={true} />)

    const sendButton = screen.getByTestId('send-button')
    expect(sendButton).toBeDisabled()
  })

  it('displays the current message value', () => {
    render(<ChatCardInput {...mockProps} message="Test message" />)

    const input = screen.getByTestId('chat-input')
    expect(input).toHaveValue('Test message')
  })

  it('applies correct styling to the input', () => {
    render(<ChatCardInput {...mockProps} />)

    const input = screen.getByTestId('chat-input')
    expect(input).toHaveClass('searchInput')
  })
})
