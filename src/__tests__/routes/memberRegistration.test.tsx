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
jest.mock(
  '@/components/memberRegistration/memberRegistration.module.css',
  () => ({
    form: 'form-class',
  }),
)

// Mock the components
jest.mock('@/components/authContainer/authContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-container">{children}</div>
  ),
}))

jest.mock('@/components/memberRegistration', () => ({
  MemberRegistrationHeader: () => (
    <div data-testid="member-registration-header">
      Member Registration Header
    </div>
  ),
  MemberRegistrationFormComponent: ({ form, isLoading }) => (
    <div data-testid="member-registration-form">
      <input data-testid="name-input" placeholder="Name" />
      <input data-testid="contact-input" placeholder="Contact" />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
      />
      <input
        data-testid="confirm-password-input"
        type="password"
        placeholder="Confirm Password"
      />
      <div data-testid="member-registration-loading">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  ),
  MemberRegistrationBottomNavigation: () => (
    <div data-testid="member-registration-bottom-nav">Bottom Navigation</div>
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
let mockUseSearch = () => ({ ws: 'test-workspace', token: 'test-token' })
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
      name: '',
      contact: '',
      password: '',
      confirm_password: '',
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
const mockMemberRegistration = jest.fn()
jest.mock('@/hooks/mutations/useMemberInvitationMutations', () => ({
  useMemberRegistrationMutation: () => ({
    mutate: mockMemberRegistration,
    isPending: false,
  }),
}))

// Mock notification
jest.mock('@/utils/notification', () => ({
  showNotification: jest.fn(),
}))

// Import components and hooks after all mocks are set up
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { showNotification } from '@/utils/notification'

// Import Route after all mocks are set up
import { Route } from '@/routes/member-registration'

describe('Member Registration Route', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorageMock.clear()
    useNavigate.mockReturnValue(mockNavigate)
    mockUseSearch = () => ({ ws: 'test-workspace', token: 'test-token' })
  })

  it('should redirect to login if no workspace or token is provided', () => {
    // Mock the route to return no workspace and token
    mockUseSearch = () => ({ ws: undefined, token: undefined })

    const { container } = render(<Route.component />)
    // Should render nothing
    expect(container.firstChild).toBeNull()
    // Should show error notification
    expect(showNotification).toHaveBeenCalledWith(
      'error',
      'Invalid registration link, please use the link sent to your email',
    )
    // Should navigate to login
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.LOGIN })
  })

  it('should set workspace and token in session storage when provided', () => {
    render(<Route.component />)
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'member_workspace',
      'test-workspace',
    )
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'member_token',
      'test-token',
    )
  })

  it('should render member registration form when workspace and token are provided', () => {
    render(<Route.component />)
    expect(screen.getByTestId('auth-container')).toBeInTheDocument()
    expect(screen.getByTestId('member-registration-header')).toBeInTheDocument()
    expect(screen.getByTestId('member-registration-form')).toBeInTheDocument()
    expect(
      screen.getByTestId('member-registration-bottom-nav'),
    ).toBeInTheDocument()
  })

  it('should handle form submission with valid data', () => {
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        name: 'Test User',
        contact: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(
      screen.getByTestId('member-registration-form').closest('form'),
    )

    expect(mockMemberRegistration).toHaveBeenCalledWith(
      {
        name: 'Test User',
        contact: 'test@example.com',
        password: 'password123',
        token: 'test-token',
        workspace: 'test-workspace',
      },
      expect.any(Object),
    )
  })

  it('should show loading state during form submission', () => {
    jest
      .spyOn(
        require('@/hooks/mutations/useMemberInvitationMutations'),
        'useMemberRegistrationMutation',
      )
      .mockReturnValue({
        mutate: mockMemberRegistration,
        isPending: true,
      })

    render(<Route.component />)
    expect(screen.getByTestId('member-registration-loading')).toHaveTextContent(
      'Loading',
    )
  })

  it('should navigate to login and clear session storage on successful registration', () => {
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        name: 'Test User',
        contact: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(
      screen.getByTestId('member-registration-form').closest('form'),
    )

    // Simulate successful registration
    const onSuccessCallback = mockMemberRegistration.mock.calls[0][1].onSuccess
    onSuccessCallback()

    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.LOGIN })
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
      'member_workspace',
    )
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('member_token')
  })

  it('should not submit form if no workspace or token is provided', () => {
    // Mock the route to return no workspace and token
    mockUseSearch = () => ({ ws: undefined, token: undefined })

    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => fn(mockForm.values)),
      values: {
        name: 'Test User',
        contact: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      },
      validate: jest.fn(() => ({})),
      errors: {},
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    const { queryByTestId } = render(<Route.component />)

    // The form should not be rendered
    expect(queryByTestId('member-registration-form')).not.toBeInTheDocument()
    expect(mockMemberRegistration).not.toHaveBeenCalled()
  })
})
