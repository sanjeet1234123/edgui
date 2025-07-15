// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import AddClusterFallback from '../../../components/addCluster/AddClusterFallback'

// Mock Mantine components
const GridCol = ({ children, span }) => (
  <div data-testid="mantine-grid-col" data-span={JSON.stringify(span)}>
    {children}
  </div>
)

jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core')
  return {
    ...actual,
    Group: ({ children }) => <div data-testid="mantine-group">{children}</div>,
    Stack: ({ children, gap, className }) => (
      <div data-testid="mantine-stack" data-gap={gap} className={className}>
        {children}
      </div>
    ),
    Grid: Object.assign(
      ({ children, gutter, mb }) => (
        <div data-testid="mantine-grid" data-gutter={gutter} data-mb={mb}>
          {children}
        </div>
      ),
      { Col: GridCol },
    ),
    Card: ({ children, h, padding, shadow, classNames }) => (
      <div
        data-testid="mantine-card"
        data-h={h}
        data-padding={padding}
        data-shadow={shadow}
        data-classnames={JSON.stringify(classNames)}
      >
        {children}
      </div>
    ),
    Skeleton: ({ height, width, radius }) => (
      <div
        data-testid="mantine-skeleton"
        data-height={height}
        data-width={width}
        data-radius={radius}
      ></div>
    ),
  }
})

describe('AddClusterFallback', () => {
  it('renders the component structure correctly', () => {
    const { container } = render(<AddClusterFallback />)

    // Check that the main structure is rendered
    const stacks = screen.getAllByTestId('mantine-stack')
    expect(stacks.length).toBeGreaterThan(0)

    // Verify the root stack has the flex-grow class
    const rootStack = stacks.find(stack => stack.className === 'flex-grow')
    expect(rootStack).toBeInTheDocument()
  })

  it('renders the header skeleton', () => {
    render(<AddClusterFallback />)

    // Check header skeleton elements
    const groupElements = screen.getAllByTestId('mantine-group')
    expect(groupElements.length).toBeGreaterThan(0)

    const skeletons = screen.getAllByTestId('mantine-skeleton')
    const headerSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '36' &&
        skeleton.getAttribute('data-width') === '50%',
    )
    expect(headerSkeleton).toBeInTheDocument()
  })

  it('renders the cluster cards grid with correct structure', () => {
    render(<AddClusterFallback />)

    const grid = screen.getByTestId('mantine-grid')
    expect(grid).toHaveAttribute('data-gutter', 'xl')
    expect(grid).toHaveAttribute('data-mb', 'xl')

    const gridCols = screen.getAllByTestId('mantine-grid-col')
    expect(gridCols.length).toBe(3) // Should have 3 grid columns

    // Check that each grid column has the correct span
    gridCols.forEach(col => {
      const span = JSON.parse(col.getAttribute('data-span'))
      expect(span).toEqual({ base: 12, md: 6, lg: 4, xl: 3 })
    })
  })

  it('renders cluster cards with correct skeleton elements', () => {
    render(<AddClusterFallback />)

    const cards = screen.getAllByTestId('mantine-card')
    expect(cards.length).toBe(3) // Should have 3 cards

    // Check card properties
    cards.forEach(card => {
      expect(card).toHaveAttribute('data-h', '100%')
      expect(card).toHaveAttribute('data-padding', 'xl')
      expect(card).toHaveAttribute('data-shadow', 'md')
    })

    const skeletons = screen.getAllByTestId('mantine-skeleton')

    // Check for icon skeleton
    const iconSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '52' &&
        skeleton.getAttribute('data-width') === '52',
    )
    expect(iconSkeleton).toBeInTheDocument()

    // Check for title skeleton
    const titleSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '24' &&
        skeleton.getAttribute('data-width') === '70%',
    )
    expect(titleSkeleton).toBeInTheDocument()

    // Check for description skeletons
    const descriptionSkeletons = skeletons.filter(
      skeleton => skeleton.getAttribute('data-height') === '16',
    )
    expect(descriptionSkeletons.length).toBeGreaterThanOrEqual(3)
  })

  it('renders the action buttons skeleton', () => {
    render(<AddClusterFallback />)

    const skeletons = screen.getAllByTestId('mantine-skeleton')
    const actionButtonSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '42' &&
        skeleton.getAttribute('data-width') === '200',
    )
    expect(actionButtonSkeleton).toBeInTheDocument()
  })
})
