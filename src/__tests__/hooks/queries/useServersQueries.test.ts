// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock serversApi
const mockGetServers = jest.fn()
jest.mock('@/api/serversApi', () => ({
  __esModule: true,
  default: { getServers: mockGetServers },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useServersQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('getServersQueryKey returns correct key', () => {
    const { getServersQueryKey } = require('@/hooks/queries/useServersQueries')
    expect(getServersQueryKey(2, 10, 'abc')).toEqual([
      'servers',
      { page: 2, limit: 10, search: 'abc' },
    ])
    expect(getServersQueryKey()).toEqual([
      'servers',
      { page: 1, limit: 12, search: '' },
    ])
  })

  it('prefetchServers returns correct queryKey and queryFn', async () => {
    const { prefetchServers } = require('@/hooks/queries/useServersQueries')
    const obj = prefetchServers(3, 5, 'xyz')
    expect(obj.queryKey).toEqual([
      'servers',
      { page: 3, limit: 5, search: 'xyz' },
    ])
    expect(typeof obj.queryFn).toBe('function')
    mockGetServers.mockResolvedValue(['srv1'])
    const result = await obj.queryFn()
    expect(mockGetServers).toHaveBeenCalledWith(3, 5, 'xyz')
    expect(result).toEqual(['srv1'])
  })

  it('useGetServersQuery returns data from serversApi.getServers', async () => {
    mockGetServers.mockResolvedValue(['serverA', 'serverB'])
    const { useGetServersQuery } = require('@/hooks/queries/useServersQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetServersQuery(1, 12, ''), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual(['serverA', 'serverB'])
  })

  it('useGetServersInfiniteQuery returns paginated data and fetches next page', async () => {
    // Simulate two pages
    mockGetServers
      .mockResolvedValueOnce({ page: 1, total: 3, data: ['srv1', 'srv2'] })
      .mockResolvedValueOnce({ page: 2, total: 3, data: ['srv3'] })
    const {
      useGetServersInfiniteQuery,
    } = require('@/hooks/queries/useServersQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetServersInfiniteQuery(2, ''), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    // Simulate fetchNextPage
    await result.current.fetchNextPage()
    // Wait for data to be updated after fetching next page
    await waitFor(() => result.current.data !== undefined)
    expect(mockGetServers).toHaveBeenCalledWith(1, 2, '')
    expect(mockGetServers).toHaveBeenCalledWith(2, 2, '')
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.pages[0]).toEqual({
      page: 1,
      total: 3,
      data: ['srv1', 'srv2'],
    })
    expect(result.current.data?.pages[1]).toEqual({
      page: 2,
      total: 3,
      data: ['srv3'],
    })
  })

  it('useGetServersInfiniteQuery stops fetching when no more pages', async () => {
    mockGetServers.mockResolvedValue({
      page: 1,
      total: 2,
      data: ['srv1', 'srv2'],
    })
    const {
      useGetServersInfiniteQuery,
    } = require('@/hooks/queries/useServersQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetServersInfiniteQuery(2, ''), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    // Should not fetch next page since only one page
    expect(result.current.hasNextPage).toBe(false)
  })
})
