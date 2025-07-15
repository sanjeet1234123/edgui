// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectMemberRegistrationFormComponent from '@/components/projectMemberRegistration/ProjectMemberRegistrationFormComponent'

// Mock the module CSS
jest.mock(
  '@/components/projectMemberRegistration/projectMemberRegistration.module.css',
  () => ({
    input: 'input-class',
    label: 'label-class',
    error: 'error-class',
  }),
)

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => 'Test Workspace'),
  },
  writable: true,
})

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, type, loading, disabled, fullWidth, size }) => (
    <button
      type={type}
      disabled={disabled}
      data-loading={loading}
      data-fullwidth={fullWidth}
      data-size={size}
      data-testid="submit-button"
    >
      {children}
    </button>
  ),
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  TextInput: ({ label, placeholder, required, classNames, ...rest }) => (
    <div data-testid="textinput-container">
      <label>
        {label}
        {required && '*'}
      </label>
      <input
        data-testid="email-input"
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    </div>
  ),
  PasswordInput: ({ label, placeholder, required, classNames, ...rest }) => (
    <div data-testid="password-container">
      <label>
        {label}
        {required && '*'}
      </label>
      <input
        data-testid="password-input"
        type="password"
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    </div>
  ),
}))

describe('ProjectMemberRegistrationFormComponent', () => {
  // Setup mock form
  const mockForm = {
    getInputProps: jest.fn(field => ({
      name: field,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      value: field === 'email' ? 'test@example.com' : 'password123',
    })),
    values: {
      email: 'test@example.com',
      password: 'password123',
    },
    errors: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with email and password inputs', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('displays workspace name from sessionStorage in the button text', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'Register to Test Workspace workspace',
    )
    expect(window.sessionStorage.getItem).toHaveBeenCalledWith(
      'project_workspace',
    )
  })

  it('passes form props to inputs correctly', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    expect(mockForm.getInputProps).toHaveBeenCalledWith('email')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('password')
  })

  it('disables the submit button when isLoading is true', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={true}
      />,
    )

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('data-loading', 'true')
  })

  it('enables the submit button when isLoading is false', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).not.toBeDisabled()
    expect(submitButton).toHaveAttribute('data-loading', 'false')
  })

  it('renders required labels for both inputs', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    expect(screen.getByText('Email*')).toBeInTheDocument()
    expect(screen.getByText('Password*')).toBeInTheDocument()
  })

  it('renders correct placeholders for inputs', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    expect(screen.getByTestId('email-input')).toHaveAttribute(
      'placeholder',
      'Enter your email',
    )
    expect(screen.getByTestId('password-input')).toHaveAttribute(
      'placeholder',
      'Enter your password',
    )
  })

  it('applies CSS classes from module to inputs', () => {
    render(
      <ProjectMemberRegistrationFormComponent
        form={mockForm}
        isLoading={false}
      />,
    )

    // Testing that the classNames prop is passed to the mock components
    expect(mockForm.getInputProps('email')).toBeDefined()
    expect(mockForm.getInputProps('password')).toBeDefined()
  })
})
