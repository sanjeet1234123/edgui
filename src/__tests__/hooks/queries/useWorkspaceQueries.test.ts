// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock workspaceApi
const mockGetWorkspaceMembers = jest.fn()
jest.mock('@/api/workspaceApi', () => ({
  __esModule: true,
  default: { getWorkspaceMembers: mockGetWorkspaceMembers },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useWorkspaceQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('prefetchWorkspaceMembers has correct queryKey and queryFn', async () => {
    const {
      prefetchWorkspaceMembers,
    } = require('@/hooks/queries/useWorkspaceQueries')
    expect(prefetchWorkspaceMembers.queryKey).toEqual(['workspaceMembers'])
    expect(typeof prefetchWorkspaceMembers.queryFn).toBe('function')
  })

  it('prefetchWorkspaceMembers.queryFn calls workspaceApi.getWorkspaceMembers', async () => {
    mockGetWorkspaceMembers.mockResolvedValue(['member1', 'member2'])
    const {
      prefetchWorkspaceMembers,
    } = require('@/hooks/queries/useWorkspaceQueries')
    const result = await prefetchWorkspaceMembers.queryFn()
    expect(mockGetWorkspaceMembers).toHaveBeenCalled()
    expect(result).toEqual(['member1', 'member2'])
  })

  it('useGetWorkspaceMembersQuery returns data from workspaceApi.getWorkspaceMembers', async () => {
    mockGetWorkspaceMembers.mockResolvedValue([{ id: 1, name: 'Alice' }])
    const {
      useGetWorkspaceMembersQuery,
    } = require('@/hooks/queries/useWorkspaceQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetWorkspaceMembersQuery(), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual([{ id: 1, name: 'Alice' }])
  })
})
