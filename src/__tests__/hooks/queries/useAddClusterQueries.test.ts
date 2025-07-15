// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as addClusterApiModule from '@/api/addClusterApi'
import {
  useAwsRoleQuery,
  fetchAwsRole,
} from '@/hooks/queries/useAddClusterQueries'
import React from 'react'

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useAddClusterQueries', () => {
  let queryClient: QueryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('fetchAwsRole has correct queryKey and queryFn', async () => {
    expect(fetchAwsRole.queryKey).toEqual(['awsRole'])
    expect(typeof fetchAwsRole.queryFn).toBe('function')
  })

  it('fetchAwsRole.queryFn calls addClusterApi.getAwsRole', async () => {
    const spy = jest
      .spyOn(addClusterApiModule.default, 'getAwsRole')
      .mockResolvedValue('mock-role')
    const result = await fetchAwsRole.queryFn()
    expect(spy).toHaveBeenCalled()
    expect(result).toBe('mock-role')
  })

  it('useAwsRoleQuery returns data from addClusterApi.getAwsRole', async () => {
    jest
      .spyOn(addClusterApiModule.default, 'getAwsRole')
      .mockResolvedValue('aws-role-data')
    const wrapper = ({ children }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      )
    const { result } = renderHook(() => useAwsRoleQuery(), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toBe('aws-role-data')
  })
})
