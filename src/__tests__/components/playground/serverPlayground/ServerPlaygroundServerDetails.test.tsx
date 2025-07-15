// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerPlaygroundServerDetails from '@/components/playground/serverPlayground/ServerPlaygroundServerDetails'
import { useSelectedServersStore } from '@/store/selectedServersStore'

// Mock the store
jest.mock('@/store/selectedServersStore', () => ({
  useSelectedServersStore: jest.fn(),
}))

// Mock child components
jest.mock(
  '@/components/playground/serverPlayground/ServerDetails/ServerDetails',
  () => ({
    __esModule: true,
    default: ({ server }) => (
      <div data-testid="server-details">{server.name}</div>
    ),
  }),
)

jest.mock(
  '@/components/playground/serverPlayground/ServerDetails/ConnectServers',
  () => ({
    __esModule: true,
    default: ({ serverConfig, serverName, configValue, onConfigChange }) => (
      <div data-testid="connect-servers">
        <button
          data-testid="submit-config"
          onClick={() =>
            onConfigChange(
              serverName,
              JSON.stringify({
                id: 'test-id',
                serverKey: 'test-key',
                env: 'test-env',
              }),
            )
          }
        >
          Submit Config
        </button>
      </div>
    ),
  }),
)

jest.mock(
  '@/components/playground/serverPlayground/ServerDetails/ServerTools',
  () => ({
    __esModule: true,
    default: ({ server }) => (
      <div data-testid="server-tools">{server.name} Tools</div>
    ),
  }),
)

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Card: ({ children, p, m }) => (
    <div data-testid="card" data-padding={p} data-margin={m}>
      {children}
    </div>
  ),
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
}))

describe('ServerPlaygroundServerDetails', () => {
  const mockServers = [
    {
      id: 'server1',
      name: 'Test Server 1',
      mcp_config: {
        mcpServers: {
          'server-key-1': {
            env: 'test-env-1',
          },
        },
      },
    },
    {
      id: 'server2',
      name: 'Test Server 2',
      mcp_config: {
        mcpServers: {
          'server-key-2': {
            env: 'test-env-2',
          },
        },
      },
    },
  ]

  const mockStore = {
    selectedServers: mockServers,
    initializeServerConfigsData: jest.fn(),
    setMcpServersFinalData: jest.fn(),
    mcpServersFinalData: {
      mcpServers: {},
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useSelectedServersStore.mockReturnValue(mockStore)
  })

  it('initializes server configs data on mount', () => {
    render(<ServerPlaygroundServerDetails />)
    expect(mockStore.initializeServerConfigsData).toHaveBeenCalled()
  })

  it('renders server details for each selected server', () => {
    render(<ServerPlaygroundServerDetails />)

    const serverDetails = screen.getAllByTestId('server-details')
    expect(serverDetails).toHaveLength(2)
    expect(serverDetails[0]).toHaveTextContent('Test Server 1')
    expect(serverDetails[1]).toHaveTextContent('Test Server 2')
  })

  it('renders connect servers for each server configuration', () => {
    render(<ServerPlaygroundServerDetails />)

    const connectServers = screen.getAllByTestId('connect-servers')
    expect(connectServers).toHaveLength(2)
  })

  it('renders server tools for each server', () => {
    render(<ServerPlaygroundServerDetails />)

    const serverTools = screen.getAllByTestId('server-tools')
    expect(serverTools).toHaveLength(2)
    expect(serverTools[0]).toHaveTextContent('Test Server 1 Tools')
    expect(serverTools[1]).toHaveTextContent('Test Server 2 Tools')
  })

  it('handles server config submission correctly', () => {
    render(<ServerPlaygroundServerDetails />)

    const submitButtons = screen.getAllByTestId('submit-config')
    fireEvent.click(submitButtons[0])

    expect(mockStore.setMcpServersFinalData).toHaveBeenCalledWith({
      mcpServers: {
        'server-key-1': {
          id: 'test-id',
          serverKey: 'test-key',
          env: 'test-env',
        },
      },
    })
  })

  it('renders nothing when no servers are selected', () => {
    useSelectedServersStore.mockReturnValue({
      ...mockStore,
      selectedServers: [],
    })

    render(<ServerPlaygroundServerDetails />)

    expect(screen.queryByTestId('server-details')).not.toBeInTheDocument()
    expect(screen.queryByTestId('connect-servers')).not.toBeInTheDocument()
    expect(screen.queryByTestId('server-tools')).not.toBeInTheDocument()
  })

  it('skips rendering connect servers when env is not present', () => {
    const serversWithoutEnv = [
      {
        id: 'server1',
        name: 'Test Server 1',
        mcp_config: {
          mcpServers: {
            'server-key-1': null, // null config
          },
        },
      },
    ]

    useSelectedServersStore.mockReturnValue({
      ...mockStore,
      selectedServers: serversWithoutEnv,
    })

    render(<ServerPlaygroundServerDetails />)

    expect(screen.getByTestId('server-details')).toBeInTheDocument()
    expect(screen.queryByTestId('connect-servers')).not.toBeInTheDocument()
    expect(screen.getByTestId('server-tools')).toBeInTheDocument()
  })

  it('renders correct card padding and margin', () => {
    render(<ServerPlaygroundServerDetails />)

    const cards = screen.getAllByTestId('card')
    expect(cards[0]).toHaveAttribute('data-padding', 'md')
    expect(cards[0]).toHaveAttribute('data-margin', '0 2.5rem')
  })

  it('renders correct stack gap', () => {
    render(<ServerPlaygroundServerDetails />)

    const stacks = screen.getAllByTestId('stack')
    expect(stacks[0]).toHaveAttribute('data-gap', 'xl')
  })

  it('handles multiple server configurations per server', () => {
    const serverWithMultipleConfigs = [
      {
        id: 'server1',
        name: 'Test Server 1',
        mcp_config: {
          mcpServers: {
            'server-key-1': {
              env: 'test-env-1',
            },
            'server-key-2': {
              env: 'test-env-2',
            },
          },
        },
      },
    ]

    useSelectedServersStore.mockReturnValue({
      ...mockStore,
      selectedServers: serverWithMultipleConfigs,
    })

    render(<ServerPlaygroundServerDetails />)

    const connectServers = screen.getAllByTestId('connect-servers')
    expect(connectServers).toHaveLength(2)
  })

  it('handles server config submission for multiple servers', () => {
    render(<ServerPlaygroundServerDetails />)

    const submitButtons = screen.getAllByTestId('submit-config')
    fireEvent.click(submitButtons[0])
    fireEvent.click(submitButtons[1])

    expect(mockStore.setMcpServersFinalData).toHaveBeenCalledTimes(2)
    expect(mockStore.setMcpServersFinalData).toHaveBeenCalledWith({
      mcpServers: {
        'server-key-1': {
          id: 'test-id',
          serverKey: 'test-key',
          env: 'test-env',
        },
      },
    })
  })
})
