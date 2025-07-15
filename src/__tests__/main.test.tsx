/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import React from 'react'

// Mock the CSS imports
jest.mock('@mantine/core/styles.css', () => ({}), { virtual: true })
jest.mock('@mantine/notifications/styles.css', () => ({}), { virtual: true })
jest.mock('@mantine/charts/styles.css', () => ({}), { virtual: true })
jest.mock('@mantine/code-highlight/styles.css', () => ({}), { virtual: true })
jest.mock('@/styles.css', () => ({}), { virtual: true })

// Mock the dependencies
jest.mock('react-dom/client', () => {
  const renderMock = jest.fn()
  const createRootMock = jest.fn(() => ({ render: renderMock }))
  return {
    createRoot: createRootMock,
  }
})

jest.mock('@tanstack/react-router', () => ({
  RouterProvider: jest.fn(() => <div data-testid="router-provider" />),
  createRouter: jest.fn(() => ({
    routeTree: {},
  })),
}))

jest.mock('@/integrations/tanstack-query/root-provider', () => ({
  Provider: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="tanstack-query-provider">{children}</div>
  )),
  getContext: jest.fn(() => ({})),
}))

jest.mock('@mantine/core', () => ({
  MantineProvider: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="mantine-provider">{children}</div>
  )),
  createOptionalContext: jest.fn(() => [null, () => null])
}))

jest.mock('@mantine/notifications', () => ({
  Notifications: jest.fn(() => <div data-testid="notifications" />),
}))

jest.mock('@mantine/code-highlight', () => ({
  CodeHighlightAdapterProvider: jest.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="code-highlight-provider">{children}</div>
  )),
  createShikiAdapter: jest.fn(() => ({}))
}))

jest.mock('@/routeTree.gen.ts', () => ({
  routeTree: {},
}))

jest.mock('@/theme/mantineTheme.ts', () => ({
  mantineTheme: {},
}))

jest.mock('@/reportWebVitals.ts', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('Main Application Entry', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Reset modules to ensure clean state between tests
    jest.resetModules()
  })

  it('renders the application when DOM element is empty', () => {
    // Set up DOM with empty #app element
    document.body.innerHTML = '<div id="app"></div>'

    // Import the main module which will execute the rendering logic
    require('@/main.tsx')

    // Get the mock functions from the mock
    const { createRoot } = require('react-dom/client')

    // Verify that createRoot was called
    expect(createRoot).toHaveBeenCalled()

    // Verify that render was called - we know the render function was called
    // if createRoot was called, since it's part of the chain
    expect(createRoot().render).toHaveBeenCalled()
  })

  it('does not render when DOM element has content', () => {
    // Set up DOM with content in the #app element
    document.body.innerHTML = '<div id="app">Some content</div>'

    // Import the main module
    require('@/main.tsx')

    // Get the mock functions from the mock
    const { createRoot } = require('react-dom/client')

    // Verify that createRoot was not called
    expect(createRoot).not.toHaveBeenCalled()
  })
})
