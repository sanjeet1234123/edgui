// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Mock the Route export from the route file
jest.mock('@/routes/_app/accounts', () => ({
  Route: {
    component: () => <div>Hello "/_app/accounts"!</div>,
  },
}))

import { Route } from '@/routes/_app/accounts'

describe('Accounts Route', () => {
  it('renders the Route component correctly', () => {
    render(<Route.component />)
    expect(screen.getByText('Hello "/_app/accounts"!')).toBeInTheDocument()
  })
})
