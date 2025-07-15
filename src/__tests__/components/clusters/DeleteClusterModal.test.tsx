// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeleteClusterModal from '@/components/clusters/DeleteClusterModal'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the delete cluster mutation
jest.mock('@/hooks/mutations/useClustersMutations', () => ({
  useDeleteClusterMutation: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Modal: ({ children, opened, onClose, title, size, padding }) =>
    opened ? (
      <div data-testid="modal" data-size={size} data-padding={padding}>
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
  Button: ({ children, onClick, loading, color, size, variant }) => (
    <button
      data-testid={children === 'Cancel' ? 'cancel-button' : 'delete-button'}
      onClick={onClick}
      data-loading={loading}
      data-color={color}
      data-size={size}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Group: ({ children, justify }) => (
    <div data-testid="button-group" data-justify={justify}>
      {children}
    </div>
  ),
  Stack: ({ children, gap, justify }) => (
    <div data-testid="stack" data-gap={gap} data-justify={justify}>
      {children}
    </div>
  ),
  Text: ({ children, c, fw, fz, ta }) => (
    <div
      data-testid="text"
      data-color={c}
      data-weight={fw}
      data-size={fz}
      data-align={ta}
    >
      {children}
    </div>
  ),
}))

describe('DeleteClusterModal', () => {
  const mockOnClose = jest.fn()
  const mockDeleteCluster = jest.fn()
  const mockId = 123

  beforeEach(() => {
    jest.clearAllMocks()
    require('@/hooks/mutations/useClustersMutations').useDeleteClusterMutation.mockReturnValue(
      {
        mutate: mockDeleteCluster,
        isPending: false,
      },
    )
  })

  it('renders correctly when opened', () => {
    render(
      <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
    )

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Delete Cluster')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to delete this cluster?'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <DeleteClusterModal opened={false} onClose={mockOnClose} id={mockId} />,
    )

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
    )

    fireEvent.click(screen.getByTestId('cancel-button'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls deleteCluster mutation when delete button is clicked', () => {
    render(
      <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
    )

    fireEvent.click(screen.getByTestId('delete-button'))
    expect(mockDeleteCluster).toHaveBeenCalledWith(mockId, expect.any(Object))
  })

  it('calls onClose after successful deletion', () => {
    render(
      <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
    )

    fireEvent.click(screen.getByTestId('delete-button'))

    // Simulate successful deletion by calling the onSuccess callback
    const onSuccessCallback = mockDeleteCluster.mock.calls[0][1].onSuccess
    onSuccessCallback()

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('shows loading state on delete button during deletion', () => {
    require('@/hooks/mutations/useClustersMutations').useDeleteClusterMutation.mockReturnValue(
      {
        mutate: mockDeleteCluster,
        isPending: true,
      },
    )

    render(
      <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
    )

    const deleteButton = screen.getByTestId('delete-button')
    expect(deleteButton).toHaveAttribute('data-loading', 'true')
  })

  describe('Responsive button sizes', () => {
    it('uses large button size on desktop view', () => {
      require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

      render(
        <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
      )

      const deleteButton = screen.getByTestId('delete-button')
      const cancelButton = screen.getByTestId('cancel-button')

      expect(deleteButton).toHaveAttribute('data-size', 'lg')
      expect(cancelButton).toHaveAttribute('data-size', 'lg')
    })

    it('uses medium button size on mobile view', () => {
      require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

      render(
        <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
      )

      const deleteButton = screen.getByTestId('delete-button')
      const cancelButton = screen.getByTestId('cancel-button')

      expect(deleteButton).toHaveAttribute('data-size', 'md')
      expect(cancelButton).toHaveAttribute('data-size', 'md')
    })
  })

  it('applies correct styling to buttons', () => {
    render(
      <DeleteClusterModal opened={true} onClose={mockOnClose} id={mockId} />,
    )

    const deleteButton = screen.getByTestId('delete-button')
    const cancelButton = screen.getByTestId('cancel-button')

    expect(deleteButton).toHaveAttribute(
      'data-color',
      'var(--mantine-color-error)',
    )
    expect(cancelButton).toHaveAttribute('data-variant', 'subtle')
    expect(cancelButton).toHaveAttribute(
      'data-color',
      'var(--mantine-color-black)',
    )
  })
})
