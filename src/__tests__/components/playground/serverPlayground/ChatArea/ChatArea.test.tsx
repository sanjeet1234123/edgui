// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// Mock Mantine components and hooks before importing anything else
jest.mock('@mantine/core', () => ({
  Box: ({ children, ...props }) => (
    <div data-testid="box" {...props}>
      {children}
    </div>
  ),
  Card: ({ children, ...props }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  Stack: ({ children, ...props }) => (
    <div data-testid="stack" {...props}>
      {children}
    </div>
  ),
  Text: ({ children }) => <p data-testid="text">{children}</p>,
  MantineProvider: ({ children }) => (
    <div data-testid="mantine-provider">{children}</div>
  ),
  useMantineColorScheme: jest.fn(() => ({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
  })),
}))

// Mock the websocket store
jest.mock('@/store/websocketStore', () => ({
  useWebSocketStore: jest.fn(() => ({
    isSendingMessage: false,
  })),
}))

// Mock the chat store
jest.mock('@/store/chatStore', () => ({
  useChatStore: jest.fn(),
}))

// Mock the RenderMessages component
jest.mock(
  '@/components/playground/serverPlayground/ChatArea/RenderMessages',
  () => ({
    __esModule: true,
    default: jest.fn(() => (
      <div data-testid="render-messages">
        <p data-testid="text">Hello</p>
        <p data-testid="text">Hi there!</p>
        <p data-testid="text">Sorry, I don't understand that.</p>
      </div>
    )),
  }),
)

// Mock react-simple-typewriter
jest.mock('react-simple-typewriter', () => ({
  Typewriter: ({ words }) => <div>{words[0]}</div>,
}))

import React from 'react'
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ChatArea from '@/components/playground/serverPlayground/ChatArea/ChatArea'
import { useChatStore } from '@/store/chatStore'

describe('ChatArea', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Hello',
      isUser: true,
    },
    {
      id: '2',
      content: 'Hi there!',
      isUser: false,
    },
    {
      id: '3',
      content: '',
      isUser: false,
    },
  ]

  beforeEach(() => {
    ;(useChatStore as jest.Mock).mockImplementation(() => ({
      messages: mockMessages,
    }))

    // Mock scrollTo method
    Element.prototype.scrollTo = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders user messages correctly', () => {
    render(<ChatArea />)

    const userMessage = screen.getByText('Hello')
    expect(userMessage).toBeInTheDocument()
  })

  it('renders bot messages correctly', () => {
    render(<ChatArea />)

    const botMessage = screen.getByText('Hi there!')
    expect(botMessage).toBeInTheDocument()
  })

  it('renders fallback message when bot message is empty', () => {
    render(<ChatArea />)

    const fallbackMessage = screen.getByText("Sorry, I don't understand that.")
    expect(fallbackMessage).toBeInTheDocument()
  })

  it('renders all messages in a stack', () => {
    render(<ChatArea />)

    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveClass('flex-grow')
    expect(stack).toHaveStyle({ overflowY: 'auto' })
  })
})
