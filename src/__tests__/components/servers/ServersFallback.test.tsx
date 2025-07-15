// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ServersFallback from '@/components/servers/ServersFallback'

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const Grid = ({ children, gutter }) => (
    <div data-testid="mantine-grid" data-gutter={JSON.stringify(gutter)}>
      {children}
    </div>
  )

  Grid.Col = ({ children, span }) => (
    <div data-testid="mantine-grid-col" data-span={JSON.stringify(span)}>
      {children}
    </div>
  )

  return {
    Card: ({ children, h }) => (
      <div data-testid="mantine-card" data-h={h}>
        {children}
      </div>
    ),
    Grid,
    Group: ({ children, justify, mt }) => (
      <div data-testid="mantine-group" data-justify={justify} data-mt={mt}>
        {children}
      </div>
    ),
    Pagination: ({ value, total, disabled }) => (
      <div
        data-testid="mantine-pagination"
        data-value={value}
        data-total={total}
        data-disabled={disabled}
      ></div>
    ),
    Skeleton: ({ height, width, radius }) => (
      <div
        data-testid="mantine-skeleton"
        data-height={height}
        data-width={width}
        data-radius={radius}
      ></div>
    ),
    Stack: ({ children, justify, className }) => (
      <div
        data-testid="mantine-stack"
        data-justify={justify}
        className={className}
      >
        {children}
      </div>
    ),
    TextInput: ({ placeholder, value, disabled, rightSection }) => (
      <div
        data-testid="mantine-text-input"
        data-placeholder={placeholder}
        data-value={value}
        data-disabled={disabled}
      >
        {rightSection && (
          <div data-testid="text-input-right-section">{rightSection}</div>
        )}
      </div>
    ),
  }
})

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconSearch: ({ size }) => (
    <div data-testid="icon-search" data-size={size}></div>
  ),
}))

describe('ServersFallback', () => {
  it('renders the component structure correctly', () => {
    const { container } = render(<ServersFallback />)

    // Check that the main structure is rendered
    const stacks = screen.getAllByTestId('mantine-stack')
    expect(stacks.length).toBeGreaterThan(0)

    // Verify the root stack has the flex-grow class
    const rootStack = stacks.find(stack => stack.className === 'flex-grow')
    expect(rootStack).toBeInTheDocument()
  })

  it('renders the header skeleton', () => {
    render(<ServersFallback />)

    // Check header skeleton elements
    const groupElements = screen.getAllByTestId('mantine-group')
    expect(groupElements.length).toBeGreaterThan(0)

    const skeletons = screen.getAllByTestId('mantine-skeleton')
    const headerSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '40' &&
        skeleton.getAttribute('data-width') === '250' &&
        skeleton.getAttribute('data-radius') === 'md',
    )
    expect(headerSkeleton).toBeInTheDocument()
  })

  it('renders the search input skeleton', () => {
    render(<ServersFallback />)

    const textInput = screen.getByTestId('mantine-text-input')
    expect(textInput).toBeInTheDocument()
    expect(textInput).toHaveAttribute('data-placeholder', 'Search')
    expect(textInput).toHaveAttribute('data-value', '')
    expect(textInput).toHaveAttribute('data-disabled', 'true')

    const searchIcon = screen.getByTestId('icon-search')
    expect(searchIcon).toBeInTheDocument()
    expect(searchIcon).toHaveAttribute('data-size', '16')
  })

  it('renders the cards grid correctly', () => {
    render(<ServersFallback />)

    const grid = screen.getByTestId('mantine-grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveAttribute(
      'data-gutter',
      JSON.stringify({ base: 16, md: 24 }),
    )

    const gridCols = screen.getAllByTestId('mantine-grid-col')
    expect(gridCols.length).toBe(8) // Should have 8 grid columns

    gridCols.forEach(col => {
      expect(col).toHaveAttribute(
        'data-span',
        JSON.stringify({ base: 12, md: 6, lg: 4, xl: 3 }),
      )
    })
  })

  it('renders the correct card content', () => {
    render(<ServersFallback />)

    const cards = screen.getAllByTestId('mantine-card')
    expect(cards.length).toBe(8)

    cards.forEach(card => {
      expect(card).toHaveAttribute('data-h', '100%')
    })

    // Check for skeleton elements inside the cards
    const skeletons = screen.getAllByTestId('mantine-skeleton')

    // Should have avatar skeletons (40x40 with radius xl)
    const avatarSkeletons = skeletons.filter(
      skeleton =>
        skeleton.getAttribute('data-height') === '40' &&
        skeleton.getAttribute('data-width') === '40' &&
        skeleton.getAttribute('data-radius') === 'xl',
    )
    expect(avatarSkeletons.length).toBe(8) // One for each card

    // Should have title skeletons (24x120 with radius md)
    const titleSkeletons = skeletons.filter(
      skeleton =>
        skeleton.getAttribute('data-height') === '24' &&
        skeleton.getAttribute('data-width') === '120' &&
        skeleton.getAttribute('data-radius') === 'md',
    )
    expect(titleSkeletons.length).toBe(8) // One for each card

    // Should have content skeletons (40x100% with radius md)
    const contentSkeletons = skeletons.filter(
      skeleton =>
        skeleton.getAttribute('data-height') === '40' &&
        skeleton.getAttribute('data-width') === '100%' &&
        skeleton.getAttribute('data-radius') === 'md',
    )
    expect(contentSkeletons.length).toBe(8) // One for each card
  })

  it('renders the pagination', () => {
    render(<ServersFallback />)

    const pagination = screen.getByTestId('mantine-pagination')
    expect(pagination).toBeInTheDocument()
    expect(pagination).toHaveAttribute('data-value', '1')
    expect(pagination).toHaveAttribute('data-total', '5')
    expect(pagination).toHaveAttribute('data-disabled', 'true')

    const paginationGroup = screen
      .getAllByTestId('mantine-group')
      .find(
        group =>
          group.getAttribute('data-justify') === 'center' &&
          group.getAttribute('data-mt') === 'xl',
      )
    expect(paginationGroup).toBeInTheDocument()
  })
})
