// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { Project, Environment } from '@/types/headerType'

// Store original localStorage
const originalLocalStorage = global.localStorage

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
}

// Create a mock mutation function that calls onSuccess with the response
const mockMutate = jest.fn().mockImplementation((payload, options) => {
  if (options?.onSuccess) {
    options.onSuccess({
      token: 'mocked-token',
      expire: '2023-12-31',
    })
  }
})

// Mock the mutation hook
jest.mock('@/hooks/mutations/useHeaderMutations', () => {
  return {
    useUpdateTokenMutation: () => ({
      mutate: mockMutate,
    }),
  }
})

// Mock the child components
jest.mock('@/components/userProfile/UserInfo', () => ({
  __esModule: true,
  default: () => <div data-testid="user-info">User Info Component</div>,
}))

jest.mock('@/components/userProfile/ProjectSelection', () => {
  return {
    __esModule: true,
    default: ({
      currentProject,
      showProjectsDropdown,
      setShowProjectsDropdown,
      setShowEnvDropdown,
    }: any) => (
      <div data-testid="project-selection">
        <span>Project: {currentProject?.name || 'None'}</span>
        <button
          data-testid="toggle-projects-dropdown"
          onClick={() => {
            setShowProjectsDropdown(!showProjectsDropdown)
            setShowEnvDropdown(false)
          }}
        >
          Toggle Projects
        </button>
      </div>
    ),
  }
})

jest.mock('@/components/userProfile/EnvironmentSelection', () => {
  return {
    __esModule: true,
    default: ({
      currentEnvironment,
      showEnvDropdown,
      setShowEnvDropdown,
      setShowProjectsDropdown,
    }: any) => (
      <div data-testid="environment-selection">
        <span>Environment: {currentEnvironment}</span>
        <button
          data-testid="toggle-env-dropdown"
          onClick={() => {
            setShowEnvDropdown(!showEnvDropdown)
            setShowProjectsDropdown(false)
          }}
        >
          Toggle Environments
        </button>
      </div>
    ),
  }
})

jest.mock('@/components/userProfile/SettingsOptions', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="settings-options">Settings Options Component</div>
  ),
}))

jest.mock('@/components/userProfile/Logout', () => ({
  __esModule: true,
  default: () => <div data-testid="logout">Logout Component</div>,
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({
    children,
    style,
    className,
    gap,
    p,
    classNames,
    onClick,
  }: {
    children: React.ReactNode
    style?: React.CSSProperties
    className?: string
    classNames?: { root: string }
    gap?: number | string
    p?: string
    onClick?: () => void
  }) => (
    <div
      data-testid="mantine-stack"
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  ),
  Divider: () => <hr data-testid="mantine-divider" />,
  Text: ({
    children,
    c,
    fz,
    fw,
    ta,
    p,
  }: {
    children: React.ReactNode
    c?: string
    fz?: string
    fw?: number
    ta?: string
    p?: string
  }) => (
    <div
      data-testid="mantine-text"
      style={{ color: c, fontSize: fz, fontWeight: fw }}
    >
      {children}
    </div>
  ),
}))

// Mock CSS module
jest.mock('@/components/userProfile/userProfile.module.css', () => ({
  dropdownStack: 'mock-dropdown-stack',
  dropdownItem: 'mock-dropdown-item',
  dropdownItemActive: 'mock-dropdown-item-active',
}))

// Import the actual component
import UserProfile from '@/components/userProfile/UserProfile'

describe('UserProfile', () => {
  // Mock props
  const mockProjects: Project[] = [
    { id: 1, name: 'Project 1' },
    { id: 2, name: 'Project 2' },
  ]
  const mockCurrentProject: Project = mockProjects[0]
  const mockCurrentEnvironment: Environment = 'development'
  const mockOnProjectChange = jest.fn()
  const mockOnEnvironmentChange = jest.fn()

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // Clear all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
  })

  it('renders all child components', () => {
    render(
      <UserProfile
        currentProject={mockCurrentProject}
        projects={mockProjects}
        currentEnvironment={mockCurrentEnvironment}
        onProjectChange={mockOnProjectChange}
        onEnvironmentChange={mockOnEnvironmentChange}
      />,
    )

    // Check if all child components are rendered
    expect(screen.getByTestId('user-info')).toBeTruthy()
    expect(screen.getByTestId('project-selection')).toBeTruthy()
    expect(screen.getByTestId('environment-selection')).toBeTruthy()
    expect(screen.getByTestId('settings-options')).toBeTruthy()
    expect(screen.getByTestId('logout')).toBeTruthy()

    // Check if dividers are rendered
    const dividers = screen.getAllByTestId('mantine-divider')
    expect(dividers.length).toBeGreaterThan(0)
  })

  it('toggles project dropdown when ProjectSelection button is clicked', () => {
    render(
      <UserProfile
        currentProject={mockCurrentProject}
        projects={mockProjects}
        currentEnvironment={mockCurrentEnvironment}
        onProjectChange={mockOnProjectChange}
        onEnvironmentChange={mockOnEnvironmentChange}
      />,
    )

    // Initially dropdown should be closed, so project IDs won't be visible
    expect(screen.queryByText('Project ID: 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Project ID: 2')).not.toBeInTheDocument()

    // Click the toggle button for projects dropdown
    fireEvent.click(screen.getByTestId('toggle-projects-dropdown'))

    // Now project IDs should be visible in the dropdown
    expect(screen.getByText('Project ID: 1')).toBeInTheDocument()
    expect(screen.getByText('Project ID: 2')).toBeInTheDocument()
  })

  it('toggles environment dropdown when EnvironmentSelection button is clicked', () => {
    render(
      <UserProfile
        currentProject={mockCurrentProject}
        projects={mockProjects}
        currentEnvironment={mockCurrentEnvironment}
        onProjectChange={mockOnProjectChange}
        onEnvironmentChange={mockOnEnvironmentChange}
      />,
    )

    // Initially env dropdown should be closed
    expect(screen.queryByText('Development')).not.toBeInTheDocument()
    expect(screen.queryByText('Staging')).not.toBeInTheDocument()
    expect(screen.queryByText('Production')).not.toBeInTheDocument()

    // Click the toggle button for environment dropdown
    fireEvent.click(screen.getByTestId('toggle-env-dropdown'))

    // Now environment options should be visible
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('Staging')).toBeInTheDocument()
    expect(screen.getByText('Production')).toBeInTheDocument()
  })

  it('handles project selection correctly', async () => {
    render(
      <UserProfile
        currentProject={mockCurrentProject}
        projects={mockProjects}
        currentEnvironment={mockCurrentEnvironment}
        onProjectChange={mockOnProjectChange}
        onEnvironmentChange={mockOnEnvironmentChange}
      />,
    )

    // Open the projects dropdown
    fireEvent.click(screen.getByTestId('toggle-projects-dropdown'))

    // Click on the project with ID 2
    const projectItem = screen
      .getByText('Project ID: 2')
      .closest('[data-testid="mantine-stack"]')
    expect(projectItem).toBeInTheDocument()
    fireEvent.click(projectItem!)

    // Verify the mutation was called with the right parameters
    expect(mockMutate).toHaveBeenCalledWith(
      {
        project_id: 2,
        environment: mockCurrentEnvironment,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )

    // Verify localStorage was updated (called by the component's onSuccess handler)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'token',
      'mocked-token',
    )
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'tokenExpiry',
      '2023-12-31',
    )

    // Verify the onProjectChange callback was called with the right parameters
    expect(mockOnProjectChange).toHaveBeenCalledWith(
      { id: 2, name: 'Project 2' },
      'development',
    )
  })

  it('handles environment selection correctly', async () => {
    render(
      <UserProfile
        currentProject={mockCurrentProject}
        projects={mockProjects}
        currentEnvironment={mockCurrentEnvironment}
        onProjectChange={mockOnProjectChange}
        onEnvironmentChange={mockOnEnvironmentChange}
      />,
    )

    // Open the environments dropdown
    fireEvent.click(screen.getByTestId('toggle-env-dropdown'))

    // Click on the Staging environment
    const stagingItem = screen
      .getByText('Staging')
      .closest('[data-testid="mantine-stack"]')
    expect(stagingItem).toBeInTheDocument()
    fireEvent.click(stagingItem!)

    // Verify the mutation was called with the right parameters
    expect(mockMutate).toHaveBeenCalledWith(
      {
        project_id: mockCurrentProject.id,
        environment: 'staging',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )

    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'token',
      'mocked-token',
    )
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'tokenExpiry',
      '2023-12-31',
    )

    // Verify the onEnvironmentChange callback was called
    expect(mockOnEnvironmentChange).toHaveBeenCalledWith('staging')
  })

  it('does not attempt to switch environments if no project is selected', async () => {
    // Render with null current project
    render(
      <UserProfile
        currentProject={null}
        projects={mockProjects}
        currentEnvironment={mockCurrentEnvironment}
        onProjectChange={mockOnProjectChange}
        onEnvironmentChange={mockOnEnvironmentChange}
      />,
    )

    // Open the environments dropdown
    fireEvent.click(screen.getByTestId('toggle-env-dropdown'))

    // Click on the Staging environment
    const stagingItem = screen
      .getByText('Staging')
      .closest('[data-testid="mantine-stack"]')
    expect(stagingItem).toBeInTheDocument()
    fireEvent.click(stagingItem!)

    // Verify the mutation was NOT called since there's no current project
    expect(mockMutate).not.toHaveBeenCalled()

    // Verify localStorage was NOT updated
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()

    // Verify onEnvironmentChange was NOT called
    expect(mockOnEnvironmentChange).not.toHaveBeenCalled()
  })
})
