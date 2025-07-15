// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the components
jest.mock('@/components/addCluster', () => ({
  AddClusterCards: () => (
    <div data-testid="add-cluster-cards">Add Cluster Cards</div>
  ),
  AddClusterFallback: () => (
    <div data-testid="add-cluster-fallback">Loading...</div>
  ),
  AddClusterHeader: () => (
    <div data-testid="add-cluster-header">Add Cluster Header</div>
  ),
}))

// Mock ComponentError
jest.mock('@/components/ui', () => ({
  ComponentError: error => (
    <div data-testid="component-error">
      Error: {error.error && error.error.message}
    </div>
  ),
}))

// Mock router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => routeConfig => ({
    ...routeConfig,
    component: routeConfig.component,
    pendingComponent: routeConfig.pendingComponent,
    errorComponent: routeConfig.errorComponent,
  }),
}))

import { Route } from '@/routes/_app/add-cluster'

const queryClient = new QueryClient()
const renderWithProviders = component => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{component}</MantineProvider>
    </QueryClientProvider>,
  )
}

describe('Add Cluster Route', () => {
  it('should render the main component with header and cards', () => {
    renderWithProviders(<Route.component />)

    expect(screen.getByTestId('add-cluster-header')).toBeInTheDocument()
    expect(screen.getByTestId('add-cluster-cards')).toBeInTheDocument()
  })

  it('should render the pending component', () => {
    renderWithProviders(<Route.pendingComponent />)

    expect(screen.getByTestId('add-cluster-fallback')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render the error component with error message', () => {
    const testError = new Error('Test error message')
    renderWithProviders(Route.errorComponent(testError))

    const errorElement = screen.getByTestId('component-error')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent('Error: Test error message')
  })

  it('should render the error component with empty error message when no error provided', () => {
    renderWithProviders(Route.errorComponent(new Error()))

    const errorElement = screen.getByTestId('component-error')
    expect(errorElement).toBeInTheDocument()
    expect(errorElement).toHaveTextContent('Error:')
  })
})
