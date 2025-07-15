// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// --- Mocks must come before all imports ---
const mockUseLoaderData = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  __esModule: true,
  createFileRoute: () => config => ({
    ...config,
    useLoaderData: mockUseLoaderData,
  }),
}))

jest.mock('@mantine/core', () => ({
  Stack: ({ children }) => <div data-testid="mantine-stack">{children}</div>,
}))

jest.mock('@/components/clusters', () => ({
  ClustersFallback: () => <div data-testid="clusters-fallback">Loading...</div>,
  ClustersHeader: ({ pageTitle }) => (
    <div data-testid="clusters-header">{pageTitle}</div>
  ),
  ClustersList: ({ clusters }) => (
    <div data-testid="clusters-list">
      {clusters?.map(cluster => (
        <div key={cluster.id} data-testid={`cluster-${cluster.id}`}>
          {cluster.name}
        </div>
      ))}
    </div>
  ),
}))

jest.mock('@/hooks/queries/useClustersQueries', () => ({
  prefetchClusters: {
    queryKey: ['clusters'],
  },
  useClustersQuery: jest.fn(),
}))

jest.mock('@/components/ui', () => ({
  ComponentError: ({ error }) => (
    <div data-testid="component-error">{error?.error?.error?.message}</div>
  ),
}))

// --- Imports ---
import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

describe('Clusters Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('should render clusters list when data is loaded', async () => {
    const { useClustersQuery } = await import(
      '@/hooks/queries/useClustersQueries'
    )
    const { Route } = await import('@/routes/_app/clusters')

    const mockClusters = [
      { id: '1', name: 'Cluster 1' },
      { id: '2', name: 'Cluster 2' },
    ]

    useClustersQuery.mockReturnValue({
      data: mockClusters,
      isLoading: false,
      error: null,
    })

    mockUseLoaderData.mockReturnValue({
      pageTitle: 'Kubernetes Clusters',
    })

    render(<Route.component />)

    expect(screen.getByTestId('clusters-header')).toHaveTextContent(
      'Kubernetes Clusters',
    )
    expect(screen.getByTestId('clusters-list')).toBeInTheDocument()
    expect(screen.getByTestId('cluster-1')).toHaveTextContent('Cluster 1')
    expect(screen.getByTestId('cluster-2')).toHaveTextContent('Cluster 2')
  })

  it('should show loading state', async () => {
    const { useClustersQuery } = await import(
      '@/hooks/queries/useClustersQueries'
    )
    const { Route } = await import('@/routes/_app/clusters')

    useClustersQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    mockUseLoaderData.mockReturnValue({
      pageTitle: 'Kubernetes Clusters',
    })

    render(<Route.pendingComponent />)
    expect(screen.getByTestId('clusters-fallback')).toBeInTheDocument()
  })

  it('should show error state', async () => {
    const { Route } = await import('@/routes/_app/clusters')
    const error = new Error('Failed to load clusters')
    const { container } = render(<Route.errorComponent error={{ error }} />)
    // Debug output
    // eslint-disable-next-line no-console
    console.log(container.innerHTML)
    expect(screen.getByTestId('component-error')).toHaveTextContent(
      'Failed to load clusters',
    )
  })

  it('should prefetch clusters data in loader', async () => {
    const { Route } = await import('@/routes/_app/clusters')
    const mockQueryClient = {
      prefetchQuery: jest.fn(),
    }

    Route.loader({ context: { queryClient: mockQueryClient } })

    expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
      queryKey: ['clusters'],
    })
  })
})
