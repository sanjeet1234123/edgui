// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ForgetWorkspaceFormComponent from '@/components/forgetWorkspace/ForgetWorkspaceFormComponent'
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
jest.mock('@/components/forgetWorkspace/forgetWorkspace.module.css', () => ({
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

describe('ForgetWorkspaceFormComponent', () => {
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
    customRender(<ForgetWorkspaceFormComponent form={mockForm as any} isLoading={false} />)
    
    expect(screen.getByText('Please enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('renders the Send Me Instructions button correctly', () => {
    customRender(<ForgetWorkspaceFormComponent form={mockForm as any} isLoading={false} />)
    
    const instructionsButton = screen.getByRole('button', { name: /send me instructions/i })
    expect(instructionsButton).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    customRender(<ForgetWorkspaceFormComponent form={mockForm as any} isLoading={true} />)
    
    const instructionsButton = screen.getByRole('button', { name: /send me instructions/i })
    expect(instructionsButton).toHaveAttribute('disabled', '')
    expect(instructionsButton).toHaveAttribute('data-loading', 'true')
  })

  it('renders the back to login link correctly', () => {
    customRender(<ForgetWorkspaceFormComponent form={mockForm as any} isLoading={false} />)
    
    const loginLink = screen.getByText('Login')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', PATHS.LOGIN)
  })

  it('calls form.getInputProps for email field', () => {
    customRender(<ForgetWorkspaceFormComponent form={mockForm as any} isLoading={false} />)
    
    expect(mockForm.getInputProps).toHaveBeenCalledWith('email')
  })
}) 