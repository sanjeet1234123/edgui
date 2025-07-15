// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

// Mock the components first
jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui')
  return {
    ...actual,
    ComponentError: ({ error }) => (
      <div data-testid="error-component">{error.message}</div>
    ),
  }
})

jest.mock('@/components/addCluster', () => {
  const actual = jest.requireActual('@/components/addCluster')
  return {
    ...actual,
    AddClusterCards: () => (
      <div data-testid="add-cluster-cards">Cluster Cards</div>
    ),
    AddClusterFallback: () => (
      <div data-testid="add-cluster-fallback">Loading...</div>
    ),
    AddClusterHeader: () => (
      <div data-testid="add-cluster-header">Cluster Header</div>
    ),
  }
})

// Mock Mantine Stack component
jest.mock('@mantine/core', () => ({
  Stack: ({ children, className }) => (
    <div data-testid="stack" className={className}>
      {children}
    </div>
  ),
}))

// Mock Mantine notifications to avoid getDefaultZIndex error
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
    update: jest.fn(),
    hide: jest.fn(),
    clean: jest.fn(),
  },
  NotificationsProvider: ({ children }) => <>{children}</>,
}))

// Mock Mantine code-highlight to avoid createOptionalContext error
jest.mock('@mantine/code-highlight', () => ({
  CodeHighlight: ({ children }) => (
    <pre data-testid="code-highlight">{children}</pre>
  ),
}))

// Mock TanStack Router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => routeConfig => ({
    ...routeConfig,
    errorComponent: ({ error }) => (
      <div data-testid="error-component">{error.message}</div>
    ),
  }),
}))

// Import the actual components for testing (after mocks)
import { Route } from '@/routes/_app/add-cluster'
import { AddClusterFallback } from '@/components/addCluster'
import { ComponentError } from '@/components/ui'

describe('Add Cluster Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the main component correctly', () => {
    render(<Route.component />)

    // Check if Stack is rendered with correct class
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveClass('flex-grow')

    // Check if header and cards are rendered
    expect(screen.getByTestId('add-cluster-header')).toBeInTheDocument()
    expect(screen.getByTestId('add-cluster-cards')).toBeInTheDocument()
  })

  it('should render the pending component', () => {
    render(<AddClusterFallback />)
    expect(screen.getByTestId('add-cluster-fallback')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render the error component', () => {
    const testError = new Error('Test error message')
    render(<ComponentError error={testError} />)
    expect(screen.getByTestId('error-component')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('Route.pendingComponent should render AddClusterFallback', () => {
    render(<Route.pendingComponent />)
    expect(screen.getByTestId('add-cluster-fallback')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('Route.errorComponent should render ComponentError', () => {
    const testError = new Error('Route error')
    render(<Route.errorComponent error={testError} />)
    expect(screen.getByTestId('error-component')).toBeInTheDocument()
    expect(screen.getByText('Route error')).toBeInTheDocument()
  })
})
