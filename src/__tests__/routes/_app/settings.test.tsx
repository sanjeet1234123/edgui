// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

// Mock BASE_URL to avoid import.meta.env issues in Jest
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost:3000/v1',
}))

// Mock axiosMiddleware to prevent import issues
jest.mock('@/lib/axiosMiddleware', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock the components
jest.mock('@/components/accountSettings/index', () => ({
  AccountSettingsHeader: () => (
    <div data-testid="account-settings-header">Account Settings Header</div>
  ),
  AccountSettingsBody: () => (
    <div data-testid="account-settings-body">Account Settings Body</div>
  ),
  AccountSettingsFallback: () => (
    <div data-testid="account-settings-fallback">Loading...</div>
  ),
}))

jest.mock('@/components/ui', () => ({
  ComponentError: ({ error }) => (
    <div data-testid="component-error">
      {error?.message || 'Error occurred'}
    </div>
  ),
}))

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => routeConfig => routeConfig,
}))

// Import the actual components for testing (after mocks)
import { Route } from '@/routes/_app/settings'

const renderWithMantine = component => {
  return render(<MantineProvider>{component}</MantineProvider>)
}

describe('Settings Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the main settings component correctly', () => {
    renderWithMantine(<Route.component />)

    expect(screen.getByTestId('account-settings-header')).toBeInTheDocument()
    expect(screen.getByTestId('account-settings-body')).toBeInTheDocument()
  })

  it('should render the pending component when loading', () => {
    renderWithMantine(<Route.pendingComponent />)
    expect(screen.getByTestId('account-settings-fallback')).toBeInTheDocument()
  })

  it('should render the error component when there is an error', () => {
    const testError = new Error('Test error message')
    renderWithMantine(Route.errorComponent(testError))
    expect(screen.getByTestId('component-error')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })
})
