// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock moment
jest.mock('moment', () => {
  const mockMoment = jest.fn(() => ({
    format: jest.fn(() => 'Jan 1, 12:00 pm'),
  }))
  mockMoment.format = jest.fn(() => 'Jan 1, 12:00 pm')
  return mockMoment
})

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children, components }) {
    if (components?.table) {
      return (
        <div data-testid="react-markdown">
          <div data-testid="markdown-table">{children}</div>
        </div>
      )
    }
    return <div data-testid="react-markdown">{children}</div>
  }
})

// Mock remark-gfm and rehype-raw
jest.mock('remark-gfm', () => jest.fn())
jest.mock('rehype-raw', () => jest.fn())

// Mock the chat store
jest.mock('@/store/chatStore', () => ({
  useChatStore: jest.fn(),
}))

// Mock utils
jest.mock('@/utils/commonFunction', () => ({
  cleanContent: jest.fn(content => content),
}))

// Mock the lazy-loaded CodeHighlightMarkdown component
jest.mock(
  '@/components/playground/serverPlayground/ChatArea/CodeHighlightMarkdown',
  () => ({
    __esModule: true,
    default: ({ content, components }) => (
      <div data-testid="code-highlight-markdown">{content}</div>
    ),
  }),
)

// Mock CSS modules
jest.mock(
  '@/components/playground/serverPlayground/ChatArea/chatArea.module.css',
  () => ({
    chatAreaUserMessage: 'chatAreaUserMessage',
    chatAreaBotMessage: 'chatAreaBotMessage',
  }),
)

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Box: ({ children, className, style, ...props }) => (
    <div data-testid="box" className={className} style={style} {...props}>
      {children}
    </div>
  ),
  Card: ({ children, p, shadow, radius, className, ...props }) => (
    <div
      data-testid="card"
      className={className}
      data-padding={p}
      data-shadow={shadow}
      data-radius={radius}
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, fz, c, ...props }) => (
    <span data-testid="text" data-size={fz} data-color={c} {...props}>
      {children}
    </span>
  ),
  Flex: ({ children, justify, mt, ...props }) => (
    <div data-testid="flex" data-justify={justify} data-mt={mt} {...props}>
      {children}
    </div>
  ),
  ScrollArea: ({ children, ...props }) => (
    <div data-testid="scroll-area" {...props}>
      {children}
    </div>
  ),
  Table: Object.assign(
    ({
      children,
      striped,
      highlightOnHover,
      withTableBorder,
      withColumnBorders,
      style,
      ...props
    }) => (
      <table
        data-testid="table"
        data-striped={striped}
        data-highlight-on-hover={highlightOnHover}
        data-with-table-border={withTableBorder}
        data-with-column-borders={withColumnBorders}
        style={style}
        {...props}
      >
        {children}
      </table>
    ),
    {
      Td: ({ children, style, ...props }) => (
        <td data-testid="table-td" style={style} {...props}>
          {children}
        </td>
      ),
      Th: ({ children, style, ...props }) => (
        <th data-testid="table-th" style={style} {...props}>
          {children}
        </th>
      ),
    },
  ),
  Loader: ({ size, ...props }) => (
    <div data-testid="loader" data-size={size} {...props}>
      Loading...
    </div>
  ),
  useMantineColorScheme: jest.fn(() => ({
    colorScheme: 'light',
  })),
}))

// Mock React.lazy
const originalLazy = React.lazy
beforeEach(() => {
  React.lazy = jest.fn(factory => {
    const Component = ({ content, components }) => (
      <div data-testid="code-highlight-markdown">{content}</div>
    )
    Component.displayName = 'MockCodeHighlightMarkdown'
    return Component
  })
})

afterEach(() => {
  React.lazy = originalLazy
  jest.clearAllMocks()
})

// Import the component after mocks
import RenderMessages from '@/components/playground/serverPlayground/ChatArea/RenderMessages'
import { useChatStore } from '@/store/chatStore'
import { useMantineColorScheme } from '@mantine/core'
import { cleanContent } from '@/utils/commonFunction'

describe('RenderMessages Component', () => {
  const mockUseChatStore = useChatStore as jest.Mock
  const mockUseMantineColorScheme = useMantineColorScheme as jest.Mock
  const mockCleanContent = cleanContent as jest.Mock

  beforeEach(() => {
    mockUseMantineColorScheme.mockReturnValue({
      colorScheme: 'light',
    })
    mockCleanContent.mockImplementation(content => content)
  })

  describe('Empty Messages', () => {
    it('renders empty array when no messages', () => {
      mockUseChatStore.mockReturnValue({
        messages: [],
      })

      const { container } = render(<RenderMessages />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('User Messages', () => {
    it('renders user message correctly', () => {
      const userMessage = {
        id: 'user-1',
        content: 'Hello, how are you?',
        isUser: true,
        timestamp: 1640995200000, // Jan 1, 2022
      }

      mockUseChatStore.mockReturnValue({
        messages: [userMessage],
      })

      render(<RenderMessages />)

      expect(screen.getByTestId('box')).toBeInTheDocument()
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
      expect(screen.getByText('Jan 1, 12:00 pm')).toBeInTheDocument()
    })

    it('applies correct styling to user message card', () => {
      const userMessage = {
        id: 'user-1',
        content: 'Hello',
        isUser: true,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [userMessage],
      })

      render(<RenderMessages />)

      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-padding', '8px 16px')
      expect(card).toHaveAttribute('data-shadow', '0')
      expect(card).toHaveAttribute('data-radius', 'xl')
      expect(card).toHaveClass('chatAreaUserMessage')
    })

    it('displays user message timestamp correctly', () => {
      const userMessage = {
        id: 'user-1',
        content: 'Hello',
        isUser: true,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [userMessage],
      })

      render(<RenderMessages />)

      const timestampText = screen.getByText('Jan 1, 12:00 pm')
      expect(timestampText).toHaveAttribute('data-size', 'var(--size-xs)')
      expect(timestampText).toHaveAttribute('data-color', 'var(--clr-black)')
    })
  })

  describe('Bot Messages', () => {
    it('renders bot message correctly', () => {
      const botMessage = {
        id: 'bot-1',
        content: 'I am doing well, thank you!',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument()
      expect(
        screen.getByText('I am doing well, thank you!'),
      ).toBeInTheDocument()
      expect(screen.getByText('Jan 1, 12:00 pm')).toBeInTheDocument()
    })

    it('handles bot message with empty content', () => {
      const botMessage = {
        id: 'bot-1',
        content: '',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      expect(mockCleanContent).toHaveBeenCalledWith(
        "Sorry, I don't understand that.",
      )
    })

    it('handles bot message with null content', () => {
      const botMessage = {
        id: 'bot-1',
        content: null,
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      expect(mockCleanContent).toHaveBeenCalledWith(
        "Sorry, I don't understand that.",
      )
    })

    it('applies correct styling to bot message container', () => {
      const botMessage = {
        id: 'bot-1',
        content: 'Bot response',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      const messageBox = screen.getByTestId('box')
      expect(messageBox).toHaveStyle({ padding: '4px 0' })
    })

    it('does not show timestamp for initial greeting message', () => {
      const initialMessage = {
        id: 'initial-greeting',
        content: 'How can I help you?',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [initialMessage],
      })

      render(<RenderMessages />)

      // Should not find timestamp flex container for initial greeting
      const flexElements = screen.queryAllByTestId('flex')
      expect(flexElements).toHaveLength(0)
    })

    it('shows timestamp for non-initial bot messages', () => {
      const botMessage = {
        id: 'bot-response-1',
        content: 'Here is my response',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      const timestampFlex = screen.getByTestId('flex')
      expect(timestampFlex).toHaveAttribute('data-mt', 'xs')
      expect(screen.getByText('Jan 1, 12:00 pm')).toBeInTheDocument()
    })
  })

  describe('Code Block Detection and Rendering', () => {
    it('detects code blocks with triple backticks', () => {
      const messageWithCode = {
        id: 'code-1',
        content: 'Here is some code:\n```javascript\nconsole.log("hello")\n```',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithCode],
      })

      render(<RenderMessages />)

      // When code blocks are detected, it should show the loader as fallback for Suspense
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('detects code blocks with <code> tags', () => {
      const messageWithCode = {
        id: 'code-1',
        content: 'Here is <code>inline code</code>',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithCode],
      })

      render(<RenderMessages />)

      // Should render the code highlight component when code blocks are detected
      expect(screen.getByTestId('code-highlight-markdown')).toBeInTheDocument()
    })

    it('detects code blocks with <pre> tags', () => {
      const messageWithCode = {
        id: 'code-1',
        content: 'Here is <pre>preformatted code</pre>',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithCode],
      })

      render(<RenderMessages />)

      // Should render the code highlight component when code blocks are detected
      expect(screen.getByTestId('code-highlight-markdown')).toBeInTheDocument()
    })

    it('uses regular markdown when no code blocks detected', () => {
      const regularMessage = {
        id: 'regular-1',
        content: 'This is just regular text with no code',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [regularMessage],
      })

      render(<RenderMessages />)

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument()
      expect(
        screen.queryByTestId('code-highlight-markdown'),
      ).not.toBeInTheDocument()
    })

    it('handles mixed messages - some with code, some without', () => {
      const messages = [
        {
          id: 'regular-1',
          content: 'Regular message',
          isUser: false,
          timestamp: 1640995200000,
        },
        {
          id: 'code-1',
          content: 'Code: ```js\nconsole.log()\n```',
          isUser: false,
          timestamp: 1640995200000,
        },
      ]

      mockUseChatStore.mockReturnValue({
        messages,
      })

      render(<RenderMessages />)

      // Should use code highlighting for all messages when any has code
      expect(screen.getAllByTestId('code-highlight-markdown')).toHaveLength(2)
    })
  })

  describe('Color Scheme Handling', () => {
    it('applies light theme data attribute', () => {
      mockUseMantineColorScheme.mockReturnValue({
        colorScheme: 'light',
      })

      const botMessage = {
        id: 'bot-1',
        content: 'Test message',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      const { container } = render(<RenderMessages />)
      const markdownDiv = container.querySelector('[data-theme="light"]')
      expect(markdownDiv).toBeInTheDocument()
    })

    it('applies dark theme data attribute', () => {
      mockUseMantineColorScheme.mockReturnValue({
        colorScheme: 'dark',
      })

      const botMessage = {
        id: 'bot-1',
        content: 'Test message',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      const { container } = render(<RenderMessages />)
      const markdownDiv = container.querySelector('[data-theme="dark"]')
      expect(markdownDiv).toBeInTheDocument()
    })
  })

  describe('Custom Markdown Components', () => {
    it('renders custom table component', () => {
      const messageWithTable = {
        id: 'table-1',
        content:
          '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithTable],
      })

      render(<RenderMessages />)

      expect(screen.getByTestId('react-markdown')).toBeInTheDocument()
    })

    it('custom table component renders with correct properties', () => {
      const messageWithTable = {
        id: 'table-1',
        content: '| Header |\n|--------|\n| Cell   |',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithTable],
      })

      render(<RenderMessages />)

      // The CustomTable component should be rendered via react-markdown
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument()
    })
  })

  describe('Multiple Messages', () => {
    it('renders multiple messages of different types', () => {
      const messages = [
        {
          id: 'user-1',
          content: 'Hello',
          isUser: true,
          timestamp: 1640995200000,
        },
        {
          id: 'bot-1',
          content: 'Hi there!',
          isUser: false,
          timestamp: 1640995260000,
        },
        {
          id: 'user-2',
          content: 'How are you?',
          isUser: true,
          timestamp: 1640995320000,
        },
      ]

      mockUseChatStore.mockReturnValue({
        messages,
      })

      render(<RenderMessages />)

      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi there!')).toBeInTheDocument()
      expect(screen.getByText('How are you?')).toBeInTheDocument()
      expect(screen.getAllByText('Jan 1, 12:00 pm')).toHaveLength(3)
    })
  })

  describe('Memoization', () => {
    it('memoizes messages correctly', () => {
      const messages = [
        {
          id: 'test-1',
          content: 'Test message',
          isUser: true,
          timestamp: 1640995200000,
        },
      ]

      mockUseChatStore.mockReturnValue({ messages })

      const { rerender } = render(<RenderMessages />)
      expect(screen.getByText('Test message')).toBeInTheDocument()

      // Re-render with same data
      rerender(<RenderMessages />)
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('updates when messages change', () => {
      const initialMessages = [
        {
          id: 'test-1',
          content: 'Initial message',
          isUser: true,
          timestamp: 1640995200000,
        },
      ]

      mockUseChatStore.mockReturnValue({ messages: initialMessages })

      const { rerender } = render(<RenderMessages />)
      expect(screen.getByText('Initial message')).toBeInTheDocument()

      // Update messages
      const updatedMessages = [
        {
          id: 'test-2',
          content: 'Updated message',
          isUser: true,
          timestamp: 1640995200000,
        },
      ]

      mockUseChatStore.mockReturnValue({ messages: updatedMessages })
      rerender(<RenderMessages />)

      expect(screen.queryByText('Initial message')).not.toBeInTheDocument()
      expect(screen.getByText('Updated message')).toBeInTheDocument()
    })
  })

  describe('Suspense and Lazy Loading', () => {
    it('shows loader while code highlight component loads', async () => {
      // Mock Suspense to show fallback
      const OriginalSuspense = React.Suspense
      React.Suspense = ({ fallback, children }) => fallback

      const messageWithCode = {
        id: 'code-1',
        content: '```javascript\nconsole.log("test")\n```',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithCode],
      })

      render(<RenderMessages />)

      expect(screen.getByTestId('loader')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Restore original Suspense
      React.Suspense = OriginalSuspense
    })
  })

  describe('Edge Cases', () => {
    it('handles message with undefined content', () => {
      const messageWithUndefinedContent = {
        id: 'undefined-1',
        content: undefined,
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithUndefinedContent],
      })

      render(<RenderMessages />)

      expect(mockCleanContent).toHaveBeenCalledWith(
        "Sorry, I don't understand that.",
      )
    })

    it('handles message without timestamp', () => {
      const messageWithoutTimestamp = {
        id: 'no-timestamp-1',
        content: 'Message without timestamp',
        isUser: true,
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithoutTimestamp],
      })

      render(<RenderMessages />)

      expect(screen.getByText('Message without timestamp')).toBeInTheDocument()
    })

    it('handles message with invalid timestamp', () => {
      const messageWithInvalidTimestamp = {
        id: 'invalid-timestamp-1',
        content: 'Message with invalid timestamp',
        isUser: true,
        timestamp: 'invalid',
      }

      mockUseChatStore.mockReturnValue({
        messages: [messageWithInvalidTimestamp],
      })

      render(<RenderMessages />)

      expect(
        screen.getByText('Message with invalid timestamp'),
      ).toBeInTheDocument()
      expect(screen.getByText('Jan 1, 12:00 pm')).toBeInTheDocument()
    })
  })

  describe('cleanContent Function Integration', () => {
    it('calls cleanContent with correct parameters', () => {
      const botMessage = {
        id: 'bot-1',
        content: 'Original content',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockCleanContent.mockReturnValue('Cleaned content')
      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      expect(mockCleanContent).toHaveBeenCalledWith('Original content')
    })

    it('passes cleaned content to markdown renderer', () => {
      const botMessage = {
        id: 'bot-1',
        content: 'Raw content',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockCleanContent.mockReturnValue('Processed content')
      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      render(<RenderMessages />)

      expect(screen.getByText('Processed content')).toBeInTheDocument()
    })
  })

  describe('Component Structure Tests', () => {
    it('renders with proper markdown class names and theme attribute', () => {
      const botMessage = {
        id: 'bot-1',
        content: 'Test content',
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [botMessage],
      })

      const { container } = render(<RenderMessages />)
      const markdownDiv = container.querySelector(
        '.markdown.markdown-body.chatAreaBotMessage',
      )
      expect(markdownDiv).toBeInTheDocument()
      expect(markdownDiv).toHaveAttribute('data-theme', 'light')
    })

    it('applies user message styling classes correctly', () => {
      const userMessage = {
        id: 'user-1',
        content: 'Hello',
        isUser: true,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [userMessage],
      })

      const { container } = render(<RenderMessages />)
      const boxElement = container.querySelector('.flex.flex-col')
      expect(boxElement).toBeInTheDocument()
    })

    it('handles messages with falsy content properly', () => {
      const falsyContentMessage = {
        id: 'falsy-1',
        content: false,
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [falsyContentMessage],
      })

      render(<RenderMessages />)

      expect(mockCleanContent).toHaveBeenCalledWith(
        "Sorry, I don't understand that.",
      )
    })

    it('handles zero as message content', () => {
      const zeroContentMessage = {
        id: 'zero-1',
        content: 0,
        isUser: false,
        timestamp: 1640995200000,
      }

      mockUseChatStore.mockReturnValue({
        messages: [zeroContentMessage],
      })

      render(<RenderMessages />)

      expect(mockCleanContent).toHaveBeenCalledWith(
        "Sorry, I don't understand that.",
      )
    })
  })
})
