// @ts-nocheck
/**
 * @jest-environment jsdom
 */

jest.mock('@mantine/core', () => ({
  useMantineColorScheme: jest.fn(),
}))

jest.mock('@/components/ui', () => ({
  FullPageError: ({ error }) => (
    <div data-testid="full-page-error">{error.message}</div>
  ),
  FullPageLoader: () => <div data-testid="full-page-loader">Loading...</div>,
}))

jest.mock('@/components/RouteProtection', () => ({
  PrivateRoute: ({ children, requiredStates }) => (
    <div
      data-testid="private-route"
      data-states={JSON.stringify(requiredStates)}
    >
      {children}
    </div>
  ),
}))

jest.mock('@/components/containerWithTopBar/ContainerWithTopBar', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="container-with-top-bar">{children}</div>
  ),
}))

jest.mock('@/components/platformSetup', () => ({
  PlatformSetupHeader: () => (
    <div data-testid="platform-setup-header">Header</div>
  ),
  PlatformSetupStepper: () => (
    <div data-testid="platform-setup-stepper">Stepper</div>
  ),
}))

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Route } from '@/routes/platform-setup'

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn(key => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

describe('Platform Setup Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorageMock.clear()
  })

  it('renders the platform setup component correctly', () => {
    const { useMantineColorScheme } = require('@mantine/core')
    useMantineColorScheme.mockReturnValue({ colorScheme: 'light' })
    sessionStorageMock.setItem('verified_email', 'true')
    sessionStorageMock.setItem('signup_completed', 'true')
    render(<Route.options.component />)
    expect(screen.getByTestId('container-with-top-bar')).toBeInTheDocument()
    expect(screen.getByTestId('platform-setup-header')).toBeInTheDocument()
    expect(screen.getByTestId('platform-setup-stepper')).toBeInTheDocument()
  })

  it('renders with dark theme', () => {
    const { useMantineColorScheme } = require('@mantine/core')
    useMantineColorScheme.mockReturnValue({ colorScheme: 'dark' })
    sessionStorageMock.setItem('verified_email', 'true')
    sessionStorageMock.setItem('signup_completed', 'true')
    render(<Route.options.component />)
    expect(screen.getByTestId('container-with-top-bar')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<Route.options.pendingComponent />)
    expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
  })

  it('shows error state', () => {
    const error = new Error('Test error')
    render(Route.options.errorComponent(error))
    // eslint-disable-next-line no-console
    console.log(
      'ERROR STATE HTML:',
      screen.getByTestId('full-page-error').outerHTML,
    )
    expect(screen.getByTestId('full-page-error')).toHaveTextContent(
      'Test error',
    )
  })

  it('checks required states in PrivateRoute', () => {
    const { useMantineColorScheme } = require('@mantine/core')
    useMantineColorScheme.mockReturnValue({ colorScheme: 'light' })
    sessionStorageMock.setItem('verified_email', 'true')
    sessionStorageMock.setItem('signup_completed', 'true')
    render(<Route.options.component />)
    const privateRoute = screen.getByTestId('private-route')
    const requiredStates = JSON.parse(privateRoute.getAttribute('data-states'))
    expect(requiredStates).toEqual({
      verified_email: 'true',
      signup_completed: 'true',
    })
  })
})
