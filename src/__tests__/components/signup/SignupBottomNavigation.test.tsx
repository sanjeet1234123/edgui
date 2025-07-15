// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SignupBottomNavigation from '@/components/signup/SignupBottomNavigation'
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
    LOGIN: '/login',
  },
}))

// Mock CSS modules
jest.mock('@/components/signup/signup.module.css', () => ({
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

describe('SignupBottomNavigation', () => {
  it('renders login link correctly', () => {
    customRender(<SignupBottomNavigation />)
    
    const loginLink = screen.getByText('Login to Platform')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', PATHS.LOGIN)
  })

  it('renders text content correctly', () => {
    customRender(<SignupBottomNavigation />)
    
    expect(screen.getByText(/Already have an Account\?/i)).toBeInTheDocument()
  })
}) 