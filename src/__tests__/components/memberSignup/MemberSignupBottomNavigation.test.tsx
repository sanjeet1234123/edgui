/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberSignupBottomNavigation from '@/components/memberSignup/MemberSignupBottomNavigation'

// Mock the CSS module
jest.mock('@/components/memberSignup/memberSignup.module.css', () => ({
  accountText: 'accountText-class',
  linkText: 'linkText-class',
}))

// Mock the paths constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    MEMBER_LOGIN: '/member-login',
    SIGNUP: '/signup',
  },
}))

// Mock the react-router Link component
jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, className, children, viewTransition, search }) => (
    <a
      href={to}
      className={className}
      data-testid="link"
      data-view-transition={viewTransition}
      data-search={search ? JSON.stringify(search) : undefined}
    >
      {children}
    </a>
  ),
}))

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Text: ({ size, className, children }) => (
    <p data-testid="text" data-size={size} className={className}>
      {children}
    </p>
  ),
}))

describe('MemberSignupBottomNavigation', () => {
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

  it('renders the component with login link and signup link', () => {
    render(<MemberSignupBottomNavigation />)

    // Check that the text elements are present
    expect(screen.getByText(/Already have an account?/)).toBeInTheDocument()
    expect(
      screen.getByText(/Want to signup to another workspace?/),
    ).toBeInTheDocument()

    // Check login link is present with correct workspace name in search params
    const loginLink = screen.getByText('Login here')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/member-login')
    expect(loginLink.closest('a')).toHaveAttribute(
      'data-view-transition',
      'true',
    )
    expect(loginLink.closest('a')).toHaveClass('linkText')
    expect(loginLink.closest('a')).toHaveAttribute(
      'data-search',
      '{"ws":"TestWorkspace"}',
    )

    // Check signup link is present
    const signupLink = screen.getByText('Signup here')
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
    expect(signupLink.closest('a')).toHaveAttribute(
      'data-view-transition',
      'true',
    )
    expect(signupLink.closest('a')).toHaveClass('linkText')
    expect(signupLink.closest('a')).not.toHaveAttribute('data-search')
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberSignupBottomNavigation />)

    // Check search params with null workspace name
    const loginLink = screen.getByText('Login here')
    expect(loginLink.closest('a')).toHaveAttribute('data-search', '{"ws":null}')
  })
})
