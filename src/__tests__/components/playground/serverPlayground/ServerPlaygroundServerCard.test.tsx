// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerPlaygroundServerCard from '@/components/playground/serverPlayground/ServerPlaygroundServerCard'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { McpIcons } from '@/assets/mcp-icons'

// Mock the selected servers store
jest.mock('@/store/selectedServersStore', () => ({
  useSelectedServersStore: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Card: ({ children, onClick, style, ref }) => (
    <div data-testid="server-card" onClick={onClick} style={style} ref={ref}>
      {children}
    </div>
  ),
  Group: ({ children, justify }) => (
    <div data-justify={justify}>{children}</div>
  ),
  Text: ({ children }) => <span>{children}</span>,
  useMantineColorScheme: jest.fn().mockReturnValue({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
  }),
}))

// Mock the IconCheck component
jest.mock('@tabler/icons-react', () => ({
  IconCheck: () => <div data-testid="check-icon">Check Icon</div>,
}))

describe('ServerPlaygroundServerCard', () => {
  const mockServer = {
    id: '1',
    name: 'Test Server',
  }

  const mockLastElementRef = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    useSelectedServersStore.mockReturnValue({
      isServerSelected: jest.fn().mockReturnValue(false),
      toggleServer: jest.fn(),
    })
  })

  it('renders server card with correct name', () => {
    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(screen.getByText('Test Server')).toBeInTheDocument()
  })

  it('shows check icon when server is selected', () => {
    useSelectedServersStore.mockReturnValue({
      isServerSelected: jest.fn().mockReturnValue(true),
      toggleServer: jest.fn(),
    })

    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('does not show check icon when server is not selected', () => {
    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
  })

  it('calls toggleServer when card is clicked', () => {
    const mockToggleServer = jest.fn()
    useSelectedServersStore.mockReturnValue({
      isServerSelected: jest.fn().mockReturnValue(false),
      toggleServer: mockToggleServer,
    })

    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    fireEvent.click(screen.getByTestId('server-card'))
    expect(mockToggleServer).toHaveBeenCalledWith(mockServer)
  })

  it('applies correct background color when selected', () => {
    useSelectedServersStore.mockReturnValue({
      isServerSelected: jest.fn().mockReturnValue(true),
      toggleServer: jest.fn(),
    })

    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    const card = screen.getByTestId('server-card')
    expect(card).toHaveStyle({ backgroundColor: 'var(--mantine-color-gray-1)' })
  })

  it('uses fallback user icon when no matching icon is found', () => {
    // Mock McpIcons to return a user icon
    const mockUserIcon = () => <div data-testid="user-icon">User Icon</div>
    McpIcons.user = mockUserIcon

    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('handles lastElementRef callback correctly', () => {
    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(mockLastElementRef).toHaveBeenCalled()
  })

  it('applies correct cursor style', () => {
    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
      />,
    )

    const card = screen.getByTestId('server-card')
    expect(card.style.cursor).toBe('pointer')
  })

  it('uses direct matching icon when server name matches exactly', () => {
    const mockMatchingIcon = () => (
      <div data-testid="matching-icon">Matching Icon</div>
    )
    McpIcons['test server'] = mockMatchingIcon

    render(
      <ServerPlaygroundServerCard
        server={{ ...mockServer, name: 'test server' }}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(screen.getByTestId('matching-icon')).toBeInTheDocument()
  })

  it('uses partial matching icon when server name includes icon name', () => {
    const mockPartialIcon = () => (
      <div data-testid="partial-icon">Partial Icon</div>
    )
    McpIcons['test'] = mockPartialIcon

    render(
      <ServerPlaygroundServerCard
        server={{ ...mockServer, name: 'test-server-123' }}
        lastElementRef={mockLastElementRef}
      />,
    )

    expect(screen.getByTestId('partial-icon')).toBeInTheDocument()
  })

  it('handles ref forwarding correctly', () => {
    const ref = jest.fn()
    render(
      <ServerPlaygroundServerCard
        server={mockServer}
        lastElementRef={mockLastElementRef}
        ref={ref}
      />,
    )

    expect(ref).toHaveBeenCalled()
  })
})
