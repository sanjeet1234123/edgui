// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import FullPageLoader from '@/components/ui/fullpageLoader'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Loader: ({ size }) => <div data-testid="loader">Loading Spinner</div>,
  Stack: ({ children, align, justify, h }) => (
    <div data-testid="stack" style={{ height: h }}>{children}</div>
  ),
  Text: ({ children }) => <p data-testid="loader-text">{children}</p>
}))

describe('FullPageLoader', () => {
  it('renders loader and default message', () => {
    render(<FullPageLoader />)
    
    // Check if loader is rendered
    expect(screen.getByTestId('loader')).toBeInTheDocument()
    
    // Check if default message is rendered
    const loaderText = screen.getByTestId('loader-text')
    expect(loaderText).toBeInTheDocument()
    expect(loaderText.textContent).toBe('Loading...')
  })
  
  it('renders loader with custom message', () => {
    const customMessage = 'Please wait while data is loading...'
    render(<FullPageLoader message={customMessage} />)
    
    // Check if custom message is rendered
    const loaderText = screen.getByTestId('loader-text')
    expect(loaderText).toBeInTheDocument()
    expect(loaderText.textContent).toBe(customMessage)
  })
  
  it('renders a Stack with full viewport height', () => {
    render(<FullPageLoader />)
    
    // Check if Stack has 100vh height
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack.style.height).toBe('100vh')
  })
}) 