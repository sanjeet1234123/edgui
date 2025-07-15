// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ForgetPasswordFormComponent from '@/components/forgetPassword/ForgetPasswordFormComponent'
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
jest.mock('@/components/forgetPassword/forgetPassword.module.css', () => ({
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

describe('ForgetPasswordFormComponent', () => {
  // Mock form
  const mockForm = {
    getInputProps: jest.fn().mockReturnValue({
      onChange: jest.fn(),
      value: '',
    }),
    values: {
      email: 'test@example.com',
    },
  }

  it('renders the email input field correctly', () => {
    customRender(<ForgetPasswordFormComponent form={mockForm as any} isLoading={false} />)
    
    expect(screen.getByText('Please enter the email to receive verification code')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('renders the Reset Password button correctly', () => {
    customRender(<ForgetPasswordFormComponent form={mockForm as any} isLoading={false} />)
    
    const resetButton = screen.getByRole('button', { name: /reset password/i })
    expect(resetButton).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    customRender(<ForgetPasswordFormComponent form={mockForm as any} isLoading={true} />)
    
    const resetButton = screen.getByRole('button', { name: /reset password/i })
    expect(resetButton).toHaveAttribute('disabled', '')
    expect(resetButton).toHaveAttribute('data-loading', 'true')
  })

  it('renders the back to login link correctly', () => {
    customRender(<ForgetPasswordFormComponent form={mockForm as any} isLoading={false} />)
    
    const loginLink = screen.getByText('Login')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', PATHS.LOGIN)
  })

  it('calls form.getInputProps for email field', () => {
    customRender(<ForgetPasswordFormComponent form={mockForm as any} isLoading={false} />)
    
    expect(mockForm.getInputProps).toHaveBeenCalledWith('email')
  })
}) 