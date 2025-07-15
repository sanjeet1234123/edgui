// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock marketplaceApi
const mockGetModels = jest.fn()
jest.mock('@/api/marketplaceApi', () => ({
  __esModule: true,
  default: { getModels: mockGetModels },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useMarketplaceQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('marketplaceKeys.list returns correct key', () => {
    const { marketplaceKeys } = require('@/hooks/queries/useMarketplaceQueries')
    expect(marketplaceKeys.list('test-category')).toEqual([
      'marketplace',
      'list',
      'test-category',
    ])
  })

  it('prefetchModels has correct queryKey and queryFn', async () => {
    const { prefetchModels } = require('@/hooks/queries/useMarketplaceQueries')
    const prefetchConfig = prefetchModels('test-category')
    expect(prefetchConfig.queryKey).toEqual([
      'marketplace',
      'list',
      'test-category',
    ])
    expect(typeof prefetchConfig.queryFn).toBe('function')
  })

  it('prefetchModels.queryFn calls marketplaceApi.getModels', async () => {
    mockGetModels.mockResolvedValue(['model1', 'model2'])
    const { prefetchModels } = require('@/hooks/queries/useMarketplaceQueries')
    const prefetchConfig = prefetchModels('test-category')
    const result = await prefetchConfig.queryFn()
    expect(mockGetModels).toHaveBeenCalledWith('test-category')
    expect(result).toEqual(['model1', 'model2'])
  })

  it('useModelsQuery returns data from marketplaceApi.getModels', async () => {
    mockGetModels.mockResolvedValue(['modelA', 'modelB'])
    const { useModelsQuery } = require('@/hooks/queries/useMarketplaceQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
          React.Suspense,
          { fallback: React.createElement('div', null, 'loading...') },
          props.children,
        ),
      )
    const { result } = renderHook(() => useModelsQuery('test-category'), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(mockGetModels).toHaveBeenCalledWith('test-category')
    expect(result.current.data).toEqual(['modelA', 'modelB'])
  })
})
