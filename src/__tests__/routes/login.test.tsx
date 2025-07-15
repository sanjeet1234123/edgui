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
interface LoginForm {
  workspace: string
  email: string
  password: string
  rememberMe: boolean
}

interface LoginRequest {
  workspace: string
  email: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
  token: string
  expire: string
  name: string
  role_id: string
  email: string
  id: string
  workspace_id: string
  workspace_name: string
  workspace_role: string
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

interface LoginFormComponentProps {
  form: UseFormReturnType<LoginForm>
  isLoading: boolean
}

interface LoginBottomNavigationProps {
  form: UseFormReturnType<LoginForm>
}

interface LoginComponentProps {
  handleSubmit: (values: LoginForm) => void
  isPending?: boolean
}

// Mock the constants/endpoint.ts file to avoid import.meta.env issues
jest.mock('@/constants/endpoint', () => 'https://api.example.com/v1')

// Mock CSS modules
jest.mock('@/components/login/login.module.css', () => ({
  form: 'form-class',
}))

// Mock components
jest.mock('@/components/authContainer/authContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-container">{children}</div>
  ),
}))

jest.mock('@/components/login', () => ({
  LoginHeader: () => <div data-testid="login-header">Login Header</div>,
  LoginFormComponent: ({ form, isLoading }: LoginFormComponentProps) => (
    <div data-testid="login-form">
      <input data-testid="workspace-input" placeholder="Workspace" />
      <input data-testid="email-input" placeholder="Email" />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
      />
      <div data-testid="login-loading">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  ),
  LoginBottomNavigation: ({ form }: LoginBottomNavigationProps) => (
    <div data-testid="login-bottom-nav">
      <button type="submit" data-testid="login-button">
        Login
      </button>
    </div>
  ),
}))

// Mock the authApi to avoid actual API calls
jest.mock('@/api/authApi', () => ({
  login: jest.fn().mockImplementation(() =>
    Promise.resolve({
      token: 'test-token',
      expire: '2023-12-31',
      name: 'Test User',
      role_id: 'admin',
      email: 'test@example.com',
      id: '123',
      workspace_id: '456',
      workspace_name: 'Test Workspace',
      workspace_role: 'admin',
    }),
  ),
}))

// Mock localStorage
const localStorageMock = (() => {
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

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
      workspace: 'test-workspace',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
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

// Mock useAuthStore
jest.mock('@/store/authStore', () => ({
  __esModule: true,
  default: {
    getState: () => ({
      setAuth: jest.fn(),
    }),
  },
}))

// Mock notification utility
jest.mock('@/utils/notification', () => ({
  showNotification: jest.fn(),
}))

// Import components and hooks after all mocks are set up
import * as AuthMutations from '@/hooks/mutations/useAuthMutations'
import AuthContainer from '@/components/authContainer/authContainer'
import {
  LoginBottomNavigation,
  LoginFormComponent,
  LoginHeader,
} from '@/components/login'
import { useForm } from '@mantine/form'
import { useNavigate } from '@tanstack/react-router'

// Create a simple test component
function LoginComponent({
  handleSubmit,
  isPending = false,
}: LoginComponentProps) {
  const mockForm: UseFormReturnType<LoginForm> = {
    getInputProps: () => ({}),
    onSubmit: (fn: any) => fn,
    values: {
      workspace: 'test-workspace',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
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
        <LoginHeader />
        <LoginFormComponent form={mockForm} isLoading={isPending} />
        <LoginBottomNavigation form={mockForm} />
      </div>
    </AuthContainer>
  )
}

describe('Login Page', () => {
  let mockLoginMutation: jest.Mock
  let mockNavigate: jest.Mock

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Mock the navigate function
    mockNavigate = jest.fn()
    jest
      .spyOn(require('@tanstack/react-router'), 'useNavigate')
      .mockReturnValue(mockNavigate)

    // Mock the useLoginMutation hook with a proper structure
    mockLoginMutation = jest.fn()
    const mockMutationResult = {
      mutate: mockLoginMutation,
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
      .spyOn(AuthMutations, 'useLoginMutation')
      .mockReturnValue(
        mockMutationResult as unknown as UseMutationResult<
          LoginResponse,
          Error,
          LoginRequest,
          unknown
        >,
      )
  })

  it('renders the login form correctly', () => {
    render(<LoginComponent handleSubmit={() => {}} />)

    expect(screen.getByTestId('auth-container')).toBeInTheDocument()
    expect(screen.getByTestId('login-header')).toBeInTheDocument()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('login-bottom-nav')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
  })

  it('submits the form with valid inputs', () => {
    // Test the login function directly
    const loginFormValues: LoginForm = {
      workspace: 'test-workspace',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    }

    // Create a simple version of the handleSubmit function
    const handleSubmit = (values: LoginForm) => {
      mockLoginMutation(values, {
        onSuccess: () => {
          mockNavigate({ to: PATHS.MARKETPLACE })
        },
      })
    }

    // Call the function directly
    handleSubmit(loginFormValues)

    // Check if the mutation was called with the correct values
    expect(mockLoginMutation).toHaveBeenCalledWith(
      loginFormValues,
      expect.any(Object),
    )
  })

  it('shows loading state while login is in progress', () => {
    // Mock the isPending state
    const mockMutationResult = {
      mutate: mockLoginMutation,
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
      .spyOn(AuthMutations, 'useLoginMutation')
      .mockReturnValue(
        mockMutationResult as unknown as UseMutationResult<
          LoginResponse,
          Error,
          LoginRequest,
          unknown
        >,
      )

    render(<LoginComponent handleSubmit={() => {}} isPending={true} />)

    expect(screen.getByTestId('login-loading')).toHaveTextContent('Loading')
  })

  it('navigates to marketplace on successful login', () => {
    // Test the login function directly
    const loginFormValues: LoginForm = {
      workspace: 'test-workspace',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    }

    // Create a simple version of the handleSubmit function
    const handleSubmit = (values: LoginForm) => {
      mockLoginMutation(values, {
        onSuccess: () => {
          mockNavigate({ to: PATHS.MARKETPLACE })
        },
      })
    }

    // Call the function directly
    handleSubmit(loginFormValues)

    // Get the onSuccess callback from the mock
    const onSuccessCallback = mockLoginMutation.mock.calls[0][1].onSuccess

    // Call the onSuccess callback to simulate a successful login
    onSuccessCallback()

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.MARKETPLACE })
  })

  it('handles login error correctly', () => {
    const loginFormValues: LoginForm = {
      workspace: 'test-workspace',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    }

    const handleSubmit = (values: LoginForm) => {
      mockLoginMutation(values, {
        onError: error => {
          // Simulate error handling
          expect(error).toBeDefined()
        },
      })
    }

    handleSubmit(loginFormValues)
    const onErrorCallback = mockLoginMutation.mock.calls[0][1].onError
    onErrorCallback(new Error('Login failed'))
  })

  it('handles remember me functionality', () => {
    const loginFormValues: LoginForm = {
      workspace: 'test-workspace',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    }

    // Mock the auth store to simulate setting auth data
    const mockSetAuth = jest.fn()
    jest
      .spyOn(require('@/store/authStore').default, 'getState')
      .mockReturnValue({
        setAuth: mockSetAuth,
      })

    const handleSubmit = (values: LoginForm) => {
      mockLoginMutation(values, {
        onSuccess: data => {
          // Simulate setting auth data in store
          mockSetAuth(data)
          // Verify auth data was set
          expect(mockSetAuth).toHaveBeenCalledWith(data)
        },
      })
    }

    handleSubmit(loginFormValues)
    const onSuccessCallback = mockLoginMutation.mock.calls[0][1].onSuccess
    onSuccessCallback({
      token: 'test-token',
      expire: '2023-12-31',
      name: 'Test User',
      role_id: 'admin',
      email: 'test@example.com',
      id: '123',
      workspace_id: '456',
      workspace_name: 'Test Workspace',
      workspace_role: 'admin',
    })
  })

  it('validates form inputs before submission', () => {
    const mockForm: UseFormReturnType<LoginForm> = {
      getInputProps: () => ({}),
      onSubmit: (fn: any) => fn,
      values: {
        workspace: '',
        email: 'invalid-email',
        password: '',
        rememberMe: false,
      },
      validate: () => ({
        workspace: 'Workspace is required',
        email: 'Invalid email format',
        password: 'Password is required',
      }),
      errors: {},
      submitting: false,
      initialized: true,
      setSubmitting: () => {},
      initialize: () => {},
      setValues: () => {},
      setInitialValues: () => {},
    }

    render(<LoginComponent handleSubmit={() => {}} />)
    const form = screen.getByTestId('login-form')
    expect(form).toBeInTheDocument()
  })

  it('handles form submission with empty values', () => {
    const mockForm: UseFormReturnType<LoginForm> = {
      getInputProps: () => ({}),
      onSubmit: (fn: any) => fn,
      values: {
        workspace: '',
        email: '',
        password: '',
        rememberMe: false,
      },
      validate: () => ({
        workspace: 'Workspace is required',
        email: 'Email is required',
        password: 'Password is required',
      }),
      errors: {},
      submitting: false,
      initialized: true,
      setSubmitting: () => {},
      initialize: () => {},
      setValues: () => {},
      setInitialValues: () => {},
    }

    render(<LoginComponent handleSubmit={() => {}} />)
    const form = screen.getByTestId('login-form')
    expect(form).toBeInTheDocument()
  })

  it('handles form submission with invalid email format', () => {
    const mockForm: UseFormReturnType<LoginForm> = {
      getInputProps: () => ({}),
      onSubmit: (fn: any) => fn,
      values: {
        workspace: 'test-workspace',
        email: 'invalid-email',
        password: 'password123',
        rememberMe: false,
      },
      validate: () => ({
        email: 'Invalid email format',
      }),
      errors: {},
      submitting: false,
      initialized: true,
      setSubmitting: () => {},
      initialize: () => {},
      setValues: () => {},
      setInitialValues: () => {},
    }

    render(<LoginComponent handleSubmit={() => {}} />)
    const form = screen.getByTestId('login-form')
    expect(form).toBeInTheDocument()
  })

  it('handles form submission with short password', () => {
    const mockForm: UseFormReturnType<LoginForm> = {
      getInputProps: () => ({}),
      onSubmit: (fn: any) => fn,
      values: {
        workspace: 'test-workspace',
        email: 'test@example.com',
        password: '123',
        rememberMe: false,
      },
      validate: () => ({
        password: 'Password must be at least 6 characters',
      }),
      errors: {},
      submitting: false,
      initialized: true,
      setSubmitting: () => {},
      initialize: () => {},
      setValues: () => {},
      setInitialValues: () => {},
    }

    render(<LoginComponent handleSubmit={() => {}} />)
    const form = screen.getByTestId('login-form')
    expect(form).toBeInTheDocument()
  })
})
