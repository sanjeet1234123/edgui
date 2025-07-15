// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import GCPModal from '@/components/addCluster/Modals/GCPModal'
import { useGCPOnboardMutation } from '@/hooks/mutations/useAddClusterMutations'
import { useNavigate } from '@tanstack/react-router'
import React, { useState, useRef, useContext, createContext } from 'react'

const ModalStackContext = createContext({
  current: 'cluster-config',
  modals: {},
  setCurrent: () => {},
})

// Step-aware ModalStack and Modal mocks
const ModalStack = ({ children }) => {
  const { current, modals } = useContext(ModalStackContext)
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) return null
    const modalId = child.props['data-modal-id']
    if (
      modalId &&
      modals[modalId] &&
      modals[modalId].opened &&
      current === modalId
    ) {
      return child
    }
    return null
  })
}
const Modal = ({ children, opened, onClose, title, ...props }) => {
  return opened ? (
    <div data-testid="modal" data-modal-id={props['data-modal-id'] || ''}>
      <div data-testid="modal-title">{title}</div>
      {children}
      <button data-testid="modal-close" onClick={onClose}>
        Close
      </button>
    </div>
  ) : null
}
ModalStack.displayName = 'ModalStack'
Modal.displayName = 'Modal'

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('@/hooks/mutations/useAddClusterMutations', () => ({
  useGCPOnboardMutation: jest.fn(),
}))

// Mock Mantine components (reference ModalStack and Modal mocks)
jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core')
  return {
    ...actual,
    Modal: Object.assign(Modal, { Stack: ModalStack }),
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
    TextInput: ({ label, placeholder, onChange, error }) => (
      <div>
        <label>{label}</label>
        <input
          data-testid="text-input"
          placeholder={placeholder}
          onChange={onChange}
          data-error={error}
        />
      </div>
    ),
    Group: ({ children, justify }) => (
      <div data-justify={justify}>{children}</div>
    ),
    Stack: ({ children, gap }) => <div data-gap={gap}>{children}</div>,
    Text: ({ children, fz, fw, c }) => (
      <span data-fz={fz} data-fw={fw} data-color={c}>
        {children}
      </span>
    ),
    ThemeIcon: ({ children, color, size }) => (
      <div data-color={color} data-size={size}>
        {children}
      </div>
    ),
    Title: ({ children, order }) => <h1 data-order={order}>{children}</h1>,
    Progress: ({ value, color }) => (
      <div data-value={value} data-color={color} />
    ),
    ActionIcon: ({ children, onClick, color }) => (
      <button data-testid="action-icon" onClick={onClick} data-color={color}>
        {children}
      </button>
    ),
    // useModalsStack will be mocked in the test suite
  }
})

// Mock the FileUpload component
jest.mock('@/components/fileUpload/FileUpload', () => ({
  __esModule: true,
  default: ({ fileData, setFileData }) => (
    <div data-testid="file-upload">
      <button
        data-testid="upload-button"
        onClick={() =>
          setFileData({
            files: [
              new File(['test'], 'test.yaml', { type: 'application/yaml' }),
            ],
            fileNames: ['test.yaml'],
          })
        }
      >
        Upload File
      </button>
    </div>
  ),
}))

// Mock icons
jest.mock('@tabler/icons-react', () => ({
  IconStack: () => <div data-testid="stack-icon">Stack Icon</div>,
  IconCloudCheck: () => (
    <div data-testid="cloud-check-icon">Cloud Check Icon</div>
  ),
  IconCheck: () => <div data-testid="check-icon">Check Icon</div>,
  IconX: () => <div data-testid="x-icon">X Icon</div>,
}))

// useModalsStack mock using a ref
function createUseModalsStackMock() {
  const stepRef = { current: 'cluster-config', rerender: () => {} }
  const modalsRef = { current: {}, setCurrent: () => {} }
  function useModalsStack(ids) {
    const context = useContext(ModalStackContext)
    stepRef.rerender = context.setCurrent
    modalsRef.setCurrent = context.setCurrent
    return {
      register: id => {
        context.modals[id] = { opened: true }
        return { 'data-modal-id': id, opened: context.current === id }
      },
      open: id => {
        context.setCurrent(id)
      },
      close: jest.fn(),
      closeAll: jest.fn(),
      get current() {
        return context.current
      },
    }
  }
  return { useModalsStack, stepRef, modalsRef }
}
const { useModalsStack, stepRef, modalsRef } = createUseModalsStackMock()
jest
  .spyOn(require('@mantine/core'), 'useModalsStack')
  .mockImplementation(useModalsStack)

function TestWrapper({ children }) {
  const [current, setCurrent] = useState('cluster-config')
  const modals = useRef({})
  return (
    <ModalStackContext.Provider
      value={{ current, setCurrent, modals: modals.current }}
    >
      {children}
    </ModalStackContext.Provider>
  )
}

describe('GCPModal', () => {
  const mockClose = jest.fn()
  const mockNavigate = jest.fn()
  const mockGCPOnboard = jest.fn((data, { onSuccess }) => {
    if (onSuccess) onSuccess()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    useGCPOnboardMutation.mockReturnValue({
      mutate: mockGCPOnboard,
      isPending: false,
    })
  })

  function renderWithWrapper(ui) {
    return render(<TestWrapper>{ui}</TestWrapper>)
  }

  it('renders the initial cluster configuration modal', () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    expect(screen.getByText('GCP Account Onboarding')).toBeInTheDocument()
    expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()
    expect(screen.getByText('Cluster Name')).toBeInTheDocument()
  })

  it('validates cluster name input', async () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    const submitButton = screen.getByText('Proceed Next')
    expect(submitButton).toBeDisabled()

    const clusterNameInput = screen.getByTestId('text-input')
    fireEvent.change(clusterNameInput, { target: { value: 'test-cluster' } })

    expect(submitButton).not.toBeDisabled()
  })

  it('navigates to file upload modal on valid form submission', () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    const clusterNameInput = screen.getByTestId('text-input')
    fireEvent.change(clusterNameInput, { target: { value: 'test-cluster' } })

    const submitButton = screen.getByText('Proceed Next')
    fireEvent.click(submitButton)

    expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
  })

  it('handles file upload and shows success modal', async () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    // Fill cluster name and proceed
    const clusterNameInput = screen.getByTestId('text-input')
    fireEvent.change(clusterNameInput, { target: { value: 'test-cluster' } })
    fireEvent.click(screen.getByText('Proceed Next'))

    // Upload file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Complete upload
    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(mockGCPOnboard).toHaveBeenCalledWith(
        {
          cluster_name: 'test-cluster',
          credentials_file: expect.any(File),
        },
        expect.any(Object),
      )
    })

    // Check success modal
    expect(screen.getByText('Onboarding Successful')).toBeInTheDocument()
  })

  it('handles modal navigation and closing', () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    // Test back button in file upload modal
    const clusterNameInput = screen.getByTestId('text-input')
    fireEvent.change(clusterNameInput, { target: { value: 'test-cluster' } })
    fireEvent.click(screen.getByText('Proceed Next'))

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()

    // Test cancel button
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(mockClose).toHaveBeenCalled()
  })

  it('handles file removal', () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    // Navigate to file upload
    const clusterNameInput = screen.getByTestId('text-input')
    fireEvent.change(clusterNameInput, { target: { value: 'test-cluster' } })
    fireEvent.click(screen.getByText('Proceed Next'))

    // Upload file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Remove file
    const removeButton = screen.getByTestId('action-icon')
    fireEvent.click(removeButton)

    // Verify file upload component is shown again
    expect(screen.getByTestId('file-upload')).toBeInTheDocument()
  })

  it('navigates to clusters page on success', async () => {
    renderWithWrapper(<GCPModal opened={true} close={mockClose} />)

    // Complete the flow
    const clusterNameInput = screen.getByTestId('text-input')
    fireEvent.change(clusterNameInput, { target: { value: 'test-cluster' } })
    fireEvent.click(screen.getByText('Proceed Next'))

    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    // Click go to clusters
    const goToClustersButton = screen.getByText('Go to Clusters')
    fireEvent.click(goToClustersButton)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/clusters' })
    expect(mockClose).toHaveBeenCalled()
  })
})
