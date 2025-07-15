// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectHeader from '@/components/project/ProjectHeader'
import { PATHS } from '@/constants/paths'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the role store
jest.mock('@/store/roleStore', () => ({
  useRoleStore: jest.fn(),
}))

// Mock the project module CSS
jest.mock('@/components/project/project.module.css', () => ({
  actionIcon: 'actionIcon-class',
  popoverText: 'popoverText-class',
}))

// Mock the Icons
jest.mock('@tabler/icons-react', () => ({
  IconChevronLeft: function IconChevronLeft(props) {
    return (
      <div
        data-testid="chevron-left-icon"
        onClick={props.onClick}
        role="button"
      >
        Chevron Left
      </div>
    )
  },
  IconDots: () => <div data-testid="dots-icon">Dots Icon</div>,
}))

// Mock navigation
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock paths constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    PROJECTS: '/projects',
  },
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
    Group: ({ children, justify, align, gap }) => (
      <div
        data-testid="group"
        data-justify={justify}
        data-align={align}
        data-gap={gap}
      >
        {children}
      </div>
    ),
    Popover: PopoverComponent,
    Stack: ({ children, gap, justify }) => (
      <div
        data-testid={`stack-${gap || 'default'}`}
        data-gap={gap}
        data-justify={justify}
      >
        {children}
      </div>
    ),
    Text: ({ children, c, classNames, onClick }) => (
      <span
        data-testid="text"
        data-color={c}
        className={classNames?.root}
        onClick={onClick}
      >
        {children}
      </span>
    ),
    Title: ({ children, order, fz, c }) => (
      <h2 data-testid="title" data-order={order} data-fz={fz} data-c={c}>
        {children}
      </h2>
    ),
  }
})

// Mock delete project mutation
const mockMutateFn = jest.fn()
jest.mock('@/hooks/mutations/useProjectMutations', () => ({
  useDeleteProjectMutation: jest.fn(() => ({
    mutate: mockMutateFn,
  })),
}))

describe('ProjectHeader', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the project title correctly', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('renders the back button correctly', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    const backButton = screen.getByTestId('chevron-left-icon')
    expect(backButton).toBeInTheDocument()
  })

  it('navigates back to projects when the back button is clicked', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Find and click the back button
    const backButton = screen.getByTestId('chevron-left-icon')
    fireEvent.click(backButton)

    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/projects' })
  })

  it('disables the action button for regular users', () => {
    const mockRoleStore = {
      isUser: true,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // The action icon button should be disabled
    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).toBeDisabled()
  })

  it('enables the action button for non-user roles', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // The action icon button should not be disabled
    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).not.toBeDisabled()
  })

  it('shows the popover dropdown when action button is clicked', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Find and click the action button
    const actionButton = screen.getByTestId('action-icon')
    fireEvent.click(actionButton)

    // The Delete option should be visible
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('uses smaller icon size on mobile screens', () => {
    // Mock the useMediaQuery to return true (mobile view)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Verify the icon size through the data-size attribute
    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).toHaveAttribute('data-size', 'lg')
  })

  it('uses larger icon size on desktop screens', () => {
    // Mock the useMediaQuery to return false (desktop view)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Verify the icon size through the data-size attribute
    const actionButton = screen.getByTestId('action-icon')
    expect(actionButton).toHaveAttribute('data-size', 'xl')
  })

  it('calls deleteProject mutation when Delete option is clicked', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Find and click the action button to show the popover
    const actionButton = screen.getByTestId('action-icon')
    fireEvent.click(actionButton)

    // Find and click the Delete text
    const deleteText = screen.getByText('Delete')
    fireEvent.click(deleteText)

    // Check if the deleteProject was called with the correct projectId
    expect(mockMutateFn).toHaveBeenCalledWith('project-123', expect.any(Object))
  })

  it('navigates to projects page on successful deletion', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    // Set up the mock to call the onSuccess callback
    mockMutateFn.mockImplementation((projectId, options) => {
      if (options && typeof options.onSuccess === 'function') {
        options.onSuccess()
      }
    })

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Find and click the action button to show the popover
    const actionButton = screen.getByTestId('action-icon')
    fireEvent.click(actionButton)

    // Find and click the Delete text
    const deleteText = screen.getByText('Delete')
    fireEvent.click(deleteText)

    // Check if navigate was called with the correct path after successful deletion
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.PROJECTS })
  })

  it('has correct styling for the Delete text in the popover', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Find and click the action button to show the popover
    const actionButton = screen.getByTestId('action-icon')
    fireEvent.click(actionButton)

    // Check if the Delete text has the correct color
    const deleteText = screen.getByText('Delete')
    expect(deleteText).toHaveAttribute(
      'data-color',
      'var(--mantine-color-red-6)',
    )
  })

  it('renders with the correct structure', () => {
    const mockRoleStore = {
      isUser: false,
    }
    require('@/store/roleStore').useRoleStore.mockReturnValue(mockRoleStore)

    render(<ProjectHeader title="Test Project" projectId="project-123" />)

    // Check if the outer Stack has correct gap
    const outerStack = screen.getByTestId('stack-xl')
    expect(outerStack).toHaveAttribute('data-gap', 'xl')

    // Check if the Group has correct justify
    const groups = screen.getAllByTestId('group')
    expect(groups[0]).toHaveAttribute('data-justify', 'space-between')

    // Check title has correct formatting
    const title = screen.getByTestId('title')
    expect(title).toHaveAttribute('data-order', '2')
    expect(title).toHaveAttribute('data-fz', 'var(--size-2xl)')
    expect(title).toHaveAttribute('data-c', 'var(--clr-black)')
  })
})
