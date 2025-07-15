/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import MemberLoginHeader from '@/components/memberLogin/MemberLoginHeader'

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children }) => <div data-testid="group">{children}</div>,
  Title: ({ children, fz, c }) => (
    <h1 data-testid="title" data-font-size={fz} data-color={c}>
      {children}
    </h1>
  ),
}))

describe('MemberLoginHeader', () => {
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
    render(<MemberLoginHeader />)

    // Check that the title is rendered with correct workspace name
    const titleElement = screen.getByTestId('title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveTextContent('Login to TestWorkspace workspace')

    // Verify the correct style properties are passed to Title
    expect(titleElement).toHaveAttribute('data-font-size', 'var(--size-2xl)')
    expect(titleElement).toHaveAttribute('data-color', 'var(--clr-black)')
  })

  it('handles missing workspace name in sessionStorage', () => {
    // Mock sessionStorage with no workspace name
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
      },
      writable: true,
    })

    render(<MemberLoginHeader />)

    // Title should still render but with "null" as the workspace name
    const titleElement = screen.getByTestId('title')
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveTextContent('Login to null workspace')
  })
})
