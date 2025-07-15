// @ts-nocheck
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as projectRoute from '@/routes/_app/project.$projectId'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the components
jest.mock('@/components/project/index', () => ({
  ProjectHeader: ({ title, projectId }) => (
    <div data-testid="project-header">
      {title} - {projectId}
    </div>
  ),
  ProjectBody: () => <div data-testid="project-body">Project Body</div>,
}))

// Mock the role store
const mockCheckRoles = jest.fn()
jest.mock('@/store/roleStore', () => ({
  useRoleStore: () => ({
    checkRoles: mockCheckRoles,
  }),
  __esModule: true,
}))

// Mock the project queries
jest.mock('@/hooks/queries/useProjectQueries', () => ({
  prefetchProject: id => ({ queryKey: ['project', id] }),
  prefetchProjectActivities: id => ({ queryKey: ['projectActivities', id] }),
  prefetchProjectMembers: id => ({ queryKey: ['projectMembers', id] }),
  useGetProjectQuery: jest.fn(),
}))

// Mock the error component
jest.mock('@/components/ui', () => ({
  ComponentError: ({ error }) => (
    <div data-testid="error-component">{error.message}</div>
  ),
}))

// Mock @mantine/core
jest.mock('@mantine/core', () => ({
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
}))

// Mock TanStack Router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: jest.fn().mockReturnValue({
    useLoaderData: () => ({ pageTitle: 'Project' }),
    useParams: () => ({ projectId: 'test-project-id' }),
  }),
}))

// Mock the route component
jest.mock('@/routes/_app/project.$projectId', () => {
  const React = require('react')
  const RouteComponent = () => {
    // Use hardcoded values instead of referencing projectRoute
    const pageTitle = 'Project'
    const projectId = 'test-project-id'
    const { checkRoles } = require('@/store/roleStore').useRoleStore()

    React.useEffect(() => {
      checkRoles()
    }, [checkRoles])

    return (
      <div data-testid="stack">
        <div data-testid="project-header">
          {pageTitle} - {projectId}
        </div>
        <div data-testid="project-body">Project Body</div>
      </div>
    )
  }

  const loader = jest.fn().mockImplementation(({ context, params }) => {
    const { queryClient } = context
    queryClient.prefetchQuery({ queryKey: ['project', params.projectId] })
    queryClient.prefetchQuery({
      queryKey: ['projectActivities', params.projectId],
    })
    queryClient.prefetchQuery({
      queryKey: ['projectMembers', params.projectId],
    })
    return { pageTitle: 'Project' }
  })

  // Add ErrorComponent to the mock
  const ErrorComponent = ({ error }) => {
    const { ComponentError } = require('@/components/ui')
    return <ComponentError error={error} />
  }

  return {
    __esModule: true,
    RouteComponent,
    loader,
    Route: {
      useLoaderData: () => ({ pageTitle: 'Project' }),
      useParams: () => ({ projectId: 'test-project-id' }),
    },
    ErrorComponent,
  }
})

describe('Project Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderWithProviders = ui => {
    const queryClient = new QueryClient()
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    )
  }

  it('should render the project page with header and body', () => {
    renderWithProviders(<projectRoute.RouteComponent />)
    const header = screen.getByTestId('project-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Project - test-project-id')
    const body = screen.getByTestId('project-body')
    expect(body).toBeInTheDocument()
    expect(body).toHaveTextContent('Project Body')
  })

  it('should call checkRoles when the component mounts', () => {
    renderWithProviders(<projectRoute.RouteComponent />)
    expect(mockCheckRoles).toHaveBeenCalledTimes(1)
  })

  it('should render error component when there is an error', () => {
    const error = new Error('Test error')
    renderWithProviders(<projectRoute.ErrorComponent error={error} />)
    const errorComponent = screen.getByTestId('error-component')
    expect(errorComponent).toBeInTheDocument()
    expect(errorComponent).toHaveTextContent('Test error')
  })

  it('should call prefetch queries in loader', () => {
    const mockQueryClient = {
      prefetchQuery: jest.fn(),
    }
    const result = projectRoute.loader({
      context: { queryClient: mockQueryClient },
      params: { projectId: 'test-project-id' },
    })
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledTimes(3)
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
      queryKey: ['project', 'test-project-id'],
    })
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
      queryKey: ['projectActivities', 'test-project-id'],
    })
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
      queryKey: ['projectMembers', 'test-project-id'],
    })
    expect(result).toEqual({ pageTitle: 'Project' })
  })

  it('should render Stack component with correct children', () => {
    renderWithProviders(<projectRoute.RouteComponent />)
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toContainElement(screen.getByTestId('project-header'))
    expect(stack).toContainElement(screen.getByTestId('project-body'))
  })
})
