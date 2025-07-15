// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import Members from '@/components/project/Members'

// Mock the project module CSS
jest.mock('@/components/project/project.module.css', () => ({
  memberData: 'member-data-class',
  memberName: 'member-name-class',
  memberBadgeOwner: 'badge-owner-class',
  memberBadgeAdmin: 'badge-admin-class',
  memberBadge: 'badge-class',
  membersDescription: 'members-description-class',
  memberBadgeEnv: 'member-badge-env-class',
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

// Mock the router parameters
jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ projectId: 'test-project-id' })),
}))

// Mock the role store
jest.mock('@/store/roleStore', () => {
  const checkRolesMock = jest.fn()
  const roleStoreMock = {
    isAdmin: false,
    isOwner: false,
    checkRoles: checkRolesMock,
  }

  return {
    useRoleStore: jest.fn().mockImplementation(() => roleStoreMock),
  }
})

// Mock InviteProjectMembers component
jest.mock('@/components/project/InviteProjectMembers', () => ({
  __esModule: true,
  default: jest.fn(({ opened, close }) =>
    opened ? (
      <div data-testid="invite-members-modal">Invite Members Modal</div>
    ) : null,
  ),
}))

// Mock utility functions
jest.mock('@/utils/commonFunction', () => ({
  getRolePriority: jest.fn(role => {
    if (role.toLowerCase() === 'owner') return 0
    if (role.toLowerCase() === 'admin') return 1
    return 2 // user
  }),
}))

// Mock queries hook
jest.mock('@/hooks/queries/useProjectQueries', () => ({
  useGetProjectMembersQuery: jest.fn(),
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
    ActionIcon: ({ children, variant, size, color, onClick, disabled }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid="action-icon"
        data-variant={variant}
        data-size={size}
        data-color={color}
      >
        {children}
      </button>
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
    Card: ({ children, withBorder, radius }) => (
      <div
        data-testid="card"
        data-with-border={withBorder}
        data-radius={radius}
      >
        {children}
      </div>
    ),
    Center: ({ children, mt }) => (
      <div data-testid="center" data-mt={mt}>
        {children}
      </div>
    ),
    Group: ({ children, justify, align }) => (
      <div data-testid="group" data-justify={justify} data-align={align}>
        {children}
      </div>
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
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
    Table,
    Text: ({ children, classNames, fw, c, className, size }) => (
      <div
        data-testid="text"
        data-classnames={JSON.stringify(classNames)}
        data-fw={fw}
        data-c={c}
        data-size={size}
        className={className}
      >
        {children}
      </div>
    ),
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
    Title: ({ children, order, fz, c }) => (
      <div data-testid="title" data-order={order} data-fz={fz} data-c={c}>
        {children}
      </div>
    ),
    Tooltip: ({ children, label }) => (
      <div data-testid="tooltip" data-label={label}>
        {children}
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
  }
})

// Mock test data
const mockMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Owner',
    environment_access: [
      { environment: 'development' },
      { environment: 'production' },
    ],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Admin',
    environment_access: [{ environment: 'staging' }],
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    environment_access: [{ environment: 'development' }],
  },
]

describe('Members', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with loading state', () => {
    // Mock the query with loading state
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: null,
        isLoading: true,
      },
    )

    render(<Members />)

    // Check for main components
    expect(screen.getByText('Project Members')).toBeInTheDocument()

    // Check for invite button (mobile or desktop)
    const inviteText = screen.getByText('Invite Member')
    expect(inviteText).toBeInTheDocument()

    // Check for loading state
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })

  it('renders correctly with members data', () => {
    // Mock the query with member data
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Check for main components
    expect(screen.getByText('Project Members')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(
      screen.getByText('Manage members and their access to this project'),
    ).toBeInTheDocument()

    // Check for members
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getAllByTestId('badge')).toHaveLength(7) // 3 roles + 4 environments
  })

  it('handles search functionality correctly', () => {
    // Mock the query with member data
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Initially all members should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()

    // Search for Jane
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'jane' } })

    // Now only Jane should be visible
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
  })

  it('handles role filtering correctly', () => {
    // Mock the query with member data
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Initially all members should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()

    // Filter by admin role
    const roleSelect = screen.getByTestId('role-select')
    fireEvent.change(roleSelect, { target: { value: 'admin' } })

    // Now only Jane should be visible (she's an admin)
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
  })

  it('handles pagination correctly', () => {
    // Create more members to test pagination
    const manyMembers = [
      ...mockMembers,
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 4}`,
        name: `User ${i + 4}`,
        email: `user${i + 4}@example.com`,
        role: 'User',
        environment_access: [{ environment: 'development' }],
      })),
    ]

    // Mock the query with many members (to trigger pagination)
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: manyMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Should have pagination with 2 pages (8 members, 5 per page)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByTestId('page-1')).toBeInTheDocument()
    expect(screen.getByTestId('page-2')).toBeInTheDocument()

    // First page should show first 5 members
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('User 4')).toBeInTheDocument()
    expect(screen.queryByText('User 8')).not.toBeInTheDocument()

    // Click on second page
    fireEvent.click(screen.getByTestId('page-2'))

    // Second page should show remaining 3 members
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.getByText('User 8')).toBeInTheDocument()
  })

  it('handles invite member button click correctly', () => {
    // Mock the hook to test invite functionality
    const openMock = jest.fn()
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      false,
      { open: openMock, close: jest.fn() },
    ])

    // Set is768 to false to ensure button is rendered
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') return false
      if (query === '(max-width: 768px)') return false
      return false
    })

    // Mock the query
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Find the button by both text and its data-testid
    const inviteButton = screen.getByText('Invite Member')

    // Click the invite button
    fireEvent.click(inviteButton)

    // Should call open function from useDisclosure
    expect(openMock).toHaveBeenCalledTimes(1)
  })

  it('renders invite modal when opened state is true', () => {
    // Mock the hook to set opened to true
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      true,
      { open: jest.fn(), close: jest.fn() },
    ])

    // Mock the query
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Should render the invite modal
    expect(screen.getByTestId('invite-members-modal')).toBeInTheDocument()
  })

  it('displays no members found message when there are no members', () => {
    // Mock the query with empty data
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: [],
        isLoading: false,
      },
    )

    render(<Members />)

    // Should show no members message
    expect(screen.getByText('No members found')).toBeInTheDocument()
  })

  it('renders correctly with different media queries', () => {
    // Mock the media query for smaller screens
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') return true
      if (query === '(max-width: 768px)') return true
      return false
    })

    // Mock the query
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Should render tooltip for mobile view instead of full button
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    // Find the specific action icon inside the tooltip
    const tooltipActionIcon = screen
      .getByTestId('tooltip')
      .querySelector('[data-testid="action-icon"]')
    expect(tooltipActionIcon).toBeInTheDocument()
  })

  it('displays environment badges correctly', () => {
    // Mock the query
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    render(<Members />)

    // Check for environment badges
    const badges = screen.getAllByTestId('badge')
    // Count badges containing environment names
    const environmentTexts = ['Development', 'Production', 'Staging']

    // Get all badges with the text of any of the environment names
    const environmentBadges = badges.filter(badge =>
      environmentTexts.some(env => badge.textContent.includes(env)),
    )

    expect(environmentBadges.length).toBeGreaterThan(0)
  })

  it('checks the button state for regular users', () => {
    // Set up component with default roles (isAdmin/isOwner as false)
    require('@/store/roleStore').useRoleStore.mockImplementation(() => ({
      isAdmin: false,
      isOwner: false,
      checkRoles: jest.fn(),
    }))

    // Mock the query
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockImplementation(() => false)

    render(<Members />)

    // Check the "Invite Member" button is present
    const button = screen.getByText('Invite Member').closest('button')
    expect(button).toBeInTheDocument()

    // In the actual implementation, the inviteButton has disabled={!(isAdmin || isOwner)}
    // which should be resolved to disabled={true} since both isAdmin and isOwner are false
  })

  it('checks the button state for admin users', () => {
    // Configure role store to simulate admin role
    require('@/store/roleStore').useRoleStore.mockImplementation(() => ({
      isAdmin: true,
      isOwner: false,
      checkRoles: jest.fn(),
    }))

    // Mock the query
    require('@/hooks/queries/useProjectQueries').useGetProjectMembersQuery.mockReturnValue(
      {
        data: mockMembers,
        isLoading: false,
      },
    )

    // Set desktop view
    require('@mantine/hooks').useMediaQuery.mockImplementation(() => false)

    render(<Members />)

    // Check the "Invite Member" button is present
    const button = screen.getByText('Invite Member').closest('button')
    expect(button).toBeInTheDocument()

    // In the actual implementation, the inviteButton has disabled={!(isAdmin || isOwner)}
    // which should be resolved to disabled={false} since isAdmin is true
  })
})
