// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import ServersSection from '@/components/servers/ServersSection'

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const GridCol = ({ children, span, ...rest }) => (
    <div
      data-testid="mantine-grid-col"
      data-span={JSON.stringify(span)}
      {...rest}
    >
      {children}
    </div>
  )

  const Grid = ({ children, gutter }) => (
    <div data-testid="mantine-grid" data-gutter={JSON.stringify(gutter)}>
      {children}
    </div>
  )

  Grid.Col = GridCol

  return {
    Grid,
    Group: ({ children, justify, mt }) => (
      <div data-testid="mantine-group" data-justify={justify} data-mt={mt}>
        {children}
      </div>
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
    Pagination: ({ value, onChange, total, siblings, boundaries }) => (
      <div
        data-testid="mantine-pagination"
        data-value={value}
        data-total={total}
        data-siblings={siblings}
        data-boundaries={boundaries}
      >
        <button
          onClick={() => onChange(value > 1 ? value - 1 : value)}
          data-testid="pagination-prev"
          disabled={value <= 1}
        >
          Prev
        </button>
        <span data-testid="pagination-current">{value}</span>
        <button
          onClick={() => onChange(value < total ? value + 1 : value)}
          data-testid="pagination-next"
          disabled={value >= total}
        >
          Next
        </button>
      </div>
    ),
    Text: ({ children, ta }) => (
      <div data-testid="mantine-text" data-ta={ta}>
        {children}
      </div>
    ),
    TextInput: ({
      placeholder,
      value,
      onChange,
      onKeyDown,
      onBlur,
      classNames,
      rightSection,
    }) => (
      <div
        data-testid="mantine-textinput"
        data-placeholder={placeholder}
        data-classnames={JSON.stringify(classNames)}
      >
        <input
          data-testid="search-input"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
        />
        <div data-testid="right-section">{rightSection}</div>
      </div>
    ),
  }
})

// Mock ServersCard component
jest.mock('@/components/servers/ServersCard', () => ({
  __esModule: true,
  default: ({ server }) => (
    <div data-testid="servers-card" data-server-id={server.id}>
      {server.name}
    </div>
  ),
}))

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconSearch: ({ size, onClick, style }) => (
    <div
      data-testid="icon-search"
      data-size={size}
      onClick={onClick}
      style={style}
    ></div>
  ),
}))

describe('ServersSection', () => {
  const mockServers = {
    data: [
      { id: '1', name: 'Server 1', description: 'Description 1' },
      { id: '2', name: 'Server 2', description: 'Description 2' },
      { id: '3', name: 'Server 3', description: 'Description 3' },
    ],
    total: 30,
    limit: 10,
    page: 1,
  }

  const mockOnPageChange = jest.fn()
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component structure correctly', () => {
    render(<ServersSection servers={mockServers} />)

    // Check stack containers - use getAllByTestId instead of getByTestId
    const stacks = screen.getAllByTestId('mantine-stack')

    // Main stack with space-between
    const mainStack = stacks.find(
      stack => stack.getAttribute('data-justify') === 'space-between',
    )
    expect(mainStack).toBeInTheDocument()
    expect(mainStack).toHaveAttribute('data-justify', 'space-between')
    expect(mainStack).toHaveClass('flex-grow')

    // Check search input
    const searchInput = screen.getByTestId('mantine-textinput')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('data-placeholder', 'Search')

    // Check grid
    const grid = screen.getByTestId('mantine-grid')
    expect(grid).toBeInTheDocument()

    // Check pagination
    const pagination = screen.getByTestId('mantine-pagination')
    expect(pagination).toBeInTheDocument()
    expect(pagination).toHaveAttribute('data-value', '1')
    expect(pagination).toHaveAttribute('data-total', '3')
  })

  it('renders server cards for each server in data', () => {
    render(<ServersSection servers={mockServers} />)

    const serverCards = screen.getAllByTestId('servers-card')
    expect(serverCards).toHaveLength(3)

    expect(serverCards[0]).toHaveAttribute('data-server-id', '1')
    expect(serverCards[1]).toHaveAttribute('data-server-id', '2')
    expect(serverCards[2]).toHaveAttribute('data-server-id', '3')
  })

  it('displays "No servers found" when no servers are available', () => {
    const emptyServers = { ...mockServers, data: [] }
    render(<ServersSection servers={emptyServers} />)

    const noServersText = screen.getByTestId('mantine-text')
    expect(noServersText).toBeInTheDocument()
    expect(noServersText.textContent).toBe('No servers found')
  })

  it('calls onPageChange when pagination changes', () => {
    render(
      <ServersSection servers={mockServers} onPageChange={mockOnPageChange} />,
    )

    const nextButton = screen.getByTestId('pagination-next')
    fireEvent.click(nextButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('does not show pagination when there is only one page', () => {
    const singlePageServers = { ...mockServers, total: 5, limit: 10, page: 1 }
    render(<ServersSection servers={singlePageServers} />)

    const pagination = screen.queryByTestId('mantine-pagination')
    expect(pagination).not.toBeInTheDocument()
  })

  it('updates search term when input changes', () => {
    render(<ServersSection servers={mockServers} onSearch={mockOnSearch} />)

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    expect(searchInput.value).toBe('test search')
  })

  it('calls onSearch when input field is emptied', () => {
    render(
      <ServersSection
        servers={mockServers}
        onSearch={mockOnSearch}
        searchValue="initial"
      />,
    )

    const searchInput = screen.getByTestId('search-input')
    expect(searchInput.value).toBe('initial')

    fireEvent.change(searchInput, { target: { value: '' } })

    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('calls onSearch when Enter key is pressed', () => {
    render(<ServersSection servers={mockServers} onSearch={mockOnSearch} />)

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'search term' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    expect(mockOnSearch).toHaveBeenCalledWith('search term')
  })

  it('calls onSearch when input loses focus', () => {
    render(<ServersSection servers={mockServers} onSearch={mockOnSearch} />)

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'blur search' } })
    fireEvent.blur(searchInput)

    expect(mockOnSearch).toHaveBeenCalledWith('blur search')
  })

  it('calls onSearch when search icon is clicked', () => {
    render(<ServersSection servers={mockServers} onSearch={mockOnSearch} />)

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'icon search' } })

    const searchIcon = screen.getByTestId('icon-search')
    fireEvent.click(searchIcon)

    expect(mockOnSearch).toHaveBeenCalledWith('icon search')
  })

  it('updates active page when servers.page prop changes', () => {
    const { rerender } = render(
      <ServersSection servers={mockServers} onPageChange={mockOnPageChange} />,
    )

    const updatedServers = { ...mockServers, page: 2 }
    rerender(
      <ServersSection
        servers={updatedServers}
        onPageChange={mockOnPageChange}
      />,
    )

    const pagination = screen.getByTestId('mantine-pagination')
    expect(pagination).toHaveAttribute('data-value', '2')
  })

  it('updates search term when searchValue prop changes', () => {
    const { rerender } = render(
      <ServersSection
        servers={mockServers}
        onSearch={mockOnSearch}
        searchValue="initial value"
      />,
    )

    const searchInput = screen.getByTestId('search-input')
    expect(searchInput.value).toBe('initial value')

    rerender(
      <ServersSection
        servers={mockServers}
        onSearch={mockOnSearch}
        searchValue="updated value"
      />,
    )

    expect(searchInput.value).toBe('updated value')
  })
})
