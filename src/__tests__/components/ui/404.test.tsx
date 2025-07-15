// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NotFound from '@/components/ui/404'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children, align, justify, h }) => (
    <div data-testid="stack" style={{ height: h }}>{children}</div>
  ),
  Text: ({ children, fz, fw, c }) => (
    <p data-testid="text">{children}</p>
  ),
  Title: ({ children, fz, c }) => (
    <h1 data-testid="title">{children}</h1>
  )
}))

describe('NotFound', () => {
  it('renders 404 title and message', () => {
    render(<NotFound />)
    
    // Check if the 404 title is rendered
    const title = screen.getByTestId('title')
    expect(title).toBeInTheDocument()
    expect(title.textContent).toBe('404')
    
    // Check if the error message is rendered
    const text = screen.getByTestId('text')
    expect(text).toBeInTheDocument()
    expect(text.textContent).toBe('Page not found')
  })
  
  it('renders a Stack with correct attributes', () => {
    render(<NotFound />)
    
    // Check if Stack is rendered with full viewport height
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack.style.height).toBe('100vh')
  })
}) 