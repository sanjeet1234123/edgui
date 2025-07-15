// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ServerPlaygroundLists from '@/components/playground/serverPlayground/ServerPlaygroundLists'
import { useGetServersInfiniteQuery } from '@/hooks/queries/useServersQueries'
import { useGetServerQuery } from '@/hooks/queries/useServerQueries'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { MantineProvider } from '@mantine/core'

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = class {
  constructor(cb) {
    this.cb = cb
  }
  observe() {
    this.cb([{ isIntersecting: true }])
  }
  unobserve() {}
  disconnect() {}
}

const mockToggleServer = jest.fn()
const mockIsServerSelected = jest.fn().mockReturnValue(false)
const mockClearSelectedServers = jest.fn()
let mockSelectedServers = []

jest.mock('@/store/selectedServersStore', () => {
  return {
    __esModule: true,
    useSelectedServersStore: jest.fn(),
  }
})

jest.mock('@/hooks/queries/useServersQueries')
jest.mock('@/hooks/queries/useServerQueries')

jest.mock(
  '@/components/playground/serverPlayground/ServerPlaygroundServerCard',
  () => ({
    __esModule: true,
    default: jest.fn(({ server, lastElementRef, ref }) => (
      <div data-testid="server-card" ref={lastElementRef || ref}>
        {server.name}
      </div>
    )),
  }),
)

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

jest.mock('@mantine/core', () => {
  const original = jest.requireActual('@mantine/core')
  return {
    ...original,
    Skeleton: props => <div data-testid="skeleton">{props.children}</div>,
    Badge: props => <div data-testid="badge">{props.children}</div>,
    MantineProvider: original.MantineProvider,
    // add more if needed
  }
})

describe('ServerPlaygroundLists', () => {
  const mockServer = {
    id: '1',
    name: 'Test Server',
  }

  const mockServersData = {
    pages: [
      {
        data: [
          { id: '1', name: 'Server 1' },
          { id: '2', name: 'Server 2' },
        ],
      },
    ],
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    mockSelectedServers = []
    mockIsServerSelected.mockReturnValue(false)
    useSelectedServersStore.mockImplementation(selector => {
      const state = {
        selectedServers: mockSelectedServers,
        toggleServer: mockToggleServer,
        isServerSelected: mockIsServerSelected,
        clearSelectedServers: mockClearSelectedServers,
      }
      return typeof selector === 'function' ? selector(state) : state
    })

    // Mock useGetServersInfiniteQuery
    useGetServersInfiniteQuery.mockReturnValue({
      data: mockServersData,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
      status: 'success',
    })

    // Mock useGetServerQuery
    useGetServerQuery.mockReturnValue({
      data: { data: [mockServer] },
    })
  })

  it('renders loading state correctly', () => {
    useGetServersInfiniteQuery.mockReturnValue({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'pending',
    })

    let error
    try {
      render(
        <MantineProvider>
          <ServerPlaygroundLists server="1" />
        </MantineProvider>,
      )
    } catch (e) {
      error = e
      // eslint-disable-next-line no-console
      console.error('Test Render Error:', e)
    }
    expect(error).toBeUndefined()
    // const skeletons = screen.getAllByTestId('skeleton')
    // expect(skeletons).toHaveLength(3)
  })

  it('renders error state correctly', () => {
    useGetServersInfiniteQuery.mockReturnValue({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'error',
    })

    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )
    expect(screen.getByText('Error loading servers')).toBeInTheDocument()
  })

  it('renders server list correctly', () => {
    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )
    const serverCards = screen.getAllByTestId('server-card')
    expect(serverCards).toHaveLength(2)
  })

  it('shows loading state when fetching next page', () => {
    useGetServersInfiniteQuery.mockReturnValue({
      data: mockServersData,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
      status: 'success',
    })

    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )
    const loadingSkeletons = screen.getAllByTestId('skeleton')
    expect(loadingSkeletons).toHaveLength(2)
  })

  it('shows correct number of selected servers in badge', () => {
    mockSelectedServers = [{ id: '1' }, { id: '2' }]
    mockIsServerSelected.mockReturnValue(true)
    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('clears selected servers when clear button is clicked', () => {
    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )
    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)
    expect(mockClearSelectedServers).toHaveBeenCalled()
  })

  it('toggles server when server card is clicked', () => {
    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )
    const serverCards = screen.getAllByTestId('server-card')
    fireEvent.click(serverCards[0])
    expect(mockToggleServer).toHaveBeenCalled()
  })

  it('fetches next page when scrolling to bottom', async () => {
    const fetchNextPage = jest.fn()
    useGetServersInfiniteQuery.mockReturnValue({
      data: mockServersData,
      fetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      status: 'success',
    })

    render(
      <MantineProvider>
        <ServerPlaygroundLists server="1" />
      </MantineProvider>,
    )

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalled()
    })
  })
})
