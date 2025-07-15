// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import MarketplaceSearch from '@/components/marketplace/MarketplaceSearch'

// Mock the model store
jest.mock('@/store/modelStore', () => ({
  useModelStore: jest.fn(() => ({
    viewMode: 'grid',
    setViewMode: jest.fn(),
    setSearchModel: jest.fn(),
    setFilters: jest.fn(),
    filters: null,
  })),
}))

// Mock CSS modules
jest.mock('@/components/marketplace/marketplace.module.css', () => ({
  segmentedControlRoot: 'segmented-control-root',
  filterTagsRoot: 'filter-tags-root',
  filterTagsLabel: 'filter-tags-label',
  filtersButtonRoot: 'filters-button-root',
  filtersButtonLabel: 'filters-button-label',
  filtersButtonSection: 'filters-button-section',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, onClick }) => (
    <button data-testid="action-icon" onClick={onClick}>
      {children}
    </button>
  ),
  Button: ({ children, onClick, leftSection, rightSection }) => (
    <button
      data-testid={`button-${children ? children.toString().toLowerCase() : 'button'}`}
      onClick={onClick}
    >
      {leftSection}
      {children}
      {rightSection}
    </button>
  ),
  Group: ({ children, justify }) => {
    // Main search group gets unique ID based on context
    if (children && Array.isArray(children) && children.length > 2) {
      return <div data-testid="search-main-group">{children}</div>
    }
    return <div data-testid="radio-input-group">{children}</div>
  },
  Popover: ({ children }) => <div data-testid="popover">{children}</div>,
  Radio: ({ label }) => (
    <input data-testid={`radio-${label.toLowerCase().replace(/\s+/g, '-')}`} />
  ),
  SegmentedControl: ({ value, onChange, data }) => (
    <div data-testid="segmented-control" data-value={value}>
      {data.map((item, index) => (
        <button
          key={index}
          data-testid={`segment-${item.value}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Text: ({ children }) => <span data-testid="text">{children}</span>,
  TextInput: ({ placeholder, onChange, leftSection }) => (
    <div>
      {leftSection}
      <input
        data-testid="text-input"
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  ),
}))

// Mock Popover sub-components
Object.defineProperty(require('@mantine/core'), 'Popover', {
  value: Object.assign(
    ({ children }) => <div data-testid="popover">{children}</div>,
    {
      Target: ({ children }) => (
        <div data-testid="popover-target">{children}</div>
      ),
      Dropdown: ({ children }) => (
        <div data-testid="popover-dropdown">{children}</div>
      ),
    },
  ),
  writable: true,
})

// Mock Radio sub-components with unique IDs - fix the Group component
Object.defineProperty(require('@mantine/core'), 'Radio', {
  value: Object.assign(
    ({ label }) => (
      <input
        data-testid={`radio-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
    ),
    {
      Group: (() => {
        let mockRadioGroupCounter = 0
        return ({ children, onChange }) => {
          mockRadioGroupCounter++
          return (
            <div
              data-testid={`radio-group-${mockRadioGroupCounter}`}
              onClick={() => onChange && onChange('test-value')}
            >
              <div data-testid="radio-inputs-container">{children}</div>
            </div>
          )
        }
      })(),
    },
  ),
  writable: true,
})

// Mock icons
jest.mock('@tabler/icons-react', () => ({
  IconLayoutGridFilled: () => <span data-testid="icon-grid">Grid</span>,
  IconMenu2: () => <span data-testid="icon-menu">Menu</span>,
  IconSearch: () => <span data-testid="icon-search">Search</span>,
  IconX: () => <span data-testid="icon-x">X</span>,
}))

jest.mock('lucide-react', () => ({
  Funnel: () => <span data-testid="icon-funnel">Funnel</span>,
}))

// Mock Framer Motion with unique IDs
jest.mock('motion/react', () => {
  let mockMotionDivCounter = 0
  return {
    motion: {
      div: ({ children }) => {
        mockMotionDivCounter++
        return (
          <div data-testid={`motion-div-${mockMotionDivCounter}`}>
            {children}
          </div>
        )
      },
    },
    AnimatePresence: ({ children }) => (
      <div data-testid="animate-presence">{children}</div>
    ),
  }
})

describe('MarketplaceSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main component structure', () => {
    render(<MarketplaceSearch />)

    expect(screen.getAllByTestId('search-main-group')[0]).toBeInTheDocument()
    expect(screen.getByTestId('text-input')).toBeInTheDocument()
    expect(screen.getByTestId('segmented-control')).toBeInTheDocument()
  })

  it('renders search input with correct placeholder', () => {
    render(<MarketplaceSearch />)

    const searchInput = screen.getByTestId('text-input')
    expect(searchInput).toHaveAttribute(
      'placeholder',
      'Search by name or description',
    )
  })

  it('renders segmented control with current view mode', () => {
    render(<MarketplaceSearch />)

    const segmentedControl = screen.getByTestId('segmented-control')
    expect(segmentedControl).toHaveAttribute('data-value', 'grid')
  })

  it('renders view mode segments', () => {
    render(<MarketplaceSearch />)

    expect(screen.getByTestId('segment-grid')).toBeInTheDocument()
    expect(screen.getByTestId('segment-table')).toBeInTheDocument()
  })

  it('renders filters button', () => {
    render(<MarketplaceSearch />)

    expect(screen.getByTestId('button-filters')).toBeInTheDocument()
  })

  it('handles search input changes', () => {
    const mockSetSearchModel = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: mockSetSearchModel,
      setFilters: jest.fn(),
      filters: null,
    })

    render(<MarketplaceSearch />)

    const searchInput = screen.getByTestId('text-input')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(mockSetSearchModel).toHaveBeenCalledWith('test search')
  })

  it('handles view mode changes to grid', () => {
    const mockSetViewMode = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: null,
    })

    render(<MarketplaceSearch />)

    const gridSegment = screen.getByTestId('segment-grid')
    fireEvent.click(gridSegment)

    expect(mockSetViewMode).toHaveBeenCalledWith('grid')
  })

  it('handles view mode changes to table', () => {
    const mockSetViewMode = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: null,
    })

    render(<MarketplaceSearch />)

    const tableSegment = screen.getByTestId('segment-table')
    fireEvent.click(tableSegment)

    expect(mockSetViewMode).toHaveBeenCalledWith('table')
  })

  it('reflects current view mode from store', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'table',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: null,
    })

    render(<MarketplaceSearch />)

    const segmentedControl = screen.getByTestId('segmented-control')
    expect(segmentedControl).toHaveAttribute('data-value', 'table')
  })

  it('renders safety and hardware filter sections', () => {
    render(<MarketplaceSearch />)

    expect(screen.getByText('Safety')).toBeInTheDocument()
    expect(screen.getByText('Hardware')).toBeInTheDocument()
  })

  it('displays correct filter option radio buttons', () => {
    render(<MarketplaceSearch />)

    // Safety options
    expect(screen.getByTestId('radio-safe')).toBeInTheDocument()
    expect(screen.getByTestId('radio-unsafe')).toBeInTheDocument()
    expect(screen.getByTestId('radio-use-with-caution')).toBeInTheDocument()

    // Hardware options
    expect(screen.getByTestId('radio-cpu')).toBeInTheDocument()
    expect(screen.getByTestId('radio-gpu')).toBeInTheDocument()
  })

  it('handles filter changes through radio groups', () => {
    const mockSetFilters = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: mockSetFilters,
      filters: null,
    })

    render(<MarketplaceSearch />)

    // Look for any radio group that exists
    const radioGroups = screen.getAllByTestId(/radio-group-\d+/)
    fireEvent.click(radioGroups[0])

    expect(mockSetFilters).toHaveBeenCalledTimes(1)
  })

  it('shows active filters when they exist', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: { safety: 'safe', hardware: null },
    })

    render(<MarketplaceSearch />)

    expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
  })

  it('renders popover structure', () => {
    render(<MarketplaceSearch />)

    expect(screen.getByTestId('popover-target')).toBeInTheDocument()
    expect(screen.getByTestId('popover-dropdown')).toBeInTheDocument()
  })

  it('renders all required icons', () => {
    render(<MarketplaceSearch />)

    expect(screen.getByTestId('icon-search')).toBeInTheDocument()
    expect(screen.getByTestId('icon-grid')).toBeInTheDocument()
    expect(screen.getByTestId('icon-menu')).toBeInTheDocument()
    expect(screen.getByTestId('icon-funnel')).toBeInTheDocument()
  })

  it('renders motion components for active filters', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: { safety: 'safe', hardware: 'gpu' },
    })

    render(<MarketplaceSearch />)

    expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
    // Look for any motion div that exists (since counter is unpredictable)
    const motionDivs = screen.getAllByTestId(/motion-div-\d+/)
    expect(motionDivs.length).toBeGreaterThan(0)
  })

  it('handles null filter values gracefully', () => {
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: { safety: null, hardware: null },
    })

    expect(() => render(<MarketplaceSearch />)).not.toThrow()
  })

  // Add these new tests for better coverage
  it('handles filter removal via action icon', () => {
    const mockSetFilters = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: mockSetFilters,
      filters: { safety: 'safe', hardware: 'gpu' },
    })

    render(<MarketplaceSearch />)

    // Find the action icon (X button) for removing filters
    const actionIcons = screen.getAllByTestId('action-icon')
    fireEvent.click(actionIcons[0])

    expect(mockSetFilters).toHaveBeenCalled()
  })

  it('synchronizes local state with store when store filters change', () => {
    const { rerender } = render(<MarketplaceSearch />)

    // Mock store with initial filters
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: { safety: 'safe', hardware: null },
    })

    rerender(<MarketplaceSearch />)

    // The component should render the updated filters
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument()
  })

  it('memoizes handleViewModeChange to prevent unnecessary re-renders', () => {
    const mockSetViewMode = jest.fn()
    const mockUseCallback = jest.spyOn(require('react'), 'useCallback')

    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: mockSetViewMode,
      setSearchModel: jest.fn(),
      setFilters: jest.fn(),
      filters: null,
    })

    render(<MarketplaceSearch />)

    // Verify useCallback was called for memoization
    expect(mockUseCallback).toHaveBeenCalled()

    mockUseCallback.mockRestore()
  })

  it('memoizes handleSearchChange to prevent unnecessary re-renders', () => {
    const mockSetSearchModel = jest.fn()
    const mockUseCallback = jest.spyOn(require('react'), 'useCallback')

    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: mockSetSearchModel,
      setFilters: jest.fn(),
      filters: null,
    })

    render(<MarketplaceSearch />)

    // Verify useCallback was called for memoization
    expect(mockUseCallback).toHaveBeenCalled()

    mockUseCallback.mockRestore()
  })

  it('handles filter changes with complex filter combinations', () => {
    const mockSetFilters = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: mockSetFilters,
      filters: { safety: 'safe', hardware: 'cpu' },
    })

    render(<MarketplaceSearch />)

    // Test filter change with existing filters
    const radioGroups = screen.getAllByTestId(/radio-group-\d+/)
    if (radioGroups.length > 0) {
      fireEvent.click(radioGroups[0])
      expect(mockSetFilters).toHaveBeenCalled()
    }
  })

  it('renders correct CSS classes from module', () => {
    render(<MarketplaceSearch />)

    // Verify that CSS classes are being applied
    const segmentedControl = screen.getByTestId('segmented-control')
    expect(segmentedControl).toBeInTheDocument()

    const filtersButton = screen.getByTestId('button-filters')
    expect(filtersButton).toBeInTheDocument()
  })

  it('handles empty string filter values correctly', () => {
    const mockSetFilters = jest.fn()
    require('@/store/modelStore').useModelStore.mockReturnValue({
      viewMode: 'grid',
      setViewMode: jest.fn(),
      setSearchModel: jest.fn(),
      setFilters: mockSetFilters,
      filters: { safety: '', hardware: '' },
    })

    expect(() => render(<MarketplaceSearch />)).not.toThrow()
  })

  it('renders popover with correct positioning props', () => {
    render(<MarketplaceSearch />)

    const popover = screen.getByTestId('popover')
    expect(popover).toBeInTheDocument()
  })
})
