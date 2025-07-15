// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatCardBody from '@/components/playground/modelPlayground/chatCardData/ChatCardBody'

// Mock the CSS module
jest.mock(
  '@/components/playground/modelPlayground/chatCardData/chatCard.module.css',
  () => ({
    messageContainer: 'messageContainer',
    message: 'message',
    userMessage: 'userMessage',
    messageBubble: 'messageBubble',
    userMessageBubble: 'userMessageBubble',
    botMessageBubble: 'botMessageBubble',
  }),
)

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children, gap }) => <div data-gap={gap}>{children}</div>,
  Loader: ({ size, color }) => (
    <div data-size={size} data-color={color}>
      Loading...
    </div>
  ),
  Text: ({ children, size, c }) => (
    <span data-size={size} data-color={c}>
      {children}
    </span>
  ),
}))

describe('ChatCardBody', () => {
  const mockMessages = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
  ]

  it('renders messages correctly', () => {
    render(
      <ChatCardBody
        messages={mockMessages}
        isLoading={false}
        isError={false}
        error={null}
      />,
    )

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    render(
      <ChatCardBody
        messages={mockMessages}
        isLoading={true}
        isError={false}
        error={null}
      />,
    )

    expect(screen.getByText('Generating response...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state correctly', () => {
    const error = new Error('Test error message')
    render(
      <ChatCardBody
        messages={mockMessages}
        isLoading={false}
        isError={true}
        error={error}
      />,
    )

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('applies correct styling for user messages', () => {
    render(
      <ChatCardBody
        messages={[{ role: 'user', content: 'User message' }]}
        isLoading={false}
        isError={false}
        error={null}
      />,
    )

    // Find the message div for the user message
    const messageDiv = screen.getByText('User message').parentElement
    expect(messageDiv).toHaveClass('message')
    expect(messageDiv).toHaveClass('userMessage')
  })

  it('applies correct styling for bot messages', () => {
    render(
      <ChatCardBody
        messages={[{ role: 'assistant', content: 'Bot message' }]}
        isLoading={false}
        isError={false}
        error={null}
      />,
    )

    // Find the message div for the bot message
    const messageDiv = screen.getByText('Bot message').parentElement
    expect(messageDiv).toHaveClass('message')
    expect(messageDiv).not.toHaveClass('userMessage')
  })

  it('renders empty state correctly', () => {
    render(
      <ChatCardBody
        messages={[]}
        isLoading={false}
        isError={false}
        error={null}
      />,
    )

    // The outermost container should have the flex-grow class
    const container = document.querySelector('.flex-grow')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('flex-grow')
  })

  it('handles multiple messages in sequence', () => {
    const multipleMessages = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
      { role: 'user', content: 'Second message' },
      { role: 'assistant', content: 'Second response' },
    ]

    render(
      <ChatCardBody
        messages={multipleMessages}
        isLoading={false}
        isError={false}
        error={null}
      />,
    )

    expect(screen.getByText('First message')).toBeInTheDocument()
    expect(screen.getByText('First response')).toBeInTheDocument()
    expect(screen.getByText('Second message')).toBeInTheDocument()
    expect(screen.getByText('Second response')).toBeInTheDocument()
  })
})
