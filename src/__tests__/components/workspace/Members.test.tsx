// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import Members from '@/components/workspace/Members'

// Mock the workspace module CSS
jest.mock('@/components/workspace/workspace.module.css', () => ({
  memberData: 'member-data-class',
  memberName: 'member-name-class',
  memberDescription: 'member-description-class',
  badgeOwner: 'badge-owner-class',
  badgeAdmin: 'badge-admin-class',
  badge: 'badge-class',
  membersDescription: 'members-description-class',
}))

// Mock the useMediaQuery hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockImplementation(query => {
    if (query === '(max-width: 1024px)') return false
    if (query === '(max-width: 768px)') return false
    return false
  }),
  useDisclosure: jest
    .fn()
    .mockReturnValue([false, { open: jest.fn(), close: jest.fn() }]),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconChevronDown: () => (
    <div data-testid="chevron-down-icon">Chevron Down</div>
  ),
  IconSearch: () => <div data-testid="search-icon">Search</div>,
  IconUsersPlus: () => <div data-testid="users-plus-icon">Users Plus</div>,
  IconDots: () => <div data-testid="dots-icon">Dots</div>,
}))

// Mock the store
jest.mock('@/store/roleStore', () => ({
  useRoleStore: jest.fn().mockReturnValue({
    isUser: false,
  }),
}))

// Mock InviteWorkspaceMembers component
jest.mock('@/components/workspace/InviteWorkspaceMembers', () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="invite-members-modal">Invite Members Modal</div>
  )),
}))

// Mock utility functions
jest.mock('@/utils/commonFunction', () => ({
  getRolePriority: jest.fn(role => {
    if (role === 'owner') return 0
    if (role === 'admin') return 1
    return 2 // user
  }),
  timeAgo: jest.fn(date => '2 days ago'),
}))

// Mock queries hook
jest.mock('@/hooks/queries/useWorkspaceQueries', () => ({
  useGetWorkspaceMembersQuery: jest.fn(),
}))

// Create a table mock function
const createTableComponent = () => {
  const TableComponent = ({
    children,
    highlightOnHover,
    withTableBorder,
    horizontalSpacing,
    classNames,
  }) => (
    <table
      data-testid="table"
      data-highlight={highlightOnHover}
      data-border={withTableBorder}
      data-spacing={horizontalSpacing}
    >
      {children}
    </table>
  )

  TableComponent.Thead = ({ children }) => (
    <thead data-testid="table-head">{children}</thead>
  )
  TableComponent.Tbody = ({ children }) => (
    <tbody data-testid="table-body">{children}</tbody>
  )
  TableComponent.Tr = ({ children }) => (
    <tr data-testid="table-row">{children}</tr>
  )
  TableComponent.Th = ({ children }) => (
    <th data-testid="table-header">{children}</th>
  )
  TableComponent.Td = ({ children, colSpan, align, style }) => (
    <td
      data-testid="table-cell"
      data-colspan={colSpan}
      data-align={align}
      style={style}
    >
      {children}
    </td>
  )

  return TableComponent
}

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const Table = createTableComponent()

  return {
    Card: ({ children, withBorder, radius }) => (
      <div
        data-testid="card"
        data-with-border={withBorder}
        data-radius={radius}
      >
        {children}
      </div>
    ),
    Group: ({ children, justify, align }) => (
      <div data-testid="group" data-justify={justify} data-align={align}>
        {children}
      </div>
    ),
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, classNames, fw, p, c, className }) => (
      <div
        data-testid="text"
        data-classnames={JSON.stringify(classNames)}
        data-fw={fw}
        data-p={p}
        data-c={c}
        className={className}
      >
        {children}
      </div>
    ),
    Title: ({ children, order, fz, c }) => (
      <div data-testid="title" data-order={order} data-fz={fz} data-c={c}>
        {children}
      </div>
    ),
    Table,
    TextInput: ({
      radius,
      leftSection,
      placeholder,
      value,
      onChange,
      styles,
    }) => (
      <div
        data-testid="text-input"
        data-radius={radius}
        data-placeholder={placeholder}
      >
        <div data-testid="left-section">{leftSection}</div>
        <input
          type="text"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          data-testid="search-input"
        />
      </div>
    ),
    Select: ({
      w,
      radius,
      data,
      value,
      onChange,
      allowDeselect,
      rightSection,
    }) => (
      <div
        data-testid="select"
        data-radius={radius}
        data-allow-deselect={allowDeselect}
      >
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          data-testid="role-select"
        >
          {data.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div data-testid="right-section">{rightSection}</div>
      </div>
    ),
    Button: ({ children, size, leftSection, onClick, disabled }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid="button"
        data-size={size}
      >
        {leftSection && (
          <span data-testid="button-left-section">{leftSection}</span>
        )}
        {children}
      </button>
    ),
    Loader: () => <div data-testid="loader">Loading...</div>,
    Pagination: ({ total, value, onChange, size, radius, color }) => (
      <div
        data-testid="pagination"
        data-total={total}
        data-value={value}
        data-size={size}
        data-radius={radius}
        data-color={color}
      >
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            data-testid={`page-${i + 1}`}
            data-active={value === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    ),
    Center: ({ children, mt }) => (
      <div data-testid="center" data-mt={mt}>
        {children}
      </div>
    ),
    Avatar: () => <div data-testid="avatar">Avatar</div>,
    Badge: ({ children, size, color, variant, classNames }) => (
      <div
        data-testid="badge"
        data-size={size}
        data-color={color}
        data-variant={variant}
        data-classnames={JSON.stringify(classNames)}
      >
        {children}
      </div>
    ),
    ActionIcon: ({ variant, size, color, disabled, onClick }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid="action-icon"
        data-variant={variant}
        data-size={size}
        data-color={color}
      >
        Action Icon
      </button>
    ),
    Tooltip: ({ children, label }) => (
      <div data-testid="tooltip" data-label={label}>
        {children}
      </div>
    ),
  }
})

describe('Members Component', () => {
  // Sample member data for testing
  const mockMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      joined: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      joined: '2023-02-01T00:00:00Z',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user',
      joined: '2023-03-01T00:00:00Z',
    },
    {
      id: '4',
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'user',
      joined: '2023-04-01T00:00:00Z',
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'user',
      joined: '2023-05-01T00:00:00Z',
    },
    {
      id: '6',
      name: 'Diana Prince',
      email: 'diana@example.com',
      role: 'admin',
      joined: '2023-06-01T00:00:00Z',
    },
  ]

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with members data', () => {
    // Mock the query to return members
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 5) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if the title is rendered
    expect(screen.getByText('Workspace Members')).toBeInTheDocument()

    // Check if the card is rendered
    expect(screen.getByTestId('card')).toBeInTheDocument()

    // Check if the table is rendered
    expect(screen.getByTestId('table')).toBeInTheDocument()

    // Check for table headers
    expect(screen.getByText('Member')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Joined At')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()

    // Check if member rows are rendered (5 members in the first page)
    const tableRows = screen.getAllByTestId('table-row')
    // +1 for header row
    expect(tableRows.length).toBe(6)
  })

  it('displays loading state when fetching members', () => {
    // Mock the query with loading state
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: null,
        isLoading: true,
      },
    )

    render(<Members />)

    // Check if the loader is displayed
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })

  it('displays "No members found" when there are no members', () => {
    // Mock the query with empty members array
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: [] },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if the "No members found" message is displayed
    expect(screen.getByText('No members found')).toBeInTheDocument()
  })

  it('filters members by search query', async () => {
    // Mock the query to return all members
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers },
        isLoading: false,
      },
    )

    render(<Members />)

    // Type in the search input
    const searchInput = screen.getByTestId('search-input')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'bob' } })
    })

    // Only Bob should be visible
    const tableRows = screen.getAllByTestId('table-row')
    // +1 for header row
    expect(tableRows.length).toBe(2)
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()

    // Clear the search
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '' } })
    })

    // Now we should see 5 members (first page)
    const updatedTableRows = screen.getAllByTestId('table-row')
    // +1 for header row
    expect(updatedTableRows.length).toBe(6)
  })

  it('filters members by role', async () => {
    // Mock the query to return all members
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers },
        isLoading: false,
      },
    )

    render(<Members />)

    // Select admin role from dropdown
    const roleSelect = screen.getByTestId('role-select')
    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: 'admin' } })
    })

    // We should see only admin members (2)
    const tableRows = screen.getAllByTestId('table-row')
    // +1 for header row
    expect(tableRows.length).toBe(3)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Diana Prince')).toBeInTheDocument()

    // Switch to user role
    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: 'user' } })
    })

    // We should see only user members (3)
    const updatedTableRows = screen.getAllByTestId('table-row')
    // +1 for header row
    expect(updatedTableRows.length).toBe(4)
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('handles pagination correctly', async () => {
    // Mock the query to return all members
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if pagination is displayed
    expect(screen.getByTestId('pagination')).toBeInTheDocument()

    // We should see the first 5 members on page 1
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    // Click on page 2
    await act(async () => {
      fireEvent.click(screen.getByTestId('page-2'))
    })

    // Now check that we're on page 2
    const pageButton = screen.getByTestId('page-2')
    expect(pageButton).toHaveAttribute('data-active', 'true')

    // Check that one of the members from page 1 is no longer visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('disables the invite button for users with "user" role', () => {
    // Mock user role
    require('@/store/roleStore').useRoleStore.mockReturnValue({
      isUser: true,
    })

    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 5) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if invite button is disabled
    const inviteButton = screen.getByTestId('button')
    expect(inviteButton).toBeDisabled()
  })

  it('enables the invite button for non-user roles', () => {
    // Mock admin role
    require('@/store/roleStore').useRoleStore.mockReturnValue({
      isUser: false,
    })

    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 5) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if invite button is enabled
    const inviteButton = screen.getByTestId('button')
    expect(inviteButton).not.toBeDisabled()
  })

  it('shows invite modal when invite button is clicked', async () => {
    // Mock open function
    const mockOpen = jest.fn()
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      false,
      { open: mockOpen, close: jest.fn() },
    ])

    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 5) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Click the invite button
    const inviteButton = screen.getByTestId('button')
    await act(async () => {
      fireEvent.click(inviteButton)
    })

    // Check if open function was called
    expect(mockOpen).toHaveBeenCalledTimes(1)
  })

  it('renders invite modal when opened state is true', () => {
    // Mock opened state
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      true,
      { open: jest.fn(), close: jest.fn() },
    ])

    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 5) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if invite modal is rendered
    expect(screen.getByTestId('invite-members-modal')).toBeInTheDocument()
  })

  it('displays mobile view on small screens', () => {
    // Mock small screen
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') return true
      if (query === '(max-width: 768px)') return true
      return false
    })

    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 5) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Check if tooltip is rendered instead of button
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()

    // Check for tooltip label instead of direct text
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-label',
      'Invite Member',
    )
  })

  it('displays proper badge styling based on role', () => {
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers.slice(0, 3) },
        isLoading: false,
      },
    )

    render(<Members />)

    // Get all badges
    const badges = screen.getAllByTestId('badge')

    // Check badge variants and classes
    expect(badges[0]).toHaveAttribute('data-variant', 'filled') // owner
    expect(badges[1]).toHaveAttribute('data-variant', 'outline') // admin
    expect(badges[2]).toHaveAttribute('data-variant', 'outline') // user
  })

  it('combines search and role filtering', async () => {
    require('@/hooks/queries/useWorkspaceQueries').useGetWorkspaceMembersQuery.mockReturnValue(
      {
        data: { members: mockMembers },
        isLoading: false,
      },
    )

    render(<Members />)

    // Type in the search input
    const searchInput = screen.getByTestId('search-input')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'j' } }) // Should match John and Jane
    })

    // Select admin role
    const roleSelect = screen.getByTestId('role-select')
    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: 'admin' } })
    })

    // Should only see Jane Smith (admin with 'j' in name)
    const tableRows = screen.getAllByTestId('table-row')
    // +1 for header row
    expect(tableRows.length).toBe(2)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })
})
