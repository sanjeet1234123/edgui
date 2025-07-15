// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'

// Mock the model store
jest.mock('@/store/modelStore', () => ({
  useModelStore: jest.fn(() => ({
    selectedModelCategory: '',
    setSelectedModelCategory: jest.fn(),
  })),
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    prefetchQuery: jest.fn(),
  })),
}))

// Mock the marketplace queries
jest.mock('@/hooks/queries/useMarketplaceQueries', () => ({
  prefetchModels: jest.fn(),
}))

// Mock MarketplaceSearch component
jest.mock('@/components/marketplace/MarketplaceSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="marketplace-search">MarketplaceSearch</div>,
}))

// Mock CSS modules with camelCase names (as they appear in actual usage)
jest.mock('@/components/marketplace/marketplace.module.css', () => ({
  toggleButtons: 'toggleButtons',
  selectedButton: 'selectedButton',
  unselectedButton: 'unselectedButton',
  buttonLabel: 'buttonLabel',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, className, onClick }) => (
    <button
      data-testid={`button-${children.toLowerCase()}`}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
  Group: ({ children }) => <div data-testid="group">{children}</div>,
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
}))

describe('MarketplaceFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component structure correctly', () => {
    render(<MarketplaceFilters />)

    expect(screen.getByTestId('stack')).toBeInTheDocument()
    expect(screen.getByTestId('group')).toBeInTheDocument()
    expect(screen.getByTestId('marketplace-search')).toBeInTheDocument()
  })

  it('renders all model type buttons', () => {
    render(<MarketplaceFilters />)

    const expectedModelTypes = [
      'All',
      'LLM',
      'LCM',
      'LAM',
      'MoE',
      'VLM',
      'SLM',
      'MLM',
      'SAM',
    ]

    expectedModelTypes.forEach(type => {
      expect(
        screen.getByTestId(`button-${type.toLowerCase()}`),
      ).toBeInTheDocument()
    })
  })

  it('applies correct CSS classes for selected button', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      selectedModelCategory: 'llm',
      setSelectedModelCategory: jest.fn(),
    })

    render(<MarketplaceFilters />)

    const llmButton = screen.getByTestId('button-llm')
    expect(llmButton).toHaveClass('toggleButtons', 'selectedButton')
  })

  it('applies correct CSS classes for unselected buttons', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      selectedModelCategory: 'llm',
      setSelectedModelCategory: jest.fn(),
    })

    render(<MarketplaceFilters />)

    const allButton = screen.getByTestId('button-all')
    expect(allButton).toHaveClass('toggleButtons', 'unselectedButton')
  })

  it('handles category selection correctly', () => {
    const mockSetSelectedModelCategory = jest.fn()
    const mockPrefetchQuery = jest.fn()

    require('@/store/modelStore').useModelStore.mockReturnValue({
      selectedModelCategory: '',
      setSelectedModelCategory: mockSetSelectedModelCategory,
    })

    require('@tanstack/react-query').useQueryClient.mockReturnValue({
      prefetchQuery: mockPrefetchQuery,
    })

    render(<MarketplaceFilters />)

    const llmButton = screen.getByTestId('button-llm')
    fireEvent.click(llmButton)

    expect(mockSetSelectedModelCategory).toHaveBeenCalledWith('llm')
    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1)
  })

  it('handles "All" category selection correctly', () => {
    const mockSetSelectedModelCategory = jest.fn()

    require('@/store/modelStore').useModelStore.mockReturnValue({
      selectedModelCategory: '',
      setSelectedModelCategory: mockSetSelectedModelCategory,
    })

    render(<MarketplaceFilters />)

    const allButton = screen.getByTestId('button-all')
    fireEvent.click(allButton)

    expect(mockSetSelectedModelCategory).toHaveBeenCalledWith('')
  })

  it('includes MarketplaceSearch component', () => {
    render(<MarketplaceFilters />)
    expect(screen.getByTestId('marketplace-search')).toBeInTheDocument()
  })

  it('renders with correct button text content', () => {
    render(<MarketplaceFilters />)

    const expectedTexts = [
      'All',
      'LLM',
      'LCM',
      'LAM',
      'MoE',
      'VLM',
      'SLM',
      'MLM',
      'SAM',
    ]

    expectedTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  it('handles multiple category selections', () => {
    const mockSetSelectedModelCategory = jest.fn()

    require('@/store/modelStore').useModelStore.mockReturnValue({
      selectedModelCategory: '',
      setSelectedModelCategory: mockSetSelectedModelCategory,
    })

    render(<MarketplaceFilters />)

    // Click LLM
    fireEvent.click(screen.getByTestId('button-llm'))
    expect(mockSetSelectedModelCategory).toHaveBeenCalledWith('llm')

    // Click VLM
    fireEvent.click(screen.getByTestId('button-vlm'))
    expect(mockSetSelectedModelCategory).toHaveBeenCalledWith('vlm')

    expect(mockSetSelectedModelCategory).toHaveBeenCalledTimes(2)
  })

  it('reflects current selected category from store', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      selectedModelCategory: 'vlm',
      setSelectedModelCategory: jest.fn(),
    })

    render(<MarketplaceFilters />)

    const vlmButton = screen.getByTestId('button-vlm')
    expect(vlmButton).toHaveClass('selectedButton')
  })
})
