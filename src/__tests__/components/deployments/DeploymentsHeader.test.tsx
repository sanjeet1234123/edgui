// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeploymentsHeader from '@/components/deployments/DeploymentsHeader'
import { PATHS } from '@/constants/paths'

// Mock the navigation
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconBuildingStore: () => (
    <div data-testid="building-store-icon">Store Icon</div>
  ),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children, justify }) => (
    <div data-testid="group" data-justify={justify}>
      {children}
    </div>
  ),
  Text: ({ children, className }) => (
    <span data-testid="text" className={className}>
      {children}
    </span>
  ),
  Button: ({ children, size, leftSection, onClick }) => (
    <button data-testid="button" data-size={size} onClick={onClick}>
      {leftSection}
      {children}
    </button>
  ),
  ActionIcon: ({ children, size, onClick }) => (
    <button data-testid="action-icon" data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
  Tooltip: ({ children, label, position }) => (
    <div data-testid="tooltip" data-label={label} data-position={position}>
      {children}
    </div>
  ),
}))

describe('DeploymentsHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the page title correctly', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false) // Desktop view

    render(<DeploymentsHeader pageTitle="Test Deployments" />)

    expect(screen.getByText('Test Deployments')).toBeInTheDocument()
    expect(screen.getByTestId('text')).toHaveClass('Title')
  })

  it('renders button with icon in desktop view', () => {
    // Mock desktop view (is1024 = false)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentsHeader pageTitle="Deployments" />)

    // Check button exists
    const button = screen.getByTestId('button')
    expect(button).toBeInTheDocument()

    // Check text content
    expect(screen.getByText('Model Marketplace')).toBeInTheDocument()

    // Check icon exists
    expect(screen.getByTestId('building-store-icon')).toBeInTheDocument()

    // Check button size
    expect(button).toHaveAttribute('data-size', 'lg')
  })

  it('renders action icon with tooltip in tablet view', () => {
    // Mock tablet view (is1024 = true, is768 = false)
    require('@mantine/hooks').useMediaQuery.mockImplementation(
      query => query === '(max-width: 1024px)',
    )

    render(<DeploymentsHeader pageTitle="Deployments" />)

    // Check tooltip exists
    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveAttribute('data-label', 'Model Marketplace')
    expect(tooltip).toHaveAttribute('data-position', 'top')

    // Check action icon exists
    const actionIcon = screen.getByTestId('action-icon')
    expect(actionIcon).toBeInTheDocument()
    expect(actionIcon).toHaveAttribute('data-size', 'lg')

    // Check icon exists inside the action icon
    expect(screen.getByTestId('building-store-icon')).toBeInTheDocument()
  })

  it('renders smaller action icon in mobile view', () => {
    // Mock mobile view (is1024 = true, is768 = true)
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') return true
      if (query === '(max-width: 768px)') return true
      return false
    })

    render(<DeploymentsHeader pageTitle="Deployments" />)

    // Check action icon size is 'md' for mobile
    const actionIcon = screen.getByTestId('action-icon')
    expect(actionIcon).toBeInTheDocument()
    expect(actionIcon).toHaveAttribute('data-size', 'md')
  })

  it('navigates to marketplace when button is clicked', () => {
    // Desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentsHeader pageTitle="Deployments" />)

    const button = screen.getByTestId('button')
    fireEvent.click(button)

    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.MARKETPLACE })
  })

  it('navigates to marketplace when action icon is clicked', () => {
    // Tablet/mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(<DeploymentsHeader pageTitle="Deployments" />)

    const actionIcon = screen.getByTestId('action-icon')
    fireEvent.click(actionIcon)

    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.MARKETPLACE })
  })
})
