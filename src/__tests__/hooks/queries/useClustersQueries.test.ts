// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock clustersApi
const mockGetClusters = jest.fn()
jest.mock('@/api/clustersApi', () => ({
  __esModule: true,
  default: { getClusters: mockGetClusters },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useClustersQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('clustersKeys.list returns correct key', () => {
    const { clustersKeys } = require('@/hooks/queries/useClustersQueries')
    expect(clustersKeys.list()).toEqual(['clusters', 'list'])
  })

  it('prefetchClusters has correct queryKey and queryFn', async () => {
    const { prefetchClusters } = require('@/hooks/queries/useClustersQueries')
    expect(prefetchClusters.queryKey).toEqual(['clusters', 'list'])
    expect(typeof prefetchClusters.queryFn).toBe('function')
  })

  it('prefetchClusters.queryFn calls clustersApi.getClusters', async () => {
    mockGetClusters.mockResolvedValue(['cluster1', 'cluster2'])
    const { prefetchClusters } = require('@/hooks/queries/useClustersQueries')
    const result = await prefetchClusters.queryFn()
    expect(mockGetClusters).toHaveBeenCalled()
    expect(result).toEqual(['cluster1', 'cluster2'])
  })

  it('useClustersQuery returns data from clustersApi.getClusters', async () => {
    mockGetClusters.mockResolvedValue(['clusterA', 'clusterB'])
    const { useClustersQuery } = require('@/hooks/queries/useClustersQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useClustersQuery(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual(['clusterA', 'clusterB'])
  })
})
