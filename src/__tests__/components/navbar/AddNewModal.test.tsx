// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import AddNewModal from '@/components/navbar/AddNewModal'
import { useNavigate } from '@tanstack/react-router'
import { PATHS } from '@/constants/paths'

// Mock the useNavigate hook
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
}))

// Mock the Mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockImplementation(() => false),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  return {
    Group: ({ children }: any) => <div>{children}</div>,
    Modal: ({ children, opened, onClose, title }: any) =>
      opened ? (
        <div role="dialog" aria-modal="true">
          <button onClick={onClose} aria-label="close">
            Close
          </button>
          <div>{title}</div>
          <div>{children}</div>
        </div>
      ) : null,
    Paper: ({ children, className, onClick }: any) => (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    ),
    Stack: ({ children }: any) => <div>{children}</div>,
    Text: ({ children, className }: any) => (
      <div className={className}>{children}</div>
    ),
  }
})

// Custom render function for AddNewModal
const customRender = (
  opened = true,
  onClose = jest.fn(),
  toggle = jest.fn(),
  setSidebarOpen = jest.fn(),
) => {
  return render(
    <AddNewModal
      opened={opened}
      onClose={onClose}
      toggle={toggle}
      setSidebarOpen={setSidebarOpen}
    />,
  )
}

describe('AddNewModal', () => {
  it('renders the modal with the correct title when opened', () => {
    customRender(true)

    // Check if title is rendered correctly
    expect(screen.getByText('Onboard Cluster')).toBeInTheDocument()
    expect(
      screen.getByText('Please configure and add your cluster'),
    ).toBeInTheDocument()
  })

  it('displays modal content with card options', () => {
    customRender(true)

    // Check if both options are visible
    expect(screen.getByText('Add New Cluster')).toBeInTheDocument()
    expect(screen.getByText('Upload New Model')).toBeInTheDocument()

    // Check descriptions
    expect(
      screen.getByText(
        /Set the infrastructure configurations as per your requirements/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Upload your model to the cluster/i),
    ).toBeInTheDocument()
  })

  it('navigates to add cluster path when Add New Cluster is clicked', () => {
    const mockNavigate = jest.fn()
    const mockOnClose = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)

    customRender(true, mockOnClose)

    // Find and click on the Add New Cluster card
    const clusterCard = screen.getByText('Add New Cluster').closest('div')
    fireEvent.click(clusterCard!)

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled()

    // Check if navigate was called with the right path
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.ADD_CLUSTER })
  })

  it('navigates to marketplace with upload=true when Upload New Model is clicked', () => {
    const mockNavigate = jest.fn()
    const mockOnClose = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)

    customRender(true, mockOnClose)

    // Find and click on the Upload New Model card
    const uploadCard = screen.getByText('Upload New Model').closest('div')
    fireEvent.click(uploadCard!)

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled()

    // Check if navigate was called with the right path and search params
    expect(mockNavigate).toHaveBeenCalledWith({
      to: PATHS.MARKETPLACE,
      search: { upload: 'true' },
    })
  })

  it('calls onClose when the modal is closed', () => {
    const mockOnClose = jest.fn()
    customRender(true, mockOnClose)

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles responsive layout', () => {
    // Mock smaller screens
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 768px)') return true
      if (query === '(max-width: 1024px)') return true
      return false
    })

    customRender(true)

    // At least verify the component still renders
    expect(screen.getByText('Onboard Cluster')).toBeInTheDocument()
  })
})
