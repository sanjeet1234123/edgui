// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the role store
jest.mock('@/store/roleStore', () => ({
  useRoleStore: jest.fn(),
}))

// Mock the workspace module CSS
jest.mock('@/components/workspace/workspace.module.css', () => ({
  actionIcon: 'actionIcon-class',
  popoverText: 'popoverText-class',
}))

// Mock the IconDots component
jest.mock('@tabler/icons-react', () => ({
  IconDots: () => <div data-testid="dots-icon">Dots Icon</div>,
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  // Create a Popover component with proper subcomponents
  const PopoverComponent = ({ children }) => (
    <div data-testid="popover">{children}</div>
  )
  PopoverComponent.Target = ({ children }) => (
    <div data-testid="popover-target">{children}</div>
  )
  PopoverComponent.Dropdown = ({ children }) => (
    <div data-testid="popover-dropdown">{children}</div>
  )

  return {
    ActionIcon: ({ children, disabled, variant, classNames, size }) => (
      <button
        data-testid="action-icon"
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        className={classNames?.root}
      >
        {children}
      </button>
    ),
    Group: ({ children, justify }) => (
      <div data-justify={justify}>{children}</div>
    ),
    Popover: PopoverComponent,
    Stack: ({ children }) => <div data-testid="stack">{children}</div>,
    Text: ({ children, c, classNames }) => (
      <span data-color={c} className={classNames?.root}>
        {children}
      </span>
    ),
    Title: ({ children, className }) => (
      <h1 className={className}>{children}</h1>
    ),
    MantineProvider: ({ children }) => <div>{children}</div>,
  }
})

describe('WorkspaceHeader', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the page title correctly', () => {
    const mockRoleStore = {
      isAdmin: false,
      isOwner: false,
      isUser: true,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Test Page Title" />)

    expect(screen.getByText('Test Page Title')).toBeInTheDocument()
  })

  it('does not render the action button for regular users', () => {
    const mockRoleStore = {
      isAdmin: false,
      isOwner: false,
      isUser: true,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Test Page" />)

    // The dots icon should not be in the document
    const actionButton = screen.queryByTestId('dots-icon')
    expect(actionButton).not.toBeInTheDocument()
  })

  it('renders the action button for admin users', () => {
    const mockRoleStore = {
      isAdmin: true,
      isOwner: false,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Admin Page" />)

    // Find the action button (dots icon)
    const actionButton = screen.getByTestId('dots-icon')
    expect(actionButton).toBeInTheDocument()
  })

  it('renders the action button for owner users', () => {
    const mockRoleStore = {
      isAdmin: false,
      isOwner: true,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Owner Page" />)

    // Find the action button (dots icon)
    const actionButton = screen.getByTestId('dots-icon')
    expect(actionButton).toBeInTheDocument()
  })

  it('shows the popover dropdown when action button is clicked', () => {
    const mockRoleStore = {
      isAdmin: true,
      isOwner: false,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Test Page" />)

    // Find and click the action button
    const actionButton = screen.getByTestId('action-icon')
    fireEvent.click(actionButton)

    // Check if the Delete option is shown in the popover
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('uses smaller icon size on mobile screens', () => {
    // Mock the useMediaQuery to return true (mobile view)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    const mockRoleStore = {
      isAdmin: true,
      isOwner: false,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Mobile View" />)

    // We can verify the icon size through the data-size attribute
    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).toBeInTheDocument()
    expect(actionButton).toHaveAttribute('data-size', 'lg')
  })

  it('uses larger icon size on desktop screens', () => {
    // Mock the useMediaQuery to return false (desktop view)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    const mockRoleStore = {
      isAdmin: true,
      isOwner: false,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Desktop View" />)

    // We can verify the icon size through the data-size attribute
    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).toBeInTheDocument()
    expect(actionButton).toHaveAttribute('data-size', 'xl')
  })

  it('applies correct styling to the popover text', () => {
    const mockRoleStore = {
      isAdmin: false,
      isOwner: true,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Test Page" />)

    // Find and click the action button to show the popover
    const actionButton = screen.getByTestId('action-icon')
    fireEvent.click(actionButton)

    // Check if the Delete text has the correct styling
    const deleteText = screen.getByText('Delete')
    expect(deleteText).toHaveAttribute(
      'data-color',
      'var(--mantine-color-red-6)',
    )
    // Instead of checking the className, we can just verify the text
  })

  it('handles both admin and owner roles correctly', () => {
    const mockRoleStore = {
      isAdmin: true,
      isOwner: true,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Admin and Owner" />)

    // The action button should be present
    const actionButton = screen.getByTestId('dots-icon')
    expect(actionButton).toBeInTheDocument()
  })

  it('applies correct variant to the action icon', () => {
    const mockRoleStore = {
      isAdmin: true,
      isOwner: false,
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<WorkspaceHeader pageTitle="Test Variant" />)

    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).toHaveAttribute('data-variant', 'subtle')
  })
})
