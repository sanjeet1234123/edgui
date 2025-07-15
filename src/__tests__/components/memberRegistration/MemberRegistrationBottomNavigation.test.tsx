/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberRegistrationBottomNavigation from '@/components/memberRegistration/MemberRegistrationBottomNavigation'

// Mock the CSS module
jest.mock(
  '@/components/memberRegistration/memberRegistration.module.css',
  () => ({
    accountText: 'accountText-class',
    linkText: 'linkText-class',
  }),
)

// Mock the paths constant
jest.mock('@/constants/paths', () => ({
  PATHS: {
    MEMBER_LOGIN: '/member-login',
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
      data-search={JSON.stringify(search)}
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

describe('MemberRegistrationBottomNavigation', () => {
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

  it('renders the component with login link', () => {
    render(<MemberRegistrationBottomNavigation />)

    // Check that the text is present
    expect(screen.getByText(/Already registered?/)).toBeInTheDocument()

    // Check login link is present
    const loginLink = screen.getByText('Login here')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/member-login')
    expect(loginLink.closest('a')).toHaveAttribute(
      'data-view-transition',
      'true',
    )
    expect(loginLink.closest('a')).toHaveClass('linkText')

    // Check search params with workspace name
    expect(loginLink.closest('a')).toHaveAttribute(
      'data-search',
      '{"ws":"TestWorkspace"}',
    )
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberRegistrationBottomNavigation />)

    // Check search params with null workspace name
    const loginLink = screen.getByText('Login here')
    expect(loginLink.closest('a')).toHaveAttribute('data-search', '{"ws":null}')
  })
})
