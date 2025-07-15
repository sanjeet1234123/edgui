// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// Mock localStorage BEFORE importing the component
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(key => {
      if (key === 'user_id') return '123'
      return null
    }),
    setItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AssignPermissions from '@/components/addCluster/Modals/AWSModal/AssignPermissions'
import {
  useAssignPermissionsMutation,
  useGetAWSInstancesMutation,
} from '@/hooks/mutations/useAddClusterMutations'
import useAddClusterStore from '@/store/addClusterStore'

// Mock the mutations
jest.mock('@/hooks/mutations/useAddClusterMutations', () => ({
  useAssignPermissionsMutation: jest.fn(),
  useGetAWSInstancesMutation: jest.fn(),
}))

// Mock the store
jest.mock('@/store/addClusterStore', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Select: ({ label, data, defaultValue, value, ...props }) => {
    const { allowDeselect, rightSection, ...rest } = props
    const selectProps = { ...rest }
    if (typeof value !== 'undefined') {
      selectProps.value = value
    } else if (typeof defaultValue !== 'undefined') {
      selectProps.defaultValue = defaultValue
    }
    return (
      <select data-testid="region-select" {...selectProps}>
        {data.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    )
  },
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Text: ({ children }) => <div data-testid="text">{children}</div>,
  TextInput: props => (
    <input
      data-testid="aws-arn-input"
      type="text"
      {...props}
      aria-invalid={props.error ? 'true' : 'false'}
    />
  ),
  Form: ({ children, ...props }) => <form {...props}>{children}</form>,
}))

describe('AssignPermissions', () => {
  let mockRef
  const mockAssignPermissions = jest.fn()
  const mockGetAWSInstances = jest.fn()
  const mockSetVMS = jest.fn()
  const mockSetAccountId = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockRef = React.createRef()
    // Setup mutation mocks
    useAssignPermissionsMutation.mockReturnValue({
      mutate: mockAssignPermissions,
    })
    useGetAWSInstancesMutation.mockReturnValue({
      mutate: mockGetAWSInstances,
    })
    // Setup store mock
    useAddClusterStore.mockReturnValue({
      setVMS: mockSetVMS,
      setAccountId: mockSetAccountId,
    })
  })

  it('renders the form with initial values', () => {
    render(<AssignPermissions ref={mockRef} />)

    expect(screen.getByTestId('text')).toHaveTextContent(
      'Please enter the IAM Role arn you have created',
    )
    expect(screen.getByTestId('aws-arn-input')).toBeInTheDocument()
    expect(screen.getByTestId('region-select')).toBeInTheDocument()
  })

  it('validates form fields correctly', async () => {
    render(<AssignPermissions ref={mockRef} />)
    const form = document.querySelector('form')
    await act(async () => {
      fireEvent.submit(form)
    })
    expect(screen.getByTestId('aws-arn-input')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('submits form with valid data', async () => {
    mockAssignPermissions.mockImplementation((data, options) => {
      options.onSuccess()
    })

    render(<AssignPermissions ref={mockRef} />)
    const arnInput = screen.getByTestId('aws-arn-input')
    const regionSelect = screen.getByTestId('region-select')
    await act(async () => {
      fireEvent.change(arnInput, {
        target: { value: 'arn:aws:iam::123456789012:role/MyRole' },
      })
      fireEvent.change(regionSelect, { target: { value: 'us-east-1' } })
    })
    const form = document.querySelector('form')
    await act(async () => {
      fireEvent.submit(form)
    })
    expect(mockAssignPermissions).toHaveBeenCalledWith(
      {
        user_id: 123,
        user_resource_arn: 'arn:aws:iam::123456789012:role/MyRole',
        region: 'us-east-1',
      },
      expect.any(Object),
    )
  })

  it('handles successful permission assignment', async () => {
    const mockClusters = ['cluster1', 'cluster2']
    const mockAccountId = '123456789012'

    mockAssignPermissions.mockImplementation((data, options) => {
      options.onSuccess()
    })

    mockGetAWSInstances.mockImplementation((userId, options) => {
      if (options && options.onSuccess) {
        options.onSuccess({
          clusters: mockClusters,
          account_id: mockAccountId,
        })
      }
    })

    render(<AssignPermissions ref={mockRef} />)
    const arnInput = screen.getByTestId('aws-arn-input')
    await act(async () => {
      fireEvent.change(arnInput, {
        target: { value: 'arn:aws:iam::123456789012:role/MyRole' },
      })
    })
    const form = document.querySelector('form')
    await act(async () => {
      fireEvent.submit(form)
    })

    expect(mockSetVMS).toHaveBeenCalledWith([
      { id: 1, vm: 'cluster1' },
      { id: 2, vm: 'cluster2' },
    ])
    expect(mockSetAccountId).toHaveBeenCalledWith(mockAccountId)
  })

  it('validates form through ref method', async () => {
    render(<AssignPermissions ref={mockRef} />)
    let isValid
    await act(async () => {
      isValid = await mockRef.current.validateForm()
    })
    expect(isValid).toBe(false)
    const arnInput = screen.getByTestId('aws-arn-input')
    await act(async () => {
      fireEvent.change(arnInput, {
        target: { value: 'arn:aws:iam::123456789012:role/MyRole' },
      })
    })
    let isValidAfterInput
    await act(async () => {
      isValidAfterInput = await mockRef.current.validateForm()
    })
    expect(isValidAfterInput).toBe(true)
  })

  it('submits form through ref method', async () => {
    mockAssignPermissions.mockImplementation((data, options) => {
      options.onSuccess()
    })

    mockGetAWSInstances.mockImplementation((userId, options) => {
      if (options && options.onSuccess) {
        options.onSuccess({
          clusters: ['cluster1', 'cluster2'],
          account_id: '123456789012',
        })
      }
    })

    render(<AssignPermissions ref={mockRef} />)
    const arnInput = screen.getByTestId('aws-arn-input')
    await act(async () => {
      fireEvent.change(arnInput, {
        target: { value: 'arn:aws:iam::123456789012:role/MyRole' },
      })
    })
    let result
    await act(async () => {
      result = await mockRef.current.submitForm()
    })
    expect(result).toBe(true)
    expect(mockAssignPermissions).toHaveBeenCalled()
  }, 10000) // Increased timeout

  it('handles submission failure through ref method', async () => {
    mockAssignPermissions.mockImplementation((data, options) => {
      options.onError()
    })

    render(<AssignPermissions ref={mockRef} />)
    const arnInput = screen.getByTestId('aws-arn-input')
    await act(async () => {
      fireEvent.change(arnInput, {
        target: { value: 'arn:aws:iam::123456789012:role/MyRole' },
      })
    })
    const result = await mockRef.current.submitForm()
    expect(result).toBe(false)
  }, 10000) // Increased timeout
})
