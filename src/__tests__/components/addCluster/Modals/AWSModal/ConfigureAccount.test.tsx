// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfigureAccount from '@/components/addCluster/Modals/AWSModal/ConfigureAccount'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Text: ({ children, fz, fw }) => (
    <span data-testid="text" data-fz={fz} data-fw={fw}>
      {children}
    </span>
  ),
}))

describe('ConfigureAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with correct structure', () => {
    const { container } = render(<ConfigureAccount />)

    // Check if Stack component is rendered
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()

    // Check if Text component is rendered with correct content and props
    const text = screen.getByTestId('text')
    expect(text).toBeInTheDocument()
    expect(text).toHaveTextContent('Event Logs')
    expect(text).toHaveAttribute('data-fz', 'var(--size-xl)')
    expect(text).toHaveAttribute('data-fw', '600')
  })

  it('maintains component structure after re-render', () => {
    const { rerender } = render(<ConfigureAccount />)

    // Re-render the component
    rerender(<ConfigureAccount />)

    // Verify the structure remains intact
    const stack = screen.getByTestId('stack')
    const text = screen.getByTestId('text')

    expect(stack).toBeInTheDocument()
    expect(text).toBeInTheDocument()
    expect(text).toHaveTextContent('Event Logs')
  })
})
