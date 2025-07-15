// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PATHS } from '@/constants/paths'
import type { ReactNode } from 'react'

// Mock CSS modules
jest.mock('@/components/memberSignup/memberSignup.module.css', () => ({
  form: 'form-class',
}))

// Mock the components
jest.mock('@/components/authContainer/authContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-container">{children}</div>
  ),
}))

jest.mock('@/components/memberSignup', () => ({
  MemberSignupHeader: ({ signupSuccess }) => (
    <div data-testid="member-signup-header">
      {signupSuccess ? 'Success' : 'Sign Up'}
    </div>
  ),
  MemberSignupFormComponent: ({ form, isLoading }) => (
    <div data-testid="member-signup-form">
      <input data-testid="email-input" placeholder="Email" />
      <div data-testid="member-signup-loading">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  ),
  MemberSignupBottomNavigation: () => (
    <div data-testid="member-signup-bottom-nav">Bottom Navigation</div>
  ),
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
  createFileRoute: jest.fn(route => routeConfig => routeConfig),
}))

// Mock useForm and zodResolver
jest.mock('@mantine/form', () => ({
  useForm: jest.fn(() => ({
    getInputProps: jest.fn(() => ({})),
    onSubmit: jest.fn(fn => fn),
    values: {
      email: '',
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

// Mock the auth mutations
const mockMemberSignup = jest.fn()
jest.mock('@/hooks/mutations/useMemberInvitationMutations', () => ({
  useMemberSignupMutation: () => ({
    mutate: mockMemberSignup,
    isPending: false,
  }),
}))

// Import components and hooks after all mocks are set up
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'

// Import Route after all mocks are set up
import { Route } from '@/routes/member-signup'

describe('Member Signup Route', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorageMock.clear()
    useNavigate.mockReturnValue(mockNavigate)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should redirect to signup if no workspace is provided', () => {
    render(<Route.component />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.SIGNUP })
  })

  it('should render member signup form when workspace is provided', () => {
    sessionStorageMock.getItem.mockReturnValue('test-workspace')
    render(<Route.component />)
    expect(screen.getByTestId('auth-container')).toBeInTheDocument()
    expect(screen.getByTestId('member-signup-header')).toBeInTheDocument()
    expect(screen.getByTestId('member-signup-form')).toBeInTheDocument()
    expect(screen.getByTestId('member-signup-bottom-nav')).toBeInTheDocument()
  })

  it('should handle form submission with valid email', () => {
    sessionStorageMock.getItem.mockReturnValue('test-workspace')
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        email: 'test@example.com',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(screen.getByTestId('member-signup-form').closest('form'))

    expect(mockMemberSignup).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        workspace: 'test-workspace',
      },
      expect.any(Object),
    )
  })

  it('should show loading state during form submission', () => {
    sessionStorageMock.getItem.mockReturnValue('test-workspace')
    jest
      .spyOn(
        require('@/hooks/mutations/useMemberInvitationMutations'),
        'useMemberSignupMutation',
      )
      .mockReturnValue({
        mutate: mockMemberSignup,
        isPending: true,
      })

    render(<Route.component />)
    expect(screen.getByTestId('member-signup-loading')).toHaveTextContent(
      'Loading',
    )
  })

  it('should show success message and redirect to login after successful signup', async () => {
    sessionStorageMock.getItem.mockReturnValue('test-workspace')
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        email: 'test@example.com',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(screen.getByTestId('member-signup-form').closest('form'))

    // Simulate successful signup
    await act(async () => {
      const onSuccessCallback = mockMemberSignup.mock.calls[0][1].onSuccess
      onSuccessCallback()
    })

    // Check success message
    expect(screen.getByTestId('member-signup-header')).toHaveTextContent(
      'Success',
    )

    // Fast-forward timers
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.LOGIN })
  })

  it('should not submit form if no workspace is provided', () => {
    sessionStorageMock.getItem.mockReturnValue(null)
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        email: 'test@example.com',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    const { container } = render(<Route.component />)

    // The component should not render anything
    expect(container.firstChild).toBeNull()
    expect(mockMemberSignup).not.toHaveBeenCalled()
  })
})
