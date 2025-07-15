// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClustersFallback from '@/components/deployment/ClustersFallback'

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const GridComponent = ({ children, gutter }) => (
    <div data-testid="grid" data-gutter={gutter}>
      {children}
    </div>
  )

  // Exclude key from props destructuring to avoid React warning
  GridComponent.Col = ({ children, span, ...rest }) => (
    <div data-testid="grid-col" data-span={JSON.stringify(span)} {...rest}>
      {children}
    </div>
  )

  return {
    Grid: GridComponent,
    Group: ({ children }) => <div data-testid="group">{children}</div>,
    Skeleton: ({ height, width, radius }) => (
      <div
        data-testid="skeleton"
        data-height={height}
        data-width={width}
        data-radius={radius}
      />
    ),
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
  }
})

describe('ClustersFallback', () => {
  it('renders the component with correct structure', () => {
    render(<ClustersFallback />)

    // Check if Stack component is rendered with correct props
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveAttribute('data-gap', '3rem')

    // Check if Group component is rendered
    const group = screen.getByTestId('group')
    expect(group).toBeInTheDocument()

    // Check if Grid component is rendered with correct gutter
    const grid = screen.getByTestId('grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveAttribute('data-gutter', 'lg')
  })

  it('renders the header skeleton with correct dimensions', () => {
    render(<ClustersFallback />)

    // Get all skeletons
    const skeletons = screen.getAllByTestId('skeleton')

    // First skeleton should be the header
    const headerSkeleton = skeletons[0]
    expect(headerSkeleton).toHaveAttribute('data-height', '36')
    expect(headerSkeleton).toHaveAttribute('data-width', '200')
  })

  it('renders the modal details skeleton with correct dimensions', () => {
    render(<ClustersFallback />)

    // Get all skeletons
    const skeletons = screen.getAllByTestId('skeleton')

    // Second skeleton should be the modal details
    const modalSkeleton = skeletons[1]
    expect(modalSkeleton).toHaveAttribute('data-height', '200')
    expect(modalSkeleton).toHaveAttribute('data-radius', 'md')
  })

  it('renders exactly 3 grid column skeletons', () => {
    render(<ClustersFallback />)

    // Check if exactly 3 grid columns are rendered
    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols).toHaveLength(3)
  })

  it('renders cluster skeletons with correct properties', () => {
    render(<ClustersFallback />)

    // Get all skeletons
    const skeletons = screen.getAllByTestId('skeleton')

    // We should have 5 skeletons in total (1 header + 1 modal + 3 clusters)
    expect(skeletons).toHaveLength(5)

    // The last 3 skeletons should be the clusters
    const clusterSkeletons = skeletons.slice(2)

    // Check each cluster skeleton
    clusterSkeletons.forEach(skeleton => {
      expect(skeleton).toHaveAttribute('data-height', '300')
      expect(skeleton).toHaveAttribute('data-radius', 'md')
    })
  })

  it('applies responsive column spans to grid columns', () => {
    render(<ClustersFallback />)

    // Check if grid columns have the correct span properties
    const gridCols = screen.getAllByTestId('grid-col')

    // Each grid column should have the same responsive span configuration
    gridCols.forEach(col => {
      const spanData = col.getAttribute('data-span')
      expect(spanData).toBe(JSON.stringify({ base: 12, md: 6, lg: 6, xl: 4 }))
    })
  })
})
