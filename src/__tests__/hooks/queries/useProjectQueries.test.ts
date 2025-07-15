// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock projectApi
const mockGetProject = jest.fn()
const mockGetProjectActivities = jest.fn()
const mockGetProjectMembers = jest.fn()
jest.mock('@/api/projectApi', () => ({
  __esModule: true,
  default: {
    getProject: mockGetProject,
    getProjectActivities: mockGetProjectActivities,
    getProjectMembers: mockGetProjectMembers,
  },
}))

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('useProjectQueries', () => {
  let queryClient
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('prefetchProject returns correct queryKey and queryFn', async () => {
    const { prefetchProject } = require('@/hooks/queries/useProjectQueries')
    const obj = prefetchProject('abc')
    expect(obj.queryKey).toEqual(['project', 'abc'])
    expect(typeof obj.queryFn).toBe('function')
    expect(obj.enabled).toBe(true)
  })

  it('prefetchProject disables query if projectId is falsy', () => {
    const { prefetchProject } = require('@/hooks/queries/useProjectQueries')
    expect(prefetchProject('').enabled).toBe(false)
  })

  it('prefetchProject.queryFn calls projectApi.getProject', async () => {
    mockGetProject.mockResolvedValue({ id: 'abc', name: 'Test Project' })
    const { prefetchProject } = require('@/hooks/queries/useProjectQueries')
    const result = await prefetchProject('abc').queryFn()
    expect(mockGetProject).toHaveBeenCalledWith('abc')
    expect(result).toEqual({ id: 'abc', name: 'Test Project' })
  })

  it('useGetProjectQuery returns data from projectApi.getProject', async () => {
    mockGetProject.mockResolvedValue({ id: 'xyz', name: 'ProjX' })
    const { useGetProjectQuery } = require('@/hooks/queries/useProjectQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetProjectQuery('xyz'), { wrapper })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual({ id: 'xyz', name: 'ProjX' })
  })

  it('prefetchProjectActivities returns correct queryKey and queryFn', () => {
    const {
      prefetchProjectActivities,
    } = require('@/hooks/queries/useProjectQueries')
    const obj = prefetchProjectActivities('pid')
    expect(obj.queryKey).toEqual(['projectActivities', 'pid'])
    expect(typeof obj.queryFn).toBe('function')
    expect(obj.enabled).toBe(true)
  })

  it('prefetchProjectActivities disables query if projectId is falsy', () => {
    const {
      prefetchProjectActivities,
    } = require('@/hooks/queries/useProjectQueries')
    expect(prefetchProjectActivities('').enabled).toBe(false)
  })

  it('prefetchProjectActivities.queryFn calls projectApi.getProjectActivities', async () => {
    mockGetProjectActivities.mockResolvedValue(['activity1', 'activity2'])
    const {
      prefetchProjectActivities,
    } = require('@/hooks/queries/useProjectQueries')
    const result = await prefetchProjectActivities('pid').queryFn()
    expect(mockGetProjectActivities).toHaveBeenCalledWith('pid')
    expect(result).toEqual(['activity1', 'activity2'])
  })

  it('useGetProjectActivitiesQuery returns data from projectApi.getProjectActivities', async () => {
    mockGetProjectActivities.mockResolvedValue(['a', 'b'])
    const {
      useGetProjectActivitiesQuery,
    } = require('@/hooks/queries/useProjectQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetProjectActivitiesQuery('pid'), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual(['a', 'b'])
  })

  it('prefetchProjectMembers returns correct queryKey and queryFn', () => {
    const {
      prefetchProjectMembers,
    } = require('@/hooks/queries/useProjectQueries')
    const obj = prefetchProjectMembers('mid')
    expect(obj.queryKey).toEqual(['projectMembers', 'mid'])
    expect(typeof obj.queryFn).toBe('function')
    expect(obj.enabled).toBe(true)
  })

  it('prefetchProjectMembers disables query if projectId is falsy', () => {
    const {
      prefetchProjectMembers,
    } = require('@/hooks/queries/useProjectQueries')
    expect(prefetchProjectMembers('').enabled).toBe(false)
  })

  it('prefetchProjectMembers.queryFn calls projectApi.getProjectMembers', async () => {
    mockGetProjectMembers.mockResolvedValue(['member1', 'member2'])
    const {
      prefetchProjectMembers,
    } = require('@/hooks/queries/useProjectQueries')
    const result = await prefetchProjectMembers('mid').queryFn()
    expect(mockGetProjectMembers).toHaveBeenCalledWith('mid')
    expect(result).toEqual(['member1', 'member2'])
  })

  it('useGetProjectMembersQuery returns data from projectApi.getProjectMembers', async () => {
    mockGetProjectMembers.mockResolvedValue(['m1', 'm2'])
    const {
      useGetProjectMembersQuery,
    } = require('@/hooks/queries/useProjectQueries')
    const wrapper = props =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        props.children,
      )
    const { result } = renderHook(() => useGetProjectMembersQuery('mid'), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(result.current.data).toEqual(['m1', 'm2'])
  })
})
