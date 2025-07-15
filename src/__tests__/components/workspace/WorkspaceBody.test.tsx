// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import WorkspaceBody from '@/components/workspace/WorkspaceBody'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false),
}))

// Mock the TeamProfile and Members components
jest.mock('@/components/workspace/TeamProfile', () => ({
  __esModule: true,
  default: () => <div data-testid="team-profile">Team Profile Content</div>,
}))

jest.mock('@/components/workspace/Members', () => ({
  __esModule: true,
  default: () => <div data-testid="members">Members Content</div>,
}))

// Mock the SegmentedControl component to make it easier to test
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core');
  return {
    ...originalModule,
    SegmentedControl: ({ value, onChange, data }) => (
      <div data-testid="segmented-control">
        {data.map(item => (
          <button 
            key={item.value} 
            data-testid={`tab-${item.value}`}
            data-active={value === item.value ? 'true' : 'false'}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    ),
    MantineProvider: ({ children }) => <div>{children}</div>,
    Group: ({ children }) => <div>{children}</div>,
  };
})

jest.mock('../../../constants/endpoint', () => ({ __esModule: true, default: 'http://localhost/v1' }))

describe('WorkspaceBody', () => {
  // Setup QueryClient for testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <WorkspaceBody />
        </MantineProvider>
      </QueryClientProvider>
    )
  }

  it('renders the segmented control with correct tabs', () => {
    renderComponent()
    
    // Check that the segmented control is rendered with both tabs
    expect(screen.getByTestId('segmented-control')).toBeInTheDocument()
    expect(screen.getByTestId('tab-team_profile')).toBeInTheDocument()
    expect(screen.getByTestId('tab-members')).toBeInTheDocument()
    
    // Team Profile tab should be active by default
    expect(screen.getByTestId('tab-team_profile')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('team-profile')).toBeInTheDocument()
  })

  it('switches to Members tab when clicked', () => {
    renderComponent()
    
    // Initially Team Profile should be visible
    expect(screen.getByTestId('team-profile')).toBeInTheDocument()
    expect(screen.queryByTestId('members')).not.toBeInTheDocument()
    
    // Click on Members tab
    fireEvent.click(screen.getByTestId('tab-members'))
    
    // Now Members should be visible and Team Profile hidden
    expect(screen.queryByTestId('team-profile')).not.toBeInTheDocument()
    expect(screen.getByTestId('members')).toBeInTheDocument()
  })
})
