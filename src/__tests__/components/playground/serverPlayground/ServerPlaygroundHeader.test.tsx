// @ts-nocheck
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import ServerPlaygroundHeader from '../../../../components/playground/serverPlayground/ServerPlaygroundHeader'
import * as selectedServersStore from '@/store/selectedServersStore'
import * as webSocketStore from '@/store/websocketStore'
import userEvent from '@testing-library/user-event'

const mockConnect = jest.fn()

const renderWithMantine = component => {
  return render(<MantineProvider>{component}</MantineProvider>)
}

describe('ServerPlaygroundHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with correct title', () => {
    jest
      .spyOn(selectedServersStore, 'useSelectedServersStore')
      .mockReturnValue({
        selectedServers: [],
        mcpServersFinalData: undefined,
      })
    jest
      .spyOn(webSocketStore, 'useWebSocketStore')
      .mockReturnValue({ connect: mockConnect })
    renderWithMantine(<ServerPlaygroundHeader />)
    const titleElement = screen.getByText('MCP Server Playground')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveClass('Title')
  })

  it('renders within a Group component', () => {
    jest
      .spyOn(selectedServersStore, 'useSelectedServersStore')
      .mockReturnValue({
        selectedServers: [],
        mcpServersFinalData: undefined,
      })
    jest
      .spyOn(webSocketStore, 'useWebSocketStore')
      .mockReturnValue({ connect: mockConnect })
    const { container } = renderWithMantine(<ServerPlaygroundHeader />)
    const groupElement = container.querySelector('div.mantine-Group-root')
    expect(groupElement).toBeInTheDocument()
  })

  it('disables Connect button and shows tooltip if configs are not filled', async () => {
    jest
      .spyOn(selectedServersStore, 'useSelectedServersStore')
      .mockReturnValue({
        selectedServers: [
          {
            id: 1,
            mcp_config: { mcpServers: { serverA: { env: { VAR: '1' } } } },
          },
        ],
        mcpServersFinalData: undefined,
      })
    jest
      .spyOn(webSocketStore, 'useWebSocketStore')
      .mockReturnValue({ connect: mockConnect })
    renderWithMantine(<ServerPlaygroundHeader />)
    const button = screen.getByRole('button', { name: /connect/i })
    expect(button).toBeDisabled()
    await userEvent.hover(button)
    expect(
      await screen.findByText('Edit configuration first'),
    ).toBeInTheDocument()
  })

  it('enables Connect button and disables tooltip if configs are filled', () => {
    jest
      .spyOn(selectedServersStore, 'useSelectedServersStore')
      .mockReturnValue({
        selectedServers: [
          {
            id: 1,
            mcp_config: { mcpServers: { serverA: { env: { VAR: '1' } } } },
          },
        ],
        mcpServersFinalData: { mcpServers: { serverA: { env: { VAR: '1' } } } },
      })
    jest
      .spyOn(webSocketStore, 'useWebSocketStore')
      .mockReturnValue({ connect: mockConnect })
    renderWithMantine(<ServerPlaygroundHeader />)
    const button = screen.getByRole('button', { name: /connect/i })
    expect(button).toBeEnabled()
    // Tooltip should be disabled, so label is not visible
  })

  it('calls connect with mcpServersFinalData when Connect is clicked', async () => {
    const mcpServersFinalData = {
      mcpServers: { serverA: { env: { VAR: '1' } } },
    }
    jest
      .spyOn(selectedServersStore, 'useSelectedServersStore')
      .mockReturnValue({
        selectedServers: [
          {
            id: 1,
            mcp_config: { mcpServers: { serverA: { env: { VAR: '1' } } } },
          },
        ],
        mcpServersFinalData,
      })
    jest
      .spyOn(webSocketStore, 'useWebSocketStore')
      .mockReturnValue({ connect: mockConnect })
    renderWithMantine(<ServerPlaygroundHeader />)
    const button = screen.getByRole('button', { name: /connect/i })
    await userEvent.click(button)
    expect(mockConnect).toHaveBeenCalledWith(mcpServersFinalData)
  })

  it('handles edge case: no selected servers', () => {
    jest
      .spyOn(selectedServersStore, 'useSelectedServersStore')
      .mockReturnValue({
        selectedServers: [],
        mcpServersFinalData: undefined,
      })
    jest
      .spyOn(webSocketStore, 'useWebSocketStore')
      .mockReturnValue({ connect: mockConnect })
    renderWithMantine(<ServerPlaygroundHeader />)
    const button = screen.getByRole('button', { name: /connect/i })
    expect(button).toBeDisabled()
  })
})
