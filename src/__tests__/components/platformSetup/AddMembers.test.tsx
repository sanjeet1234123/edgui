// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react'
import AddMembers from '@/components/platformSetup/AddMembers'

// Mock the platformSetup module CSS
jest.mock('@/components/platformSetup/platformSetup.module.css', () => ({
  addMembersButton: 'addMembersButton-class',
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconCirclePlusFilled: () => (
    <div data-testid="circle-plus-icon">Circle Plus</div>
  ),
  IconTrash: () => <div data-testid="trash-icon">Trash Icon</div>,
  IconChevronDown: () => (
    <div data-testid="chevron-down-icon">Chevron Down</div>
  ),
}))

// Mock the notification utility
jest.mock('@/utils/notification', () => ({
  showNotification: jest.fn(),
}))

// Mock the mutations hook
jest.mock('@/hooks/mutations/usePlatformSetupMutations', () => ({
  useInviteMembersMutation: jest.fn(),
}))

// Mock the TeamMember component
jest.mock('@/components/platformSetup/teamMember', () => ({
  __esModule: true,
  default: ({
    id,
    name,
    role,
    emailError,
    roleError,
    onDelete,
    onChange,
    canDelete,
  }) => (
    <div data-testid={`team-member-${id}`} className="team-member">
      <input
        data-testid={`email-input-${id}`}
        type="email"
        value={name}
        onChange={e => onChange(id, 'name', e.target.value)}
      />
      <select
        data-testid={`role-select-${id}`}
        value={role}
        onChange={e => onChange(id, 'role', e.target.value)}
      >
        <option value="Admin">Admin</option>
        <option value="Member">Member</option>
      </select>
      {emailError && <div data-testid={`email-error-${id}`}>{emailError}</div>}
      {roleError && <div data-testid={`role-error-${id}`}>{roleError}</div>}
      {canDelete && (
        <button
          data-testid={`delete-button-${id}`}
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      )}
    </div>
  ),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
  Title: ({ children, c, fz, fw }) => (
    <h1
      data-testid="title"
      data-color={c}
      data-fontsize={fz}
      data-fontweight={fw}
    >
      {children}
    </h1>
  ),
  Button: ({
    children,
    leftSection,
    onClick,
    classNames,
    p,
    size,
    variant,
  }) => (
    <button
      data-testid="add-members-button"
      onClick={onClick}
      data-size={size}
      data-variant={variant}
      data-padding={p}
    >
      {leftSection}
      {children}
    </button>
  ),
  Group: ({ children, w, justify }) => (
    <div data-testid="group" data-width={w} data-justify={justify}>
      {children}
    </div>
  ),
  Text: ({ children, fw, size, c }) => (
    <span
      data-testid="text"
      data-fontweight={fw}
      data-size={size}
      data-color={c}
    >
      {children}
    </span>
  ),
}))

describe('AddMembers', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with initial team member', () => {
    // Mock the invite mutation
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
      },
    )

    const mockOnMembersInvited = jest.fn()
    render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Check the title is rendered
    expect(screen.getByTestId('title')).toHaveTextContent(
      'Invite People to workspace',
    )

    // Check there is one initial team member
    expect(screen.getByTestId('team-member-1')).toBeInTheDocument()

    // Check add more button is present
    expect(screen.getByTestId('add-members-button')).toHaveTextContent(
      'Add More Members',
    )
  })

  it('adds a new team member when the add button is clicked', () => {
    // Mock the invite mutation
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
      },
    )

    const mockOnMembersInvited = jest.fn()
    render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Check there is one initial team member
    expect(screen.getByTestId('team-member-1')).toBeInTheDocument()

    // Click add button
    fireEvent.click(screen.getByTestId('add-members-button'))

    // Now there should be two team members
    expect(screen.getAllByTestId(/^team-member-/)).toHaveLength(2)
  })

  it('removes a team member when delete button is clicked', () => {
    // Mock the invite mutation
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
      },
    )

    const mockOnMembersInvited = jest.fn()
    render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Add a second team member so we can delete one
    fireEvent.click(screen.getByTestId('add-members-button'))

    // Now there should be two team members
    expect(screen.getAllByTestId(/^team-member-/)).toHaveLength(2)

    // Delete the second team member
    const deleteButtons = screen.getAllByTestId(/^delete-button-/)
    fireEvent.click(deleteButtons[1]) // Click the second delete button

    // Now there should be one team member
    expect(screen.getAllByTestId(/^team-member-/)).toHaveLength(1)
  })

  it('updates team member data when input values change', () => {
    // Set up the mock inviteMembersMock function first
    const inviteMembersMock = jest.fn()
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: inviteMembersMock,
      },
    )

    const mockOnMembersInvited = jest.fn()
    const { rerender } = render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Find email input and change value
    const emailInput = screen.getByTestId('email-input-1')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Find role select and change value
    const roleSelect = screen.getByTestId('role-select-1')
    fireEvent.change(roleSelect, { target: { value: 'Admin' } })

    // Now trigger parentIsInviting to call handleInviteMembers
    rerender(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={true} // This will trigger handleInviteMembers
        membersInvited={false}
      />,
    )

    // Check that inviteMembersMock was called with the updated data
    expect(inviteMembersMock).toHaveBeenCalled()

    // Get the first argument passed to mutate
    const mutateArgs = inviteMembersMock.mock.calls[0][0]

    // Verify the email and role were updated correctly
    expect(mutateArgs).toContainEqual(
      expect.objectContaining({
        email: 'test@example.com',
        role: 'Admin',
      }),
    )
  })

  it('validates email format before submitting', () => {
    // Mock the notification utility
    const showNotificationMock = jest.fn()
    require('@/utils/notification').showNotification = showNotificationMock

    // Mock the invite mutation
    const inviteMembersMock = jest.fn()
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: inviteMembersMock,
      },
    )

    const mockOnMembersInvited = jest.fn()
    render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Find email input and set invalid email
    const emailInput = screen.getByTestId('email-input-1')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    // Trigger validation
    act(() => {
      render(
        <AddMembers
          onMembersInvited={mockOnMembersInvited}
          parentIsInviting={true}
          membersInvited={false}
        />,
      )
    })

    // Should show error notification
    expect(showNotificationMock).toHaveBeenCalledWith(
      'error',
      'Please enter a valid email and select a role before inviting members.',
    )

    // Should call onMembersInvited with false
    expect(mockOnMembersInvited).toHaveBeenCalledWith(false)
  })

  it('handles duplicate emails correctly', () => {
    // Mock the notification utility
    const showNotificationMock = jest.fn()
    require('@/utils/notification').showNotification = showNotificationMock

    // Mock the invite mutation
    const inviteMembersMock = jest.fn()
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: inviteMembersMock,
      },
    )

    const mockOnMembersInvited = jest.fn()
    const { rerender } = render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Add a second team member
    fireEvent.click(screen.getByTestId('add-members-button'))

    // Set the same email for both members
    const emailInputs = screen.getAllByTestId(/^email-input-/)
    fireEvent.change(emailInputs[0], {
      target: { value: 'duplicate@example.com' },
    })
    fireEvent.change(emailInputs[1], {
      target: { value: 'duplicate@example.com' },
    })

    // Make roles different to trigger the duplicate email with different roles error
    const roleSelects = screen.getAllByTestId(/^role-select-/)
    fireEvent.change(roleSelects[0], { target: { value: 'Admin' } })
    fireEvent.change(roleSelects[1], { target: { value: 'Member' } })

    // Trigger validation
    rerender(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={true}
        membersInvited={false}
      />,
    )

    // Should show error notification
    expect(showNotificationMock).toHaveBeenCalledWith(
      'error',
      'Please remove duplicate email addresses before inviting members.',
    )

    // Should call onMembersInvited with false
    expect(mockOnMembersInvited).toHaveBeenCalledWith(false)
  })

  it('successfully invites members when validation passes', async () => {
    // Mock the notification utility
    const showNotificationMock = jest.fn()
    require('@/utils/notification').showNotification = showNotificationMock

    // Mock the invite mutation with success
    const inviteMembersMock = jest
      .fn()
      .mockImplementation((data, { onSuccess }) => {
        onSuccess({
          error: false,
          status: {
            add: [{ email: 'test@example.com', role: 'Member' }],
            not_add: [],
          },
        })
      })

    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: inviteMembersMock,
      },
    )

    const mockOnMembersInvited = jest.fn()
    const { rerender } = render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Update email to valid
    const emailInput = screen.getByTestId('email-input-1')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Trigger invite
    rerender(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={true}
        membersInvited={false}
      />,
    )

    // Should call inviteMembersMock with correct data
    expect(inviteMembersMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'test@example.com',
          role: 'Member',
          duplicate: false,
        }),
      ]),
      expect.any(Object),
    )

    // Should show success notification
    expect(showNotificationMock).toHaveBeenCalledWith(
      'success',
      'Successfully invited 1 member(s)',
    )

    // Should call onMembersInvited with true
    expect(mockOnMembersInvited).toHaveBeenCalledWith(true)
  })

  it('handles API errors when inviting members', async () => {
    // Mock the notification utility
    const showNotificationMock = jest.fn()
    require('@/utils/notification').showNotification = showNotificationMock

    // Mock the invite mutation with error
    const inviteMembersMock = jest
      .fn()
      .mockImplementation((data, { onError }) => {
        onError(new Error('API error'))
      })

    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: inviteMembersMock,
      },
    )

    const mockOnMembersInvited = jest.fn()
    const { rerender } = render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    // Update email to valid
    const emailInput = screen.getByTestId('email-input-1')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Trigger invite
    rerender(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={true}
        membersInvited={false}
      />,
    )

    // Should call onMembersInvited with false
    expect(mockOnMembersInvited).toHaveBeenCalledWith(false)
  })

  it('hides the "Add More Members" button when members have been invited', () => {
    // Mock the invite mutation
    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: jest.fn(),
      },
    )

    render(
      <AddMembers
        onMembersInvited={jest.fn()}
        parentIsInviting={false}
        membersInvited={true}
      />,
    )

    // Add more button should not be present
    expect(screen.queryByTestId('add-members-button')).not.toBeInTheDocument()
  })

  it('displays invitation results correctly', async () => {
    // Mock the notification utility
    const showNotificationMock = jest.fn()
    require('@/utils/notification').showNotification = showNotificationMock

    // Mock the invite mutation with mixed results
    const inviteMembersMock = jest
      .fn()
      .mockImplementation((data, { onSuccess }) => {
        onSuccess({
          error: false,
          status: {
            add: [{ email: 'success@example.com', role: 'Member' }],
            not_add: [
              {
                email: 'failed@example.com',
                role: 'Admin',
                message: 'User already exists',
              },
            ],
          },
        })
      })

    require('@/hooks/mutations/usePlatformSetupMutations').useInviteMembersMutation.mockReturnValue(
      {
        mutate: inviteMembersMock,
      },
    )

    const mockOnMembersInvited = jest.fn()

    // Add two members
    const { rerender } = render(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={false}
        membersInvited={false}
      />,
    )

    fireEvent.click(screen.getByTestId('add-members-button'))

    // Set emails
    const emailInputs = screen.getAllByTestId(/^email-input-/)
    fireEvent.change(emailInputs[0], {
      target: { value: 'success@example.com' },
    })
    fireEvent.change(emailInputs[1], {
      target: { value: 'failed@example.com' },
    })

    // Set roles
    const roleSelects = screen.getAllByTestId(/^role-select-/)
    fireEvent.change(roleSelects[0], { target: { value: 'Member' } })
    fireEvent.change(roleSelects[1], { target: { value: 'Admin' } })

    // Trigger invite
    rerender(
      <AddMembers
        onMembersInvited={mockOnMembersInvited}
        parentIsInviting={true}
        membersInvited={false}
      />,
    )

    // Should display success results
    expect(screen.getByText('Successfully invited:')).toBeInTheDocument()
    expect(screen.getByText('success@example.com (Member)')).toBeInTheDocument()

    // Should display failed results
    expect(screen.getByText('Could not invite:')).toBeInTheDocument()
    expect(
      screen.getByText('failed@example.com - User already exists'),
    ).toBeInTheDocument()
  })
})
