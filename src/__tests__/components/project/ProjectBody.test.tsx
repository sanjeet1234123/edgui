// @ts-nocheck
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import ProjectBody from '@/components/project/ProjectBody'

// Mock the media query hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockImplementation(query => {
    if (query === '(max-width: 1024px)') return false
    if (query === '(max-width: 768px)') return false
    return false
  }),
}))

// Mock the project components
jest.mock('@/components/project/overview/Overview', () => ({
  __esModule: true,
  default: () => <div data-testid="overview">Overview Content</div>,
}))

jest.mock('@/components/project/Environments', () => ({
  __esModule: true,
  default: () => <div data-testid="environments">Environments Content</div>,
}))

jest.mock('@/components/project/Members', () => ({
  __esModule: true,
  default: () => <div data-testid="members">Members Content</div>,
}))

jest.mock('@/components/project/Settings', () => ({
  __esModule: true,
  default: () => <div data-testid="settings">Settings Content</div>,
}))

jest.mock('@/components/project/Activity', () => ({
  __esModule: true,
  default: () => <div data-testid="activity">Activity Content</div>,
}))

// Mock the SegmentedControl component to make it easier to test
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core')
  return {
    ...originalModule,
    SegmentedControl: ({ value, onChange, data }) => (
      <div data-testid="segmented-control">
        {data.map(item => (
          <button
            key={item.value}
            data-testid={`tab-${item.value}`}
            data-active={value === item.value ? 'true' : 'false'}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    ),
    MantineProvider: ({ children }) => <div>{children}</div>,
    Group: ({ children }) => <div>{children}</div>,
  }
})

describe('ProjectBody', () => {
  // Setup QueryClient for testing
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ProjectBody />
        </MantineProvider>
      </QueryClientProvider>,
    )
  }

  it('renders the segmented control with correct tabs', () => {
    renderComponent()

    // Check that the segmented control is rendered with all tabs
    expect(screen.getByTestId('segmented-control')).toBeInTheDocument()
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument()
    expect(screen.getByTestId('tab-environments')).toBeInTheDocument()
    expect(screen.getByTestId('tab-members')).toBeInTheDocument()
    expect(screen.getByTestId('tab-settings')).toBeInTheDocument()
    expect(screen.getByTestId('tab-activity')).toBeInTheDocument()

    // Overview tab should be active by default
    expect(screen.getByTestId('tab-overview')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(screen.getByTestId('overview')).toBeInTheDocument()
  })

  it('switches to Members tab when clicked', () => {
    renderComponent()

    // Initially Overview should be visible
    expect(screen.getByTestId('overview')).toBeInTheDocument()
    expect(screen.queryByTestId('members')).not.toBeInTheDocument()

    // Click on Members tab
    fireEvent.click(screen.getByTestId('tab-members'))

    // Now Members should be visible and Overview hidden
    expect(screen.queryByTestId('overview')).not.toBeInTheDocument()
    expect(screen.getByTestId('members')).toBeInTheDocument()
  })

  it('switches to Activity tab when clicked', () => {
    renderComponent()

    // Initially Overview should be visible
    expect(screen.getByTestId('overview')).toBeInTheDocument()
    expect(screen.queryByTestId('activity')).not.toBeInTheDocument()

    // Click on Activity tab
    fireEvent.click(screen.getByTestId('tab-activity'))

    // Now Activity should be visible and Overview hidden
    expect(screen.queryByTestId('overview')).not.toBeInTheDocument()
    expect(screen.getByTestId('activity')).toBeInTheDocument()
  })

  it('does not switch to disabled tabs', () => {
    renderComponent()

    // Check disabled status of tabs
    expect(screen.getByTestId('tab-environments')).toHaveAttribute(
      'disabled',
      '',
    )
    expect(screen.getByTestId('tab-settings')).toHaveAttribute('disabled', '')

    // Try clicking on disabled Environments tab
    fireEvent.click(screen.getByTestId('tab-environments'))

    // Should still be on Overview
    expect(screen.getByTestId('overview')).toBeInTheDocument()
    expect(screen.queryByTestId('environments')).not.toBeInTheDocument()
  })

  it('handles responsive layout changes', () => {
    // Mock different screen sizes
    const useMediaQueryMock = jest.requireMock('@mantine/hooks').useMediaQuery

    // Test layout for desktop (default)
    useMediaQueryMock.mockImplementation(query => false)
    const { unmount: unmount1 } = renderComponent()
    expect(screen.getAllByTestId('segmented-control')[0]).toBeInTheDocument()
    unmount1()

    // Test layout for tablet (1024px)
    useMediaQueryMock.mockImplementation(query => {
      if (query === '(max-width: 1024px)') return true
      return false
    })
    const { unmount: unmount2 } = renderComponent()
    expect(screen.getAllByTestId('segmented-control')[0]).toBeInTheDocument()
    unmount2()

    // Test layout for mobile (768px)
    useMediaQueryMock.mockImplementation(query => {
      if (query === '(max-width: 768px)') return true
      return false
    })
    renderComponent()
    expect(screen.getAllByTestId('segmented-control')[0]).toBeInTheDocument()
  })
})
