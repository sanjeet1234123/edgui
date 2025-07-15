// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberLoginBottomNavigation from '@/components/memberLogin/MemberLoginBottomNavigation'

// Mock the CSS module
jest.mock('@/components/memberLogin/memberLogin.module.css', () => ({
  accountText: 'accountText-class',
  linkText: 'linkText-class',
}))

// Mock the paths constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    MEMBER_SIGNUP: '/member-signup',
    LOGIN: '/login',
  },
}))

// Mock the react-router Link component
jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, className, children, viewTransition }) => (
    <a
      href={to}
      className={className}
      data-testid="link"
      data-view-transition={viewTransition}
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

describe('MemberLoginBottomNavigation', () => {
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

  it('renders the component with signup and login links', () => {
    render(<MemberLoginBottomNavigation />)

    // Check signup text is present
    expect(screen.getByText(/Do not have an Account?/)).toBeInTheDocument()

    // Check signup link is present with correct workspace name
    const signupLink = screen.getByText(/Signup to TestWorkspace workspace/)
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', '/member-signup')
    expect(signupLink.closest('a')).toHaveAttribute(
      'data-view-transition',
      'true',
    )
    expect(signupLink.closest('a')).toHaveClass('linkText')

    // Check login text is present
    expect(
      screen.getByText(/Want to login to another workspace?/),
    ).toBeInTheDocument()

    // Check login link is present
    const loginLink = screen.getByText('Click here')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
    expect(loginLink.closest('a')).toHaveAttribute(
      'data-view-transition',
      'true',
    )
    expect(loginLink.closest('a')).toHaveClass('linkText')
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberLoginBottomNavigation />)

    // Should still render but with just "workspace" text
    const signupLink = screen.getByText('Signup to workspace')
    expect(signupLink).toBeInTheDocument()
  })
})
