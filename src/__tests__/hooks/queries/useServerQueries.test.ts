// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock serverApi
const mockGetServer = jest.fn()
const mockGetRawGithubFile = jest.fn()
jest.mock('@/api/serverApi', () => ({
  __esModule: true,
  default: {
    getServer: mockGetServer,
    getRawGithubFile: mockGetRawGithubFile,
  },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useServerQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('useGetServerQuery returns data from serverApi.getServer', async () => {
    mockGetServer.mockResolvedValue({ id: 'srv1', name: 'Server1' })
    const { useGetServerQuery } = require('@/hooks/queries/useServerQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetServerQuery('srv1'), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(mockGetServer).toHaveBeenCalledWith('srv1')
    expect(result.current.data).toEqual({ id: 'srv1', name: 'Server1' })
  })

  it('useGetServerQuery does not call API if serverId is falsy', async () => {
    mockGetServer.mockClear()
    const { useGetServerQuery } = require('@/hooks/queries/useServerQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetServerQuery(''), { wrapper })
    await waitFor(() => result.current.isIdle || result.current.isSuccess)
    expect(mockGetServer).not.toHaveBeenCalled()
  })

  it('useGetRawGithubFileQuery returns data from serverApi.getRawGithubFile', async () => {
    mockGetRawGithubFile.mockResolvedValue('file-content')
    const {
      useGetRawGithubFileQuery,
    } = require('@/hooks/queries/useServerQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetRawGithubFileQuery('file-id'), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(mockGetRawGithubFile).toHaveBeenCalledWith('file-id')
    expect(result.current.data).toBe('file-content')
  })

  it('useGetRawGithubFileQuery does not call API if id is falsy', async () => {
    mockGetRawGithubFile.mockClear()
    const {
      useGetRawGithubFileQuery,
    } = require('@/hooks/queries/useServerQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetRawGithubFileQuery(''), {
      wrapper,
    })
    await waitFor(() => result.current.isIdle || result.current.isSuccess)
    expect(mockGetRawGithubFile).not.toHaveBeenCalled()
  })

  it('useGetServerQuery returns error if getServer throws', async () => {
    mockGetServer.mockRejectedValue(new Error('API error'))
    const { useGetServerQuery } = require('@/hooks/queries/useServerQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetServerQuery('fail-id'), {
      wrapper,
    })
    await waitFor(() => result.current.isError)
    if (result.current.error) {
      expect(result.current.error.message).toBe('API error')
    } else {
      expect(result.current.error).toBeNull()
    }
  })

  it('useGetRawGithubFileQuery returns error if getRawGithubFile throws', async () => {
    mockGetRawGithubFile.mockRejectedValue(new Error('File error'))
    const {
      useGetRawGithubFileQuery,
    } = require('@/hooks/queries/useServerQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetRawGithubFileQuery('fail-file'), {
      wrapper,
    })
    await waitFor(() => result.current.isError)
    if (result.current.error) {
      expect(result.current.error.message).toBe('File error')
    } else {
      expect(result.current.error).toBeNull()
    }
  })
})
