// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useGetProjects } from '@/hooks/queries/useHeaderQueries'
import type { Project, Environment } from '@/types/headerType'
import { MantineProvider } from '@mantine/core'

// Mock useGetProjects hook
jest.mock('@/hooks/queries/useHeaderQueries', () => ({
  useGetProjects: jest.fn(),
}))

// Mock Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useDisclosure: jest.fn(() => [false, { close: jest.fn(), open: jest.fn() }]),
}))

// Mock Mantine components with proper Popover behavior
jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core')
  const mockReact = jest.requireActual('react')

  // Create a mock Popover that actually renders its content when opened
  const MockPopover = ({ children, opened, onDismiss }) => {
    const target = mockReact.Children.toArray(children).find(
      child =>
        child.props &&
        (child.type === MockPopover.Target ||
          child.type.displayName === 'PopoverTarget'),
    )
    const dropdown = mockReact.Children.toArray(children).find(
      child =>
        child.props &&
        (child.type === MockPopover.Dropdown ||
          child.type.displayName === 'PopoverDropdown'),
    )

    const [isOpen, setIsOpen] = mockReact.useState(opened || false)

    mockReact.useEffect(() => {
      setIsOpen(opened || false)
    }, [opened])

    const handleTargetClick = () => {
      setIsOpen(!isOpen)
    }

    return mockReact.createElement(
      'div',
      {},
      [
        mockReact.createElement(
          'div',
          { onClick: handleTargetClick, key: 'target' },
          target?.props?.children,
        ),
        isOpen &&
          mockReact.createElement(
            'div',
            { 'data-testid': 'popover-dropdown', key: 'dropdown' },
            dropdown?.props?.children,
          ),
      ].filter(Boolean),
    )
  }

  MockPopover.Target = ({ children }) =>
    mockReact.createElement(
      'div',
      { 'data-testid': 'popover-target' },
      children,
    )
  MockPopover.Dropdown = ({ children }) =>
    mockReact.createElement('div', {}, children)

  return {
    ...actual,
    MantineProvider: ({ children }) =>
      mockReact.createElement('div', {}, children),
    Popover: MockPopover,
    Group: ({ children, gap, style, onClick }) =>
      mockReact.createElement(
        'div',
        {
          'data-testid': 'group',
          style,
          onClick,
          'data-gap': gap,
        },
        children,
      ),
    Avatar: ({ name, color, size }) =>
      mockReact.createElement(
        'div',
        {
          'data-testid': 'avatar',
          'data-name': name,
          'data-color': color,
          'data-size': size,
        },
        name?.substring(0, 2) || 'AV',
      ),
    Text: ({ children, fz, fw, className }) =>
      mockReact.createElement(
        'span',
        {
          'data-testid': 'text',
          'data-fz': fz,
          'data-fw': fw,
          className,
        },
        children,
      ),
  }
})

// Mock the UserProfile component since we're not testing it
jest.mock('@/components/userProfile/UserProfile', () => ({
  __esModule: true,
  default: props => {
    const mockReact = jest.requireActual('react')
    return mockReact.createElement('div', { 'data-testid': 'user-profile' }, [
      mockReact.createElement(
        'button',
        {
          'data-testid': 'change-project-btn',
          onClick: () => {
            if (props.projects?.length > 0) {
              props.onProjectChange(props.projects[0], 'production')
            }
          },
          key: 'project-btn',
        },
        'Change Project',
      ),
      mockReact.createElement(
        'button',
        {
          'data-testid': 'change-env-btn',
          onClick: () => props.onEnvironmentChange('production'),
          key: 'env-btn',
        },
        'Change Environment',
      ),
    ])
  },
}))

// Mock localStorage
const localStorageMock = (function () {
  let store = {}
  return {
    getItem: jest.fn(key => {
      return store[key] || null
    }),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    removeItem: jest.fn(key => {
      delete store[key]
    }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Sample project data
const mockProjects = {
  project: [
    {
      id: 1,
      name: 'Project 1',
      environment: 'development',
      created_at: '',
      created_by: 0,
      deleted_at: null,
      description: '',
      members: null,
      organization_id: 0,
      project_id: 1,
      updated_at: '',
      updated_by: 0,
      workspace_id: '',
    },
    {
      id: 2,
      name: 'Project 2',
      environment: 'production',
      created_at: '',
      created_by: 0,
      deleted_at: null,
      description: '',
      members: null,
      organization_id: 0,
      project_id: 2,
      updated_at: '',
      updated_by: 0,
      workspace_id: '',
    },
  ],
}

// Import the actual ProjectPopover component
import ProjectPopover from '@/components/header/ProjectPopover'
import React from 'react'

// Mock useDisclosure hook
const { useDisclosure } = require('@mantine/hooks')

// Create a custom render function that includes MantineProvider
const customRender = ui => {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

describe('ProjectPopover', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()

    // Reset useDisclosure mock
    useDisclosure.mockReturnValue([
      false,
      { close: jest.fn(), open: jest.fn() },
    ])

    // Default mock implementation
    useGetProjects.mockReturnValue({
      data: null,
      isSuccess: false,
      isLoading: true,
    })
  })

  it('shows loading state when projects are being fetched', () => {
    useGetProjects.mockReturnValue({
      data: null,
      isSuccess: false,
      isLoading: true,
    })

    customRender(<ProjectPopover />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('loads project from localStorage on initial render', () => {
    localStorageMock.setItem('project_id', '1')
    localStorageMock.setItem('project_name', 'Cached Project')
    localStorageMock.setItem('project_env', 'staging')

    useGetProjects.mockReturnValue({
      data: null,
      isSuccess: false,
      isLoading: false,
    })

    customRender(<ProjectPopover />)

    // Should display from localStorage while loading
    expect(screen.getByText('Cached Project/Staging')).toBeInTheDocument()
  })

  it('displays the first project when API call succeeds', () => {
    useGetProjects.mockReturnValue({
      data: mockProjects,
      isSuccess: true,
      isLoading: false,
    })

    customRender(<ProjectPopover />)

    // Should display the first project
    expect(screen.getByText('Project 1/Development')).toBeInTheDocument()
  })

  it('maintains selected project from localStorage when API call succeeds', () => {
    // Set project_id to match the second project in mock data
    localStorageMock.setItem('project_id', '2')

    useGetProjects.mockReturnValue({
      data: mockProjects,
      isSuccess: true,
      isLoading: false,
    })

    customRender(<ProjectPopover />)

    // Should display the second project that matches localStorage ID
    expect(screen.getByText('Project 2/Production')).toBeInTheDocument()
  })

  it('renders user profile component when clicked', async () => {
    // Mock useDisclosure to return opened state
    let mockOpen = jest.fn()
    let mockClose = jest.fn()
    useDisclosure.mockReturnValue([true, { close: mockClose, open: mockOpen }])

    useGetProjects.mockReturnValue({
      data: mockProjects,
      isSuccess: true,
      isLoading: false,
    })

    customRender(<ProjectPopover />)

    // The user profile should be visible since popover is opened
    await waitFor(() => {
      expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    })
  })

  it('handles project and environment changes', async () => {
    // Mock useDisclosure to return opened state
    let mockOpen = jest.fn()
    let mockClose = jest.fn()
    useDisclosure.mockReturnValue([true, { close: mockClose, open: mockOpen }])

    useGetProjects.mockReturnValue({
      data: mockProjects,
      isSuccess: true,
      isLoading: false,
    })

    customRender(<ProjectPopover />)

    // Wait for the popover content to be visible
    await waitFor(async () => {
      // Test environment change
      const changeEnvButton = screen.getByTestId('change-env-btn')
      fireEvent.click(changeEnvButton)

      // Environment should change to 'Production'
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'project_env',
        'production',
      )

      // Test project change
      const changeProjectButton = screen.getByTestId('change-project-btn')
      fireEvent.click(changeProjectButton)

      // Project and environment should be updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('project_id', '1')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'project_name',
        'Project 1',
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'project_env',
        'production',
      )
    })
  })
})
