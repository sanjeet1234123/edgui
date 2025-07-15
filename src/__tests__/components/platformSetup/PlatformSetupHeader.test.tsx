// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PlatformSetupHeader from '@/components/platformSetup/PlatformSetupHeader'

// Mock the platformSetup module CSS
jest.mock('@/components/platformSetup/platformSetup.module.css', () => ({
  title: 'title',
  text: 'text',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
  Text: ({ children, className }) => (
    <p data-testid="text" className={className}>
      {children}
    </p>
  ),
  Title: ({ children, className }) => (
    <h1 data-testid="title" className={className}>
      {children}
    </h1>
  ),
}))

describe('PlatformSetupHeader', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<PlatformSetupHeader />)

    // Check if the component is rendered
    const stackElement = screen.getByTestId('stack')
    expect(stackElement).toBeInTheDocument()
    expect(stackElement).toHaveAttribute('data-gap', 'xs')
  })

  it('renders the title with the correct class', () => {
    render(<PlatformSetupHeader />)

    const titleElement = screen.getByTestId('title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveClass('title')
    expect(titleElement).toHaveTextContent('Platform Setup')
  })

  it('renders the description text with the correct class', () => {
    render(<PlatformSetupHeader />)

    const textElement = screen.getByTestId('text')
    expect(textElement).toBeInTheDocument()
    expect(textElement).toHaveClass('text')
    expect(textElement).toHaveTextContent(
      'Please follow the steps by setting up your Team, Project and workspace',
    )
  })

  it('renders the Stack component with the correct gap prop', () => {
    render(<PlatformSetupHeader />)

    const stackElement = screen.getByTestId('stack')
    expect(stackElement).toHaveAttribute('data-gap', 'xs')
  })
})
