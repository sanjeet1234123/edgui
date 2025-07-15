// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import LoginBottomNavigation from '@/components/login/LoginBottomNavigation'
import { PATHS } from '@/constants/paths'
import { MantineProvider } from '@mantine/core'

// Mock the Link component from @tanstack/react-router
jest.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: { children: React.ReactNode, to: string, className?: string }) => (
    <a href={to} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}))

// Mock constants
jest.mock('@/constants/paths', () => ({
  PATHS: {
    SIGNUP: '/signup',
    FORGOT_WORKSPACE: '/forgot-workspace',
  },
}))

// Mock CSS modules
jest.mock('@/components/login/login.module.css', () => ({
  accountText: 'accountText-class',
  linkText: 'linkText-class',
}))

// Create a custom render function that wraps components with MantineProvider
const customRender = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  )
}

describe('LoginBottomNavigation', () => {
  // Mock form
  const mockForm = {
    values: {
      email: 'test@example.com',
    },
  }

  const emptyEmailMockForm = {
    values: {
      email: '',
    },
  }

  it('renders signup link correctly', () => {
    customRender(<LoginBottomNavigation form={mockForm as any} />)
    
    const signupLink = screen.getByText('Signup to Platform')
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', PATHS.SIGNUP)
  })

  it('renders create workspace link correctly with email parameter when email exists', () => {
    customRender(<LoginBottomNavigation form={mockForm as any} />)
    
    const createWorkspaceLink = screen.getByText('Create workspace')
    expect(createWorkspaceLink).toBeInTheDocument()
    expect(createWorkspaceLink.closest('a')).toHaveAttribute('href', `${PATHS.FORGOT_WORKSPACE}?email=test@example.com`)
  })

  it('renders create workspace link correctly without email parameter when email is empty', () => {
    customRender(<LoginBottomNavigation form={emptyEmailMockForm as any} />)
    
    const createWorkspaceLink = screen.getByText('Create workspace')
    expect(createWorkspaceLink).toBeInTheDocument()
    expect(createWorkspaceLink.closest('a')).toHaveAttribute('href', PATHS.FORGOT_WORKSPACE)
  })

  it('renders all text content correctly', () => {
    customRender(<LoginBottomNavigation form={mockForm as any} />)
    
    expect(screen.getByText('Do not have an Account?')).toBeInTheDocument()
    expect(screen.getByText('Already have an account but not workspace?')).toBeInTheDocument()
  })
}) 