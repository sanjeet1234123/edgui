/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberSignupHeader from '@/components/memberSignup/MemberSignupHeader'

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children }) => <div data-testid="group">{children}</div>,
  Stack: ({ children }) => <div data-testid="stack">{children}</div>,
  Title: ({ children, fz, c }) => (
    <h1 data-testid="title" data-font-size={fz} data-color={c}>
      {children}
    </h1>
  ),
  Text: ({ children, c, fz }) => (
    <p data-testid="success-text" data-color={c} data-font-size={fz}>
      {children}
    </p>
  ),
}))

describe('MemberSignupHeader', () => {
  // Setup before tests
  beforeEach(() => {
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('TestWorkspace'),
      },
      writable: true,
    })

    // Reset mocks
    jest.clearAllMocks()
  })

  it('renders the component with workspace name from sessionStorage', () => {
    render(<MemberSignupHeader />)

    // Check that the title is rendered with correct workspace name
    const titleElement = screen.getByTestId('title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveTextContent('Signup to TestWorkspace workspace')

    // Verify the correct style properties are passed to Title
    expect(titleElement).toHaveAttribute('data-font-size', 'var(--size-2xl)')
    expect(titleElement).toHaveAttribute('data-color', 'var(--clr-black)')

    // Success message should not be displayed
    expect(screen.queryByTestId('success-text')).not.toBeInTheDocument()
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberSignupHeader />)

    // Title should still render but with null as the workspace name
    const titleElement = screen.getByTestId('title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveTextContent('Signup to null workspace')
  })

  it('shows success message when signupSuccess is true', () => {
    render(<MemberSignupHeader signupSuccess={true} />)

    // Success message should be displayed
    const successMessage = screen.getByTestId('success-text')
    expect(successMessage).toBeInTheDocument()
    expect(successMessage).toHaveTextContent(
      'Invitation sent successfully! Please check your email.',
    )
    expect(successMessage).toHaveAttribute(
      'data-color',
      'var(--mantine-color-green-7)',
    )
    expect(successMessage).toHaveAttribute('data-font-size', 'var(--size-sm)')
  })
})
