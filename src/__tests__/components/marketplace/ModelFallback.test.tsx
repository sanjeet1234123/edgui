// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ModelFallback from '@/components/marketplace/ModelFallback'

// Mock the MarketplaceHeader component
jest.mock('@/components/marketplace/MarketplaceHeader', () => ({
  __esModule: true,
  default: jest.fn(({ pageTitle }) => (
    <div data-testid="marketplace-header">{pageTitle}</div>
  )),
}))

// Mock the Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(() => false)
}))

// Mock the Mantine components
const Grid = ({ children, gutter }) => (
  <div data-testid="grid" data-gutter={JSON.stringify(gutter)}>
    {children}
  </div>
);
Grid.Col = ({ children, span, key }) => (
  <div data-testid="grid-col" data-span={JSON.stringify(span)} key={key}>
    {children}
  </div>
);

jest.mock('@mantine/core', () => ({
  Card: ({ children, p, radius, withBorder, shadow }) => (
    <div 
      data-testid="card" 
      data-p={p} 
      data-radius={radius} 
      data-with-border={withBorder} 
      data-shadow={shadow}
    >
      {children}
    </div>
  ),
  Grid,
  Group: ({ children, justify }) => (
    <div data-testid="group" data-justify={justify}>
      {children}
    </div>
  ),
  Skeleton: ({ height, width, radius }) => (
    <div 
      data-testid="skeleton" 
      style={{ height, width }} 
      data-radius={radius}
    ></div>
  ),
  Stack: ({ children, h, w, gap }) => (
    <div 
      data-testid="stack" 
      style={{ height: h, width: w, gap }}
    >
      {children}
    </div>
  ),
  Text: ({ children, fw, size, c, ta }) => (
    <p 
      data-testid="text" 
      style={{ 
        fontWeight: fw, 
        fontSize: size,
        color: c,
        textAlign: ta
      }}
    >
      {children}
    </p>
  ),
}))

describe('ModelFallback', () => {
  it('renders the marketplace header with correct props', () => {
    render(<ModelFallback />)
    
    const header = screen.getByTestId('marketplace-header')
    expect(header).toHaveTextContent('Model Marketplace')
  })

  it('renders the Models title', () => {
    render(<ModelFallback />)
    
    const modelsTitle = screen.getByText('Models')
    expect(modelsTitle).toBeInTheDocument()
  })

  it('renders skeleton cards for desktop view (3 columns)', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(() => false) // Not mobile and not tablet
    
    render(<ModelFallback />)
    
    // Should render 9 skeleton cards (3 rows x 3 columns)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(9)
    
    // Should have 9 grid columns
    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols.length).toBe(9)
  })

  it('renders skeleton cards for tablet view (2 columns)', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    // First call for mobile check returns false, second call for tablet check returns true
    useMediaQuery.mockImplementationOnce(() => false)
      .mockImplementationOnce(() => true)
    
    render(<ModelFallback />)
    
    // Should render 6 skeleton cards (3 rows x 2 columns)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(6)
    
    // Should have 6 grid columns
    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols.length).toBe(6)
  })

  it('renders skeleton cards for mobile view (1 column)', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    // Mock mobile check to return true
    useMediaQuery.mockImplementation(() => true)
    
    render(<ModelFallback />)
    
    // Should render 3 skeleton cards (3 rows x 1 column)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
    
    // Should have 3 grid columns
    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols.length).toBe(3)
  })

  it('renders card skeletons with proper structure', () => {
    render(<ModelFallback />)
    
    const cards = screen.getAllByTestId('card')
    
    // Each card should have these attributes
    expect(cards[0]).toHaveAttribute('data-p', 'lg')
    expect(cards[0]).toHaveAttribute('data-radius', 'md')
    expect(cards[0]).toHaveAttribute('data-with-border', 'true')
    expect(cards[0]).toHaveAttribute('data-shadow', 'sm')
    
    // Each card should have header, body and footer sections
    const stacks = screen.getAllByTestId('stack')
    expect(stacks.length).toBeGreaterThan(0)
    
    // Each card should have multiple skeletons
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
