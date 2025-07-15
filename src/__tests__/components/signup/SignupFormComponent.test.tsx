// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SignupFormComponent from '@/components/signup/SignupFormComponent'
import { MantineProvider } from '@mantine/core'

// Mock CSS modules
jest.mock('@/components/signup/signup.module.css', () => ({
  checkboxLabel: 'checkboxLabel-class',
}))

// Create a custom render function that wraps components with MantineProvider
const customRender = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  )
}

describe('SignupFormComponent', () => {
  // Mock form
  const mockForm = {
    getInputProps: jest.fn().mockReturnValue({
      onChange: jest.fn(),
      value: '',
    }),
    values: {
      name: 'Test User',
      email: 'test@example.com',
      contact: '1234567890',
      password: 'password123',
      email_subscribed: false,
    },
  }

  it('renders all form elements', () => {
    customRender(<SignupFormComponent form={mockForm as any} isLoading={false} />)
    
    // Check if name input is rendered
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    
    // Check if email input is rendered
    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    
    // Check if phone input is rendered
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument()
    
    // Check if password input is rendered
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    
    // Check if newsletter switch is rendered
    expect(screen.getByText('Subscribe to newsletter')).toBeInTheDocument()
    
    // Check if signup button is rendered
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    customRender(<SignupFormComponent form={mockForm as any} isLoading={true} />)
    
    const signupButton = screen.getByRole('button', { name: /create account/i })
    expect(signupButton).toHaveAttribute('disabled', '')
    expect(signupButton).toHaveAttribute('data-loading', 'true')
  })

  it('calls form.getInputProps for each form field', () => {
    customRender(<SignupFormComponent form={mockForm as any} isLoading={false} />)
    
    expect(mockForm.getInputProps).toHaveBeenCalledWith('name')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('email')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('contact')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('password')
    expect(mockForm.getInputProps).toHaveBeenCalledWith('email_subscribed', { type: 'checkbox' })
  })
}) 