/**
 * @jest-environment jsdom
 */
// @ts-nocheck
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock the endpoint constants first
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost:3000/v1',
}))

// Mock the user details queries
jest.mock('@/hooks/queries/useUserDetailsQueries', () => ({
  useGetUserDetailsQuery: jest.fn(() => ({
    data: { name: 'Test User' },
    isLoading: false,
  })),
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}))

// Mock the navigation function and MediaQuery without referencing variables
jest.mock('@tanstack/react-router', () => {
  const navigateMock = jest.fn()
  return {
    useNavigate: () => navigateMock,
  }
})

jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Only import component after mocks are set up
import SettingsOptions from '@/components/userProfile/SettingsOptions'

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({
    children,
    color,
    size,
    fz,
    variant,
    leftSection,
    onClick,
  }: {
    children: React.ReactNode
    color: string
    size: string
    fz: string
    variant: string
    leftSection: React.ReactNode
    onClick: () => void
  }) => (
    <button
      data-testid={`button-${children.toString().replace(/\s+/g, '-').toLowerCase()}`}
      onClick={onClick}
      style={{ color, fontSize: fz }}
    >
      {leftSection && <span data-testid="button-icon">{leftSection}</span>}
      {children}
    </button>
  ),
  Stack: ({
    children,
    align,
    gap,
  }: {
    children: React.ReactNode
    align: string
    gap: string
  }) => (
    <div data-testid="mantine-stack" style={{ alignItems: align, gap }}>
      {children}
    </div>
  ),
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconSettings: ({ size }: { size: number }) => (
    <div data-testid="icon-settings" style={{ width: size, height: size }}>
      Settings Icon
    </div>
  ),
  IconCode: ({ size }: { size: number }) => (
    <div data-testid="icon-code" style={{ width: size, height: size }}>
      Code Icon
    </div>
  ),
  IconHelp: ({ size }: { size: number }) => (
    <div data-testid="icon-help" style={{ width: size, height: size }}>
      Help Icon
    </div>
  ),
  IconUser: ({ size }: { size: number }) => (
    <div data-testid="icon-user" style={{ width: size, height: size }}>
      User Icon
    </div>
  ),
}))

// Mock the paths constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    WORKSPACE: '/workspace',
    ACCOUNT_SETTINGS: '/account-settings',
  },
}))

describe('SettingsOptions', () => {
  // Setup for window.open mock
  const originalOpen = window.open
  const mockClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.open inside the test
    window.open = jest.fn()
    // Clear the close mock
    mockClose.mockClear()
  })

  afterEach(() => {
    // Restore window.open after each test
    window.open = originalOpen
  })

  it('renders workspace and account settings buttons in desktop view', () => {
    // Configure the media query mock for desktop view
    const mockMediaQuery = jest.requireMock('@mantine/hooks').useMediaQuery
    mockMediaQuery.mockReturnValue(false) // Desktop view

    render(<SettingsOptions close={mockClose} />)

    // Check if the workspace and account settings buttons are rendered
    expect(screen.getByTestId('button-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('button-settings')).toBeInTheDocument()

    // Check if the settings icon is rendered
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument()
    expect(screen.getByTestId('icon-user')).toBeInTheDocument()

    // Verify no Agent SRE or Help Center buttons in desktop view
    expect(screen.queryByTestId('button-agent-sre')).not.toBeInTheDocument()
    expect(screen.queryByTestId('button-help-center')).not.toBeInTheDocument()
  })

  it('renders additional buttons on mobile view', () => {
    // Configure the media query mock for mobile view
    const mockMediaQuery = jest.requireMock('@mantine/hooks').useMediaQuery
    mockMediaQuery.mockReturnValue(true) // Mobile view (width <= 1024px)

    render(<SettingsOptions close={mockClose} />)

    // Verify all buttons are present
    expect(screen.getByTestId('button-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('button-settings')).toBeInTheDocument()
    expect(screen.getByTestId('button-agent-sre')).toBeInTheDocument()
    expect(screen.getByTestId('button-help-center')).toBeInTheDocument()

    // Check if all icons are rendered
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument()
    expect(screen.getByTestId('icon-user')).toBeInTheDocument()
    expect(screen.getByTestId('icon-code')).toBeInTheDocument()
    expect(screen.getByTestId('icon-help')).toBeInTheDocument()
  })

  it('navigates to workspace page when workspace button is clicked', () => {
    // Get the navigate mock
    const navigateMock = jest
      .requireMock('@tanstack/react-router')
      .useNavigate()

    render(<SettingsOptions close={mockClose} />)

    // Click the workspace button
    fireEvent.click(screen.getByTestId('button-workspace'))

    // Check if navigate was called with the correct path
    expect(navigateMock).toHaveBeenCalledWith({ to: '/workspace' })
    // Check if close was called
    expect(mockClose).toHaveBeenCalled()
  })

  it('navigates to account settings page when account settings button is clicked', () => {
    // Get the navigate mock
    const navigateMock = jest
      .requireMock('@tanstack/react-router')
      .useNavigate()

    render(<SettingsOptions close={mockClose} />)

    // Click the account settings button
    fireEvent.click(screen.getByTestId('button-settings'))

    // Check if navigate was called with the correct path
    expect(navigateMock).toHaveBeenCalledWith({ to: '/account-settings' })
    // Check if close was called
    expect(mockClose).toHaveBeenCalled()
  })

  it('opens Agent SRE in new tab when clicked', () => {
    // Configure the media query mock for mobile view
    const mockMediaQuery = jest.requireMock('@mantine/hooks').useMediaQuery
    mockMediaQuery.mockReturnValue(true) // Mobile view to show the Agent SRE button

    render(<SettingsOptions close={mockClose} />)

    // Find and click the Agent SRE button
    fireEvent.click(screen.getByTestId('button-agent-sre'))

    // Check if window.open was called with the correct URL
    expect(window.open).toHaveBeenCalledWith(
      'https://agentsre.prod.neuralcompany.team/',
      '_blank',
    )
    // Check if close was called
    expect(mockClose).toHaveBeenCalled()
  })
})
