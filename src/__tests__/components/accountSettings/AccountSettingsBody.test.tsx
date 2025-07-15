// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountSettingsBody from '@/components/accountSettings/AccountSettingsBody'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockImplementation(query => {
    if (query === '(max-width: 1024px)') {
      return false // Default to desktop view
    }
    return false
  }),
}))

// Mock the projects query hook
jest.mock('@/hooks/queries/useProjectsQueries', () => ({
  useGetProjectsQuery: jest.fn().mockReturnValue({
    data: [
      { id: 1, name: 'Project 1' },
      { id: 2, name: 'Project 2' },
    ],
    isLoading: false,
  }),
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconSettings: () => <div data-testid="settings-icon">Settings Icon</div>,
  IconUser: () => <div data-testid="user-icon">User Icon</div>,
  IconUsers: () => <div data-testid="users-icon">Users Icon</div>,
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const TabsComponent = ({
    children,
    orientation,
    defaultValue,
    className,
    classNames,
    variant,
  }) => {
    return (
      <div
        data-testid="tabs"
        data-orientation={orientation}
        data-default-value={defaultValue}
        data-variant={variant}
        className={className}
        data-tab-class={classNames?.tab || 'tab'}
        data-panel-class={classNames?.panel || 'panel'}
        data-list-class={classNames?.list || 'list'}
      >
        {children}
      </div>
    )
  }
  TabsComponent.List = ({ children }) => (
    <div data-testid="tabs-list">{children}</div>
  )
  TabsComponent.Tab = ({ children, value, leftSection, size, color }) => (
    <button
      data-testid={`tab-${value}`}
      data-value={value}
      data-size={size}
      data-color={color}
    >
      {leftSection}
      {children}
    </button>
  )
  TabsComponent.Panel = ({ children, value, ps, pt }) => (
    <div
      data-testid={`panel-${value}`}
      data-value={value}
      data-ps={ps}
      data-pt={pt}
    >
      {children}
    </div>
  )

  return {
    Stack: ({ children }) => <div data-testid="stack">{children}</div>,
    Tabs: TabsComponent,
  }
})

// Mock the child components
jest.mock('@/components/accountSettings/UserDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="user-details">User Details</div>,
}))

jest.mock('@/components/accountSettings/WorkspaceDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="workspace-details">Workspace Details</div>,
}))

jest.mock('@/components/accountSettings/ProjectDetails', () => ({
  __esModule: true,
  default: ({ data, isLoading }) => (
    <div
      data-testid="project-details"
      data-loading={isLoading ? 'true' : 'false'}
    >
      {data?.map(project => <div key={project.id}>{project.name}</div>)}
    </div>
  ),
}))

// Mock the CSS module
jest.mock('@/components/accountSettings/accountSettings.module.css', () => ({
  tabSection: 'tabSection',
  tab: 'tab',
  panel: 'panel',
  list: 'list',
}))

describe('AccountSettingsBody', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all tabs correctly', () => {
    render(<AccountSettingsBody />)

    // Check if all tabs are rendered
    expect(screen.getByTestId('tab-user-details')).toBeInTheDocument()
    expect(screen.getByTestId('tab-workspace')).toBeInTheDocument()
    expect(screen.getByTestId('tab-projects')).toBeInTheDocument()

    // Check if tab icons are rendered
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
  })

  it('shows user details panel by default', () => {
    render(<AccountSettingsBody />)
    expect(screen.getByTestId('panel-user-details')).toBeInTheDocument()
    expect(screen.getByTestId('user-details')).toBeInTheDocument()
  })

  it('renders projects data correctly', () => {
    render(<AccountSettingsBody />)
    const projectDetails = screen.getByTestId('project-details')
    expect(projectDetails).toBeInTheDocument()
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 2')).toBeInTheDocument()
  })

  it('handles loading state for projects', () => {
    // Mock loading state
    const {
      useGetProjectsQuery,
    } = require('@/hooks/queries/useProjectsQueries')
    useGetProjectsQuery.mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(<AccountSettingsBody />)
    const projectDetails = screen.getByTestId('project-details')
    expect(projectDetails).toHaveAttribute('data-loading', 'true')
  })

  it('uses vertical orientation on desktop', () => {
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') {
        return false
      }
      return false
    })
    render(<AccountSettingsBody />)
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toHaveAttribute('data-orientation', 'vertical')
  })

  it('uses horizontal orientation on mobile', () => {
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') {
        return true
      }
      return false
    })
    render(<AccountSettingsBody />)
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('applies correct CSS classes', () => {
    render(<AccountSettingsBody />)
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toHaveAttribute('data-tab-class', 'tab')
    expect(tabs).toHaveAttribute('data-panel-class', 'panel')
    expect(tabs).toHaveAttribute('data-list-class', 'list')
  })

  it('renders workspace details when workspace tab is clicked', () => {
    render(<AccountSettingsBody />)
    const workspaceTab = screen.getByTestId('tab-workspace')
    fireEvent.click(workspaceTab)
    expect(screen.getByTestId('workspace-details')).toBeInTheDocument()
  })

  it('renders project details when projects tab is clicked', () => {
    render(<AccountSettingsBody />)
    const projectsTab = screen.getByTestId('tab-projects')
    fireEvent.click(projectsTab)
    expect(screen.getByTestId('project-details')).toBeInTheDocument()
  })

  it('handles empty projects data', () => {
    require('@/hooks/queries/useProjectsQueries').useGetProjectsQuery.mockReturnValue(
      {
        data: [],
        isLoading: false,
      },
    )
    render(<AccountSettingsBody />)
    const projectDetails = screen.getByTestId('project-details')
    expect(projectDetails).toBeInTheDocument()
  })
})
