// @ts-nocheck
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import TeamProfile from '@/components/workspace/TeamProfile'

// Mock the WorkspaceDetails component
jest.mock('@/components/workspace/TeamProfile/WorkspaceDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="workspace-details">Workspace Details Content</div>,
}))

// Mock the WorkspaceMembers component
jest.mock('@/components/workspace/TeamProfile/WorkspaceMembers', () => ({
  __esModule: true,
  default: () => <div data-testid="workspace-members">Workspace Members Content</div>,
}))

jest.mock('../../../constants/endpoint', () => ({ __esModule: true, default: 'http://localhost/v1' }))

describe('TeamProfile', () => {
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
          <TeamProfile />
        </MantineProvider>
      </QueryClientProvider>
    )
  }

  it('renders the workspace details and members components', () => {
    renderComponent()
    
    // Check that both components are rendered
    expect(screen.getByTestId('workspace-details')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-members')).toBeInTheDocument()
  })

  it('renders the components in a grid layout', () => {
    renderComponent()
    
    // Check that both components are rendered in the document
    expect(screen.getByTestId('workspace-details')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-members')).toBeInTheDocument()
    
    // Mantine Grid doesn't use standard grid roles, so we'll just check for the components
    const gridElement = document.querySelector('.mantine-Grid-root')
    expect(gridElement).toBeTruthy()
  })
})
