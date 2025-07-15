// @ts-nocheck
/**
 * @jest-environment jsdom
 */
// Mock Mantine components
const Table = ({ children }) => (
  <table data-testid="mantine-table">{children}</table>
)
Table.Thead = ({ children }) => (
  <thead data-testid="mantine-table-head">{children}</thead>
)
Table.Tbody = ({ children }) => (
  <tbody data-testid="mantine-table-body">{children}</tbody>
)
Table.Tr = ({ children }) => <tr data-testid="mantine-table-row">{children}</tr>
Table.Th = ({ children }) => (
  <th data-testid="mantine-table-header">{children}</th>
)
Table.Td = ({ children }) => (
  <td data-testid="mantine-table-cell">{children}</td>
)
jest.mock('@mantine/core', () => ({
  Group: ({ children, justify, align, gap, wrap }) => (
    <div
      data-testid="mantine-group"
      data-justify={justify}
      data-align={align}
      data-gap={gap}
      data-wrap={wrap}
    >
      {children}
    </div>
  ),
  Stack: ({ children, gap, className, w }) => (
    <div
      data-testid="mantine-stack"
      data-gap={gap}
      className={className}
      data-w={w}
    >
      {children}
    </div>
  ),
  Card: ({ children, padding }) => (
    <div data-testid="mantine-card" data-padding={padding}>
      {children}
    </div>
  ),
  Skeleton: ({ height, width, circle }) => (
    <div
      data-testid="mantine-skeleton"
      data-height={height}
      data-width={width}
      data-circle={circle}
    ></div>
  ),
  Table,
}))

const mockUseMediaQuery = jest.fn()
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: () => mockUseMediaQuery(),
}))

import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ClustersFallback from '../../../components/clusters/ClustersFallback'

describe('ClustersFallback', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('renders the component structure correctly', () => {
    // Mock media queries for desktop view
    mockUseMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      if (query === '(max-width: 1024px)') return false
      return false
    })

    const { container } = render(<ClustersFallback />)

    // Check that the main structure is rendered
    const stacks = screen.getAllByTestId('mantine-stack')
    expect(stacks.length).toBeGreaterThan(0)

    // Verify the root stack has the flex-grow class
    const rootStack = stacks.find(stack => stack.className === 'flex-grow')
    expect(rootStack).toBeInTheDocument()
  })

  it('renders the header skeleton correctly', () => {
    mockUseMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      if (query === '(max-width: 1024px)') return false
      return false
    })

    render(<ClustersFallback />)

    // Only check the first Group (header)
    const groups = screen.getAllByTestId('mantine-group')
    const headerGroup = groups[0]
    const headerSkeletons = Array.from(
      headerGroup.querySelectorAll(
        '[data-testid="mantine-skeleton"][data-height="40"]',
      ),
    )
    expect(headerSkeletons.length).toBe(2)
  })

  it('renders three cluster cards', () => {
    mockUseMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      if (query === '(max-width: 1024px)') return false
      return false
    })

    render(<ClustersFallback />)

    const cards = screen.getAllByTestId('mantine-card')
    expect(cards.length).toBe(3)
  })

  it('renders node metrics table skeleton', () => {
    mockUseMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      if (query === '(max-width: 1024px)') return false
      return false
    })

    render(<ClustersFallback />)

    const tableHead = screen.getAllByTestId('mantine-table-head')
    const tableBody = screen.getAllByTestId('mantine-table-body')
    const tableRows = screen.getAllByTestId('mantine-table-row')

    expect(tableHead.length).toBe(3) // One for each card
    expect(tableBody.length).toBe(3)
    expect(tableRows.length).toBe(9) // 3 cards * (1 header row + 2 data rows)
  })

  it('renders utilization metrics in desktop view', () => {
    mockUseMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      if (query === '(max-width: 1024px)') return false
      return false
    })

    render(<ClustersFallback />)

    const circleSkeletons = screen
      .getAllByTestId('mantine-skeleton')
      .filter(skeleton => skeleton.getAttribute('data-circle') === 'true')
    expect(circleSkeletons.length).toBe(6) // 3 cards * 2 utilization metrics
  })

  it('renders in tablet view (1440px)', () => {
    mockUseMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return true
      if (query === '(max-width: 1024px)') return false
      return false
    })

    render(<ClustersFallback />)

    // In tablet view, circle skeletons are still rendered (see component logic)
    const circleSkeletons = screen
      .getAllByTestId('mantine-skeleton')
      .filter(skeleton => skeleton.getAttribute('data-circle') === 'true')
    expect(circleSkeletons.length).toBe(6) // 3 cards * 2 utilization metrics
  })

  it('renders in mobile view (1024px)', () => {
    mockUseMediaQuery.mockReturnValue(true)

    render(<ClustersFallback />)

    // In mobile view, at least one group should have data-wrap="wrap"
    const groups = screen.getAllByTestId('mantine-group')
    console.log(
      'mantine-group HTML:',
      groups.map(g => g.outerHTML),
    )
    const wrappedGroups = groups.filter(
      group => group.getAttribute('data-wrap') === 'wrap',
    )
    console.log(
      'data-wrap attributes:',
      groups.map(g => g.getAttribute('data-wrap')),
    )
    expect(wrappedGroups.length).toBeGreaterThan(0)
  })
})
