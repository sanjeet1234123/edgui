// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ProjectMemberRegistrationFooter from '@/components/projectMemberRegistration/ProjectMemberRegistrationFooter'
import { PATHS } from '@/constants/paths'
import { MantineProvider } from '@mantine/core'

// Mock the Link component from @tanstack/react-router
jest.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className, viewTransition }) => (
    <a
      href={to}
      className={className}
      data-testid="mock-link"
      data-view-transition={viewTransition}
    >
      {children}
    </a>
  ),
}))

// Helper function to render with MantineProvider
const customRender = ui => {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

describe('ProjectMemberRegistrationFooter', () => {
  it('renders the footer text correctly', () => {
    customRender(<ProjectMemberRegistrationFooter />)

    expect(screen.getByText(/Already registered\?/i)).toBeInTheDocument()
  })

  it('renders the login link with correct path', () => {
    customRender(<ProjectMemberRegistrationFooter />)

    const loginLink = screen.getByText('Login here')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', PATHS.LOGIN)
  })

  it('applies view transition to login link', () => {
    customRender(<ProjectMemberRegistrationFooter />)

    const loginLink = screen.getByText('Login here')
    expect(loginLink.closest('a')).toHaveAttribute(
      'data-view-transition',
      'true',
    )
  })

  it('applies the correct CSS classes', () => {
    customRender(<ProjectMemberRegistrationFooter />)

    expect(screen.getByText(/Already registered\?/i)).toHaveClass('accountText')
    expect(screen.getByText('Login here').closest('a')).toHaveClass('linkText')
  })
})
