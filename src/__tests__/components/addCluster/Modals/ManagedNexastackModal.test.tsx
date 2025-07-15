// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ManagedNexastackModal from '@/components/addCluster/Modals/ManagedNexastackModal'
import { useNavigate } from '@tanstack/react-router'
import { useManagedClusterMutation } from '@/hooks/mutations/useAddClusterMutations'

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
}))

// Mock the mutation hook
jest.mock('@/hooks/mutations/useAddClusterMutations', () => ({
  useManagedClusterMutation: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const Modal = ({ children, opened, onClose, title }) =>
    opened ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  Modal.Stack = ({ children }) => (
    <div data-testid="modal-stack">{children}</div>
  )

  return {
    Modal,
    Button: ({ children, onClick, disabled, loading, type }) => (
      <button
        data-testid="button"
        onClick={onClick}
        disabled={disabled}
        data-loading={loading}
        type={type}
      >
        {children}
      </button>
    ),
    Group: ({ children }) => <div data-testid="group">{children}</div>,
    Stack: ({ children, gap, align }) => (
      <div data-testid="stack" data-gap={gap} data-align={align}>
        {children}
      </div>
    ),
    Text: ({ children, fz, fw, c }) => (
      <span data-testid="text" data-fz={fz} data-fw={fw} data-color={c}>
        {children}
      </span>
    ),
    TextInput: ({ label, placeholder, ...props }) => {
      const id =
        props.id || label?.replace(/\s+/g, '-').toLowerCase() || 'input-id'
      return (
        <div>
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            data-testid="text-input"
            placeholder={placeholder}
            {...props}
          />
        </div>
      )
    },
    ThemeIcon: ({ children, color, size, variant }) => (
      <div
        data-testid="theme-icon"
        data-color={color}
        data-size={size}
        data-variant={variant}
      >
        {children}
      </div>
    ),
    Title: ({ children, order }) => (
      <h1 data-testid="title" data-order={order}>
        {children}
      </h1>
    ),
    useModalsStack: jest.fn(),
  }
})

// Mock icons
jest.mock('@tabler/icons-react', () => ({
  IconStack: () => <div data-testid="icon-stack">Stack Icon</div>,
  IconCloudCheck: () => (
    <div data-testid="icon-cloud-check">Cloud Check Icon</div>
  ),
  IconCheck: () => <div data-testid="icon-check">Check Icon</div>,
}))

describe('ManagedNexastackModal', () => {
  const mockNavigate = jest.fn()
  const mockClose = jest.fn()
  const mockMutate = jest.fn()
  const mockOpenSuccess = jest.fn()
  const mockCloseAll = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    useManagedClusterMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
    require('@mantine/core').useModalsStack.mockReturnValue({
      register: () => ({}),
      open: mockOpenSuccess,
      closeAll: mockCloseAll,
    })
  })

  it('renders the initial modal with cluster configuration form', () => {
    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    expect(
      screen.getByText('Managed Kubernetes (By Nexastack)'),
    ).toBeInTheDocument()
    expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText('Cluster Name')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter cluster name'),
    ).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Proceed Next')).toBeInTheDocument()
  })

  it('validates cluster name is required', async () => {
    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    const submitButton = screen.getByText('Proceed Next')
    expect(submitButton).toBeDisabled()

    const input = screen.getByPlaceholderText('Enter cluster name')
    fireEvent.change(input, { target: { value: 'test-cluster' } })

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('handles form submission and shows success modal', async () => {
    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    const input = screen.getByPlaceholderText('Enter cluster name')
    fireEvent.change(input, { target: { value: 'test-cluster' } })

    const submitButton = screen.getByText('Proceed Next')
    fireEvent.click(submitButton)

    expect(mockMutate).toHaveBeenCalledWith(
      {
        cluster_name: 'test-cluster',
        ingress: '.lab.neuralcompany.team',
      },
      expect.any(Object),
    )

    // Simulate successful mutation
    const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
    onSuccessCallback()

    expect(mockOpenSuccess).toHaveBeenCalledWith('success')
  })

  it('handles cancel button click', () => {
    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockClose).toHaveBeenCalled()
  })

  it('handles finish button click in success modal', async () => {
    // Mock the modal stack state
    let currentModal = 'cluster-config'
    const mockRegister = modalId => ({
      opened: currentModal === modalId,
    })
    const mockOpen = modalId => {
      currentModal = modalId
    }
    require('@mantine/core').useModalsStack.mockReturnValue({
      register: mockRegister,
      open: mockOpen,
      closeAll: mockCloseAll,
    })

    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    // Fill in the form and submit
    const input = screen.getByPlaceholderText('Enter cluster name')
    fireEvent.change(input, { target: { value: 'test-cluster' } })
    const submitButton = screen.getByText('Proceed Next')
    fireEvent.click(submitButton)

    // Simulate successful mutation
    const onSuccessCallback = mockMutate.mock.calls[0][1].onSuccess
    onSuccessCallback()

    // Re-render to show success modal
    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    // Click the finish button
    const finishButton = screen.getByText('Go to Clusters')
    fireEvent.click(finishButton)

    // Verify all expected actions were called
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/clusters' })
  })

  it('shows loading state during mutation', () => {
    useManagedClusterMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })

    render(<ManagedNexastackModal opened={true} close={mockClose} />)

    const input = screen.getByPlaceholderText('Enter cluster name')
    fireEvent.change(input, { target: { value: 'test-cluster' } })

    const submitButton = screen.getByText('Proceed Next')
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })
})
