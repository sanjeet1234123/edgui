// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import InviteWorkspaceMembers from '@/components/workspace/InviteWorkspaceMembers'

// Mock the workspace module CSS
jest.mock('@/components/workspace/workspace.module.css', () => ({
  input: 'input-class',
  label: 'label-class',
  error: 'error-class',
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconAlertCircle: () => (
    <div data-testid="alert-circle-icon">Alert Circle</div>
  ),
  IconChevronDown: () => (
    <div data-testid="chevron-down-icon">Chevron Down</div>
  ),
}))

// Mock the mutations hook
jest.mock('@/hooks/mutations/useWorkspaceMutations', () => ({
  useInviteWorkspaceMembersMutation: jest.fn(),
}))

// Mock the queries hook
jest.mock('@/hooks/queries/useRolesQueries', () => ({
  useGetRolesQuery: jest.fn(),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, onClick, type, disabled, loading, variant, size }) => (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      data-loading={loading}
      data-variant={variant}
      data-size={size}
      data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  ),
  Group: ({ children, justify }) => (
    <div data-testid="group" data-justify={justify}>
      {children}
    </div>
  ),
  Alert: ({ children, icon, title, color, variant }) => (
    <div data-testid="alert" data-color={color} data-variant={variant}>
      <div data-testid="alert-icon">{icon}</div>
      <div data-testid="alert-title">{title}</div>
      <div data-testid="alert-content">{children}</div>
    </div>
  ),
  Modal: ({ children, opened, onClose, title, size }) =>
    opened ? (
      <div data-testid="modal" data-size={size}>
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null,
  Select: ({
    label,
    placeholder,
    data,
    rightSection,
    allowDeselect,
    classNames,
    styles,
    ...rest
  }) => (
    <div data-testid="select-container">
      <label>{label}</label>
      <select data-testid="select" placeholder={placeholder} {...rest}>
        <option value="">Select an option</option>
        {data?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div data-testid="select-right-section">{rightSection}</div>
    </div>
  ),
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
  TextInput: ({ label, placeholder, classNames, ...rest }) => (
    <div data-testid="textinput-container">
      <label>{label}</label>
      <input data-testid="textinput" placeholder={placeholder} {...rest} />
    </div>
  ),
}))

// Mock the form library
jest.mock('@mantine/form', () => ({
  useForm: jest.fn(() => ({
    onSubmit: cb => data => cb(data),
    getInputProps: jest.fn(field => ({
      name: field,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      value: '',
    })),
    setFieldValue: jest.fn(),
    setValues: jest.fn(),
    values: { email: '', role: '' },
    errors: {},
  })),
}))

describe('InviteWorkspaceMembers', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the modal when opened is true', () => {
    const mockClose = jest.fn()

    // Mock the roles query
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: { roles: [] },
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Invite Members',
    )
  })

  it('does not render the modal when opened is false', () => {
    const mockClose = jest.fn()

    // Mock the roles query
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: { roles: [] },
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={false} close={mockClose} />)

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('renders form elements correctly', () => {
    const mockClose = jest.fn()

    // Mock the roles query with project roles
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: {
          roles: [
            { id: 1, name: 'admin', domain: 'project' },
            { id: 2, name: 'user', domain: 'project' },
            { id: 3, name: 'owner', domain: 'workspace' }, // Should be filtered out
          ],
        },
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // Check if form elements are rendered
    expect(screen.getByTestId('textinput-container')).toBeInTheDocument()
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByTestId('select-container')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()

    // Check for buttons
    expect(screen.getByTestId('button-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('button-add-member')).toBeInTheDocument()
  })

  it('calls close function when cancel button is clicked', () => {
    const mockClose = jest.fn()

    // Mock the roles query
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: { roles: [] },
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    fireEvent.click(screen.getByTestId('button-cancel'))
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('displays loading state when submitting the form', () => {
    const mockClose = jest.fn()

    // Mock the roles query
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: { roles: [] },
        isLoading: false,
      },
    )

    // Mock the mutation with pending state
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: true,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // Check if the submit button shows loading state
    const submitButton = screen.getByTestId('button-sending...')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })

  it('shows error alert when invitation fails', () => {
    const mockClose = jest.fn()

    // Mock the roles query
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: { roles: [] },
        isLoading: false,
      },
    )

    // Mock the mutation with error state
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: true,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // Check if error alert is displayed
    expect(screen.getByTestId('alert')).toBeInTheDocument()
    expect(screen.getByTestId('alert-title')).toHaveTextContent(
      'Invitation Failed',
    )
    expect(screen.getByTestId('alert-content')).toHaveTextContent(
      'There was a problem sending the invitation',
    )
  })

  it('filters roles correctly to only show project roles', () => {
    const mockClose = jest.fn()

    // Mock the roles query with mixed roles
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: {
          roles: [
            { id: 1, name: 'admin', domain: 'project' },
            { id: 2, name: 'user', domain: 'project' },
            { id: 3, name: 'owner', domain: 'workspace' },
            { id: 4, name: 'guest', domain: 'system' },
          ],
        },
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // We should have 2 options (plus the default empty option)
    const options = screen.getByTestId('select').querySelectorAll('option')
    expect(options.length).toBe(3) // Empty option + 2 project roles
  })

  it('submits the form with correct data', async () => {
    const mockClose = jest.fn()
    const mockMutate = jest.fn()

    // Mock the roles query with real admin role
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: {
          roles: [{ id: 1, name: 'admin', domain: 'project' }],
        },
        isLoading: false,
      },
    )

    // Provide a custom implementation of useForm for this test
    require('@mantine/form').useForm.mockReturnValue({
      onSubmit: callback => data => {
        // This simulates the form submission with actual values
        callback({ email: 'test@example.com', role: '1' })
      },
      getInputProps: jest.fn(field => ({
        name: field,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: field === 'email' ? 'test@example.com' : '1',
      })),
      setFieldValue: jest.fn(),
      setValues: jest.fn(),
      values: { email: 'test@example.com', role: '1' },
      errors: {},
    })

    // Mock the mutation with our custom function
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: mockMutate,
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // Get the form element and manually submit it to trigger the onSubmit
    const form = screen.getByTestId('modal-content').querySelector('form')
    await act(async () => {
      fireEvent.submit(form)
    })

    // Verify that mutate was called with the correct data
    expect(mockMutate).toHaveBeenCalledWith([
      {
        email: 'test@example.com',
        role: 'admin',
        duplicate: false,
      },
    ])
  })

  it('shows loading state while fetching roles', () => {
    const mockClose = jest.fn()

    // Mock the roles query with loading state
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: null,
        isLoading: true,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // The select should have no role options
    const options = screen.getByTestId('select').querySelectorAll('option')
    expect(options.length).toBe(1) // Just the empty option
  })

  it('handles null roles data gracefully', () => {
    const mockClose = jest.fn()

    // Mock the roles query with null data
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: null,
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // The component should render without crashing
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('capitalizes role names in the dropdown', () => {
    const mockClose = jest.fn()

    // Mock the roles query with mixed-case role names
    require('@/hooks/queries/useRolesQueries').useGetRolesQuery.mockReturnValue(
      {
        data: {
          roles: [
            { id: 1, name: 'admin', domain: 'project' },
            { id: 2, name: 'user', domain: 'project' },
          ],
        },
        isLoading: false,
      },
    )

    // Mock the mutation
    require('@/hooks/mutations/useWorkspaceMutations').useInviteWorkspaceMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
        isPending: false,
        isError: false,
      },
    )

    render(<InviteWorkspaceMembers opened={true} close={mockClose} />)

    // Check that option labels are capitalized
    const options = Array.from(
      screen.getByTestId('select').querySelectorAll('option'),
    )

    // Skip the first option which is the placeholder
    const roleOptions = options.slice(1)
    expect(roleOptions[0].textContent).toBe('Admin')
    expect(roleOptions[1].textContent).toBe('User')
  })
})
