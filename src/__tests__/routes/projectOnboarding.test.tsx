// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PATHS } from '@/constants/paths'
import type { ReactNode } from 'react'

// Mock CSS modules
jest.mock(
  '@/components/projectMemberRegistration/projectMemberRegistration.module.css',
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

jest.mock('@/components/projectMemberRegistration', () => ({
  ProjectMemberRegistrationHeader: () => (
    <div data-testid="project-registration-header">
      Project Registration Header
    </div>
  ),
  ProjectMemberRegistrationFormComponent: ({ form, isLoading }) => (
    <div data-testid="project-registration-form">
      <input data-testid="email-input" placeholder="Email" />
      <input
        data-testid="password-input"
        type="password"
        placeholder="Password"
      />
      <div data-testid="project-registration-loading">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  ),
  ProjectMemberRegistrationFooter: () => (
    <div data-testid="project-registration-footer">Footer</div>
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
let mockUseSearch = () => ({
  ws: 'test-workspace',
  project_id: 'test-project',
  token: 'test-token',
})
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
const mockProjectMemberRegistration = jest.fn()
jest.mock('@/hooks/mutations/useMemberInvitationMutations', () => ({
  useProjectMemberRegistrationMutation: () => ({
    mutate: mockProjectMemberRegistration,
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
import { Route } from '@/routes/project-onboarding'

describe('Project Onboarding Route', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorageMock.clear()
    useNavigate.mockReturnValue(mockNavigate)
    mockUseSearch = () => ({
      ws: 'test-workspace',
      project_id: 'test-project',
      token: 'test-token',
    })
  })

  it('should redirect to login if any required parameter is missing', () => {
    // Mock the route to return missing parameters
    mockUseSearch = () => ({
      ws: undefined,
      project_id: 'test-project',
      token: 'test-token',
    })

    const { container } = render(<Route.component />)
    expect(container.firstChild).toBeNull()
    expect(showNotification).toHaveBeenCalledWith(
      'error',
      'Invalid registration link, please use the link sent to your email',
    )
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.LOGIN })
  })

  it('should set session storage items when all parameters are provided', () => {
    render(<Route.component />)
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'project_workspace',
      'test-workspace',
    )
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'project_id',
      'test-project',
    )
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'project_token',
      'test-token',
    )
  })

  it('should render project registration form when all parameters are provided', () => {
    render(<Route.component />)
    expect(screen.getByTestId('auth-container')).toBeInTheDocument()
    expect(
      screen.getByTestId('project-registration-header'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('project-registration-form')).toBeInTheDocument()
    expect(
      screen.getByTestId('project-registration-footer'),
    ).toBeInTheDocument()
  })

  it('should handle form submission with valid credentials', async () => {
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
    fireEvent.submit(
      screen.getByTestId('project-registration-form').closest('form'),
    )

    await waitFor(() => {
      expect(mockProjectMemberRegistration).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          password: 'password123',
          workspace: 'test-workspace',
          project_id: 'test-project',
          token: 'test-token',
        },
        expect.any(Object),
      )
    })
  })

  it('should show loading state during form submission', () => {
    jest
      .spyOn(
        require('@/hooks/mutations/useMemberInvitationMutations'),
        'useProjectMemberRegistrationMutation',
      )
      .mockReturnValue({
        mutate: mockProjectMemberRegistration,
        isPending: true,
      })

    render(<Route.component />)
    expect(
      screen.getByTestId('project-registration-loading'),
    ).toHaveTextContent('Loading')
  })

  it('should navigate to marketplace and clear session storage on successful registration', async () => {
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
    fireEvent.submit(
      screen.getByTestId('project-registration-form').closest('form'),
    )

    // Simulate successful registration
    const onSuccessCallback =
      mockProjectMemberRegistration.mock.calls[0][1].onSuccess
    onSuccessCallback()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.MARKETPLACE })
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        'project_workspace',
      )
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('project_id')
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        'project_token',
      )
    })
  })

  it('should not submit form if any required parameter is missing', () => {
    // Mock the route to return missing parameters
    mockUseSearch = () => ({
      ws: undefined,
      project_id: 'test-project',
      token: 'test-token',
    })

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
    expect(queryByTestId('project-registration-form')).not.toBeInTheDocument()
    expect(mockProjectMemberRegistration).not.toHaveBeenCalled()
  })

  it('should handle form validation errors', () => {
    const mockForm = {
      getInputProps: jest.fn(() => ({})),
      onSubmit: jest.fn(fn => e => {
        // Simulate validation error: do not call fn if there are errors
        const errors = mockForm.validate()
        if (Object.keys(errors).length === 0) {
          fn(mockForm.values)
        }
      }),
      values: {
        email: 'invalid-email',
        password: '',
      },
      validate: jest.fn(() => ({
        email: 'Invalid email',
        password: 'Password is required',
      })),
      errors: {
        email: 'Invalid email',
        password: 'Password is required',
      },
      submitting: false,
      initialized: true,
    }
    useForm.mockReturnValue(mockForm)

    render(<Route.component />)

    // Simulate form submission
    fireEvent.submit(
      screen.getByTestId('project-registration-form').closest('form'),
    )

    expect(mockProjectMemberRegistration).not.toHaveBeenCalled()
  })
})
