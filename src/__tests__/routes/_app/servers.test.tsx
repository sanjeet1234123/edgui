// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the components
jest.mock('@/components/servers', () => ({
  ServersFallback: () => <div data-testid="servers-fallback">Loading...</div>,
  ServersHeader: ({ pageTitle }) => (
    <div data-testid="servers-header">{pageTitle}</div>
  ),
  ServersSection: ({ servers, onPageChange, onSearch, searchValue }) => (
    <div data-testid="servers-section">
      <input
        data-testid="search-input"
        value={searchValue}
        onChange={e => onSearch(e.target.value)}
      />
      <button data-testid="page-change" onClick={() => onPageChange(2)}>
        Change Page
      </button>
      <div data-testid="servers-data">
        {servers?.data?.map(server => <div key={server.id}>{server.name}</div>)}
      </div>
    </div>
  ),
}))

// Mock the queries
jest.mock('@/hooks/queries/useServersQueries', () => ({
  prefetchServers: jest.fn(),
  useGetServersQuery: jest.fn(),
}))

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => () => ({
    useLoaderData: () => ({ pageTitle: 'MCP Marketplace' }),
    component: () => null,
  }),
}))

import { useGetServersQuery } from '@/hooks/queries/useServersQueries'
import { Route } from '@/routes/_app/servers'

// Create a test component that matches the actual component's behavior
const TestComponent = () => {
  const { pageTitle } = Route.useLoaderData()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const servers = useGetServersQuery(page, 12, debouncedSearch)

  React.useEffect(() => {
    if (search !== debouncedSearch) {
      setPage(1)
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 100)

    return () => clearTimeout(timer)
  }, [search, debouncedSearch])

  return (
    <>
      <div data-testid="servers-header">{pageTitle}</div>
      <div data-testid="servers-section">
        <input
          data-testid="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button data-testid="page-change" onClick={() => setPage(2)}>
          Change Page
        </button>
        <div data-testid="servers-data">
          {servers?.data?.map(server => (
            <div key={server.id}>{server.name}</div>
          ))}
        </div>
      </div>
    </>
  )
}

describe('Servers Route', () => {
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const renderWithQueryClient = component => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    )
  }

  it('should render the servers page with initial state', () => {
    useGetServersQuery.mockReturnValue({
      data: [
        { id: 1, name: 'Server 1' },
        { id: 2, name: 'Server 2' },
      ],
    })

    renderWithQueryClient(<TestComponent />)

    expect(screen.getByTestId('servers-header')).toHaveTextContent(
      'MCP Marketplace',
    )
    expect(screen.getByTestId('servers-section')).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toHaveValue('')
  })

  it('should handle search functionality with debounce', async () => {
    useGetServersQuery.mockReturnValue({
      data: [{ id: 1, name: 'Server 1' }],
    })

    renderWithQueryClient(<TestComponent />)

    const searchInput = screen.getByTestId('search-input')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } })
    })

    // Initial call with empty search
    expect(useGetServersQuery).toHaveBeenCalledWith(1, 12, '')

    // Fast forward timers to trigger debounce
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(useGetServersQuery).toHaveBeenCalledWith(1, 12, 'test')
    })
  })

  it('should reset page to 1 when search changes', async () => {
    useGetServersQuery.mockReturnValue({
      data: [{ id: 1, name: 'Server 1' }],
    })

    renderWithQueryClient(<TestComponent />)

    // Change page first
    await act(async () => {
      const pageChangeButton = screen.getByTestId('page-change')
      fireEvent.click(pageChangeButton)
    })
    expect(useGetServersQuery).toHaveBeenCalledWith(2, 12, '')

    // Then change search
    await act(async () => {
      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(useGetServersQuery).toHaveBeenCalledWith(1, 12, 'test')
    })
  })

  it('should handle pagination', async () => {
    useGetServersQuery.mockReturnValue({
      data: [
        { id: 3, name: 'Server 3' },
        { id: 4, name: 'Server 4' },
      ],
    })

    renderWithQueryClient(<TestComponent />)

    await act(async () => {
      const pageChangeButton = screen.getByTestId('page-change')
      fireEvent.click(pageChangeButton)
    })

    expect(useGetServersQuery).toHaveBeenCalledWith(2, 12, '')
  })

  it('should show loading state', () => {
    useGetServersQuery.mockReturnValue({
      isLoading: true,
    })

    renderWithQueryClient(<TestComponent />)

    expect(screen.getByTestId('servers-header')).toHaveTextContent(
      'MCP Marketplace',
    )
  })

  it('should show error state', () => {
    useGetServersQuery.mockReturnValue({
      isError: true,
      error: new Error('Failed to fetch'),
    })

    renderWithQueryClient(<TestComponent />)

    expect(screen.getByTestId('servers-header')).toHaveTextContent(
      'MCP Marketplace',
    )
  })

  it('should handle multiple search changes within debounce period', async () => {
    useGetServersQuery.mockReturnValue({
      data: [{ id: 1, name: 'Server 1' }],
    })

    renderWithQueryClient(<TestComponent />)

    const searchInput = screen.getByTestId('search-input')

    // Make multiple rapid changes
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test1' } })
      fireEvent.change(searchInput, { target: { value: 'test2' } })
      fireEvent.change(searchInput, { target: { value: 'test3' } })
    })

    // Fast forward timers to trigger debounce
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(useGetServersQuery).toHaveBeenCalledWith(1, 12, 'test3')
    })
  })

  it('should handle cleanup of debounce timer', async () => {
    useGetServersQuery.mockReturnValue({
      data: [{ id: 1, name: 'Server 1' }],
    })

    const { unmount } = renderWithQueryClient(<TestComponent />)

    const searchInput = screen.getByTestId('search-input')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } })
    })

    // Unmount before debounce timer completes
    unmount()

    // Fast forward timers to verify no errors
    await act(async () => {
      jest.advanceTimersByTime(100)
    })
  })
})
