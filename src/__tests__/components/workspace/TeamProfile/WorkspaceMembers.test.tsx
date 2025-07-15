// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import WorkspaceMembers from '@/components/workspace/TeamProfile/WorkspaceMembers'

// Mock CSS modules
jest.mock('@/components/workspace/TeamProfile/teamProfile.module.css', () => ({
  cardTitle: 'cardTitle-class',
  cardDescription: 'cardDescription-class',
  outlineButton: 'outline-button-class',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
  Card: ({ children, withBorder, radius, h }) => (
    <div
      data-testid="mantine-card"
      data-with-border={withBorder}
      data-radius={radius}
      data-h={h}
    >
      {children}
    </div>
  ),
  Group: ({ children, justify }) => (
    <div data-testid="mantine-group" data-justify={justify}>
      {children}
    </div>
  ),
  Stack: ({ children, gap, h }) => (
    <div data-testid="mantine-stack" data-gap={gap} data-h={h}>
      {children}
    </div>
  ),
  Text: ({ children, className }) => (
    <p data-testid="mantine-text" className={className}>
      {children}
    </p>
  ),
  Title: ({ children, order, className }) => {
    const Tag = `h${order}`
    return (
      <Tag data-testid="mantine-title" className={className}>
        {children}
      </Tag>
    )
  },
}))

// Mock InviteWorkspaceMembers component
jest.mock('@/components/workspace/InviteWorkspaceMembers', () => ({
  __esModule: true,
  default: ({ opened, close }) => (
    <div data-testid="invite-workspace-members" data-opened={opened}>
      <button data-testid="mock-close-button" onClick={close}>
        Close
      </button>
    </div>
  ),
}))

// Mock RenderMembers component
jest.mock('@/components/workspace/TeamProfile/RenderMembers', () => ({
  __esModule: true,
  default: () => <div data-testid="render-members">Members List</div>,
}))

// Mock role store
const mockIsUser = jest.fn().mockReturnValue(false)
jest.mock('@/store/roleStore', () => ({
  useRoleStore: () => ({
    isUser: mockIsUser(),
  }),
}))

// Mock useDisclosure hook
const mockOpen = jest.fn()
const mockClose = jest.fn()
let mockOpenedState = false

jest.mock('@mantine/hooks', () => ({
  useDisclosure: () => [mockOpenedState, { open: mockOpen, close: mockClose }],
}))

describe('WorkspaceMembers', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockIsUser.mockReturnValue(false)
    mockOpen.mockClear()
    mockClose.mockClear()
    mockOpenedState = false
  })

  it('renders the workspace members card with correct title', () => {
    render(<WorkspaceMembers />)

    // Check that the card title is rendered
    expect(screen.getByText('Workspace Members')).toBeInTheDocument()
    expect(
      screen.getByText('People with access to this workspace'),
    ).toBeInTheDocument()
  })

  it('renders the invite button when user is not restricted', () => {
    render(<WorkspaceMembers />)

    // Check that the invite button is rendered and enabled
    const inviteButton = screen.getByText('Invite')
    expect(inviteButton).toBeInTheDocument()
    expect(inviteButton.closest('button')).not.toBeDisabled()
  })

  it('disables the invite button when user has restricted permissions', () => {
    // Set isUser to true to simulate restricted permissions
    mockIsUser.mockReturnValue(true)

    render(<WorkspaceMembers />)

    // Check that the invite button is disabled
    const inviteButton = screen.getByText('Invite')
    expect(inviteButton).toBeInTheDocument()
    expect(inviteButton.closest('button')).toBeDisabled()
  })

  it('renders the members list component', () => {
    render(<WorkspaceMembers />)

    // Check that RenderMembers component is rendered
    expect(screen.getByTestId('render-members')).toBeInTheDocument()
  })

  it('calls open function when invite button is clicked', () => {
    render(<WorkspaceMembers />)

    // Click the invite button
    fireEvent.click(screen.getByText('Invite'))

    // Check if open function was called
    expect(mockOpen).toHaveBeenCalled()
  })

  it('renders the invite modal when opened state is true', () => {
    // Set initial state to opened
    mockOpenedState = true

    render(<WorkspaceMembers />)

    // Check that the modal is rendered
    expect(screen.getByTestId('invite-workspace-members')).toBeInTheDocument()
  })

  it('does not render the invite modal when opened state is false', () => {
    // Set initial state to closed
    mockOpenedState = false

    render(<WorkspaceMembers />)

    // Check that the modal is not rendered
    expect(
      screen.queryByTestId('invite-workspace-members'),
    ).not.toBeInTheDocument()
  })

  it('calls close function when close button in modal is clicked', () => {
    // Set initial state to opened
    mockOpenedState = true

    render(<WorkspaceMembers />)

    // Click the close button in the modal
    fireEvent.click(screen.getByTestId('mock-close-button'))

    // Check that the close function was called
    expect(mockClose).toHaveBeenCalled()
  })
})
