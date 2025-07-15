// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import AccountSettingsFallback from '../../../components/accountSettings/AccountSettingsFallback'

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const Grid = ({ children, gutter }) => (
    <div data-testid="mantine-grid" data-gutter={gutter}>
      {children}
    </div>
  )
  Grid.Col = ({ children, span }) => (
    <div data-testid="mantine-grid-col" data-span={JSON.stringify(span)}>
      {children}
    </div>
  )

  // Mock Tabs and its subcomponents
  const Tabs = ({ children, value, defaultValue, onChange }) => (
    <div
      data-testid="mantine-tabs"
      data-value={value}
      data-default-value={defaultValue}
    >
      {children}
    </div>
  )
  Tabs.List = ({ children }) => (
    <div data-testid="mantine-tabs-list">{children}</div>
  )
  Tabs.Tab = ({ children, value, leftSection }) => (
    <div data-testid="mantine-tabs-tab" data-value={value}>
      {leftSection}
      {children}
    </div>
  )
  Tabs.Panel = ({ children, value, ps, pt }) => (
    <div
      data-testid="mantine-tabs-panel"
      data-value={value}
      data-ps={ps}
      data-pt={pt}
    >
      {children}
    </div>
  )

  return {
    Grid,
    Group: ({ children, gap, justify }) => (
      <div data-testid="mantine-group" data-gap={gap} data-justify={justify}>
        {children}
      </div>
    ),
    Stack: ({ children, gap, h }) => (
      <div data-testid="mantine-stack" data-gap={gap} data-h={h}>
        {children}
      </div>
    ),
    Card: ({ children, withBorder, radius, h }) => (
      <div
        data-testid="mantine-card"
        data-with-border={withBorder}
        data-radius={radius}
        data-h={h}
      >
        {children}
      </div>
    ),
    Skeleton: ({ height, width, radius, mb }) => (
      <div
        data-testid="mantine-skeleton"
        data-height={height}
        data-width={width}
        data-radius={radius}
        data-mb={mb}
      ></div>
    ),
    ScrollArea: ({ children, h }) => (
      <div data-testid="mantine-scroll-area" data-h={h}>
        {children}
      </div>
    ),
    Flex: ({ children, gap, justify }) => (
      <div data-testid="mantine-flex" data-gap={gap} data-justify={justify}>
        {children}
      </div>
    ),
    Tabs,
  }
})

describe('AccountSettingsFallback', () => {
  it('renders the main grid structure', () => {
    render(<AccountSettingsFallback />)

    // The main layout uses multiple Stack components
    const stacks = screen.getAllByTestId('mantine-stack')
    expect(stacks.length).toBeGreaterThan(0)

    // Check that the Tabs are present
    const tabs = screen.getByTestId('mantine-tabs')
    expect(tabs).toBeInTheDocument()

    // Check that there are three tab items
    const tabItems = screen.getAllByTestId('mantine-tabs-tab')
    expect(tabItems.length).toBe(3)
  })

  it('renders UserDetailsSkeleton correctly', () => {
    render(<AccountSettingsFallback />)

    const cards = screen.getAllByTestId('mantine-card')
    const userDetailsCard = cards[0]
    expect(userDetailsCard).toHaveAttribute('data-with-border', 'true')
    expect(userDetailsCard).toHaveAttribute('data-radius', 'md')
    expect(userDetailsCard).toHaveAttribute('data-h', '100%')

    const skeletons = screen.getAllByTestId('mantine-skeleton')

    // Check title skeleton
    const titleSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '24' &&
        skeleton.getAttribute('data-width') === '120' &&
        skeleton.getAttribute('data-mb') === 'md',
    )
    expect(titleSkeleton).toBeInTheDocument()

    // Check user details skeletons
    const detailSkeletons = skeletons.filter(
      skeleton => skeleton.getAttribute('data-height') === '18',
    )
    expect(detailSkeletons.length).toBeGreaterThan(0)
  })

  it('renders WorkspaceDetailsSkeleton correctly', () => {
    render(<AccountSettingsFallback />)

    const cards = screen.getAllByTestId('mantine-card')
    const workspaceCard = cards[1]
    expect(workspaceCard).toHaveAttribute('data-with-border', 'true')
    expect(workspaceCard).toHaveAttribute('data-radius', 'md')
    expect(workspaceCard).toHaveAttribute('data-h', '100%')

    const skeletons = screen.getAllByTestId('mantine-skeleton')

    // Check workspace title skeleton
    const titleSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '24' &&
        skeleton.getAttribute('data-width') === '180',
    )
    expect(titleSkeleton).toBeInTheDocument()

    // Check workspace description skeleton
    const descSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '16' &&
        skeleton.getAttribute('data-width') === '250',
    )
    expect(descSkeleton).toBeInTheDocument()
  })

  it('renders ProjectDetailsSkeleton correctly', () => {
    render(<AccountSettingsFallback />)

    const cards = screen.getAllByTestId('mantine-card')
    const projectCard = cards[2]
    expect(projectCard).toHaveAttribute('data-with-border', 'true')
    expect(projectCard).toHaveAttribute('data-radius', 'md')
    expect(projectCard).toHaveAttribute('data-h', '100%')

    const scrollArea = screen.getByTestId('mantine-scroll-area')
    expect(scrollArea).toHaveAttribute('data-h', '150')

    const skeletons = screen.getAllByTestId('mantine-skeleton')

    // Check project title skeleton
    const titleSkeleton = skeletons.find(
      skeleton =>
        skeleton.getAttribute('data-height') === '24' &&
        skeleton.getAttribute('data-width') === '100',
    )
    expect(titleSkeleton).toBeInTheDocument()

    // Check project list skeletons
    const projectSkeletons = skeletons.filter(
      skeleton =>
        skeleton.getAttribute('data-height') === '30' &&
        skeleton.getAttribute('data-width') === '30' &&
        skeleton.getAttribute('data-radius') === 'md',
    )
    expect(projectSkeletons.length).toBe(3) // Should have 3 project skeletons
  })
})
