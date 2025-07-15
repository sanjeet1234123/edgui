// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberLoginFormComponent from '@/components/memberLogin/MemberLoginFormComponent'

// Mock the CSS module
jest.mock('@/components/memberLogin/memberLogin.module.css', () => ({
  forgotPassword: 'forgotPassword-class',
}))

// Mock the paths constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    FORGOT_PASSWORD: '/forgot-password',
  },
}))

// Mock the react-router Link component
jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, className, children, viewTransition }) => (
    <a
      href={to}
      className={className}
      data-testid="link"
      data-view-transition={viewTransition}
    >
      {children}
    </a>
  ),
}))

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, type, fullWidth, size, loading, disabled }) => (
    <button
      type={type}
      data-testid="button"
      data-full-width={fullWidth}
      data-size={size}
      disabled={disabled || loading}
      data-loading={loading}
    >
      {children}
    </button>
  ),
  Group: ({ children, justify, mt }) => (
    <div data-testid="group" data-justify={justify} data-mt={mt}>
      {children}
    </div>
  ),
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  TextInput: ({ required, label, placeholder, ...rest }) => (
    <div data-testid="text-input" data-required={required}>
      <label htmlFor="email">{label}</label>
      <input
        id="email"
        placeholder={placeholder}
        onChange={rest.onChange}
        value={rest.value}
        onBlur={rest.onBlur}
      />
      {rest.error && <span data-testid="error-message">{rest.error}</span>}
    </div>
  ),
  PasswordInput: ({ required, label, placeholder, ...rest }) => (
    <div data-testid="password-input" data-required={required}>
      <label htmlFor="password">{label}</label>
      <input
        id="password"
        type="password"
        placeholder={placeholder}
        onChange={rest.onChange}
        value={rest.value}
        onBlur={rest.onBlur}
      />
      {rest.error && <span data-testid="error-message">{rest.error}</span>}
    </div>
  ),
}))

describe('MemberLoginFormComponent', () => {
  // Mock form object
  const mockForm = {
    getInputProps: jest.fn(field => ({
      onChange: jest.fn(),
      value: field === 'email' ? 'test@example.com' : 'password123',
      onBlur: jest.fn(),
      error: null,
    })),
  }

  // Setup before tests
  beforeEach(() => {
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('TestWorkspace'),
      },
      writable: true,
    })

    // Reset mocks
    jest.clearAllMocks()
  })

  it('renders form component with all required fields', () => {
    render(<MemberLoginFormComponent form={mockForm} isLoading={false} />)

    // Check that the input fields are rendered
    const emailInput = screen.getByLabelText('Email Address')
    expect(emailInput).toBeInTheDocument()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toBeInTheDocument()

    // Check if forgot password link is present
    const forgotPasswordLink = screen.getByText('Forgot Password?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    expect(forgotPasswordLink).toHaveClass('forgotPassword')

    // Check the login button
    const loginButton = screen.getByTestId('button')
    expect(loginButton).toBeInTheDocument()
    expect(loginButton).toHaveTextContent('Login to TestWorkspace workspace')
    expect(loginButton).toHaveAttribute('type', 'submit')
    expect(loginButton).toHaveAttribute('data-full-width', 'true')
    expect(loginButton).toHaveAttribute('data-size', 'md')
    expect(loginButton).not.toBeDisabled()
  })

  it('shows loading state on button when isLoading is true', () => {
    render(<MemberLoginFormComponent form={mockForm} isLoading={true} />)

    // Check that the button is in loading state and disabled
    const loginButton = screen.getByTestId('button')
    expect(loginButton).toHaveAttribute('data-loading', 'true')
    expect(loginButton).toBeDisabled()
  })

  it('handles form input correctly', () => {
    // Create a mock form with more detailed tracking
    const detailedMockForm = {
      getInputProps: jest.fn(field => ({
        onChange: jest.fn(),
        value: field === 'email' ? 'test@example.com' : 'password123',
        onBlur: jest.fn(),
        error: null,
      })),
    }

    render(
      <MemberLoginFormComponent form={detailedMockForm} isLoading={false} />,
    )

    // Verify getInputProps was called with the correct field names
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith('email')
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith('password')
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberLoginFormComponent form={mockForm} isLoading={false} />)

    // Button should still render but with just "workspace" text
    const loginButton = screen.getByTestId('button')
    expect(loginButton).toBeInTheDocument()
    expect(loginButton).toHaveTextContent('Login to workspace')
  })
})
