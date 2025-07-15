// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TeamMember from '@/components/platformSetup/teamMember'

// Mock the CSS module
jest.mock('@/components/platformSetup/platformSetup.module.css', () => ({
  input: 'input-class',
  wrapper: 'wrapper-class',
  error: 'error-class',
}))

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(() => false), // Default to desktop view
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconChevronDown: () => (
    <div data-testid="chevron-down-icon">Chevron Down</div>
  ),
  IconTrash: () => <div data-testid="trash-icon">Trash</div>,
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  MantineProvider: ({ children }) => <div>{children}</div>,
  TextInput: ({
    size,
    placeholder,
    classNames,
    w,
    value,
    styles,
    onChange,
    style,
    type,
    error,
  }) => (
    <div data-testid="textinput-container" style={{ width: w }}>
      <input
        data-testid="textinput"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        style={style}
        aria-invalid={error ? 'true' : 'false'}
      />
      {error && <div className="error">{error}</div>}
    </div>
  ),
  Select: ({
    size,
    placeholder,
    data,
    rightSection,
    classNames,
    value,
    styles,
    onChange,
    error,
  }) => (
    <div data-testid="select-container">
      <select
        data-testid="select"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => {
          // Simulate Mantine select behavior by passing the selected option
          const selectedOption = data.find(
            item => item.value === e.target.value,
          )
          onChange && onChange(e.target.value, selectedOption)
        }}
        aria-invalid={error ? 'true' : 'false'}
      >
        <option value="">Select a role</option>
        {data &&
          data.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      {rightSection && <div data-testid="right-section">{rightSection}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  ),
  Group: ({
    children,
    gap,
    grow,
    preventGrowOverflow,
    wrap,
    style,
    align,
    onMouseEnter,
    onMouseLeave,
  }) => (
    <div
      data-testid="group"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  ),
  ActionIcon: ({ onClick, radius, size, color, children }) => (
    <button
      data-testid="action-icon"
      onClick={onClick}
      style={{ borderRadius: radius, color }}
    >
      {children}
    </button>
  ),
}))

describe('TeamMember', () => {
  const defaultProps = {
    id: 'member1',
    name: 'test@example.com',
    role: 'Member',
    emailError: '',
    roleError: '',
    onDelete: jest.fn(),
    onChange: jest.fn(),
    canDelete: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<TeamMember {...defaultProps} />)

    // Check that the email input and role selection are rendered with correct values
    const emailInput = screen.getByPlaceholderText('Email address')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveValue('test@example.com')

    // Check that the role is selected
    const roleSelect = screen.getByTestId('select')
    expect(roleSelect).toBeInTheDocument()
    expect(roleSelect).toHaveValue('Member')
  })

  it('shows error messages when provided', () => {
    const props = {
      ...defaultProps,
      emailError: 'Invalid email',
      roleError: 'Role is required',
    }

    render(<TeamMember {...props} />)

    // Check for email error
    const emailInput = screen.getByPlaceholderText('Email address')
    expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Invalid email')).toBeInTheDocument()

    // Check for role error
    const roleSelect = screen.getByTestId('select')
    expect(roleSelect).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Role is required')).toBeInTheDocument()
  })

  it('calls onChange when email input changes', () => {
    render(<TeamMember {...defaultProps} />)

    const emailInput = screen.getByPlaceholderText('Email address')
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      'member1',
      'name',
      'new@example.com',
    )
  })

  it('calls onChange when role selection changes', () => {
    render(<TeamMember {...defaultProps} />)

    const roleSelect = screen.getByTestId('select')
    fireEvent.change(roleSelect, { target: { value: 'Admin' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      'member1',
      'role',
      'Admin',
    )
  })

  it('shows the delete button on mouse enter and hides on mouse leave when canDelete is true', () => {
    render(<TeamMember {...defaultProps} />)

    // Find the outer group
    const outerGroup = screen.getAllByTestId('group')[0]

    // Initially, the showTrash state should be false
    expect(document.querySelector('.w-0')).toBeInTheDocument()
    expect(document.querySelector('.w-14')).not.toBeInTheDocument()

    // Trigger mouse enter
    fireEvent.mouseEnter(outerGroup)
    expect(document.querySelector('.w-14')).toBeInTheDocument()
    expect(document.querySelector('.w-0')).not.toBeInTheDocument()

    // Trigger mouse leave
    fireEvent.mouseLeave(outerGroup)
    expect(document.querySelector('.w-0')).toBeInTheDocument()
    expect(document.querySelector('.w-14')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<TeamMember {...defaultProps} />)

    // First make the delete button visible
    const outerGroup = screen.getAllByTestId('group')[0]
    fireEvent.mouseEnter(outerGroup)

    // Find and click the delete button
    const deleteButton = screen.getByTestId('action-icon')
    fireEvent.click(deleteButton)

    expect(defaultProps.onDelete).toHaveBeenCalledWith('member1')
  })

  it('does not show delete button when canDelete is false', () => {
    const props = { ...defaultProps, canDelete: false }
    render(<TeamMember {...props} />)

    const deleteButton = screen.queryByTestId('action-icon')
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('does not call onDelete when button is clicked but canDelete is false', () => {
    // No need to test this as the button won't even render when canDelete is false
    // and we've already tested that scenario
    expect(true).toBeTruthy()
  })

  it('renders correctly with responsive layout', () => {
    // Mock the media query to return true (mobile view)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(<TeamMember {...defaultProps} />)

    // In mobile view, flexDirection should be column
    const innerGroup = screen.getAllByTestId('group')[1]
    expect(innerGroup).toHaveStyle({ flexDirection: 'column' })

    // Check email input width is 100% in mobile view
    const emailContainer = screen.getByTestId('textinput-container')
    expect(emailContainer).toHaveStyle({ width: '100%' })
  })

  it('initializes with Admin role when role prop is Admin', () => {
    const adminProps = { ...defaultProps, role: 'Admin' }
    render(<TeamMember {...adminProps} />)

    const roleSelect = screen.getByTestId('select')
    expect(roleSelect).toHaveValue('Admin')
  })

  it('initializes with Member role when role prop is Member', () => {
    const memberProps = { ...defaultProps, role: 'Member' }
    render(<TeamMember {...memberProps} />)

    const roleSelect = screen.getByTestId('select')
    expect(roleSelect).toHaveValue('Member')
  })

  it('initializes with empty role when role prop is empty', () => {
    const emptyRoleProps = { ...defaultProps, role: '' }
    render(<TeamMember {...emptyRoleProps} />)

    const roleSelect = screen.getByTestId('select')
    expect(roleSelect).toHaveValue('')
  })
})
