// @ts-nocheck
/**
 * @jest-environment jsdom
 */

// Mock the endpoint constants first to avoid import.meta issues
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost:3000/v1',
}))

// Mock the user details queries to avoid API calls
jest.mock('@/hooks/queries/useUserDetailsQueries', () => ({
  useGetUserDetailsQuery: jest.fn(() => ({
    data: {
      name: 'Test User',
      account: {
        CreationDate: 1641945600, // Mock Unix timestamp for Jan 12, 2022
      },
    },
    isLoading: false,
  })),
}))

// Mock the user details mutations to avoid QueryClient issues
jest.mock('@/hooks/mutations/useUserDetailsMutations', () => ({
  useUpdateUserDetailsMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    error: null,
  })),
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}))

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserDetails from '../../../components/accountSettings/UserDetails'

// Mock the accountSettings module CSS
jest.mock(
  '../../../components/accountSettings/accountSettings.module.css',
  () => ({
    cardTitle: 'cardTitle-class',
    badgeOwner: 'badgeOwner-class',
    badgeAdmin: 'badgeAdmin-class',
    badge: 'badge-class',
  }),
)

// Mock Mantine components completely to avoid MantineProvider requirement
jest.mock('@mantine/core', () => {
  const Grid = ({ children, gutter }) => (
    <div data-testid="grid" data-gutter={gutter}>
      {children}
    </div>
  )
  Grid.Col = ({ children, span }) => (
    <div data-testid="grid-col" data-span={JSON.stringify(span)}>
      {children}
    </div>
  )
  return {
    Card: ({ children, radius, w }) => (
      <div data-testid="card" data-radius={radius} data-width={w}>
        {children}
      </div>
    ),
    Text: ({ children, fz, fw }) => (
      <span data-testid="text" data-fz={fz} data-fw={fw}>
        {children}
      </span>
    ),
    Stack: ({ children, gap, h }) => (
      <div data-testid="stack" data-gap={gap} data-height={h}>
        {children}
      </div>
    ),
    Title: ({ children, order, className, fz, fw, c }) => (
      <h1
        data-testid="title"
        data-order={order}
        className={className}
        data-fz={fz}
        data-fw={fw}
        data-color={c}
      >
        {children}
      </h1>
    ),
    Badge: ({ children, color, variant, size, classNames }) => (
      <span
        data-testid="badge"
        data-color={color}
        data-variant={variant}
        data-size={size}
        className={classNames?.root}
      >
        {children}
      </span>
    ),
    Group: ({ children, justify, gap }) => (
      <div data-testid="group" data-justify={justify} data-gap={gap}>
        {children}
      </div>
    ),
    Avatar: ({ name, color, size }) => (
      <div
        data-testid="avatar"
        data-name={name}
        data-color={color}
        data-size={size}
      >
        {name}
      </div>
    ),
    Button: ({
      children,
      leftSection,
      variant,
      className,
      onClick,
      type,
      mt,
      loading,
    }) => (
      <button
        data-testid="button"
        data-variant={variant}
        className={className}
        onClick={onClick}
        type={type}
        data-mt={mt}
        disabled={loading}
      >
        {leftSection}
        {children}
      </button>
    ),
    TextInput: ({ placeholder, disabled, value, readOnly, ...props }) => (
      <input
        data-testid="text-input"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        readOnly={readOnly}
        {...props}
      />
    ),
    Input: ({
      component,
      mask,
      placeholder,
      disabled,
      value,
      readOnly,
      ...props
    }) => (
      <input
        data-testid="input"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        readOnly={readOnly}
        data-mask={mask}
        {...props}
      />
    ),
    Grid,
  }
})

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
  useDisclosure: jest.fn(() => [
    false, // opened state
    {
      open: jest.fn(),
      close: jest.fn(),
      toggle: jest.fn(),
    },
  ]),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconCalendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  IconEdit: () => <div data-testid="edit-icon">Edit Icon</div>,
  IconMail: () => <div data-testid="mail-icon">Mail Icon</div>,
  IconSettings: () => <div data-testid="settings-icon">Settings Icon</div>,
  IconFileText: () => <div data-testid="file-text-icon">File Text Icon</div>,
}))

// Mock the ChangePassword component
jest.mock('../../../components/accountSettings/ChangePassword', () => {
  return function ChangePassword({ opened, close }) {
    return opened ? (
      <div data-testid="change-password-modal">Change Password Modal</div>
    ) : null
  }
})

// Mock react-imask
jest.mock('react-imask', () => ({
  IMaskInput: ({ mask, placeholder, ...props }) => (
    <input
      data-testid="imask-input"
      placeholder={placeholder}
      data-mask={mask}
      {...props}
    />
  ),
}))

// Mock @mantine/form
jest.mock('@mantine/form', () => ({
  useForm: jest.fn(() => ({
    getInputProps: jest.fn(field => ({
      value: '',
      onChange: jest.fn(),
    })),
    onSubmit: jest.fn(callback => e => {
      e.preventDefault()
      callback({})
    }),
  })),
}))

// Mock mantine-form-zod-resolver
jest.mock('mantine-form-zod-resolver', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}))

// Mock zod
jest.mock('zod', () => ({
  z: {
    string: () => ({
      min: () => ({
        regex: () => ({}),
      }),
    }),
    object: () => ({}),
  },
}))

describe('UserDetails', () => {
  const mockUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
    workspace: 'Test Workspace',
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Set up mock data in localStorage
    localStorage.setItem('name', mockUserData.name)
    localStorage.setItem('email', mockUserData.email)
    localStorage.setItem('workspace_role', mockUserData.role)
    localStorage.setItem('workspace_name', mockUserData.workspace)
  })

  it('renders the component with correct title', () => {
    render(<UserDetails />)
    expect(screen.getByText('User Details')).toBeInTheDocument()
  })

  it('displays all user information correctly', () => {
    render(<UserDetails />)

    // Check full name appears in multiple places - use getAllByText to verify both
    const johnDoeElements = screen.getAllByText('John Doe')
    expect(johnDoeElements).toHaveLength(2) // Should appear in avatar and title

    // Check email
    expect(screen.getByText('john@example.com')).toBeInTheDocument()

    // Check workspace
    expect(screen.getByText('Test Workspace')).toBeInTheDocument()

    // Check role
    expect(screen.getByText('owner')).toBeInTheDocument()
  })

  it('renders role badge with correct styling for owner', () => {
    render(<UserDetails />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'filled')
    expect(badge).toHaveAttribute('data-color', 'var(--mantine-color-black)')
    expect(badge).toHaveAttribute('data-size', 'lg')
    expect(badge).toHaveClass('badgeOwner-class')
  })

  it('renders role badge with correct styling for admin', () => {
    localStorage.setItem('workspace_role', 'admin')
    render(<UserDetails />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'outline')
    expect(badge).toHaveAttribute('data-color', 'var(--mantine-color-black)')
    expect(badge).toHaveAttribute('data-size', 'lg')
    expect(badge).toHaveClass('badgeAdmin-class')
  })

  it('renders role badge with correct styling for regular user', () => {
    localStorage.setItem('workspace_role', 'user')
    render(<UserDetails />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-variant', 'outline')
    expect(badge).toHaveAttribute('data-color', 'var(--mantine-color-black)')
    expect(badge).toHaveAttribute('data-size', 'lg')
    expect(badge).toHaveClass('badge-class')
  })

  it('handles missing localStorage data gracefully', () => {
    localStorage.clear()
    render(<UserDetails />)

    // Check that N/A is displayed for role when no data is available
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders grid with correct layout', () => {
    render(<UserDetails />)

    const grid = screen.getByTestId('grid')
    expect(grid).toHaveAttribute('data-gutter', 'xl')

    const gridCols = screen.getAllByTestId('grid-col')
    expect(gridCols).toHaveLength(6) // 6 user info items (First Name, Last Name, Email, Phone, Workspace, Role)
  })
})
