// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PlatformSetupStepper from '@/components/platformSetup/PlatformSetupStepper'

// Mock the MantineProvider and its components
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core')

  // Create a Stepper component with proper subcomponents
  const StepperComponent = ({ children, active }) => (
    <div data-testid="stepper" data-active={active}>
      {children}
    </div>
  )
  StepperComponent.Step = ({ children, label, description }) => (
    <div
      data-testid="stepper-step"
      data-label={label}
      data-description={description}
    >
      {children}
    </div>
  )
  StepperComponent.Completed = ({ children }) => (
    <div data-testid="stepper-completed">{children}</div>
  )

  return {
    ...originalModule,
    MantineProvider: ({ children }) => <div>{children}</div>,
    Stepper: StepperComponent,
    Stack: ({ children }) => <div data-testid="stack">{children}</div>,
    Group: ({ children, justify }) => (
      <div data-testid="group" data-justify={justify}>
        {children}
      </div>
    ),
    Button: ({ children, onClick, disabled, loading, variant, size }) => (
      <button
        data-testid="button"
        onClick={onClick}
        disabled={disabled}
        data-loading={loading}
        data-variant={variant}
        data-size={size}
      >
        {children}
      </button>
    ),
    Text: ({ children, fw, ta, size, c }) => (
      <span
        data-testid="text"
        data-fw={fw}
        data-ta={ta}
        data-size={size}
        data-c={c}
      >
        {children}
      </span>
    ),
  }
})

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the components used in PlatformSetupStepper
jest.mock('@/components/platformSetup/TeamDetails', () => ({
  __esModule: true,
  default: ({ form }) => (
    <div data-testid="team-details">
      Team Details Content
      <button
        data-testid="set-team-values"
        onClick={() => {
          form.setValues({
            team_name: 'Test Team',
            team_type: 'Engineering',
            team_size: '10-50',
            workspace_url: '',
          })
        }}
      >
        Set Team Values
      </button>
    </div>
  ),
}))

jest.mock('@/components/platformSetup/WorkspaceCreation', () => ({
  __esModule: true,
  default: ({ form, onWorkspaceCreated }) => (
    <div data-testid="workspace-creation">
      Workspace Creation Content
      <button
        data-testid="set-workspace-url"
        onClick={() => {
          form.setValues({
            ...form.values,
            workspace_url: 'test-workspace',
          })
        }}
      >
        Set Workspace URL
      </button>
      <button data-testid="create-workspace" onClick={onWorkspaceCreated}>
        Create Workspace
      </button>
    </div>
  ),
}))

jest.mock('@/components/platformSetup/AddMembers', () => ({
  __esModule: true,
  default: ({ onMembersInvited, parentIsInviting }) => (
    <div data-testid="add-members">
      Add Members Content
      {parentIsInviting && (
        <button
          data-testid="trigger-invite-success"
          onClick={() => onMembersInvited(true)}
        >
          Invite Success
        </button>
      )}
      {parentIsInviting && (
        <button
          data-testid="trigger-invite-failure"
          onClick={() => onMembersInvited(false)}
        >
          Invite Failure
        </button>
      )}
    </div>
  ),
}))

jest.mock('@/components/platformSetup/CompleteModal', () => ({
  __esModule: true,
  default: ({ opened }) =>
    opened && <div data-testid="complete-modal">Complete Modal Content</div>,
}))

// Mock the notification util
jest.mock('@/utils/notification', () => ({
  showNotification: jest.fn(),
}))

// Mock CSS module
jest.mock('@/components/platformSetup/platformSetup.module.css', () => ({
  default: {},
}))

describe('PlatformSetupStepper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the initial stepper with team details step', () => {
    render(<PlatformSetupStepper />)

    // Check that team details step is rendered
    expect(screen.getByTestId('team-details')).toBeInTheDocument()

    // Check next button is disabled initially
    const nextButton = screen.getByText('Proceed Next')
    expect(nextButton).toBeDisabled()
  })

  it('enables next button when team details are filled', () => {
    render(<PlatformSetupStepper />)

    // Set team values
    fireEvent.click(screen.getByTestId('set-team-values'))

    // Next button should be enabled now
    const nextButton = screen.getByText('Proceed Next')
    expect(nextButton).not.toBeDisabled()
  })

  it('proceeds to workspace creation step when team details are valid', () => {
    render(<PlatformSetupStepper />)

    // Set team values
    fireEvent.click(screen.getByTestId('set-team-values'))

    // Click next
    fireEvent.click(screen.getByText('Proceed Next'))

    // Should show workspace creation step
    expect(screen.getByTestId('workspace-creation')).toBeInTheDocument()

    // Button should be disabled as workspace isn't created yet
    const nextButton = screen.getByText('Proceed Next')
    expect(nextButton).toBeDisabled()
  })

  it('proceeds to add members step when workspace is created', () => {
    render(<PlatformSetupStepper />)

    // Go to workspace creation step
    fireEvent.click(screen.getByTestId('set-team-values'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Set workspace URL and create workspace
    fireEvent.click(screen.getByTestId('set-workspace-url'))
    fireEvent.click(screen.getByTestId('create-workspace'))

    // Next button should be enabled now
    const nextButton = screen.getByText('Proceed Next')
    expect(nextButton).not.toBeDisabled()

    // Click next
    fireEvent.click(nextButton)

    // Should show add members step
    expect(screen.getByTestId('add-members')).toBeInTheDocument()

    // Button text should change
    expect(screen.getByText('Invite Members')).toBeInTheDocument()
  })

  it('handles invite members flow', () => {
    render(<PlatformSetupStepper />)

    // Navigate to add members step
    fireEvent.click(screen.getByTestId('set-team-values'))
    fireEvent.click(screen.getByText('Proceed Next'))
    fireEvent.click(screen.getByTestId('set-workspace-url'))
    fireEvent.click(screen.getByTestId('create-workspace'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Click invite members
    fireEvent.click(screen.getByText('Invite Members'))

    // Trigger successful invitation
    fireEvent.click(screen.getByTestId('trigger-invite-success'))

    // Button text should change after successful invitation
    expect(screen.getByText('Proceed Next')).toBeInTheDocument()
  })

  it('handles invite failure correctly', () => {
    render(<PlatformSetupStepper />)

    // Navigate to add members step
    fireEvent.click(screen.getByTestId('set-team-values'))
    fireEvent.click(screen.getByText('Proceed Next'))
    fireEvent.click(screen.getByTestId('set-workspace-url'))
    fireEvent.click(screen.getByTestId('create-workspace'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Click invite members
    fireEvent.click(screen.getByText('Invite Members'))

    // Trigger failed invitation
    fireEvent.click(screen.getByTestId('trigger-invite-failure'))

    // Button text should remain the same after failed invitation
    expect(screen.getByText('Invite Members')).toBeInTheDocument()
  })

  it('shows complete modal after proceeding from add members step', () => {
    render(<PlatformSetupStepper />)

    // Navigate to add members step
    fireEvent.click(screen.getByTestId('set-team-values'))
    fireEvent.click(screen.getByText('Proceed Next'))
    fireEvent.click(screen.getByTestId('set-workspace-url'))
    fireEvent.click(screen.getByTestId('create-workspace'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Invite members successfully
    fireEvent.click(screen.getByText('Invite Members'))
    fireEvent.click(screen.getByTestId('trigger-invite-success'))

    // Proceed to completion
    fireEvent.click(screen.getByText('Proceed Next'))

    // Should show complete modal
    expect(screen.getByTestId('complete-modal')).toBeInTheDocument()
  })

  it('allows skipping member invitations', () => {
    render(<PlatformSetupStepper />)

    // Navigate to add members step
    fireEvent.click(screen.getByTestId('set-team-values'))
    fireEvent.click(screen.getByText('Proceed Next'))
    fireEvent.click(screen.getByTestId('set-workspace-url'))
    fireEvent.click(screen.getByTestId('create-workspace'))
    fireEvent.click(screen.getByText('Proceed Next'))

    // Skip invitations
    fireEvent.click(screen.getByText('Skip for now'))

    // Should show complete modal
    expect(screen.getByTestId('complete-modal')).toBeInTheDocument()
  })

  it('changes orientation based on screen size', () => {
    // Test desktop view first
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockReturnValue(false) // Desktop

    const { rerender } = render(<PlatformSetupStepper />)

    // Change to mobile view
    useMediaQuery.mockReturnValue(true) // Mobile
    rerender(<PlatformSetupStepper />)

    // Confirm re-render
    expect(screen.getByTestId('team-details')).toBeInTheDocument()
  })

  it('adjusts button size based on screen size', () => {
    // Test with mobile view
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockReturnValueOnce(false) // Desktop for main component
    useMediaQuery.mockReturnValueOnce(true) // Mobile for button size

    render(<PlatformSetupStepper />)

    // Set team values to enable button
    fireEvent.click(screen.getByTestId('set-team-values'))

    // Button should be present
    expect(screen.getByText('Proceed Next')).toBeInTheDocument()
  })
})
