// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import AddProjectsModal from '@/components/projects/AddProjectsModal'
import { useCreateProjectMutation } from '@/hooks/mutations/useProjectsMutations'

// Mock the project mutations hook
jest.mock('@/hooks/mutations/useProjectsMutations', () => ({
  useCreateProjectMutation: jest.fn(),
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = { workspace_id: 'test-workspace-id' }
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('AddProjectsModal', () => {
  const mockClose = jest.fn()
  const mockMutate = jest.fn()
  
  // Setup QueryClient for testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mock implementation
    ;(useCreateProjectMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  const renderComponent = (opened = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <AddProjectsModal opened={opened} close={mockClose} />
        </MantineProvider>
      </QueryClientProvider>
    )
  }

  it('renders the modal when opened is true', () => {
    renderComponent(true)
    
    expect(screen.getByText('Create a new project')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Add Project')).toBeInTheDocument()
  })

  it('does not render the modal when opened is false', () => {
    renderComponent(false)
    
    expect(screen.queryByText('Create a new project')).not.toBeInTheDocument()
  })

  it('calls close function when Cancel button is clicked', () => {
    renderComponent()
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('validates project name format', async () => {
    renderComponent()
    
    // Submit the form with empty name field
    const submitButton = screen.getByText('Add Project')
    fireEvent.click(submitButton)
    
    // The form validation shows the format error by default
    expect(screen.getByText('Project name can only contain letters, numbers, hyphens, underscores, periods, and spaces')).toBeInTheDocument()
  })

  it('validates special characters in project name', async () => {
    renderComponent()
    
    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: '!@#$%^' } })
    
    const submitButton = screen.getByText('Add Project')
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Project name can only contain letters, numbers, hyphens, underscores, periods, and spaces')).toBeInTheDocument()
  })

  it('submits the form with valid data', async () => {
    renderComponent()
    
    const nameInput = screen.getByLabelText('Name')
    const descriptionInput = screen.getByLabelText('Description')
    
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.change(descriptionInput, { target: { value: 'This is a test project' } })
    
    const submitButton = screen.getByText('Add Project')
    fireEvent.click(submitButton)
    
    expect(mockMutate).toHaveBeenCalledWith(
      {
        name: 'Test Project',
        description: 'This is a test project',
        workspace_id: 'test-workspace-id',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    )
  })

  it('closes the modal on successful project creation', async () => {
    // Setup mock to call onSuccess callback
    mockMutate.mockImplementation((_, options) => {
      options.onSuccess()
    })
    
    renderComponent()
    
    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    
    const submitButton = screen.getByText('Add Project')
    fireEvent.click(submitButton)
    
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('disables the submit button when form submission is pending', () => {
    // Mock pending state
    ;(useCreateProjectMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })
    
    renderComponent()
    
    // In Mantine, we need to check the button element itself, not just the text
    const submitButton = screen.getByRole('button', { name: 'Add Project' })
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })

  it('does not submit if workspace_id is missing', async () => {
    // Clear the localStorage mock completely before this test
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    renderComponent()
    
    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    
    const submitButton = screen.getByText('Add Project')
    fireEvent.click(submitButton)
    
    // Wait a bit to ensure any async operations complete
    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })
})
