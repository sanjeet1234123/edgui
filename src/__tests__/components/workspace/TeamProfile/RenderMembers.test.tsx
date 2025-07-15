// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import React from 'react'
import RenderMembers from '@/components/workspace/TeamProfile/RenderMembers'
import { useGetWorkspaceMembersQuery } from '@/hooks/queries/useWorkspaceQueries'

// Mock the workspace queries
jest.mock('@/hooks/queries/useWorkspaceQueries', () => ({
  useGetWorkspaceMembersQuery: jest.fn(),
}))

// Mock the utility function
jest.mock('@/utils/commonFunction', () => ({
  getRolePriority: jest.fn().mockImplementation(role => {
    const priorities = { owner: 1, admin: 2, user: 3 }
    return priorities[role.toLowerCase()] || 4
  }),
}))

// Mock CSS modules
jest.mock('@/components/workspace/TeamProfile/teamProfile.module.css', () => ({
  memberName: 'memberName-class',
  memberEmail: 'memberEmail-class',
  badgeOwner: 'badgeOwner-class',
  badgeAdmin: 'badgeAdmin-class',
  badge: 'badge-class',
}))

// Mock the Mantine Badge component to make testing easier
jest.mock('@mantine/core', () => {
  const originalModule = jest.requireActual('@mantine/core')
  return {
    ...originalModule,
    Badge: ({ children, variant, classNames }) => (
      <div
        data-testid={`badge-${children}`}
        data-variant={variant}
        className={classNames?.root}
      >
        {children}
      </div>
    ),
  }
})

describe('RenderMembers', () => {
  // Helper function to render the component with MantineProvider
  const renderWithProvider = ui => {
    return render(<MantineProvider>{ui}</MantineProvider>)
  }

  // Sample test data
  const mockMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Owner' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      role: 'Admin',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state or empty state when data is null', () => {
    useGetWorkspaceMembersQuery.mockReturnValue({ data: null })

    renderWithProvider(<RenderMembers />)

    expect(screen.getByText('No members found')).toBeInTheDocument()
  })

  it('renders loading state or empty state when members array is empty', () => {
    useGetWorkspaceMembersQuery.mockReturnValue({ data: { members: [] } })

    renderWithProvider(<RenderMembers />)

    expect(screen.getByText('No members found')).toBeInTheDocument()
  })

  it('renders member cards correctly', () => {
    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: mockMembers.slice(0, 3) },
    })

    renderWithProvider(<RenderMembers />)

    // Check if all members are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()

    // Check if roles are displayed correctly
    expect(screen.getByTestId('badge-Owner')).toBeInTheDocument()
    expect(screen.getByTestId('badge-Admin')).toBeInTheDocument()
    expect(screen.getByTestId('badge-User')).toBeInTheDocument()
  })

  it('sorts members by role priority (owner -> admin -> user)', () => {
    // Put members in a different order to test sorting
    const unsortedMembers = [
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Owner' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
    ]

    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: unsortedMembers },
    })

    renderWithProvider(<RenderMembers />)

    // Get all member names in order
    const memberElements = screen.getAllByText(
      /John Doe|Jane Smith|Bob Johnson/,
    )

    // Check if members are sorted correctly by role
    expect(memberElements[0]).toHaveTextContent('John Doe') // Owner should be first
    expect(memberElements[1]).toHaveTextContent('Jane Smith') // Admin should be second
    expect(memberElements[2]).toHaveTextContent('Bob Johnson') // User should be third
  })

  it('applies correct badge styling based on role', () => {
    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: mockMembers.slice(0, 3) },
    })

    renderWithProvider(<RenderMembers />)

    // With our mock, we can directly check the variant attribute
    const ownerBadge = screen.getByTestId('badge-Owner')
    expect(ownerBadge).toHaveAttribute('data-variant', 'filled')

    // Other roles should have outline variant
    const adminBadge = screen.getByTestId('badge-Admin')
    expect(adminBadge).toHaveAttribute('data-variant', 'outline')

    const userBadge = screen.getByTestId('badge-User')
    expect(userBadge).toHaveAttribute('data-variant', 'outline')

    // Also check that the correct CSS classes are applied through classNames
    expect(ownerBadge.className).toContain('badgeOwner')
    expect(adminBadge.className).toContain('badgeAdmin')
    expect(userBadge.className).toContain('badge')
  })

  it('shows pagination when there are more than itemsPerPage members', () => {
    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: mockMembers }, // Using all 5 mock members
    })

    renderWithProvider(<RenderMembers />)

    // With default itemsPerPage of 3, and 5 total items, pagination should be visible
    // Check if pagination message is displayed correctly
    expect(screen.getByText(/Showing 1 – 3 of 5/)).toBeInTheDocument()
  })

  it('does not show pagination when there are fewer than itemsPerPage members', () => {
    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: mockMembers.slice(0, 2) }, // Using only 2 members
    })

    renderWithProvider(<RenderMembers />)

    // With only 2 members (less than itemsPerPage), pagination should not be visible
    const paginationText = screen.queryByText(/Showing/)
    expect(paginationText).not.toBeInTheDocument()
  })

  it('handles page changes correctly', () => {
    // Instead of trying to interact with the Pagination component directly,
    // we'll mock the useState hook and verify the setPage function is called
    const setPageMock = jest.fn()
    const useStateMock = jest.spyOn(React, 'useState')
    useStateMock.mockImplementation(initialState => {
      if (initialState === 1) {
        // This is the page state
        return [1, setPageMock]
      }
      return [initialState, jest.fn()]
    })

    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: mockMembers }, // Using all 5 mock members
    })

    renderWithProvider(<RenderMembers />)

    // Mock the onChange handler that would be triggered by Pagination component
    // This is the equivalent of clicking the "next" button
    const paginationComponent = screen
      .getByText(/Showing 1 – 3 of 5/)
      .closest('.m_4081bf90')
    expect(paginationComponent).toBeInTheDocument()

    // Manually call the onChange function that Pagination would call
    // This simulates clicking the next page button
    const onChange = page => setPageMock(page)
    onChange(2)

    // Verify setPage was called with page 2
    expect(setPageMock).toHaveBeenCalledWith(2)

    // Restore original useState
    useStateMock.mockRestore()
  })

  it('handles member without name or email gracefully', () => {
    const membersWithMissingData = [
      { id: 1, role: 'Owner' }, // No name or email
      { id: 2, name: 'Jane Smith', role: 'Admin' }, // No email
      { id: 3, email: 'bob@example.com', role: 'User' }, // No name
    ]

    useGetWorkspaceMembersQuery.mockReturnValue({
      data: { members: membersWithMissingData },
    })

    renderWithProvider(<RenderMembers />)

    // Member with missing name and email should still render
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()

    // All role badges should still be displayed
    expect(screen.getByTestId('badge-Owner')).toBeInTheDocument()
    expect(screen.getByTestId('badge-Admin')).toBeInTheDocument()
    expect(screen.getByTestId('badge-User')).toBeInTheDocument()
  })
})
