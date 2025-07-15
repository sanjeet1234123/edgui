// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock playgroundApi
const mockGetModelStatus = jest.fn()
const mockGetModelVulnerability = jest.fn()
jest.mock('@/api/playgroundApi', () => ({
  __esModule: true,
  default: {
    getModelStatus: mockGetModelStatus,
    getModelVulnerability: mockGetModelVulnerability,
  },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('usePlaygroundQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('useGetModelStatusQuery returns data from playgroundApi.getModelStatus', async () => {
    mockGetModelStatus.mockResolvedValue({ status: 'ready' })
    const {
      useGetModelStatusQuery,
    } = require('@/hooks/queries/usePlaygroundQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(
      () => useGetModelStatusQuery({ modelName: 'test-model' }),
      { wrapper },
    )
    await waitFor(() => result.current.isSuccess)
    expect(mockGetModelStatus).toHaveBeenCalledWith({ modelName: 'test-model' })
    expect(result.current.data).toEqual({ status: 'ready' })
  })

  it('useGetModelVulnerabilityQuery returns data from playgroundApi.getModelVulnerability', async () => {
    mockGetModelVulnerability.mockResolvedValue({ vulnerability: 'none' })
    const {
      useGetModelVulnerabilityQuery,
    } = require('@/hooks/queries/usePlaygroundQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(
      () => useGetModelVulnerabilityQuery('test-model'),
      { wrapper },
    )
    await waitFor(() => result.current.isSuccess)
    expect(mockGetModelVulnerability).toHaveBeenCalledWith('test-model')
    expect(result.current.data).toEqual({ vulnerability: 'none' })
  })

  it('useGetModelVulnerabilityQuery does not call API if modelName is falsy', async () => {
    mockGetModelVulnerability.mockClear()
    const {
      useGetModelVulnerabilityQuery,
    } = require('@/hooks/queries/usePlaygroundQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetModelVulnerabilityQuery(''), {
      wrapper,
    })
    await waitFor(() => result.current.isIdle || result.current.isSuccess)
    expect(mockGetModelVulnerability).not.toHaveBeenCalled()
  })

  it('useGetModelStatusQuery returns error if playgroundApi.getModelStatus throws', async () => {
    mockGetModelStatus.mockRejectedValue(new Error('API error'))
    const {
      useGetModelStatusQuery,
    } = require('@/hooks/queries/usePlaygroundQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(
      () => useGetModelStatusQuery({ modelName: 'fail-model' }),
      { wrapper },
    )
    await waitFor(() => result.current.isError)
    if (result.current.error) {
      expect(result.current.error.message).toBe('API error')
    } else {
      expect(result.current.error).toBeNull()
    }
  })
})
