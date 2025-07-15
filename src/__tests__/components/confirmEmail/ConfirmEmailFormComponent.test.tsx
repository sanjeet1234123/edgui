// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfirmEmailFormComponent from '@/components/confirmEmail/ConfirmEmailFormComponent'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false), // Default to desktop view
}))

// Mock the auth mutations hook
jest.mock('@/hooks/mutations/useAuthMutations', () => ({
  useRequestVerificationCodeMutation: jest.fn(() => ({
    mutate: jest.fn(),
  })),
}))

// Mock the CSS module
jest.mock('@/components/confirmEmail/confirmEmail.module.css', () => ({
  verificationCodeText: 'verificationCodeText-class',
  error: 'error-class',
  sendCodeText: 'sendCodeText-class',
  sendCodeButton: 'sendCodeButton-class',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  PinInput: ({ length, type, size, placeholder, onChange, value }) => (
    <div data-testid="pin-input">
      <input
        data-testid="pin-input-field"
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        data-length={length}
        data-size={size}
      />
    </div>
  ),
  Button: ({
    children,
    loading,
    disabled,
    onClick,
    variant,
    size,
    fullWidth,
  }) => (
    <button
      data-testid="button"
      data-loading={loading}
      data-disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth}
      onClick={onClick}
    >
      {children}
    </button>
  ),
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Text: ({ children, classNames }) => (
    <span className={classNames?.root}>{children}</span>
  ),
  Group: ({ children, gap, justify, align }) => (
    <div data-gap={gap} data-justify={justify} data-align={align}>
      {children}
    </div>
  ),
}))

describe('ConfirmEmailFormComponent', () => {
  let mockForm
  const mockRequestVerificationCode = jest.fn()

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup session storage
    sessionStorage.setItem('email', 'test@example.com')

    // Setup form mock
    mockForm = {
      getInputProps: jest.fn(field => ({
        value: '',
        onChange: e =>
          mockForm.setFieldValue(field, e.target ? e.target.value : e),
      })),
      errors: {},
      setFieldValue: jest.fn(),
    }

    // Setup mutation mock
    require('@/hooks/mutations/useAuthMutations').useRequestVerificationCodeMutation.mockReturnValue(
      {
        mutate: mockRequestVerificationCode,
      },
    )
  })

  it('renders the verification code input correctly', () => {
    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    expect(screen.getByText('Enter the verification code')).toBeInTheDocument()
    expect(screen.getByTestId('pin-input')).toBeInTheDocument()
  })

  it('shows error message when verification code is invalid', () => {
    mockForm.errors.verificationCode = 'Invalid verification code'

    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    expect(screen.getByText('Invalid verification code')).toBeInTheDocument()
  })

  it('handles request code button click', () => {
    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    const requestCodeButton = screen.getByText('Send code again')
    fireEvent.click(requestCodeButton)

    expect(mockRequestVerificationCode).toHaveBeenCalledWith({
      email: 'test@example.com',
    })
  })

  it('disables submit button when loading', () => {
    render(<ConfirmEmailFormComponent form={mockForm} isLoading={true} />)

    const submitButton = screen.getByText('Verify Email')
    expect(submitButton).toHaveAttribute('data-loading', 'true')
    expect(submitButton).toHaveAttribute('data-disabled', 'true')
  })

  it('uses mobile styles when on mobile device', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    const pinInput = screen.getByTestId('pin-input-field')
    expect(pinInput).toHaveAttribute('data-size', 'md')
  })

  it('uses desktop styles when on desktop device', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    const pinInput = screen.getByTestId('pin-input-field')
    expect(pinInput).toHaveAttribute('data-size', 'lg')
  })

  it('renders the resend code section correctly', () => {
    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    expect(
      screen.getByText("Didn't receive the verification code ?"),
    ).toBeInTheDocument()
    expect(screen.getByText('Send code again')).toBeInTheDocument()
  })

  it('handles pin input changes', () => {
    render(<ConfirmEmailFormComponent form={mockForm} isLoading={false} />)

    const pinInput = screen.getByTestId('pin-input-field')
    fireEvent.change(pinInput, { target: { value: '123456' } })

    expect(mockForm.setFieldValue).toHaveBeenCalledWith(
      'verificationCode',
      '123456',
    )
  })
})
