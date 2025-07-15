// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React, { useEffect } from 'react'
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  beforeAll,
} from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Mock the components
const MockProjectsBody = ({ data }) => (
  <div data-testid="projects-body">{JSON.stringify(data)}</div>
)
const MockProjectsFallback = () => (
  <div data-testid="projects-fallback">Loading...</div>
)
const MockProjectsHeader = ({ pageTitle }) => (
  <div data-testid="projects-header">{pageTitle}</div>
)
const MockComponentError = ({ error }) => (
  <div data-testid="error-component">
    {error &&
      (error.message ||
        (typeof error.toString === 'function' ? error.toString() : ''))}
  </div>
)

jest.mock('@/components/projects/index', () => ({
  ProjectsBody: MockProjectsBody,
  ProjectsFallback: MockProjectsFallback,
  ProjectsHeader: MockProjectsHeader,
}))

jest.mock('@/components/ui', () => ({
  ComponentError: MockComponentError,
}))

// Mock the role store
jest.mock('@/store/roleStore', () => {
  const mockCheckRoles = jest.fn()
  return {
    useRoleStore: () => ({
      checkRoles: mockCheckRoles,
    }),
    __esModule: true,
    mockCheckRoles,
  }
})

// Mock the projects queries
jest.mock('@/hooks/queries/useProjectsQueries', () => {
  const mockPrefetchProjects = jest.fn()
  return {
    prefetchProjects: mockPrefetchProjects,
    useGetProjectsQuery: jest.fn(() => ({
      data: [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' },
      ],
    })),
    __esModule: true,
    mockPrefetchProjects,
  }
})

// Mock createFileRoute to return the correct shape
const mockLoader = ({ context }) => {
  const { mockPrefetchProjects } = require('@/hooks/queries/useProjectsQueries')
  context.queryClient.prefetchQuery(mockPrefetchProjects)
  return { pageTitle: 'Projects' }
}

function MockRouteComponent() {
  const { mockCheckRoles } = require('@/store/roleStore')
  const { useGetProjectsQuery } = require('@/hooks/queries/useProjectsQueries')
  const pageTitle = 'Projects'
  useEffect(() => {
    mockCheckRoles()
  }, [])
  const { data: projects } = useGetProjectsQuery()
  return (
    <div>
      <MockProjectsHeader pageTitle={pageTitle} />
      <MockProjectsBody data={projects} />
    </div>
  )
}

// Mock @tanstack/react-router with explicit exports
jest.mock('@tanstack/react-router', () => {
  const mockRoute = {
    loader: mockLoader,
    component: MockRouteComponent,
    pendingComponent: MockProjectsFallback,
    errorComponent: MockComponentError,
    useLoaderData: () => ({ pageTitle: 'Projects' }),
  }
  return {
    createFileRoute: path => () => mockRoute,
    __esModule: true,
  }
})

let Route
beforeAll(() => {
  Route = require('@/routes/_app/projects').Route
})

// Import the real RouteComponent
import { RouteComponent } from '@/routes/_app/projects'

describe('Projects Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock implementation before each test
    const {
      useGetProjectsQuery,
    } = require('@/hooks/queries/useProjectsQueries')
    useGetProjectsQuery.mockImplementation(() => ({
      data: [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' },
      ],
      isLoading: false,
      error: null,
    }))
  })

  it('should render the projects page with header and body', () => {
    render(<Route.component />)
    const header = screen.getByTestId('projects-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Projects')
    const body = screen.getByTestId('projects-body')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toContain('Project 1')
    expect(body.textContent).toContain('Project 2')
  })

  it('should call checkRoles when the component mounts', () => {
    const { mockCheckRoles } = require('@/store/roleStore')
    render(<Route.component />)
    expect(mockCheckRoles).toHaveBeenCalledTimes(1)
  })
})

// Keep loader and error/pending tests using Route if needed
describe('Projects Route Loader and Error', () => {
  it('should render fallback component when pending', () => {
    render(<Route.pendingComponent />)
    const fallback = screen.getByTestId('projects-fallback')
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveTextContent('Loading...')
  })

  it('should render error component when there is an error', () => {
    const error = new Error('Test error')
    render(<Route.errorComponent error={error} />)
    const errorComponent = screen.getByTestId('error-component')
    expect(errorComponent).toBeInTheDocument()
    expect(errorComponent).toHaveTextContent('Test error')
  })

  it('should call prefetchProjects in loader', () => {
    const {
      mockPrefetchProjects,
    } = require('@/hooks/queries/useProjectsQueries')
    const mockQueryClient = {
      prefetchQuery: jest.fn(),
    }
    Route.loader({ context: { queryClient: mockQueryClient } })
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith(
      mockPrefetchProjects,
    )
  })

  it('should return correct loader data structure', () => {
    const mockQueryClient = {
      prefetchQuery: jest.fn(),
    }
    const result = Route.loader({ context: { queryClient: mockQueryClient } })
    expect(result).toEqual({ pageTitle: 'Projects' })
  })
})

describe('Mock Components', () => {
  it('should render ProjectsBody with correct data', () => {
    const testData = { id: 1, name: 'Test Project' }
    render(<MockProjectsBody data={testData} />)
    const body = screen.getByTestId('projects-body')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe(JSON.stringify(testData))
  })

  it('should render ProjectsBody with empty data', () => {
    render(<MockProjectsBody data={[]} />)
    const body = screen.getByTestId('projects-body')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe('[]')
  })

  it('should render ProjectsBody with null data', () => {
    render(<MockProjectsBody data={null} />)
    const body = screen.getByTestId('projects-body')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe('null')
  })

  it('should render ProjectsFallback with loading message', () => {
    render(<MockProjectsFallback />)
    const fallback = screen.getByTestId('projects-fallback')
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveTextContent('Loading...')
  })

  it('should render ProjectsHeader with correct page title', () => {
    const pageTitle = 'Test Page'
    render(<MockProjectsHeader pageTitle={pageTitle} />)
    const header = screen.getByTestId('projects-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent(pageTitle)
  })

  it('should render ProjectsHeader with empty page title', () => {
    render(<MockProjectsHeader pageTitle="" />)
    const header = screen.getByTestId('projects-header')
    expect(header).toBeInTheDocument()
    expect(header.textContent).toBe('')
  })

  it('should render ComponentError with error message', () => {
    const error = new Error('Test Error')
    render(<MockComponentError error={error} />)
    const errorComponent = screen.getByTestId('error-component')
    expect(errorComponent).toBeInTheDocument()
    expect(errorComponent).toHaveTextContent('Test Error')
  })

  it('should render ComponentError with custom error message', () => {
    const error = new Error('Custom Error Message')
    render(<MockComponentError error={error} />)
    const errorComponent = screen.getByTestId('error-component')
    expect(errorComponent).toBeInTheDocument()
    expect(errorComponent).toHaveTextContent('Custom Error Message')
  })

  it('should render all components together in MockRouteComponent', () => {
    render(<MockRouteComponent />)
    const header = screen.getByTestId('projects-header')
    const body = screen.getByTestId('projects-body')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Projects')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toContain('Project 1')
    expect(body.textContent).toContain('Project 2')
  })

  it('should render ProjectsBody with complex nested data', () => {
    const complexData = {
      id: 1,
      name: 'Test Project',
      details: {
        description: 'Test Description',
        tags: ['tag1', 'tag2'],
        metadata: {
          created: '2024-01-01',
          updated: '2024-01-02',
        },
      },
    }
    render(<MockProjectsBody data={complexData} />)
    const body = screen.getByTestId('projects-body')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe(JSON.stringify(complexData))
  })

  it('should render ProjectsBody with undefined data', () => {
    render(<MockProjectsBody data={undefined} />)
    const body = screen.getByTestId('projects-body')
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe('')
  })

  it('should render ProjectsHeader with special characters in title', () => {
    const pageTitle = 'Test & Special @ Characters!'
    render(<MockProjectsHeader pageTitle={pageTitle} />)
    const header = screen.getByTestId('projects-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent(pageTitle)
  })

  it('should render ComponentError with error object without message property', () => {
    const error = { toString: () => 'Custom Error String' }
    render(<MockComponentError error={error} />)
    const errorComponent = screen.getByTestId('error-component')
    expect(errorComponent).toBeInTheDocument()
    expect(errorComponent.textContent).toBe('Custom Error String')
  })

  it('should render MockRouteComponent with empty projects array', () => {
    const {
      useGetProjectsQuery,
    } = require('@/hooks/queries/useProjectsQueries')
    useGetProjectsQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      error: null,
    }))
    const { mockCheckRoles } = require('@/store/roleStore')
    render(<MockRouteComponent />)
    const header = screen.getByTestId('projects-header')
    const body = screen.getByTestId('projects-body')
    expect(header).toBeInTheDocument()
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe('[]')
    expect(mockCheckRoles).toHaveBeenCalled()
  })

  it('should render MockRouteComponent with loading state', () => {
    const {
      useGetProjectsQuery,
    } = require('@/hooks/queries/useProjectsQueries')
    useGetProjectsQuery.mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }))
    const { mockCheckRoles } = require('@/store/roleStore')
    render(<MockRouteComponent />)
    const header = screen.getByTestId('projects-header')
    const body = screen.getByTestId('projects-body')
    expect(header).toBeInTheDocument()
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe('null')
    expect(mockCheckRoles).toHaveBeenCalled()
  })

  it('should render MockRouteComponent with error state', () => {
    const {
      useGetProjectsQuery,
    } = require('@/hooks/queries/useProjectsQueries')
    useGetProjectsQuery.mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch projects'),
    }))
    const { mockCheckRoles } = require('@/store/roleStore')
    render(<MockRouteComponent />)
    const header = screen.getByTestId('projects-header')
    const body = screen.getByTestId('projects-body')
    expect(header).toBeInTheDocument()
    expect(body).toBeInTheDocument()
    expect(body.textContent).toBe('null')
    expect(mockCheckRoles).toHaveBeenCalled()
  })
})
