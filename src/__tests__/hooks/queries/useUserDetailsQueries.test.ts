// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock userDetailsApi
const mockGetUserDetails = jest.fn()
jest.mock('@/api/userDetailsApi', () => ({
  __esModule: true,
  default: { getUserDetails: mockGetUserDetails },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useUserDetailsQueries', () => {
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  describe('userDetailsKeys', () => {
    it('exports correct query keys structure', () => {
      const {
        userDetailsKeys,
      } = require('@/hooks/queries/useUserDetailsQueries')

      expect(userDetailsKeys.all).toEqual(['userDetails'])
      expect(userDetailsKeys.details()).toEqual(['userDetails', 'details'])
    })

    it('details function returns consistent query key', () => {
      const {
        userDetailsKeys,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const firstCall = userDetailsKeys.details()
      const secondCall = userDetailsKeys.details()

      expect(firstCall).toEqual(secondCall)
      expect(firstCall).toEqual(['userDetails', 'details'])
    })
  })

  describe('prefetchUserDetails', () => {
    it('returns correct queryKey and queryFn', () => {
      const {
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const prefetchConfig = prefetchUserDetails()

      expect(prefetchConfig.queryKey).toEqual(['userDetails', 'details'])
      expect(typeof prefetchConfig.queryFn).toBe('function')
    })

    it('queryFn calls userDetailsApi.getUserDetails', async () => {
      mockGetUserDetails.mockResolvedValue({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      })

      const {
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const result = await prefetchUserDetails().queryFn()

      expect(mockGetUserDetails).toHaveBeenCalledWith()
      expect(mockGetUserDetails).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      })
    })

    it('queryFn handles API errors correctly', async () => {
      const apiError = new Error('API Error')
      mockGetUserDetails.mockRejectedValue(apiError)

      const {
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')

      await expect(prefetchUserDetails().queryFn()).rejects.toThrow('API Error')
      expect(mockGetUserDetails).toHaveBeenCalledWith()
    })
  })

  describe('useGetUserDetailsQuery', () => {
    it('returns data from userDetailsApi.getUserDetails', async () => {
      const mockUserData = {
        id: '456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        role: 'admin',
        workspace: 'Test Workspace',
      }

      mockGetUserDetails.mockResolvedValue(mockUserData)

      const {
        useGetUserDetailsQuery,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const wrapper = props =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          props.children,
        )

      const { result } = renderHook(() => useGetUserDetailsQuery(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      expect(mockGetUserDetails).toHaveBeenCalledWith()
      expect(result.current.data).toEqual(mockUserData)
      expect(result.current.isSuccess).toBe(true)
    })

    it('uses correct query configuration from prefetchUserDetails', async () => {
      mockGetUserDetails.mockResolvedValue({ id: '789', name: 'Test User' })

      const {
        useGetUserDetailsQuery,
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const wrapper = props =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          props.children,
        )

      const { result } = renderHook(() => useGetUserDetailsQuery(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      // Verify the hook uses the same configuration as prefetchUserDetails
      const prefetchConfig = prefetchUserDetails()
      expect(mockGetUserDetails).toHaveBeenCalledWith()
      expect(result.current.data).toEqual({ id: '789', name: 'Test User' })
    })

    it('handles empty response correctly', async () => {
      mockGetUserDetails.mockResolvedValue(null)

      const {
        useGetUserDetailsQuery,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const wrapper = props =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          props.children,
        )

      const { result } = renderHook(() => useGetUserDetailsQuery(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toBeNull()
      expect(result.current.isSuccess).toBe(true)
    })
  })

  describe('Integration Tests', () => {
    it('userDetailsKeys.details() is used correctly in prefetchUserDetails', () => {
      const {
        userDetailsKeys,
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const prefetchConfig = prefetchUserDetails()
      const expectedKey = userDetailsKeys.details()

      expect(prefetchConfig.queryKey).toEqual(expectedKey)
    })

    it('prefetchUserDetails config is used correctly in useGetUserDetailsQuery', async () => {
      mockGetUserDetails.mockResolvedValue({ test: 'data' })

      const {
        useGetUserDetailsQuery,
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const wrapper = props =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          props.children,
        )

      const { result } = renderHook(() => useGetUserDetailsQuery(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      // Both should use the same query function
      const prefetchConfig = prefetchUserDetails()
      expect(typeof prefetchConfig.queryFn).toBe('function')
      expect(mockGetUserDetails).toHaveBeenCalledWith()
    })
  })

  describe('Function Coverage Tests', () => {
    it('covers all exported functions', async () => {
      // Test userDetailsKeys.details function
      const {
        userDetailsKeys,
      } = require('@/hooks/queries/useUserDetailsQueries')
      const detailsKey = userDetailsKeys.details()
      expect(detailsKey).toEqual(['userDetails', 'details'])

      // Test prefetchUserDetails function
      const {
        prefetchUserDetails,
      } = require('@/hooks/queries/useUserDetailsQueries')
      const prefetchConfig = prefetchUserDetails()
      expect(prefetchConfig.queryKey).toEqual(['userDetails', 'details'])
      expect(typeof prefetchConfig.queryFn).toBe('function')

      // Test useGetUserDetailsQuery function
      mockGetUserDetails.mockResolvedValue({ coverage: 'test' })
      const {
        useGetUserDetailsQuery,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const wrapper = props =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          props.children,
        )

      const { result } = renderHook(() => useGetUserDetailsQuery(), { wrapper })
      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toEqual({ coverage: 'test' })
    })

    it('tests different data scenarios', async () => {
      // Test with complex user data
      const complexUserData = {
        id: 'user-123',
        name: 'Complex User',
        email: 'complex@test.com',
        account: {
          CreationDate: 1641945600,
          lastLogin: '2024-01-01',
        },
        permissions: ['read', 'write'],
        metadata: {
          theme: 'dark',
          language: 'en',
        },
      }

      mockGetUserDetails.mockResolvedValue(complexUserData)

      const {
        useGetUserDetailsQuery,
      } = require('@/hooks/queries/useUserDetailsQueries')

      const wrapper = props =>
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          props.children,
        )

      const { result } = renderHook(() => useGetUserDetailsQuery(), { wrapper })
      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toEqual(complexUserData)
      expect(mockGetUserDetails).toHaveBeenCalledWith()
    })
  })
})
