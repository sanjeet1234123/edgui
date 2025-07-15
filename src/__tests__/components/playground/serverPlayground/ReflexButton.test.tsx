// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReflexButton from '@/components/playground/serverPlayground/reflexbutton'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, onClick, color, size, w, p, styles }) => (
    <button
      data-testid="reflex-button"
      onClick={onClick}
      data-color={color}
      data-size={size}
      data-width={w}
      data-padding={p}
      style={styles?.root}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children, label, position, withArrow }) => (
    <div
      data-testid="tooltip"
      data-label={label}
      data-position={position}
      data-with-arrow={withArrow}
    >
      {children}
    </div>
  ),
}))

// Mock the IconArrowsHorizontal component
jest.mock('@tabler/icons-react', () => ({
  IconArrowsHorizontal: () => <div data-testid="arrows-icon">Arrows Icon</div>,
}))

describe('ReflexButton', () => {
  it('renders with default props', () => {
    render(<ReflexButton isCollapsed={false} />)

    const button = screen.getByTestId('reflex-button')
    const tooltip = screen.getByTestId('tooltip')
    const icon = screen.getByTestId('arrows-icon')

    expect(button).toBeInTheDocument()
    expect(tooltip).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
  })

  it('shows correct tooltip label when collapsed', () => {
    render(<ReflexButton isCollapsed={true} />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-label', 'Expand')
  })

  it('shows correct tooltip label when expanded', () => {
    render(<ReflexButton isCollapsed={false} />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-label', 'Collapse')
  })

  it('uses custom tooltip labels when provided', () => {
    render(
      <ReflexButton
        isCollapsed={true}
        expandLabel="Custom Expand"
        collapseLabel="Custom Collapse"
      />,
    )

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-label', 'Custom Expand')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<ReflexButton isCollapsed={false} onClick={handleClick} />)

    const button = screen.getByTestId('reflex-button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct button styles', () => {
    render(<ReflexButton isCollapsed={false} />)

    const button = screen.getByTestId('reflex-button')
    expect(button).toHaveAttribute('data-color', 'var(--clr-primary)')
    expect(button).toHaveAttribute('data-size', 'xs')
    expect(button).toHaveAttribute('data-width', '50')
    expect(button).toHaveAttribute('data-padding', '0')
  })

  it('applies correct tooltip props', () => {
    render(<ReflexButton isCollapsed={false} />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toHaveAttribute('data-position', 'top')
    expect(tooltip).toHaveAttribute('data-with-arrow', 'true')
  })

  it('handles undefined onClick prop', () => {
    render(<ReflexButton isCollapsed={false} />)

    const button = screen.getByTestId('reflex-button')
    fireEvent.click(button)
    // Should not throw any errors
  })
})
