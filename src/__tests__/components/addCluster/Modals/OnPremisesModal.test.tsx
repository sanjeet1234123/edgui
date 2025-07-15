// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import OnPremisesModal from '@/components/addCluster/Modals/OnPremisesModal'

// Mock the router
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => jest.fn(),
}))

// Mock the mutations hook
jest.mock('@/hooks/mutations/useAddClusterMutations', () => ({
  useUploadClusterFileMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  // Singleton stack object to persist modal state and modal list
  const modalStack = {
    modalIds: ['cluster-config', 'file-upload', 'success'],
    currentModal: 'cluster-config',
    open(modalId) {
      if (this.modalIds.includes(modalId)) {
        this.currentModal = modalId
      }
    },
    close(modalId) {
      const currentIndex = this.modalIds.indexOf(this.currentModal)
      if (currentIndex > 0) {
        this.currentModal = this.modalIds[currentIndex - 1]
      }
    },
    closeAll() {
      this.currentModal = null
    },
    register(modalId) {
      return { opened: this.currentModal === modalId }
    },
    reset(modalIds) {
      this.modalIds = modalIds
      this.currentModal = modalIds[0]
    },
  }

  const ModalComponent = ({ children, opened, onClose, title }) =>
    opened ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  ModalComponent.Stack = ({ children }) => (
    <div data-testid="modal-stack">{children}</div>
  )
  ModalComponent.register = () => ({})

  function useModalsStack(modalIds) {
    if (modalIds && Array.isArray(modalIds)) {
      modalStack.modalIds = modalIds
      if (
        !modalStack.currentModal ||
        !modalIds.includes(modalStack.currentModal)
      ) {
        modalStack.currentModal = modalIds[0]
      }
    }
    return {
      open: modalStack.open.bind(modalStack),
      close: modalStack.close.bind(modalStack),
      closeAll: modalStack.closeAll.bind(modalStack),
      register: modalStack.register.bind(modalStack),
    }
  }

  return {
    ActionIcon: ({ children, onClick }) => (
      <button data-testid="action-icon" onClick={onClick}>
        {children}
      </button>
    ),
    Button: ({ children, onClick, type, disabled, loading }) => (
      <button
        data-testid="button"
        onClick={onClick}
        type={type}
        disabled={disabled}
        data-loading={loading}
      >
        {children}
      </button>
    ),
    Group: ({ children, justify }) => (
      <div data-testid="group" data-justify={justify}>
        {children}
      </div>
    ),
    Modal: ModalComponent,
    Progress: ({ value }) => <div data-testid="progress" data-value={value} />,
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, fz, fw, c }) => (
      <div data-testid="text" data-fz={fz} data-fw={fw} data-c={c}>
        {children}
      </div>
    ),
    TextInput: ({ label, placeholder, ...props }) => (
      <div data-testid="text-input">
        <label>{label}</label>
        <input placeholder={placeholder} {...props} />
      </div>
    ),
    ThemeIcon: ({ children, color }) => (
      <div data-testid="theme-icon" data-color={color}>
        {children}
      </div>
    ),
    Title: ({ children, order }) => (
      <h1 data-testid="title" data-order={order}>
        {children}
      </h1>
    ),
    useModalsStack,
    __setModalState: modalIds => {
      modalStack.reset(modalIds)
    },
    __esModule: true,
  }
})

// Mock the form hook
jest.mock('@mantine/form', () => ({
  useForm: () => ({
    values: {
      clusterName: 'test-cluster',
      ingress: 'test-ingress',
      ingressClass: 'test-ingress-class',
    },
    getInputProps: field => ({
      value:
        field === 'clusterName'
          ? 'test-cluster'
          : field === 'ingress'
            ? 'test-ingress'
            : 'test-ingress-class',
      onChange: jest.fn(),
    }),
    onSubmit: fn => e => {
      e.preventDefault()
      fn()
    },
    isValid: () => true,
    errors: {},
  }),
}))

// Mock the FileUpload component
jest.mock('@/components/fileUpload/FileUpload', () => ({
  __esModule: true,
  default: ({ fileData, setFileData, validFileTypes }) => (
    <div data-testid="file-upload">
      <div data-testid="valid-file-types">{validFileTypes.join(', ')}</div>
      <button
        data-testid="upload-button"
        onClick={() =>
          setFileData({
            files: [new File(['test'], 'test.yaml', { type: 'text/yaml' })],
            fileNames: ['test.yaml'],
          })
        }
      >
        Upload File
      </button>
      {fileData?.fileNames?.length > 0 && (
        <div data-testid="file-preview">
          <div>File Added</div>
          <div>{fileData.fileNames[0]}</div>
        </div>
      )}
    </div>
  ),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconCheck: () => <div data-testid="icon-check">Check Icon</div>,
  IconCloudCheck: () => (
    <div data-testid="icon-cloud-check">Cloud Check Icon</div>
  ),
  IconStack: () => <div data-testid="icon-stack">Stack Icon</div>,
  IconX: () => <div data-testid="icon-x">X Icon</div>,
}))

describe('OnPremisesModal', () => {
  const mockClose = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    require('@mantine/core').__setModalState([
      'cluster-config',
      'file-upload',
      'success',
    ])
    require('@tanstack/react-router').useNavigate = () => mockNavigate
  })

  it('renders the initial cluster configuration modal', () => {
    render(<OnPremisesModal opened={true} close={mockClose} />)

    expect(screen.getByText('OnPrem Cluster Onboard')).toBeInTheDocument()
    expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter cluster name'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter ingress')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter ingress class'),
    ).toBeInTheDocument()
  })

  it('validates form fields before proceeding', async () => {
    render(<OnPremisesModal opened={true} close={mockClose} />)

    const proceedButton = screen.getByText('Proceed Next')
    expect(proceedButton).not.toBeDisabled()
  })

  it('proceeds to file upload modal when form is valid', async () => {
    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    // Check if file upload modal is shown
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })
  })

  it('handles file upload and shows file preview', async () => {
    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    // Wait for file upload modal to be shown
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Upload a file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Check if file preview is shown
    await waitFor(() => {
      expect(screen.getByText('File Added')).toBeInTheDocument()
      expect(screen.getByText('test.yaml')).toBeInTheDocument()
    })
  })

  it('allows removing uploaded file', async () => {
    render(<OnPremisesModal opened={true} close={mockClose} />)

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    require('@mantine/core').__setModalState(['file-upload', 'success'])
    // Wait for file upload modal to be shown
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Upload a file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Remove the file
    const removeButton = screen.getByTestId('action-icon')
    fireEvent.click(removeButton)

    // Check if file upload component is shown again
    await waitFor(() => {
      expect(screen.getByTestId('file-upload')).toBeInTheDocument()
    })
  })

  it('closes the modal when cancel is clicked', () => {
    render(<OnPremisesModal opened={true} close={mockClose} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockClose).toHaveBeenCalled()
  })

  it('handles successful file upload and shows success modal', async () => {
    let onSuccessCallback
    const mockMutate = jest.fn((_, { onSuccess }) => {
      onSuccessCallback = onSuccess
    })
    require('@/hooks/mutations/useAddClusterMutations').useUploadClusterFileMutation =
      () => ({
        mutate: mockMutate,
        isPending: false,
      })

    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Upload a file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Trigger file upload completion
    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    // Simulate mutation success (open success modal)
    if (onSuccessCallback) onSuccessCallback()
    // Patch the stack.register mock to open the success modal
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'success' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster_name: 'test-cluster',
          cloud_type: 'on-prem',
          framework: 'terraform',
          ingress: 'test-ingress',
          ingress_class: 'test-ingress-class',
        }),
        expect.any(Object),
      )
    })

    // Check if success modal is shown
    await waitFor(() => {
      expect(screen.getByText('Onboarding Successful')).toBeInTheDocument()
    })
  })

  it('handles loading state during file upload', async () => {
    require('@/hooks/mutations/useAddClusterMutations').useUploadClusterFileMutation =
      () => ({
        mutate: jest.fn(),
        isPending: true,
      })

    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    // Wait for file upload modal to be shown
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Upload a file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Check if complete button is in loading state
    const completeButton = screen.getByText('Complete')
    expect(completeButton).toHaveAttribute('data-loading', 'true')
  })

  it('allows going back from file upload to cluster config', async () => {
    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    // Wait for file upload modal to be shown
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Click back button
    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    // Patch the stack.register mock to open the cluster-config modal
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'cluster-config' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)

    // Check if cluster config modal is shown again
    await waitFor(() => {
      expect(screen.getByText('Cluster Configuration')).toBeInTheDocument()
    })
  })

  it('handles modal close from success screen', async () => {
    let onSuccessCallback
    const mockMutate = jest.fn((_, { onSuccess }) => {
      onSuccessCallback = onSuccess
    })
    require('@/hooks/mutations/useAddClusterMutations').useUploadClusterFileMutation =
      () => ({
        mutate: mockMutate,
        isPending: false,
      })

    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Upload a file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Trigger file upload completion
    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    // Simulate mutation success (open success modal)
    if (onSuccessCallback) onSuccessCallback()
    // Patch the stack.register mock to open the success modal
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'success' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)

    // Wait for success modal
    await waitFor(() => {
      expect(screen.getByText('Onboarding Successful')).toBeInTheDocument()
    })

    // Close modal from success screen (click the last close button)
    const closeButtons = screen.getAllByTestId('modal-close')
    fireEvent.click(closeButtons[closeButtons.length - 1])

    expect(mockClose).toHaveBeenCalled()
  })

  it('navigates to clusters page after successful onboarding', async () => {
    let onSuccessCallback
    const mockMutate = jest.fn((_, { onSuccess }) => {
      onSuccessCallback = onSuccess
    })
    require('@/hooks/mutations/useAddClusterMutations').useUploadClusterFileMutation =
      () => ({
        mutate: mockMutate,
        isPending: false,
      })

    const { rerender } = render(
      <OnPremisesModal opened={true} close={mockClose} />,
    )

    // Submit the form to get to file upload
    fireEvent.click(screen.getByText('Proceed Next'))
    // Patch the stack.register mock to open the file-upload modal
    const mantineCore = require('@mantine/core')
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'file-upload' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration Files')).toBeInTheDocument()
    })

    // Upload a file
    const uploadButton = screen.getByTestId('upload-button')
    fireEvent.click(uploadButton)

    // Trigger file upload completion
    const completeButton = screen.getByText('Complete')
    fireEvent.click(completeButton)

    // Simulate mutation success (open success modal)
    if (onSuccessCallback) onSuccessCallback()
    // Patch the stack.register mock to open the success modal
    mantineCore.useModalsStack = () => ({
      open: jest.fn(),
      close: jest.fn(),
      closeAll: jest.fn(),
      register: modalId => ({ opened: modalId === 'success' }),
    })
    rerender(<OnPremisesModal opened={true} close={mockClose} />)

    // Wait for success modal
    await waitFor(() => {
      expect(screen.getByText('Onboarding Successful')).toBeInTheDocument()
    })

    // Click "Go to Clusters" button
    const goToClustersButton = screen.getByText('Go to Clusters')
    fireEvent.click(goToClustersButton)

    expect(mockNavigate).toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalled()
  })
})
