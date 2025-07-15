// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock deploymentsApi
const mockGetDeployments = jest.fn()
jest.mock('@/api/deploymentsApi', () => ({
  __esModule: true,
  default: { getDeployments: mockGetDeployments },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useDeploymentsQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('deploymentsKeys.list returns correct key', () => {
    const { deploymentsKeys } = require('@/hooks/queries/useDeploymentsQueries')
    expect(deploymentsKeys.list()).toEqual(['deployments', 'list'])
  })

  it('prefetchDeployments has correct queryKey and queryFn', async () => {
    const {
      prefetchDeployments,
    } = require('@/hooks/queries/useDeploymentsQueries')
    expect(prefetchDeployments.queryKey).toEqual(['deployments', 'list'])
    expect(typeof prefetchDeployments.queryFn).toBe('function')
  })

  it('prefetchDeployments.queryFn calls deploymentsApi.getDeployments', async () => {
    mockGetDeployments.mockResolvedValue(['deployment1', 'deployment2'])
    const {
      prefetchDeployments,
    } = require('@/hooks/queries/useDeploymentsQueries')
    const result = await prefetchDeployments.queryFn()
    expect(mockGetDeployments).toHaveBeenCalled()
    expect(result).toEqual(['deployment1', 'deployment2'])
  })

  it('useDeploymentsQuery returns data from deploymentsApi.getDeployments', async () => {
    mockGetDeployments.mockResolvedValue(['deploymentA', 'deploymentB'])
    const {
      useDeploymentsQuery,
    } = require('@/hooks/queries/useDeploymentsQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useDeploymentsQuery(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual(['deploymentA', 'deploymentB'])
  })
})
