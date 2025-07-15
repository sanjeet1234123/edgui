// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Environments from '@/components/project/Environments'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Card: ({ children, withBorder, radius, p }) => (
    <div
      data-testid="card"
      data-with-border={withBorder}
      data-radius={radius}
      data-p={p}
    >
      {children}
    </div>
  ),
  Text: ({ children, fw, fz, ta }) => (
    <span data-testid="text" data-fw={fw} data-fz={fz} data-ta={ta}>
      {children}
    </span>
  ),
}))

describe('Environments', () => {
  it('renders the card with correct attributes', () => {
    render(<Environments />)

    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('data-with-border', 'true')
    expect(card).toHaveAttribute('data-radius', 'md')
    expect(card).toHaveAttribute('data-p', 'xl')
  })

  it('renders the "Coming Soon" text with correct styling', () => {
    render(<Environments />)

    const text = screen.getByText('Coming Soon')
    expect(text).toBeInTheDocument()
    expect(text).toHaveAttribute('data-fw', '600')
    expect(text).toHaveAttribute('data-fz', 'var(--size-2xl)')
    expect(text).toHaveAttribute('data-ta', 'center')
  })

  it('renders the correct text content', () => {
    render(<Environments />)
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })
})
