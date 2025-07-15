// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Settings from '@/components/project/Settings'

// Mock the Mantine core components
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

describe('Settings', () => {
  it('renders with the correct structure', () => {
    render(<Settings />)

    // Check if the Card component has correct props
    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('data-with-border', 'true')
    expect(card).toHaveAttribute('data-radius', 'md')
    expect(card).toHaveAttribute('data-p', 'xl')

    // Check if the Text component has correct props
    const text = screen.getByTestId('text')
    expect(text).toHaveAttribute('data-fw', '600')
    expect(text).toHaveAttribute('data-fz', 'var(--size-2xl)')
    expect(text).toHaveAttribute('data-ta', 'center')

    // Check if the "Coming Soon" text is displayed
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })
})
