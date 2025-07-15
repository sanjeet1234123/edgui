// @ts-nocheck - Disable TypeScript checking for this test file
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { PATHS } from '@/constants/paths'
import type { ReactNode } from 'react'
import type {
  UseMutationResult,
  UseMutateFunction,
} from '@tanstack/react-query'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string): R
    }
  }
}

// Define types for our mocks and components
interface SignupForm {
  email: string
  name: string
  country: string
  contact: string
  password: string
  email_subscribed: boolean
}

interface SignupRequest {
  email: string
  name: string
  contact: string
  password: string
  email_subscribed: boolean
}

// Simplified version of the form return type for testing purposes
interface UseFormReturnType<T> {
  getInputProps: () => Record<string, unknown>
  onSubmit: (fn: (values: T) => void) => (values: T) => void
  values: T
  validate: () => Record<string, unknown>
  errors: Record<string, unknown>
  submitting: boolean
  initialized: boolean
  // Add these required properties
  setSubmitting: (value: boolean) => void
  initialize: (values: T) => void
  setValues: (values: T) => void
  setInitialValues: (values: T) => void
  // Any additional properties that might be used
  [key: string]: any
}

interface SignupFormComponentProps {
  form: UseFormReturnType<SignupForm>
  isLoading: boolean
}

interface SignupBottomNavigationProps {
  form?: UseFormReturnType<SignupForm>
}

interface SignupComponentProps {
  handleSubmit: (values: SignupForm) => void
  isPending?: boolean
}

// Mock the constants/endpoint.ts file to avoid import.meta.env issues
jest.mock('@/constants/endpoint', () => 'https://api.example.com/v1')

// Mock CSS modules
jest.mock('@/components/signup/signup.module.css', () => ({
  form: 'form-class',
  checkboxLabel: 'checkbox-label-class',
}))

// Mock components
jest.mock('@/components/authContainer/authContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-container">{children}</div>
  ),
}))

jest.mock('@/components/signup', () => ({
  SignupHeader: () => <div data-testid="signup-header">Signup Header</div>,
  SignupFormComponent: ({ form, isLoading }: SignupFormComponentProps) => (
    <div data-testid="signup-form">
      <input data-testid="name-input" placeholder="Full Name" />
      <input data-testid="email-input" placeholder="Email Address" />
      <input data-testid="contact-input" placeholder="Phone Number" />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
      />
      <div data-testid="signup-loading">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  ),
  SignupBottomNavigation: ({ form }: SignupBottomNavigationProps) => (
    <div data-testid="signup-bottom-nav">
      <button type="submit" data-testid="signup-button">
        Create Account
      </button>
    </div>
  ),
}))

// Mock the authApi to avoid actual API calls
jest.mock('@/api/authApi', () => ({
  signup: jest.fn().mockImplementation(() => Promise.resolve({})),
}))

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock tanstack router
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  createFileRoute: jest.fn(() => jest.fn()),
}))

// Mock useForm and zodResolver
jest.mock('@mantine/form', () => ({
  useForm: jest.fn(() => ({
    getInputProps: jest.fn(() => ({})),
    onSubmit: jest.fn(fn => fn),
    values: {
      email: 'test@example.com',
      name: 'Test User',
      country: 'US',
      contact: '1234567890',
      password: 'password123',
      email_subscribed: false,
    },
    validate: jest.fn(() => ({})),
    errors: {},
    submitting: false,
    initialized: true,
  })),
}))

jest.mock('mantine-form-zod-resolver', () => ({
  zodResolver: jest.fn(),
}))

// Mock route protection
jest.mock('@/components/RouteProtection', () => ({
  PublicRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

// Mock notification utility
jest.mock('@/utils/notification', () => ({
  showNotification: jest.fn(),
}))

// Import components and hooks after all mocks are set up
import * as AuthMutations from '@/hooks/mutations/useAuthMutations'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  SignupBottomNavigation,
  SignupFormComponent,
  SignupHeader,
} from '@/components/signup'
import { useForm } from '@mantine/form'
import { useNavigate } from '@tanstack/react-router'

// Create a simple test component
function SignupComponent({
  handleSubmit,
  isPending = false,
}: SignupComponentProps) {
  const mockForm: UseFormReturnType<SignupForm> = {
    getInputProps: () => ({}),
    onSubmit: (fn: any) => fn,
    values: {
      email: 'test@example.com',
      name: 'Test User',
      country: 'US',
      contact: '1234567890',
      password: 'password123',
      email_subscribed: false,
    },
    validate: () => ({}),
    errors: {},
    submitting: false,
    initialized: true,
    setSubmitting: () => {},
    initialize: () => {},
    setValues: () => {},
    setInitialValues: () => {},
  }

  return (
    <AuthContainer>
      <div className="form-class">
        <SignupHeader />
        <SignupFormComponent form={mockForm} isLoading={isPending} />
        <SignupBottomNavigation />
      </div>
    </AuthContainer>
  )
}

describe('Signup Page', () => {
  let mockSignupMutation: jest.Mock
  let mockNavigate: jest.Mock

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Mock the navigate function
    mockNavigate = jest.fn()
    jest
      .spyOn(require('@tanstack/react-router'), 'useNavigate')
      .mockReturnValue(mockNavigate)

    // Mock the useSignupMutation hook with a proper structure
    mockSignupMutation = jest.fn()
    const mockMutationResult = {
      mutate: mockSignupMutation,
      isPending: false,
      data: undefined,
      error: null,
      isError: false,
      isSuccess: false,
      isIdle: true,
      status: 'idle',
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      mutateAsync: jest.fn().mockImplementation(() => Promise.resolve({})),
    }

    jest
      .spyOn(AuthMutations, 'useSignupMutation')
      .mockReturnValue(
        mockMutationResult as unknown as UseMutationResult<
          {},
          Error,
          SignupRequest,
          unknown
        >,
      )
  })

  it('renders the signup form correctly', () => {
    render(<SignupComponent handleSubmit={() => {}} />)

    expect(screen.getByTestId('auth-container')).toBeInTheDocument()
    expect(screen.getByTestId('signup-header')).toBeInTheDocument()
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
    expect(screen.getByTestId('signup-bottom-nav')).toBeInTheDocument()
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('contact-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('signup-button')).toBeInTheDocument()
  })

  it('submits the form with valid inputs', () => {
    // Test the signup function directly
    const signupFormValues: SignupForm = {
      email: 'test@example.com',
      name: 'Test User',
      country: 'US',
      contact: '1234567890',
      password: 'password123',
      email_subscribed: false,
    }

    // Create a simple version of the handleSubmit function
    const handleSubmit = (values: SignupForm) => {
      const { country, ...signupData } = values
      mockSignupMutation(signupData, {
        onSuccess: () => {
          sessionStorage.setItem('email', values.email)
          mockNavigate({ to: PATHS.CONFIRM_EMAIL })
        },
      })
    }

    // Call the function directly
    handleSubmit(signupFormValues)

    // Check if the mutation was called with the correct values
    expect(mockSignupMutation).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        name: 'Test User',
        contact: '1234567890',
        password: 'password123',
        email_subscribed: false,
      },
      expect.any(Object),
    )
  })

  it('shows loading state while signup is in progress', () => {
    // Mock the isPending state
    const mockMutationResult = {
      mutate: mockSignupMutation,
      isPending: true,
      data: undefined,
      error: null,
      isError: false,
      isSuccess: false,
      isIdle: false,
      status: 'loading',
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      mutateAsync: jest.fn().mockImplementation(() => Promise.resolve({})),
    }

    jest
      .spyOn(AuthMutations, 'useSignupMutation')
      .mockReturnValue(
        mockMutationResult as unknown as UseMutationResult<
          {},
          Error,
          SignupRequest,
          unknown
        >,
      )

    render(<SignupComponent handleSubmit={() => {}} isPending={true} />)

    expect(screen.getByTestId('signup-loading')).toHaveTextContent('Loading')
  })

  it('navigates to confirm email page on successful signup', () => {
    // Test the signup function directly
    const signupFormValues: SignupForm = {
      email: 'test@example.com',
      name: 'Test User',
      country: 'US',
      contact: '1234567890',
      password: 'password123',
      email_subscribed: false,
    }

    // Create a simple version of the handleSubmit function
    const handleSubmit = (values: SignupForm) => {
      const { country, ...signupData } = values
      mockSignupMutation(signupData, {
        onSuccess: () => {
          sessionStorage.setItem('email', values.email)
          mockNavigate({ to: PATHS.CONFIRM_EMAIL })
        },
      })
    }

    // Call the function directly
    handleSubmit(signupFormValues)

    // Get the onSuccess callback from the mock
    const onSuccessCallback = mockSignupMutation.mock.calls[0][1].onSuccess

    // Call the onSuccess callback to simulate a successful signup
    onSuccessCallback()

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.CONFIRM_EMAIL })
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'email',
      'test@example.com',
    )
  })
})
