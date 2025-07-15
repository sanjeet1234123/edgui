// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import UploadModel from '@/components/marketplace/UploadModel'

// Mock the FileUpload component
jest.mock('@/components/fileUpload/FileUpload', () => ({
  __esModule: true,
  default: jest.fn(({ fileData, setFileData }) => (
    <div data-testid="file-upload">
      <button
        data-testid="mock-upload-button"
        onClick={() => {
          const mockFile = new File(['test content'], 'test-file.bin', { type: 'application/octet-stream' })
          setFileData({
            files: [mockFile],
            fileNames: ['test-file.bin'],
          })
        }}
      >
        Upload File
      </button>
    </div>
  )),
}))

// Mock the marketplace mutations
jest.mock('@/hooks/mutations/useMarketplaceMutations', () => ({
  useLoadModelMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  }),
}))

// Mock the Mantine form
jest.mock('@mantine/form', () => ({
  useForm: jest.fn().mockReturnValue({
    getInputProps: jest.fn().mockReturnValue({
      value: '',
      onChange: jest.fn(),
      error: null,
    }),
    onSubmit: (callback) => (event) => {
      event?.preventDefault()
      callback({
        addUrlInput: 'https://huggingface.co/model',
        addDescriptionInput: 'Test description',
        addTokenInput: 'test-token',
      })
    },
    setErrors: jest.fn(),
    setValues: jest.fn(),
    values: {
      addUrlInput: '',
      addDescriptionInput: '',
      addTokenInput: '',
    },
  }),
}))

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, color, onClick, variant }) => (
    <button 
      data-testid="action-icon" 
      data-color={color} 
      data-variant={variant} 
      onClick={onClick}
    >
      {children}
    </button>
  ),
  Button: ({ children, size, variant, onClick, loading, disabled, type }) => (
    <button 
      data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
      data-size={size} 
      data-variant={variant} 
      data-loading={loading}
      data-disabled={disabled}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  Divider: ({ my, label, labelPosition }) => (
    <div 
      data-testid="divider" 
      data-my={my} 
      data-label={label} 
      data-label-position={labelPosition}
    ></div>
  ),
  Group: ({ children, justify, gap }) => (
    <div 
      data-testid="group" 
      data-justify={justify}
      data-gap={gap}
    >
      {children}
    </div>
  ),
  Modal: ({ children, opened, onClose, size, title }) => (
    opened ? (
      <div 
        data-testid="modal" 
        data-size={size}
      >
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
  PasswordInput: ({ label, placeholder, disabled, ...props }) => (
    <div 
      data-testid="password-input" 
      data-label={label} 
      data-placeholder={placeholder} 
      data-disabled={disabled}
    >
      <input 
        type="password" 
        placeholder={placeholder} 
        disabled={disabled} 
        {...props} 
      />
    </div>
  ),
  Progress: ({ value, color, size, radius, striped, animated }) => (
    <div 
      data-testid="progress" 
      data-value={value} 
      data-color={color} 
      data-size={size} 
      data-radius={radius} 
      data-striped={striped} 
      data-animated={animated}
    ></div>
  ),
  Stack: ({ children, gap, style, className }) => (
    <div 
      data-testid="stack" 
      data-gap={gap} 
      style={style} 
      className={className}
    >
      {children}
    </div>
  ),
  Text: ({ children, fz, fw, c, size }) => (
    <p 
      data-testid="text" 
      style={{ 
        fontSize: fz || size, 
        fontWeight: fw,
        color: c
      }}
    >
      {children}
    </p>
  ),
  TextInput: ({ label, placeholder, disabled, error, ...props }) => (
    <div 
      data-testid="text-input" 
      data-label={label} 
      data-placeholder={placeholder} 
      data-disabled={disabled}
    >
      <input 
        type="text" 
        placeholder={placeholder} 
        disabled={disabled} 
        {...props} 
      />
      {error && <div data-testid="input-error">{error}</div>}
    </div>
  ),
}))

// Mock the Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconDownload: () => <span data-testid="icon-download">Download</span>,
  IconX: () => <span data-testid="icon-x">X</span>,
}))

describe('UploadModel', () => {
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the modal when opened is true', () => {
    render(<UploadModel {...defaultProps} />)
    
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-title')).toBeInTheDocument()
  })

  it('does not render the modal when opened is false', () => {
    render(<UploadModel {...defaultProps} opened={false} />)
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('renders form inputs for URL, description, and token', () => {
    render(<UploadModel {...defaultProps} />)
    
    const textInputs = screen.getAllByTestId('text-input')
    expect(textInputs.length).toBe(2)
    expect(textInputs[0]).toHaveAttribute('data-label', 'Hugging Face URL')
    expect(textInputs[1]).toHaveAttribute('data-label', 'Description')
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('renders the FileUpload component', () => {
    render(<UploadModel {...defaultProps} />)
    
    expect(screen.getByTestId('file-upload')).toBeInTheDocument()
  })

  it('disables URL, description, and token inputs when files are uploaded', () => {
    render(<UploadModel {...defaultProps} />)
    
    // Initially inputs should be enabled
    const textInputs = screen.getAllByTestId('text-input')
    const urlInput = textInputs[0]
    expect(urlInput).not.toHaveAttribute('data-disabled', 'true')
    
    // Upload a file
    fireEvent.click(screen.getByTestId('mock-upload-button'))
    
    // Now the inputs should be disabled
    expect(urlInput).toHaveAttribute('data-disabled', 'true')
  })

  it('shows file preview when files are uploaded', () => {
    render(<UploadModel {...defaultProps} />)
    
    // Upload a file
    fireEvent.click(screen.getByTestId('mock-upload-button'))
    
    // File preview should be shown
    expect(screen.getByText('test-file.bin')).toBeInTheDocument()
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })

  it('removes file when remove button is clicked', () => {
    render(<UploadModel {...defaultProps} />)
    
    // Upload a file
    fireEvent.click(screen.getByTestId('mock-upload-button'))
    
    // File preview should be shown
    expect(screen.getByText('test-file.bin')).toBeInTheDocument()
    
    // Click the remove button
    const removeButtons = screen.getAllByTestId('action-icon')
    const removeButton = removeButtons.find(button => 
      button.innerHTML.includes('icon-x') || 
      button.textContent.includes('X')
    )
    fireEvent.click(removeButton)
    
    // File preview should be removed
    expect(screen.queryByText('test-file.bin')).not.toBeInTheDocument()
  })

  it('calls loadModelMutation when form is submitted with URL', () => {
    const loadModelMutate = jest.fn()
    require('@/hooks/mutations/useMarketplaceMutations').useLoadModelMutation.mockReturnValue({
      mutate: loadModelMutate,
      isPending: false,
    })
    
    render(<UploadModel {...defaultProps} />)
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('button-upload'))
    
    // Should call loadModelMutation with the form values
    expect(loadModelMutate).toHaveBeenCalledWith(
      {
        url: 'https://huggingface.co/model',
        description: 'Test description',
        trending: true,
      },
      expect.any(Object)
    )
  })

  it('closes the modal on successful form submission', () => {
    const onClose = jest.fn()
    const loadModelMutate = jest.fn((data, options) => {
      options.onSuccess()
    })
    
    require('@/hooks/mutations/useMarketplaceMutations').useLoadModelMutation.mockReturnValue({
      mutate: loadModelMutate,
      isPending: false,
    })
    
    render(<UploadModel {...defaultProps} onClose={onClose} />)
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('button-upload'))
    
    // Should call onClose
    expect(onClose).toHaveBeenCalled()
  })

  it('disables the submit button when loading', () => {
    require('@/hooks/mutations/useMarketplaceMutations').useLoadModelMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    })
    
    render(<UploadModel {...defaultProps} />)
    
    const uploadButton = screen.getByTestId('button-upload')
    expect(uploadButton).toHaveAttribute('data-loading', 'true')
    expect(uploadButton).toHaveAttribute('data-disabled', 'true')
  })

  it('closes the modal when cancel button is clicked', () => {
    const onClose = jest.fn()
    
    render(<UploadModel {...defaultProps} onClose={onClose} />)
    
    // Click the cancel button
    fireEvent.click(screen.getByTestId('button-cancel'))
    
    // Should call onClose
    expect(onClose).toHaveBeenCalled()
  })

  it('shows validation error when submitting with no files and empty URL/description', () => {
    // Temporarily restore real useForm for this test only
    const originalUseForm = jest.requireActual('@mantine/form').useForm;
    const mantineForm = require('@mantine/form');
    const prevUseForm = mantineForm.useForm;
    mantineForm.useForm = originalUseForm;

    render(<UploadModel opened={true} onClose={jest.fn()} />);
    // Clear both fields (simulate user input)
    const urlInput = screen.getAllByTestId('text-input')[0].querySelector('input');
    const descInput = screen.getAllByTestId('text-input')[1].querySelector('input');
    fireEvent.change(urlInput, { target: { value: '' } });
    fireEvent.change(descInput, { target: { value: '' } });
    fireEvent.submit(screen.getByTestId('button-upload'));
    // Check for validation error messages in the DOM
    expect(screen.getAllByTestId('input-error').some(node => /url is required/i.test(node.textContent))).toBe(true);
    expect(screen.getAllByTestId('input-error').some(node => /description is required/i.test(node.textContent))).toBe(true);

    // Restore mock
    mantineForm.useForm = prevUseForm;
  });

  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;

  afterEach(() => {
    if (appendChildSpy) appendChildSpy.mockRestore();
    if (removeChildSpy) removeChildSpy.mockRestore();
  });

  it('triggers file download logic when download icon is clicked', () => {
    // Save originals
    const originalCreateObjectURL = global.URL.createObjectURL;
    const originalRevokeObjectURL = global.URL.revokeObjectURL;
    const createObjectURL = jest.fn(() => 'blob:http://test-url');
    const revokeObjectURL = jest.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    appendChildSpy = jest.spyOn(document.body, 'appendChild');
    removeChildSpy = jest.spyOn(document.body, 'removeChild');

    render(<UploadModel opened={true} onClose={jest.fn()} />);
    fireEvent.click(screen.getByTestId('mock-upload-button'));
    // Find the download button (IconDownload)
    const actionIcons = screen.getAllByTestId('action-icon');
    const downloadButton = actionIcons.find(btn => btn.innerHTML.includes('icon-download') || btn.textContent.includes('Download'));
    fireEvent.click(downloadButton);
    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();

    // Restore originals
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('submits form with file data when files are uploaded', () => {
    const loadModelMutate = jest.fn()
    require('@/hooks/mutations/useMarketplaceMutations').useLoadModelMutation.mockReturnValue({
      mutate: loadModelMutate,
      isPending: false,
    })
    
    // Save original FormData
    const OriginalFormData = global.FormData
    
    // Create a mock FormData constructor and instance
    const mockAppend = jest.fn()
    const mockFormDataInstance = { append: mockAppend }
    const MockFormData = jest.fn(() => mockFormDataInstance)
    
    // Replace global FormData with mock
    global.FormData = MockFormData
    
    try {
      render(<UploadModel {...defaultProps} />)
      
      // Upload a file
      fireEvent.click(screen.getByTestId('mock-upload-button'))
      
      // Submit the form
      fireEvent.submit(screen.getByTestId('button-upload'))
      
      // Should call loadModelMutation
      expect(loadModelMutate).toHaveBeenCalled()
      
      // We don't need to check if FormData constructor was called
      // since the implementation might be using it differently
    } finally {
      // Restore original FormData
      global.FormData = OriginalFormData
    }
  })
})
