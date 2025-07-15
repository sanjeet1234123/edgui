// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock projectsApi
const mockGetProjects = jest.fn()
jest.mock('@/api/projectsApi', () => ({
  __esModule: true,
  default: { getProjects: mockGetProjects },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useProjectsQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('prefetchProjects has correct queryKey and queryFn', () => {
    const { prefetchProjects } = require('@/hooks/queries/useProjectsQueries')
    expect(prefetchProjects.queryKey).toEqual(['projects'])
    expect(typeof prefetchProjects.queryFn).toBe('function')
  })

  it('prefetchProjects.queryFn calls projectsApi.getProjects', async () => {
    mockGetProjects.mockResolvedValue(['proj1', 'proj2'])
    const { prefetchProjects } = require('@/hooks/queries/useProjectsQueries')
    const result = await prefetchProjects.queryFn()
    expect(mockGetProjects).toHaveBeenCalled()
    expect(result).toEqual(['proj1', 'proj2'])
  })

  it('useGetProjectsQuery returns data from projectsApi.getProjects', async () => {
    mockGetProjects.mockResolvedValue([{ id: 1, name: 'Project1' }])
    const {
      useGetProjectsQuery,
    } = require('@/hooks/queries/useProjectsQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetProjectsQuery(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual([{ id: 1, name: 'Project1' }])
  })
})
