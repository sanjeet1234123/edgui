// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerPlaygroundChatArea from '@/components/playground/serverPlayground/ServerPlaygroundChatArea'

// Mock the stores
jest.mock('@/store/chatStore', () => ({
  useChatStore: jest.fn(() => ({
    clearMessages: jest.fn(),
  })),
}))

jest.mock('@/store/selectedServersStore', () => ({
  useSelectedServersStore: jest.fn(() => ({
    selectedServers: [],
    serverConfigsData: [],
  })),
}))

jest.mock('@/store/websocketStore', () => {
  const disconnect = jest.fn()
  const store = {
    isConnected: false,
    connectionStatus: 'Disconnected',
    errorMessage: '',
    connect: jest.fn(),
    reconnect: jest.fn(),
    disconnect,
  }
  function useWebSocketStore() {
    return store
  }
  useWebSocketStore.getState = () => store
  return {
    useWebSocketStore,
    __esModule: true,
  }
})

// Mock the CSS module
jest.mock(
  '@/components/playground/serverPlayground/serverPlayground.module.css',
  () => ({
    chatAreaCard: 'chatAreaCard-class',
    SVGContainer: 'SVGContainer-class',
    threeDotButton: 'threeDotButton-class',
    errorAlert: 'errorAlert-class',
  }),
)

// Mock the ThreeDotContainer SVG
jest.mock('@/assets/images/3dot-container.svg', () => 'ThreeDotContainer')

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, onClick }) => (
    <button data-testid="action-icon" onClick={onClick}>
      {children}
    </button>
  ),
  Alert: ({ children, color, title }) => (
    <div data-testid="alert" data-color={color} data-title={title}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, variant, color, size }) => (
    <button
      data-testid="button"
      onClick={onClick}
      data-variant={variant}
      data-color={color}
      data-size={size}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Group: ({ children, gap }) => (
    <div data-testid="group" data-gap={gap}>
      {children}
    </div>
  ),
  Stack: ({ children, className }) => (
    <div data-testid="stack" className={className}>
      {children}
    </div>
  ),
  Text: ({ children, size }) => (
    <span data-testid="text" data-size={size}>
      {children}
    </span>
  ),
  ThemeIcon: ({ children, color, size }) => (
    <div data-testid="theme-icon" data-color={color} data-size={size}>
      {children}
    </div>
  ),
  Tooltip: ({ children, label, position }) => (
    <div data-testid="tooltip" data-label={label} data-position={position}>
      {children}
    </div>
  ),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconPlugConnected: () => (
    <div data-testid="icon-plug-connected">Connected</div>
  ),
  IconPlugConnectedX: () => (
    <div data-testid="icon-plug-disconnected">Disconnected</div>
  ),
  IconTrash: () => <div data-testid="icon-trash">Trash</div>,
}))

// Mock the ChatArea and ChatInput components
jest.mock('@/components/playground/serverPlayground/ChatArea/ChatArea', () => ({
  __esModule: true,
  default: () => <div data-testid="chat-area">Chat Area</div>,
}))

jest.mock(
  '@/components/playground/serverPlayground/ChatArea/ChatInput',
  () => ({
    __esModule: true,
    default: ({ disabled }) => (
      <div data-testid="chat-input" data-disabled={disabled}>
        Chat Input
      </div>
    ),
  }),
)

describe('ServerPlaygroundChatArea', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with disconnected state', () => {
    render(<ServerPlaygroundChatArea />)

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('icon-plug-disconnected')).toBeInTheDocument()
    expect(screen.getByTestId('chat-area')).toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toHaveAttribute(
      'data-disabled',
      'true',
    )
  })

  it('renders the component with connected state', () => {
    const wsStore = require('@/store/websocketStore')
    wsStore.useWebSocketStore = () => ({
      isConnected: true,
      connectionStatus: 'Connected',
      errorMessage: '',
      connect: jest.fn(),
      reconnect: jest.fn(),
      disconnect: jest.fn(),
    })
    wsStore.useWebSocketStore.getState = () => wsStore.useWebSocketStore()

    render(<ServerPlaygroundChatArea />)

    expect(screen.getByTestId('icon-plug-connected')).toBeInTheDocument()
    expect(screen.getByTestId('chat-input')).toHaveAttribute(
      'data-disabled',
      'false',
    )
  })

  it('shows error alert when there is an error message', () => {
    const wsStore = require('@/store/websocketStore')
    wsStore.useWebSocketStore = () => ({
      isConnected: false,
      connectionStatus: 'Error',
      errorMessage: 'Connection failed',
      connect: jest.fn(),
      reconnect: jest.fn(),
      disconnect: jest.fn(),
    })
    wsStore.useWebSocketStore.getState = () => wsStore.useWebSocketStore()

    render(<ServerPlaygroundChatArea />)

    const alert = screen.getByTestId('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('data-color', 'red')
    expect(alert).toHaveAttribute('data-title', 'Connection Error')
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
    expect(screen.getByText('Try Reconnect')).toBeInTheDocument()
  })

  it('calls clearMessages when clear chat button is clicked', () => {
    const mockClearMessages = jest.fn()
    require('@/store/chatStore').useChatStore.mockReturnValue({
      clearMessages: mockClearMessages,
    })

    render(<ServerPlaygroundChatArea />)

    const clearButton = screen.getByTestId('action-icon')
    fireEvent.click(clearButton)

    expect(mockClearMessages).toHaveBeenCalled()
  })

  it('attempts to connect when servers are selected and configured', () => {
    const mockConnect = jest.fn()
    const wsStore = require('@/store/websocketStore')
    wsStore.useWebSocketStore = () => ({
      isConnected: false,
      connectionStatus: 'Disconnected',
      errorMessage: '',
      connect: mockConnect,
      reconnect: jest.fn(),
      disconnect: jest.fn(),
    })
    wsStore.useWebSocketStore.getState = () => wsStore.useWebSocketStore()

    require('@/store/selectedServersStore').useSelectedServersStore.mockReturnValue(
      {
        selectedServers: ['server1'],
        serverConfigsData: [{ id: 'server1', hasEnv: false }],
      },
    )

    render(<ServerPlaygroundChatArea />)

    expect(mockConnect).toHaveBeenCalled()
  })

  it('disconnects when no servers are selected', () => {
    const mockDisconnect = jest.fn()
    const wsStore = require('@/store/websocketStore')
    wsStore.useWebSocketStore = () => ({
      isConnected: false,
      connectionStatus: 'Disconnected',
      errorMessage: '',
      connect: jest.fn(),
      reconnect: jest.fn(),
      disconnect: mockDisconnect,
    })
    wsStore.useWebSocketStore.getState = () => wsStore.useWebSocketStore()

    require('@/store/selectedServersStore').useSelectedServersStore.mockReturnValue(
      {
        selectedServers: [],
        serverConfigsData: [],
      },
    )

    render(<ServerPlaygroundChatArea />)

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('attempts to reconnect when reconnect button is clicked', () => {
    const mockReconnect = jest.fn()
    const wsStore = require('@/store/websocketStore')
    wsStore.useWebSocketStore = () => ({
      isConnected: false,
      connectionStatus: 'Error',
      errorMessage: 'Connection failed',
      connect: jest.fn(),
      reconnect: mockReconnect,
      disconnect: jest.fn(),
    })
    wsStore.useWebSocketStore.getState = () => wsStore.useWebSocketStore()

    require('@/store/selectedServersStore').useSelectedServersStore.mockReturnValue(
      {
        selectedServers: ['server1'],
        serverConfigsData: [{ id: 'server1', hasEnv: false }],
      },
    )

    render(<ServerPlaygroundChatArea />)

    const reconnectButton = screen.getByText('Try Reconnect')
    fireEvent.click(reconnectButton)

    expect(mockReconnect).toHaveBeenCalled()
  })
})
