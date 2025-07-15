// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the endpoint constants first
jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost:3000/v1',
}))

// Mock the user details queries
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

import UserProfileHeader from '@/components/accountSettings/UserProfileHeader'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the accountSettings module CSS
jest.mock('@/components/accountSettings/accountSettings.module.css', () => ({
  labels: 'labels-class',
  editProfileBtn: 'editProfileBtn',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
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
  Group: ({ children, justify, gap }) => (
    <div data-testid="group" data-justify={justify} data-gap={gap}>
      {children}
    </div>
  ),
  Stack: ({ children, gap, align }) => (
    <div data-testid="stack" data-gap={gap} data-align={align}>
      {children}
    </div>
  ),
  Title: ({ children, order, c }) => (
    <h1 data-testid="title" data-order={order} data-color={c}>
      {children}
    </h1>
  ),
  Text: ({ children, className }) => (
    <span data-testid="text" className={className}>
      {children}
    </span>
  ),
  Button: ({ children, leftSection, variant, className }) => (
    <button data-testid="button" data-variant={variant} className={className}>
      {leftSection}
      {children}
    </button>
  ),
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconCalendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  IconEdit: () => <div data-testid="edit-icon">Edit Icon</div>,
  IconMail: () => <div data-testid="mail-icon">Mail Icon</div>,
  IconSettings: () => <div data-testid="settings-icon">Settings Icon</div>,
}))

describe('UserProfileHeader', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // Default localStorage values
    mockLocalStorage.getItem.mockImplementation(key => {
      switch (key) {
        case 'name':
          return 'John Doe'
        case 'email':
          return 'john@example.com'
        case 'workspace_name':
          return 'Test Workspace'
        default:
          return null
      }
    })
  })

  it('renders user profile information correctly', () => {
    render(<UserProfileHeader />)

    // Check if name is rendered in title
    const title = screen.getByTestId('title')
    expect(title).toHaveTextContent('John Doe')

    // Check if email is rendered
    const emailText = screen.getAllByTestId('text')[0]
    expect(emailText).toHaveTextContent('john@example.com')

    // Check if workspace name is rendered
    const workspaceText = screen.getAllByTestId('text')[1]
    expect(workspaceText).toHaveTextContent('Test Workspace')
  })

  it('renders avatar with correct props', () => {
    render(<UserProfileHeader />)

    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveAttribute('data-name', 'John Doe')
    expect(avatar).toHaveAttribute('data-color', 'var(--clr-header-headings)')
    expect(avatar).toHaveAttribute('data-size', 'xl')
  })

  it('renders all icons correctly', () => {
    render(<UserProfileHeader />)

    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
  })

  it('renders edit profile button with correct props', () => {
    render(<UserProfileHeader />)

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveClass('editProfileBtn')
    expect(button).toHaveTextContent('Reset Password')
  })

  it('handles missing localStorage values', () => {
    mockLocalStorage.getItem.mockImplementation(() => null)

    render(<UserProfileHeader />)

    // Check if NA is rendered in title
    const title = screen.getByTestId('title')
    expect(title).toHaveTextContent('NA')

    // Check if NA is rendered in email
    const emailText = screen.getAllByTestId('text')[0]
    expect(emailText).toHaveTextContent('NA')

    // Check if NA is rendered in workspace
    const workspaceText = screen.getAllByTestId('text')[1]
    expect(workspaceText).toHaveTextContent('NA')
  })

  it('adjusts layout for mobile view', () => {
    // Mock mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(<UserProfileHeader />)

    const stack = screen.getAllByTestId('stack')[1] // Get the right section stack
    expect(stack).toHaveAttribute('data-align', 'flex-start')
    expect(stack).toHaveAttribute('data-gap', 'xs')
  })

  it('adjusts layout for desktop view', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<UserProfileHeader />)

    const stack = screen.getAllByTestId('stack')[1] // Get the right section stack
    expect(stack).toHaveAttribute('data-align', 'flex-end')
    expect(stack).toHaveAttribute('data-gap', 'sm')
  })

  it('renders joined date text', () => {
    render(<UserProfileHeader />)

    const joinedDateText = screen.getAllByTestId('text')[2]
    expect(joinedDateText).toHaveTextContent('Joined on Jan 12, 2022')
  })
})
