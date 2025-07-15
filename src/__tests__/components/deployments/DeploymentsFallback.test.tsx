// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeploymentsFallback from '@/components/deployments/DeploymentsFallback'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Card: ({ children, padding }) => (
    <div data-testid="card" data-padding={padding}>
      {children}
    </div>
  ),
  Group: ({ children, justify, gap, align }) => (
    <div
      data-testid="group"
      data-justify={justify}
      data-gap={gap}
      data-align={align}
    >
      {children}
    </div>
  ),
  Skeleton: ({ height, width, circle }) => (
    <div
      data-testid="skeleton"
      style={{ height, width }}
      data-circle={circle ? 'true' : undefined}
    ></div>
  ),
  Stack: ({ children, className, gap, style, w }) => (
    <div
      data-testid="stack"
      className={className}
      data-gap={gap}
      style={{ ...style, width: w }}
    >
      {children}
    </div>
  ),
}))

describe('DeploymentsFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component correctly in desktop view (>1600px)', () => {
    // Mock the media query to simulate desktop view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(false) // is1600px = false
      .mockReturnValueOnce(false) // is1024px = false

    render(<DeploymentsFallback />)

    // Check for header section
    const headerGroup = screen.getAllByTestId('group')[0]
    expect(headerGroup).toHaveAttribute('data-justify', 'space-between')

    // Check for skeleton cards (3 cards as per the component)
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-padding', 'xl')

    // Verify right side skeleton section is rendered in desktop view
    const stacks = screen.getAllByTestId('stack')
    // Find a stack with width 600
    const rightSideStack = stacks.find(
      stack => stack.style && stack.style.width === '600px',
    )
    expect(rightSideStack).toBeTruthy()

    // Verify skeletons are rendered
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(10) // Should have multiple skeletons
  })

  it('renders the component correctly in tablet view (≤1600px)', () => {
    // Mock the media query to simulate tablet view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(false) // is1024px = false

    render(<DeploymentsFallback />)

    // Check for the action buttons for tablet view
    const groups = screen.getAllByTestId('group')
    // Find a group with justify="flex-end"
    const actionButtonGroup = groups.find(
      group => group.getAttribute('data-justify') === 'flex-end',
    )
    expect(actionButtonGroup).toBeTruthy()

    // The right side skeleton stack should not be rendered in tablet view
    const stacks = screen.getAllByTestId('stack')
    // Check that no stack has width 600
    const rightSideStack = stacks.find(
      stack => stack.style && stack.style.width === '600px',
    )
    expect(rightSideStack).toBeFalsy()
  })

  it('renders the component correctly in mobile view (≤1024px)', () => {
    // Mock the media query to simulate mobile view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(true) // is1024px = true

    render(<DeploymentsFallback />)

    // Check for single action button in mobile view
    const skeletons = screen.getAllByTestId('skeleton')

    // Find a group with justify="flex-end" that contains the single action button
    const groups = screen.getAllByTestId('group')
    const mobileActionGroup = groups.find(
      group => group.getAttribute('data-justify') === 'flex-end',
    )
    expect(mobileActionGroup).toBeTruthy()

    // Verify that a single action button is rendered in the mobile view
    // Count children of the mobile action group
    const mobileAction = mobileActionGroup.querySelector(
      '[data-testid="skeleton"]',
    )
    expect(mobileAction).toBeTruthy()
    expect(mobileAction.style.height).toBe('40px')
    expect(mobileAction.style.width).toBe('40px')
  })
})
