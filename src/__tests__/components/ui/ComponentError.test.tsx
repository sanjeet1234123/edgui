// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ComponentError from '@/components/ui/componentError'
import type { ReactNode } from 'react'

// Mock the ErrorComponentProps from @tanstack/react-router
// This is just for the test and doesn't need to match the exact implementation
jest.mock('@tanstack/react-router', () => ({
  // We don't need to implement anything here
}))

// Define types for mocked components
type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: string;
}

type StackProps = {
  children: ReactNode;
  align?: string;
  justify?: string;
  h?: string;
  className?: string;
}

type TextProps = {
  children: ReactNode;
  c?: string;
}

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconAlertCircle: () => <div data-testid="alert-icon">Alert Icon</div>
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Button: ({ children, onClick, variant }: ButtonProps) => (
    <button data-testid="retry-button" onClick={onClick}>{children}</button>
  ),
  Stack: ({ children, align, justify, h, className }: StackProps) => (
    <div data-testid="stack" className={className}>{children}</div>
  ),
  Text: ({ children, c }: TextProps) => (
    <p data-testid="error-message">{children}</p>
  )
}))

describe('ComponentError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with custom error message when error is an Error object', () => {
    // Create a mock Error object
    const testError = new Error('Test error message');
    
    // @ts-ignore - Ignoring type checking for test purposes
    render(<ComponentError error={testError} />)
    
    // Check if the alert icon is rendered
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    
    // Check if the error message is rendered correctly
    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage.textContent).toBe('Error loading: Test error message')
    
    // Check if retry button is rendered
    expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
  
  it('renders with generic error message when error is not an Error object', () => {
    // Use a non-Error object as the error
    const stringError = 'Some string error';
    
    // @ts-ignore - Ignoring type checking for test purposes
    render(<ComponentError error={stringError} />)
    
    // Check if the error message falls back to generic message
    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage.textContent).toBe('Error loading: Something went wrong')
  })
  
  it('calls onRetry function when Retry button is clicked', () => {
    const mockRetry = jest.fn()
    const testError = new Error('Test error');
    
    // @ts-ignore - Ignoring type checking for test purposes
    render(<ComponentError error={testError} onRetry={mockRetry} />)
    
    // Click the retry button
    fireEvent.click(screen.getByTestId('retry-button'))
    
    // Check if the onRetry function was called
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
  
  it('uses default retry function (window.location.reload) when no onRetry prop is provided', () => {
    // Setup mock for window.location.reload
    const reloadFn = jest.fn()
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: reloadFn
      },
      writable: true
    })
    
    const testError = new Error('Test error');
    
    // Render the component with no onRetry prop
    // @ts-ignore - Ignoring type checking for test purposes
    render(<ComponentError error={testError} />)
    
    // Click the retry button
    fireEvent.click(screen.getByTestId('retry-button'))
    
    // Check if window.location.reload was called
    expect(reloadFn).toHaveBeenCalledTimes(1)
  })

  it('renders stack with flex-grow class when not in full page mode', () => {
    const testError = new Error('Test error');
    
    // @ts-ignore - Ignoring type checking for test purposes
    render(<ComponentError error={testError} />)
    
    // Check if the stack has the flex-grow class
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveClass('flex-grow')
  })
}) 