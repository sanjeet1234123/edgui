/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberRegistrationFormComponent from '@/components/memberRegistration/MemberRegistrationFormComponent'

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
  PasswordInput: ({ required, label, placeholder, ...rest }) => (
    <div data-testid="password-input" data-required={required}>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
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

describe('MemberRegistrationFormComponent', () => {
  // Mock form object
  const mockForm = {
    getInputProps: jest.fn(field => ({
      onChange: jest.fn(),
      value:
        field === 'name'
          ? 'John Doe'
          : field === 'contact'
            ? 'john@example.com'
            : field === 'password'
              ? 'password123'
              : 'password123',
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
    render(
      <MemberRegistrationFormComponent form={mockForm} isLoading={false} />,
    )

    // Check that the input fields are rendered
    const nameInput = screen.getByLabelText('Name')
    expect(nameInput).toBeInTheDocument()

    const contactInput = screen.getByLabelText('Contact')
    expect(contactInput).toBeInTheDocument()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toBeInTheDocument()

    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    expect(confirmPasswordInput).toBeInTheDocument()

    // Check the register button
    const registerButton = screen.getByTestId('button')
    expect(registerButton).toBeInTheDocument()
    expect(registerButton).toHaveTextContent(
      'Register to TestWorkspace workspace',
    )
    expect(registerButton).toHaveAttribute('type', 'submit')
    expect(registerButton).toHaveAttribute('data-full-width', 'true')
    expect(registerButton).toHaveAttribute('data-size', 'md')
    expect(registerButton).not.toBeDisabled()
  })

  it('shows loading state on button when isLoading is true', () => {
    render(<MemberRegistrationFormComponent form={mockForm} isLoading={true} />)

    // Check that the button is in loading state and disabled
    const registerButton = screen.getByTestId('button')
    expect(registerButton).toHaveAttribute('data-loading', 'true')
    expect(registerButton).toBeDisabled()
  })

  it('handles form input correctly', () => {
    // Create a mock form with more detailed tracking
    const detailedMockForm = {
      getInputProps: jest.fn(field => ({
        onChange: jest.fn(),
        value:
          field === 'name'
            ? 'John Doe'
            : field === 'contact'
              ? 'john@example.com'
              : field === 'password'
                ? 'password123'
                : 'password123',
        onBlur: jest.fn(),
        error: null,
      })),
    }

    render(
      <MemberRegistrationFormComponent
        form={detailedMockForm}
        isLoading={false}
      />,
    )

    // Verify getInputProps was called with the correct field names
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith('name')
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith('contact')
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith('password')
    expect(detailedMockForm.getInputProps).toHaveBeenCalledWith(
      'confirm_password',
    )
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(
      <MemberRegistrationFormComponent form={mockForm} isLoading={false} />,
    )

    // Button should still render but with just "workspace" text
    const registerButton = screen.getByTestId('button')
    expect(registerButton).toBeInTheDocument()
    expect(registerButton).toHaveTextContent('Register to workspace')
  })
})
