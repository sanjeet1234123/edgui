// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import WorkspaceCreation from '@/components/platformSetup/WorkspaceCreation'

// Mock the mutation hooks
const mockCheckAvailabilityMutate = jest.fn()
const mockCheckAvailabilityReset = jest.fn()
const mockCreateWorkspaceMutate = jest.fn()

jest.mock('@/hooks/mutations/usePlatformSetupMutations', () => ({
  useCheckWorkspaceAvailabilityMutation: () => ({
    mutate: mockCheckAvailabilityMutate,
    isPending: false,
    isError: false,
    isSuccess: false,
    reset: mockCheckAvailabilityReset,
  }),
  useCreateWorkspaceMutation: () => ({
    mutate: mockCreateWorkspaceMutate,
    isPending: false,
  }),
}))

// Mock setTimeout and clearTimeout
jest.useFakeTimers()

// Mock the useMediaQuery hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: () => false, // Default to desktop view
}))

// Mock Mantine components with string components instead of function components
jest.mock('@mantine/core', () => ({
  Box: 'div',
  Button: 'button',
  Flex: 'div',
  Group: 'div',
  Loader: 'div',
  Stack: 'div',
  Text: 'span',
  TextInput: ({ value, onChange, placeholder, disabled }) => (
    <input
      data-testid="text-input"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  ),
}))

describe('WorkspaceCreation', () => {
  let mockForm
  let mockOnWorkspaceCreated

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock form
    mockForm = {
      values: {
        team_name: 'Test Team',
        team_type: 'agency',
        team_size: '10-50',
        workspace_url: '',
      },
      setFieldValue: jest.fn(),
    }

    mockOnWorkspaceCreated = jest.fn()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('updates workspace URL based on team name', () => {
    render(
      <WorkspaceCreation
        form={mockForm}
        onWorkspaceCreated={mockOnWorkspaceCreated}
      />,
    )

    // Check that the form field was updated
    expect(mockForm.setFieldValue).toHaveBeenCalledWith(
      'workspace_url',
      'test-team',
    )
  })

  it('handles workspace URL input changes', () => {
    render(
      <WorkspaceCreation
        form={mockForm}
        onWorkspaceCreated={mockOnWorkspaceCreated}
      />,
    )

    // Get the input field and change its value
    const input = screen.getByTestId('text-input')
    fireEvent.change(input, { target: { value: 'new-workspace' } })

    // Fast-forward timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Check that availability check was called
    expect(mockCheckAvailabilityMutate).toHaveBeenCalledWith({
      workspace_url: 'new-workspace',
    })
  })

  it('creates workspace when button is clicked', () => {
    render(
      <WorkspaceCreation
        form={mockForm}
        onWorkspaceCreated={mockOnWorkspaceCreated}
      />,
    )

    // Find and click the create button
    const createButton = screen.getByRole('button')
    fireEvent.click(createButton)

    // Check that createWorkspace was called with the correct data
    expect(mockCreateWorkspaceMutate).toHaveBeenCalledWith(
      {
        workspace_url: 'test-team.nexastack.neuralcompany.work',
        team_name: 'Test Team',
        team_type: 'agency',
        team_size: '10-50',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    )
  })
})
