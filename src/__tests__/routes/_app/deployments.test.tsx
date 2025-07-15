// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

// Mock the query client and hooks
jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual('@tanstack/react-router')
  return {
    ...actual,
    createFileRoute: () => routeConfig => ({
      ...routeConfig,
      useLoaderData: () => ({ pageTitle: 'Deployments' }),
    }),
  }
})

jest.mock('@/hooks/queries/useDeploymentsQueries', () => ({
  prefetchDeployments: jest.fn(),
  useDeploymentsQuery: jest.fn(),
}))

// Mock the components
jest.mock('@/components/deployments', () => ({
  DeploymentsFallback: () => (
    <div data-testid="deployments-fallback">Loading...</div>
  ),
  DeploymentsHeader: ({ pageTitle }) => (
    <div data-testid="deployments-header">{pageTitle}</div>
  ),
  DeploymentsList: ({ deployments }) => (
    <div data-testid="deployments-list">
      {deployments?.map(deployment => (
        <div key={deployment.id}>{deployment.name}</div>
      ))}
    </div>
  ),
}))

// Import the actual components for testing (after mocks)
import { Route } from '@/routes/_app/deployments'
import { useDeploymentsQuery } from '@/hooks/queries/useDeploymentsQueries'

describe('Deployments Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the deployments page with data', () => {
    const mockDeployments = [
      { id: 1, name: 'Deployment 1' },
      { id: 2, name: 'Deployment 2' },
    ]
    useDeploymentsQuery.mockReturnValue({ data: mockDeployments })

    render(
      <MantineProvider>
        <Route.component />
      </MantineProvider>,
    )

    expect(screen.getByTestId('deployments-header')).toHaveTextContent(
      'Deployments',
    )
    expect(screen.getByTestId('deployments-list')).toBeInTheDocument()
    expect(screen.getByText('Deployment 1')).toBeInTheDocument()
    expect(screen.getByText('Deployment 2')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    useDeploymentsQuery.mockReturnValue({ data: undefined, isLoading: true })
    render(<Route.pendingComponent />)
    expect(screen.getByTestId('deployments-fallback')).toBeInTheDocument()
  })

  it('should render error state', () => {
    render(
      <MantineProvider>
        {Route.errorComponent(new Error('Test error'))}
      </MantineProvider>,
    )
    expect(screen.getByText('Error loading: Test error')).toBeInTheDocument()
  })

  it('should prefetch deployments data', () => {
    const mockQueryClient = {
      prefetchQuery: jest.fn(),
    }
    Route.loader({ context: { queryClient: mockQueryClient } })
    expect(mockQueryClient.prefetchQuery).toHaveBeenCalled()
  })
})
