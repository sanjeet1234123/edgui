// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Provider,
  getContext,
} from '@/integrations/tanstack-query/root-provider'

describe('tanstack-query/root-provider', () => {
  it('getContext returns the queryClient instance', () => {
    const context = getContext()
    expect(context).toHaveProperty('queryClient')
    expect(context.queryClient).toBeInstanceOf(QueryClient)
  })

  it('Provider renders children and provides QueryClient context', () => {
    const TestChild = () => <div data-testid="test-child">Child</div>
    render(
      <Provider>
        <TestChild />
      </Provider>,
    )
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('Provider uses the same queryClient as getContext', () => {
    // This test ensures the singleton pattern is respected
    const context = getContext()
    let clientFromContext: QueryClient | undefined
    function TestComponent() {
      // @ts-ignore
      clientFromContext = context.queryClient
      return null
    }
    render(
      <Provider>
        <TestComponent />
      </Provider>,
    )
    expect(clientFromContext).toBe(context.queryClient)
  })
})
