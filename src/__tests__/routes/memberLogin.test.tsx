// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { PATHS } from '@/constants/paths'
import type { ReactNode } from 'react'

// Mock CSS modules
jest.mock('@/components/memberLogin/memberLogin.module.css', () => ({
  form: 'form-class',
}))

// Mock the components
jest.mock('@/components/authContainer/authContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-container">{children}</div>
  ),
}))

jest.mock('@/components/memberLogin', () => ({
  MemberLoginHeader: () => (
    <div data-testid="member-login-header">Member Login Header</div>
  ),
  MemberLoginFormComponent: ({ form, isLoading }) => (
    <div data-testid="member-login-form">
      <input data-testid="email-input" placeholder="Email" />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
      />
      <div data-testid="member-login-loading">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  ),
  MemberLoginBottomNavigation: () => (
    <div data-testid="member-login-bottom-nav">Bottom Navigation</div>
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
let mockUseSearch = () => ({ ws: 'test-workspace' })
jest.mock('@tanstack/react-router', () => {
  return {
    useNavigate: jest.fn(() => jest.fn()),
    createFileRoute: jest.fn(route => routeConfig => ({
      ...routeConfig,
      useSearch: () => mockUseSearch(),
    })),
  }
})

// Mock useForm and zodResolver
jest.mock('@mantine/form', () => ({
  useForm: jest.fn(() => ({
    getInputProps: jest.fn(() => ({})),
    onSubmit: jest.fn(fn => fn),
    values: {
      email: '',
      password: '',
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
const mockMemberLogin = jest.fn()
jest.mock('@/hooks/mutations/useMemberInvitationMutations', () => ({
  useMemberLoginMutation: () => ({
    mutate: mockMemberLogin,
    isPending: false,
  }),
}))

// Import components and hooks after all mocks are set up
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'

// Import Route after all mocks are set up
import { Route } from '@/routes/member-login'

describe('Member Login Route', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorageMock.clear()
    useNavigate.mockReturnValue(mockNavigate)
    mockUseSearch = () => ({ ws: 'test-workspace' })
  })

  it('should redirect to login if no workspace is provided', () => {
    // Mock the route to return no workspace
    mockUseSearch = () => ({ ws: undefined })

    const { container } = render(<Route.component />)
    // Should render nothing
    expect(container.firstChild).toBeNull()
    // Should navigate to login
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.LOGIN })
  })

  it('should set workspace in session storage when provided', () => {
    render(<Route.component />)
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'member_workspace',
      'test-workspace',
    )
  })

  it('should render member login form when workspace is provided', () => {
    render(<Route.component />)
    expect(screen.getByTestId('auth-container')).toBeInTheDocument()
    expect(screen.getByTestId('member-login-header')).toBeInTheDocument()
    expect(screen.getByTestId('member-login-form')).toBeInTheDocument()
    expect(screen.getByTestId('member-login-bottom-nav')).toBeInTheDocument()
  })

  it('should handle form submission with valid credentials', () => {
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        email: 'test@example.com',
        password: 'password123',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(screen.getByTestId('member-login-form').closest('form'))

    expect(mockMemberLogin).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        password: 'password123',
        workspace: 'test-workspace',
      },
      expect.any(Object),
    )
  })

  it('should show loading state during form submission', () => {
    jest
      .spyOn(
        require('@/hooks/mutations/useMemberInvitationMutations'),
        'useMemberLoginMutation',
      )
      .mockReturnValue({
        mutate: mockMemberLogin,
        isPending: true,
      })

    render(<Route.component />)
    expect(screen.getByTestId('member-login-loading')).toHaveTextContent(
      'Loading',
    )
  })

  it('should navigate to marketplace and clear session storage on successful login', () => {
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        email: 'test@example.com',
        password: 'password123',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(screen.getByTestId('member-login-form').closest('form'))

    // Simulate successful login
    const onSuccessCallback = mockMemberLogin.mock.calls[0][1].onSuccess
    onSuccessCallback()

    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.MARKETPLACE })
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
      'member_workspace',
    )
  })

  it('should not submit form if no workspace is provided', () => {
    // Mock the route to return no workspace
    mockUseSearch = () => ({ ws: undefined })

    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        email: 'test@example.com',
        password: 'password123',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    const { queryByTestId } = render(<Route.component />)

    // The form should not be rendered
    expect(queryByTestId('member-login-form')).not.toBeInTheDocument()
    expect(mockMemberLogin).not.toHaveBeenCalled()
  })
})
