/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberSignupFormComponent from '@/components/memberSignup/MemberSignupFormComponent'

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
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  TextInput: ({ required, label, placeholder, ...rest }) => (
    <div data-testid="text-input" data-required={required}>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        placeholder={placeholder}
        onChange={rest.onChange}
        value={rest.value}
        onBlur={rest.onBlur}
      />
      {rest.error && <span data-testid="error-message">{rest.error}</span>}
    </div>
  ),
}))

describe('MemberSignupFormComponent', () => {
  // Mock form object
  const mockForm = {
    getInputProps: jest.fn(field => ({
      onChange: jest.fn(),
      value: field === 'email' ? 'test@example.com' : '',
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
    render(<MemberSignupFormComponent form={mockForm} isLoading={false} />)

    // Check that the input field is rendered
    const emailInput = screen.getByLabelText('Email Address')
    expect(emailInput).toBeInTheDocument()
    expect(emailInput).toHaveValue('test@example.com')
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')

    // Check the signup button
    const signupButton = screen.getByTestId('button')
    expect(signupButton).toBeInTheDocument()
    expect(signupButton).toHaveTextContent('Signup to TestWorkspace workspace')
    expect(signupButton).toHaveAttribute('type', 'submit')
    expect(signupButton).toHaveAttribute('data-full-width', 'true')
    expect(signupButton).toHaveAttribute('data-size', 'md')
    expect(signupButton).not.toBeDisabled()
  })

  it('shows loading state on button when isLoading is true', () => {
    render(<MemberSignupFormComponent form={mockForm} isLoading={true} />)

    // Check that the button is in loading state and disabled
    const signupButton = screen.getByTestId('button')
    expect(signupButton).toHaveAttribute('data-loading', 'true')
    expect(signupButton).toBeDisabled()
  })

  it('handles form input correctly', () => {
    // Create a mock form with more detailed tracking
    const detailedMockForm = {
      getInputProps: jest.fn(field => ({
        onChange: jest.fn(),
        value: field === 'email' ? 'test@example.com' : '',
        onBlur: jest.fn(),
        error: null,
      })),
    }

    render(
      <MemberSignupFormComponent form={detailedMockForm} isLoading={false} />,
    )

    // Verify getInputProps was called with the correct field name
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith('email')
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberSignupFormComponent form={mockForm} isLoading={false} />)

    // Button should still render but with empty workspace text
    const signupButton = screen.getByTestId('button')
    expect(signupButton).toBeInTheDocument()
    expect(signupButton).toHaveTextContent('Signup to workspace')
  })
})
