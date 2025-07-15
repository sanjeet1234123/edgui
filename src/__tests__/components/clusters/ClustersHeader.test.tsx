// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClustersHeader from '@/components/clusters/ClustersHeader'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, size, onClick }) => (
    <button data-testid="action-icon" data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
  Button: ({ children, leftSection, onClick }) => (
    <button data-testid="button" onClick={onClick}>
      {leftSection}
      {children}
    </button>
  ),
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
  Tooltip: ({ children, label }) => (
    <div data-testid="tooltip" data-label={label}>
      {children}
    </div>
  ),
}))

// Mock the IconPlus component
jest.mock('@tabler/icons-react', () => ({
  IconPlus: () => <div data-testid="plus-icon">Plus Icon</div>,
}))

describe('ClustersHeader', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    require('@tanstack/react-router').useNavigate.mockReturnValue(mockNavigate)
  })

  it('renders the page title correctly', () => {
    render(<ClustersHeader pageTitle="Test Clusters" />)
    expect(screen.getByText('Test Clusters')).toBeInTheDocument()
  })

  it('renders desktop view with button when screen width > 1024px', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)
    render(<ClustersHeader pageTitle="Test Clusters" />)

    expect(screen.getByTestId('button')).toBeInTheDocument()
    expect(screen.getByText('Add New Cluster')).toBeInTheDocument()
    expect(screen.queryByTestId('action-icon')).not.toBeInTheDocument()
  })

  it('renders tablet view with action icon when screen width <= 1024px', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)
    render(<ClustersHeader pageTitle="Test Clusters" />)

    expect(screen.getByTestId('action-icon')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-label',
      'Add New Cluster',
    )
    expect(screen.queryByTestId('button')).not.toBeInTheDocument()
  })

  it('renders smaller action icon when screen width <= 768px', () => {
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1024
      .mockReturnValueOnce(true) // is768
    render(<ClustersHeader pageTitle="Test Clusters" />)

    const actionIcon = screen.getByTestId('action-icon')
    expect(actionIcon).toHaveAttribute('data-size', 'md')
  })

  it('renders larger action icon when screen width > 768px but <= 1024px', () => {
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1024
      .mockReturnValueOnce(false) // is768
    render(<ClustersHeader pageTitle="Test Clusters" />)

    const actionIcon = screen.getByTestId('action-icon')
    expect(actionIcon).toHaveAttribute('data-size', 'lg')
  })

  it('navigates to add cluster page when button is clicked in desktop view', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)
    render(<ClustersHeader pageTitle="Test Clusters" />)

    fireEvent.click(screen.getByTestId('button'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/add-cluster' })
  })

  it('navigates to add cluster page when action icon is clicked in tablet view', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)
    render(<ClustersHeader pageTitle="Test Clusters" />)

    fireEvent.click(screen.getByTestId('action-icon'))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/add-cluster' })
  })
})
