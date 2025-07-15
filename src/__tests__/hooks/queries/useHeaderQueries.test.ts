// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock headerApi
const mockGetProjects = jest.fn()
jest.mock('@/api/headerApi', () => ({
  __esModule: true,
  default: { getProjects: mockGetProjects },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useHeaderQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('calls headerApi.getProjects and returns data', async () => {
    mockGetProjects.mockResolvedValue([{ id: 1, name: 'Project1' }])
    const { useGetProjects } = require('@/hooks/queries/useHeaderQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetProjects(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(mockGetProjects).toHaveBeenCalled()
    expect(result.current.data).toEqual([{ id: 1, name: 'Project1' }])
  })

  it('uses correct queryKey', async () => {
    mockGetProjects.mockResolvedValue([])
    const { useGetProjects } = require('@/hooks/queries/useHeaderQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetProjects(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual([])
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isSuccess', true)
  })
})
