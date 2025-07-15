// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost:3000/v1',
}))

// Mock the components
jest.mock('@/components/workspace', () => ({
  WorkspaceBody: () => <div data-testid="workspace-body">Workspace Body</div>,
  WorkspaceHeader: () => (
    <div data-testid="workspace-header">Workspace Header</div>
  ),
  WorkspaceSkeleton: () => (
    <div data-testid="workspace-skeleton">Workspace Skeleton</div>
  ),
}))

// Mock the role store as a jest function
const mockCheckRoles = jest.fn()
jest.mock('@/store/roleStore', () => ({
  useRoleStore: jest.fn(() => ({
    checkRoles: mockCheckRoles,
  })),
}))

// Mock the query client and workspace queries
jest.mock('@/hooks/queries/useWorkspaceQueries', () => ({
  prefetchWorkspaceMembers: {
    queryKey: ['workspace-members'],
  },
}))

const mockQueryClient = {
  prefetchQuery: jest.fn(),
}

// Mock the router context
const mockContext = {
  queryClient: mockQueryClient,
}

// Mock the error component to render error.message as a text node
jest.mock('@/components/ui/componentError', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line no-console
    console.log('Error prop in mock:', props)
    return (
      <div data-testid="error-component">
        {props.error && props.error.error && props.error.error.message ? (
          <span>{props.error.error.message}</span>
        ) : (
          ''
        )}
      </div>
    )
  },
}))

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => routeConfig => ({
    ...routeConfig,
    loader: routeConfig.loader,
    component: routeConfig.component,
    pendingComponent: routeConfig.pendingComponent,
    errorComponent: routeConfig.errorComponent,
  }),
}))

// Mock axios and other dependencies
jest.mock('axios', () => ({
  create: jest.fn(),
}))

// Import the actual components for testing (after mocks)
import { Route } from '@/routes/_app/workspace'

describe('Workspace Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the default mock for useRoleStore
    require('@/store/roleStore').useRoleStore.mockReturnValue({
      checkRoles: mockCheckRoles,
    })
  })

  const renderWithProvider = ui =>
    render(<MantineProvider>{ui}</MantineProvider>)

  it('should render workspace component correctly', () => {
    renderWithProvider(<Route.component />)
    expect(screen.getByTestId('workspace-header')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-body')).toBeInTheDocument()
  })

  it('should call checkRoles on mount', () => {
    const customCheckRoles = jest.fn()
    require('@/store/roleStore').useRoleStore.mockReturnValue({
      checkRoles: customCheckRoles,
    })
    renderWithProvider(<Route.component />)
    expect(customCheckRoles).toHaveBeenCalled()
  })

  it('should render pending component', () => {
    const PendingComponent = Route.pendingComponent
    renderWithProvider(<PendingComponent />)
    expect(screen.getByTestId('workspace-skeleton')).toBeInTheDocument()
  })

  it('should render error component', () => {
    const ErrorComponent = Route.errorComponent
    const testError = new Error('Test error')
    renderWithProvider(<ErrorComponent error={testError} />)
    expect(screen.getByTestId('error-component')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('should prefetch workspace members in loader', () => {
    const result = Route.loader({ context: mockContext })
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalled()
    expect(result).toEqual({ pageTitle: 'Workspace' })
  })
})
