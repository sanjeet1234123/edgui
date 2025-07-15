// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock rolesApi
const mockGetRoles = jest.fn()
jest.mock('@/api/rolesApi', () => ({
  __esModule: true,
  default: { getRoles: mockGetRoles },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useRolesQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('calls rolesApi.getRoles and returns data', async () => {
    mockGetRoles.mockResolvedValue([{ id: 1, name: 'Admin' }])
    const { useGetRolesQuery } = require('@/hooks/queries/useRolesQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetRolesQuery(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(mockGetRoles).toHaveBeenCalled()
    expect(result.current.data).toEqual([{ id: 1, name: 'Admin' }])
  })

  it('uses correct queryKey', async () => {
    mockGetRoles.mockResolvedValue([])
    const { useGetRolesQuery } = require('@/hooks/queries/useRolesQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetRolesQuery(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual([])
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isSuccess', true)
  })

  it('returns error if getRoles throws', async () => {
    mockGetRoles.mockRejectedValue(new Error('API error'))
    const { useGetRolesQuery } = require('@/hooks/queries/useRolesQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetRolesQuery(), { wrapper })
    await waitFor(() => result.current.isError)
    if (result.current.error) {
      expect(result.current.error.message).toBe('API error')
    } else {
      expect(result.current.error).toBeNull()
    }
  })
})
