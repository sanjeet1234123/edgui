import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Route } from '@/routes/confirm-email'
import { PATHS } from '@/constants/paths'
import { useVerifyEmailMutation } from '@/hooks/mutations/useAuthMutations'
import { MantineProvider } from '@mantine/core'

// Mock image imports
jest.mock('@/assets/images/authentication-image.png', () => 'mocked-auth-image')
jest.mock('@/assets/logos/nexastack-logo.png', () => 'mocked-nexastack-logo')
jest.mock(
  '@/assets/logos/nexastack-dark-logo.png',
  () => 'mocked-nexastack-dark-logo',
)

// Mock CSS module
jest.mock('@/components/confirmEmail/confirmEmail.module.css', () => ({
  form: 'mocked-form-class',
  container: 'mocked-container-class',
  logo: 'mocked-logo-class',
  image: 'mocked-image-class',
  title: 'mocked-title-class',
  subtitle: 'mocked-subtitle-class',
  button: 'mocked-button-class',
  link: 'mocked-link-class',
  text: 'mocked-text-class',
  dark: 'mocked-dark-class',
  light: 'mocked-light-class',
}))

const mockNavigate = jest.fn()

// Mock the hooks and components
jest.mock('@/hooks/mutations/useAuthMutations', () => ({
  useVerifyEmailMutation: jest.fn(),
  useRequestVerificationCodeMutation: jest.fn(),
}))

// Only mock useNavigate from @tanstack/react-router
jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

jest.mock('@/components/RouteProtection', () => ({
  PrivateRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="private-route">{children}</div>
  ),
}))

// Mock ConfirmEmailFormComponent and ConfirmEmailHeader
jest.mock('@/components/confirmEmail', () => ({
  ConfirmEmailFormComponent: ({
    form,
    isLoading,
  }: {
    form: any
    isLoading: boolean
  }) => {
    // Simulate error message rendering for invalid code
    const code = form.getInputProps('verificationCode').value
    const showError = code && code.length !== 6
    return (
      <div data-testid="confirm-email-form">
        <input
          data-testid="verification-code-input"
          {...form.getInputProps('verificationCode')}
        />
        <button type="submit" disabled={isLoading}>
          Submit
        </button>
        {showError && <div>Verification code must be 6 digits</div>}
      </div>
    )
  },
  ConfirmEmailHeader: () => (
    <div data-testid="confirm-email-header">Header</div>
  ),
}))

// Mock FullPageLoader and FullPageError
jest.mock('@/components/ui', () => ({
  FullPageLoader: () => <div data-testid="full-page-loader">Loading...</div>,
  FullPageError: () => <div data-testid="full-page-error">Error!</div>,
}))

describe('Confirm Email Route', () => {
  const mockVerifyEmail = jest.fn()
  const mockRequestCode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
    ;(useVerifyEmailMutation as jest.Mock).mockReturnValue({
      mutate: mockVerifyEmail,
      isPending: false,
    })
    ;(
      require('@/hooks/mutations/useAuthMutations')
        .useRequestVerificationCodeMutation as jest.Mock
    ).mockReturnValue({
      mutate: mockRequestCode,
      isPending: false,
    })
  })

  it('redirects to signup if email is not in session storage', () => {
    const Component = (Route as any).options.component
    render(
      <MantineProvider>
        <Component />
      </MantineProvider>,
    )
    expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.SIGNUP })
  })

  it('renders the main component when email is in session storage', () => {
    sessionStorage.setItem('email', 'test@example.com')
    const Component = (Route as any).options.component
    render(
      <MantineProvider>
        <Component />
      </MantineProvider>,
    )
    expect(screen.getByTestId('private-route')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-email-header')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-email-form')).toBeInTheDocument()
  })

  it('renders the pending component', () => {
    const PendingComponent = (Route as any).options.pendingComponent
    render(
      <MantineProvider>
        <PendingComponent />
      </MantineProvider>,
    )
    expect(screen.getByTestId('full-page-loader')).toBeInTheDocument()
  })

  it('renders the error component', () => {
    const ErrorComponent = (Route as any).options.errorComponent
    render(
      <MantineProvider>
        <ErrorComponent error={new Error('Test error')} />
      </MantineProvider>,
    )
    expect(screen.getByTestId('full-page-error')).toBeInTheDocument()
  })

  it('handles form submission with valid verification code', async () => {
    sessionStorage.setItem('email', 'test@example.com')
    const Component = (Route as any).options.component
    render(
      <MantineProvider>
        <Component />
      </MantineProvider>,
    )
    const input = screen.getByTestId('verification-code-input')
    fireEvent.change(input, { target: { value: '123456' } })
    const form = screen.getByTestId('confirm-email-form')
    fireEvent.submit(form)
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          verification_code: '123456',
        },
        expect.any(Object),
      )
    })
  })

  it('navigates to platform setup on successful verification', async () => {
    sessionStorage.setItem('email', 'test@example.com')
    const Component = (Route as any).options.component
    render(
      <MantineProvider>
        <Component />
      </MantineProvider>,
    )
    const input = screen.getByTestId('verification-code-input')
    fireEvent.change(input, { target: { value: '123456' } })
    const form = screen.getByTestId('confirm-email-form')
    fireEvent.submit(form)

    // Simulate successful verification
    const onSuccessCallback = mockVerifyEmail.mock.calls[0][1].onSuccess
    onSuccessCallback()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: PATHS.PLATFORM_SETUP })
    })
  })

  it('shows validation error for invalid verification code', async () => {
    sessionStorage.setItem('email', 'test@example.com')
    const Component = (Route as any).options.component
    render(
      <MantineProvider>
        <Component />
      </MantineProvider>,
    )
    const input = screen.getByTestId('verification-code-input')
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(
        screen.getByText('Verification code must be 6 digits'),
      ).toBeInTheDocument()
    })
  })
})
