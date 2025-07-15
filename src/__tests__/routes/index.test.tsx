// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

// Mock the auth store
jest.mock('@/store/authStore', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock the Navigate component
jest.mock('@tanstack/react-router', () => ({
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  createFileRoute: () => routeConfig => routeConfig,
}))

// Import the actual components for testing (after mocks)
import { Route } from '@/routes/index'
import useAuthStore from '@/store/authStore'

describe('Index Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const setAuthState = isAuthenticated => {
    useAuthStore.mockImplementation(() => ({ isAuthenticated }))
  }

  it('should redirect to login when not authenticated', () => {
    setAuthState(false)
    render(<Route.component />)
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/login')
  })

  it('should redirect to marketplace when authenticated', () => {
    setAuthState(true)
    render(<Route.component />)
    const navigate = screen.getByTestId('navigate')
    expect(navigate).toBeInTheDocument()
    expect(navigate).toHaveAttribute('data-to', '/marketplace')
  })

  it('should render error component when error occurs', () => {
    const testError = new Error('Test error')
    const ErrorComponent = Route.errorComponent
    const { container } = render(
      <MantineProvider>
        <ErrorComponent error={testError} />
      </MantineProvider>,
    )
    expect(container).toBeInTheDocument()
  })
})
