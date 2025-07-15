// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfirmEmailHeader from '@/components/confirmEmail/ConfirmEmailHeader'

// Mock the CSS module
jest.mock('@/components/confirmEmail/confirmEmail.module.css', () => ({
  subText: 'subText',
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
  Text: ({ children, classNames }) => (
    <span className={classNames?.root}>{children}</span>
  ),
  Title: ({ children, fz, c }) => (
    <h1 data-testid="title" data-fz={fz} data-color={c}>
      {children}
    </h1>
  ),
}))

describe('ConfirmEmailHeader', () => {
  const mockEmail = 'test@example.com'

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
    // Set up sessionStorage with mock email
    sessionStorage.setItem('email', mockEmail)
  })

  it('renders the title correctly', () => {
    render(<ConfirmEmailHeader />)
    const title = screen.getByTestId('title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Verify your Email')
    expect(title).toHaveAttribute('data-fz', 'var(--size-2xl)')
    expect(title).toHaveAttribute('data-color', 'var(--clr-black)')
  })

  it('renders the email verification message with correct email', () => {
    render(<ConfirmEmailHeader />)
    const message = screen.getByText(
      /We have sent a six-digit verification code to/i,
    )
    expect(message).toBeInTheDocument()
    expect(message).toHaveTextContent(mockEmail)
  })

  it('applies correct styling to the subtext', () => {
    render(<ConfirmEmailHeader />)
    const subtext = screen.getByText(
      /We have sent a six-digit verification code to/i,
    )
    expect(subtext).toHaveClass('subText')
  })

  it('renders with correct stack gap', () => {
    render(<ConfirmEmailHeader />)
    const stack = screen.getByTestId('stack')
    expect(stack).toHaveAttribute('data-gap', 'xs')
  })
})
