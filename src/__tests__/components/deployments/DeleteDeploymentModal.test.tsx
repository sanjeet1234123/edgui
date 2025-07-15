// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeleteDeploymentModal from '@/components/deployments/DeleteDeploymentsModal'
import { useDeleteDeploymentMutation } from '@/hooks/mutations/useDeploymentsMutations'

// Mock the mutations hook
jest.mock('@/hooks/mutations/useDeploymentsMutations', () => ({
  useDeleteDeploymentMutation: jest.fn(),
}))

// Mock the Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, onClick, variant, color, size, loading }) => (
    <button
      data-testid={`button-${children?.toString().toLowerCase()}`}
      onClick={onClick}
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-loading={loading}
      disabled={loading}
    >
      {children}
    </button>
  ),
  Group: ({ children, justify }) => (
    <div data-testid="group" data-justify={justify}>
      {children}
    </div>
  ),
  Modal: ({ children, opened, onClose, size, padding, title, styles }) =>
    opened ? (
      <div data-testid="modal" data-size={size} data-padding={padding}>
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
  Stack: ({ children, gap, justify }) => (
    <div data-testid="stack" data-gap={gap} data-justify={justify}>
      {children}
    </div>
  ),
  Text: ({ children, c, fw, fz, ta }) => (
    <div
      data-testid="text"
      data-color={c}
      data-font-weight={fw}
      data-font-size={fz}
      data-text-align={ta}
    >
      {children}
    </div>
  ),
}))

describe('DeleteDeploymentModal', () => {
  const mockOnClose = jest.fn()
  const mockMutate = jest.fn()
  const mockDeploymentId = 123

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation for the mutation hook
    useDeleteDeploymentMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  it('should not render when opened is false', () => {
    render(
      <DeleteDeploymentModal
        opened={false}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('should render correctly when opened is true', () => {
    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    // Check modal exists and has correct title
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-title')).toBeInTheDocument()

    // Check title text
    const titleText = screen.getByText('Delete Model')
    expect(titleText).toBeInTheDocument()

    // Check confirmation text
    const confirmText = screen.getByText(
      'Are you sure you want to delete this model?',
    )
    expect(confirmText).toBeInTheDocument()

    // Check buttons exist
    expect(screen.getByTestId('button-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('button-delete')).toBeInTheDocument()
  })

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    const cancelButton = screen.getByTestId('button-cancel')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('should call onClose when modal close button is clicked', () => {
    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    const closeButton = screen.getByTestId('modal-close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('should call deleteDeployment mutation with correct ID when Delete button is clicked', () => {
    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    const deleteButton = screen.getByTestId('button-delete')
    fireEvent.click(deleteButton)

    expect(mockMutate).toHaveBeenCalledTimes(1)
    expect(mockMutate).toHaveBeenCalledWith(
      mockDeploymentId,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })

  it('should call onClose when mutation succeeds', () => {
    // Setup mockMutate to call the onSuccess callback
    mockMutate.mockImplementation((id, options) => {
      options.onSuccess()
    })

    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    const deleteButton = screen.getByTestId('button-delete')
    fireEvent.click(deleteButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should show loading state on Delete button when isPending is true', () => {
    // Mock pending state
    useDeleteDeploymentMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    })

    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    const deleteButton = screen.getByTestId('button-delete')
    expect(deleteButton).toHaveAttribute('data-loading', 'true')
    expect(deleteButton).toBeDisabled()
  })

  it('should apply responsive styling for mobile view', () => {
    // Mock mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(
      <DeleteDeploymentModal
        opened={true}
        onClose={mockOnClose}
        id={mockDeploymentId}
      />,
    )

    expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'md')
    expect(screen.getByTestId('modal')).toHaveAttribute('data-padding', 'md')

    // Check button sizes
    expect(screen.getByTestId('button-cancel')).toHaveAttribute(
      'data-size',
      'md',
    )
    expect(screen.getByTestId('button-delete')).toHaveAttribute(
      'data-size',
      'md',
    )

    // Check text sizes
    const texts = screen.getAllByTestId('text')
    expect(texts[0]).toHaveAttribute('data-font-size', 'var(--size-xl)')
    expect(texts[1]).toHaveAttribute('data-font-size', 'var(--size-md)')
  })
})
