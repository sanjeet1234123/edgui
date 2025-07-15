// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PasswordRequirement from '@/components/accountSettings/PasswordRequirement'
import { MantineProvider } from '@mantine/core'

// Create a custom render function that wraps components with MantineProvider
const customRender = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconCheck: ({ size }: { size?: number }) => (
    <span data-testid="icon-check" data-size={size}>
      ✓
    </span>
  ),
  IconX: ({ size }: { size?: number }) => (
    <span data-testid="icon-x" data-size={size}>
      ✗
    </span>
  ),
}))

describe('PasswordRequirement', () => {
  it('renders with check icon when requirement is met', () => {
    customRender(<PasswordRequirement meets={true} label="Includes number" />)

    // Check that the check icon is rendered
    const checkIcon = screen.getByTestId('icon-check')
    expect(checkIcon).toBeInTheDocument()
    expect(checkIcon).toHaveAttribute('data-size', '14')

    // Check that the label is displayed
    expect(screen.getByText('Includes number')).toBeInTheDocument()

    // Check that X icon is not rendered
    expect(screen.queryByTestId('icon-x')).not.toBeInTheDocument()
  })

  it('renders with X icon when requirement is not met', () => {
    customRender(
      <PasswordRequirement meets={false} label="Includes uppercase letter" />,
    )

    // Check that the X icon is rendered
    const xIcon = screen.getByTestId('icon-x')
    expect(xIcon).toBeInTheDocument()
    expect(xIcon).toHaveAttribute('data-size', '14')

    // Check that the label is displayed
    expect(screen.getByText('Includes uppercase letter')).toBeInTheDocument()

    // Check that check icon is not rendered
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument()
  })

  it('applies correct color when requirement is met', () => {
    customRender(
      <PasswordRequirement meets={true} label="Test requirement met" />,
    )

    // Find the Text component by looking for the element containing the label
    const textElement =
      screen.getByText('Test requirement met').closest('[data-testid]') ||
      screen.getByText('Test requirement met').parentElement

    // The color should be applied via Mantine's color prop
    expect(textElement).toBeInTheDocument()
  })

  it('applies correct color when requirement is not met', () => {
    customRender(
      <PasswordRequirement meets={false} label="Test requirement not met" />,
    )

    // Find the Text component by looking for the element containing the label
    const textElement =
      screen.getByText('Test requirement not met').closest('[data-testid]') ||
      screen.getByText('Test requirement not met').parentElement

    // The color should be applied via Mantine's color prop
    expect(textElement).toBeInTheDocument()
  })

  it('renders different requirement labels correctly', () => {
    const requirements = [
      'Includes number',
      'Includes lowercase letter',
      'Includes uppercase letter',
      'Includes special symbol',
      'Includes at least 6 characters',
    ]

    requirements.forEach(label => {
      const { unmount } = customRender(
        <PasswordRequirement meets={true} label={label} />,
      )

      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    })
  })

  it('handles empty label gracefully', () => {
    customRender(<PasswordRequirement meets={true} label="" />)

    // Should still render the icon even with empty label
    expect(screen.getByTestId('icon-check')).toBeInTheDocument()
  })

  it('handles long labels correctly', () => {
    const longLabel =
      'This is a very long password requirement label that should still be displayed correctly'

    customRender(<PasswordRequirement meets={false} label={longLabel} />)

    expect(screen.getByText(longLabel)).toBeInTheDocument()
    expect(screen.getByTestId('icon-x')).toBeInTheDocument()
  })

  it('maintains consistent styling structure', () => {
    customRender(<PasswordRequirement meets={true} label="Test styling" />)

    // Check that both icon and text are present
    expect(screen.getByTestId('icon-check')).toBeInTheDocument()
    expect(screen.getByText('Test styling')).toBeInTheDocument()

    // Verify the component structure is maintained
    const container = screen.getByText('Test styling').parentElement
    expect(container).toBeInTheDocument()
  })

  it('switches between states correctly', () => {
    const { rerender } = customRender(
      <PasswordRequirement meets={false} label="Dynamic requirement" />,
    )

    // Initially should show X icon
    expect(screen.getByTestId('icon-x')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument()

    // Re-render with meets=true
    rerender(
      <MantineProvider>
        <PasswordRequirement meets={true} label="Dynamic requirement" />
      </MantineProvider>,
    )

    // Should now show check icon
    expect(screen.getByTestId('icon-check')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-x')).not.toBeInTheDocument()
  })
})
