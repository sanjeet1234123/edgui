// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MantineProvider } from '@mantine/core'
import AzureModal from '@/components/addCluster/Modals/AzureModal'
import { useNavigate } from '@tanstack/react-router'
import { useUploadClusterFileMutation } from '@/hooks/mutations/useAddClusterMutations'
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

// Mock the hooks and modules
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
}))

jest.mock('@/hooks/mutations/useAddClusterMutations', () => ({
  useUploadClusterFileMutation: jest.fn(),
}))

// Mock Mantine components
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
        <label htmlFor={`input-${label}`}>{label}</label>
        <input
          id={`input-${label}`}
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

describe('AzureModal', () => {
  const mockClose = jest.fn()
  const mockNavigate = jest.fn()
  const mockUploadClusterFile = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    useUploadClusterFileMutation.mockReturnValue({
      mutate: (...args) => mockUploadClusterFile(...args),
      isPending: false,
    })
    mockUploadClusterFile.mockImplementation((_, { onSuccess }) => {
      if (onSuccess) onSuccess()
    })
  })

  function renderWithWrapper(ui) {
    return render(<TestWrapper>{ui}</TestWrapper>)
  }

  it('renders the initial cluster configuration modal', () => {
    renderWithWrapper(<AzureModal opened={true} close={mockClose} />)

    expect(screen.getByText('Azure Account Onboarding')).toBeInTheDocument()
    expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText('Cluster Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Ingress')).toBeInTheDocument()
    expect(screen.getByLabelText('Ingress Class')).toBeInTheDocument()
  })

  it('proceeds to file upload modal when form is valid', async () => {
    renderWithWrapper(<AzureModal opened={true} close={mockClose} />)

    fireEvent.change(screen.getByLabelText('Cluster Name'), {
      target: { value: 'test-cluster' },
    })
    fireEvent.change(screen.getByLabelText('Ingress'), {
      target: { value: 'test-ingress' },
    })
    fireEvent.change(screen.getByLabelText('Ingress Class'), {
      target: { value: 'test-ingress-class' },
    })

    const proceedButton = screen.getByText('Proceed Next')
    fireEvent.click(proceedButton)

    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })
  })

  it('handles file upload and shows success modal', async () => {
    renderWithWrapper(<AzureModal opened={true} close={mockClose} />)

    // Fill form and proceed
    fireEvent.change(screen.getByLabelText('Cluster Name'), {
      target: { value: 'test-cluster' },
    })
    fireEvent.change(screen.getByLabelText('Ingress'), {
      target: { value: 'test-ingress' },
    })
    fireEvent.change(screen.getByLabelText('Ingress Class'), {
      target: { value: 'test-ingress-class' },
    })

    fireEvent.click(screen.getByText('Proceed Next'))

    // Wait for file upload modal
    await screen.findByText('Upload Configuration Files')

    // Upload file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Complete upload
    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(mockUploadClusterFile).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster_name: 'test-cluster',
          cloud_type: 'azure',
          framework: 'terraform',
          ingress: 'test-ingress',
          ingress_class: 'test-ingress-class',
        }),
        expect.any(Object),
      )
    })

    // Check success modal
    expect(screen.getByText('Onboarding Successful')).toBeInTheDocument()
  })

  it('handles navigation after successful upload', async () => {
    renderWithWrapper(<AzureModal opened={true} close={mockClose} />)

    // Fill form and proceed
    fireEvent.change(screen.getByLabelText('Cluster Name'), {
      target: { value: 'test-cluster' },
    })
    fireEvent.change(screen.getByLabelText('Ingress'), {
      target: { value: 'test-ingress' },
    })
    fireEvent.change(screen.getByLabelText('Ingress Class'), {
      target: { value: 'test-ingress-class' },
    })

    fireEvent.click(screen.getByText('Proceed Next'))

    // Wait for file upload modal
    await screen.findByText('Upload Configuration Files')

    // Upload file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Complete upload
    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    // Wait for success modal
    await waitFor(() => {
      expect(screen.getByText('Onboarding Successful')).toBeInTheDocument()
    })

    // Click Go to Clusters
    const goToClustersButton = screen.getByText('Go to Clusters')
    fireEvent.click(goToClustersButton)

    expect(mockClose).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('handles cancel button click', () => {
    renderWithWrapper(<AzureModal opened={true} close={mockClose} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockClose).toHaveBeenCalled()
  })

  it('handles back button in file upload modal', async () => {
    renderWithWrapper(<AzureModal opened={true} close={mockClose} />)

    // Fill form and proceed
    fireEvent.change(screen.getByLabelText('Cluster Name'), {
      target: { value: 'test-cluster' },
    })
    fireEvent.change(screen.getByLabelText('Ingress'), {
      target: { value: 'test-ingress' },
    })
    fireEvent.change(screen.getByLabelText('Ingress Class'), {
      target: { value: 'test-ingress-class' },
    })

    fireEvent.click(screen.getByText('Proceed Next'))

    // Wait for file upload modal
    await screen.findByText('Upload Configuration Files')

    // Click back button
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()
    })
  })
})
