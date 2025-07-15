// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import LoginFormComponent from '@/components/login/LoginFormComponent'
import { MantineProvider } from '@mantine/core'

// Mock the Link component from @tanstack/react-router
jest.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: { children: React.ReactNode, to: string, className?: string }) => (
    <a href={to} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}))

// Mock CSS modules
jest.mock('@/components/login/login.module.css', () => ({
  workspaceGroup: 'workspaceGroup-class',
  workspaceInput: 'workspaceInput-class',
  exampleUrl: 'exampleUrl-class',
  forgotWorkspace: 'forgotWorkspace-class',
  checkboxLabel: 'checkboxLabel-class',
  forgotPassword: 'forgotPassword-class',
}))

// Create a custom render function that wraps components with MantineProvider
const customRender = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  )
}

describe('LoginFormComponent', () => {
  // Mock form
  const mockForm = {
    getInputProps: jest.fn().mockReturnValue({
      onChange: jest.fn(),
      value: '',
    }),
    values: {
      email: 'test@example.com',
      workspace: 'testworkspace',
      password: 'password123',
      rememberMe: false,
    },
  }

  it('renders all form elements', () => {
    customRender(<LoginFormComponent form={mockForm as any} isLoading={false} />)
    
    // Check if workspace input is rendered
    expect(screen.getByText(/Enter your workspace's team URL/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter workspace URL')).toBeInTheDocument()
    expect(screen.getByText('.nexastack.neuralcompany.work')).toBeInTheDocument()
    
    // Check if email input is rendered
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    
    // Check if password input is rendered
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    
    // Check if remember me switch is rendered
    expect(screen.getByText('Remember me')).toBeInTheDocument()
    
    // Check if login button is rendered
    expect(screen.getByText('Login to Platform')).toBeInTheDocument()
  })

  it('renders forgot workspace link correctly', () => {
    customRender(<LoginFormComponent form={mockForm as any} isLoading={false} />)
    
    const forgotWorkspaceLink = screen.getByText('Forgot your workspace team URL?')
    expect(forgotWorkspaceLink).toBeInTheDocument()
    expect(forgotWorkspaceLink.getAttribute('href')).toContain('?email=test@example.com')
  })

  it('renders forgot password link correctly', () => {
    customRender(<LoginFormComponent form={mockForm as any} isLoading={false} />)
    
    const forgotPasswordLink = screen.getByText('Forgot Password?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink.getAttribute('href')).toContain('?email=test@example.com')
  })

  it('shows loading state when isLoading is true', () => {
    customRender(<LoginFormComponent form={mockForm as any} isLoading={true} />)
    
    const loginButton = screen.getByRole('button', { name: /login to platform/i })
    expect(loginButton).toHaveAttribute('disabled', '')
    // The Mantine Button component sets a 'data-loading' attribute when in loading state
    expect(loginButton).toHaveAttribute('data-loading', 'true')
  })

  it('calls form.getInputProps for each form field', () => {
    customRender(<LoginFormComponent form={mockForm as any} isLoading={false} />)
    
    expect(mockForm.getInputProps).toHaveBeenCalledWith('workspace')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('email')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('password')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('rememberMe', { type: 'checkbox' })
  })
}) 