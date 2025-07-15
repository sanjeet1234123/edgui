// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Mock the components
jest.mock('@/components/playground/modelPlayground', () => ({
  __esModule: true,
  default: () => <div data-testid="model-playground">Model Playground</div>,
}))

jest.mock('@/components/playground/serverPlayground', () => ({
  __esModule: true,
  default: ({ server }) => (
    <div data-testid="server-playground">Server Playground: {server}</div>
  ),
}))

jest.mock('@/components/ui/componentError', () => ({
  __esModule: true,
  default: props => (
    <div data-testid="error-component">
      {props.error ? props.error.message : 'No error'}
    </div>
  ),
}))

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => routeConfig => routeConfig,
  useNavigate: () => mockNavigate,
}))

import { Route } from '@/routes/_app/playground'

describe('Playground Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should navigate to marketplace when no model or server is provided', () => {
    Route.useSearch = jest.fn(() => ({ model: undefined, server: undefined }))
    render(<Route.component />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/marketplace' })
  })

  it('should render ModelPlayground when model is provided', () => {
    Route.useSearch = jest.fn(() => ({
      model: 'test-model',
      server: undefined,
    }))
    render(<Route.component />)
    expect(screen.getByTestId('model-playground')).toBeInTheDocument()
  })

  it('should render ServerPlayground when server is provided', () => {
    Route.useSearch = jest.fn(() => ({
      model: undefined,
      server: 'test-server',
    }))
    render(<Route.component />)
    expect(screen.getByTestId('server-playground')).toBeInTheDocument()
    expect(
      screen.getByText('Server Playground: test-server'),
    ).toBeInTheDocument()
  })

  it('should render error component when error occurs', () => {
    const error = new Error('Test error')
    render(<Route.errorComponent error={error} />)
    expect(screen.getByTestId('error-component')).toBeInTheDocument()
  })

  it('should return null when no model or server is provided', () => {
    Route.useSearch = jest.fn(() => ({ model: undefined, server: undefined }))
    const { container } = render(<Route.component />)
    expect(container.firstChild).toBeNull()
  })
})
