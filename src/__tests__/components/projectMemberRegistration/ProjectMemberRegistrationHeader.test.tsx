// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProjectMemberRegistrationHeader from '@/components/projectMemberRegistration/ProjectMemberRegistrationHeader'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children }) => <div data-testid="group">{children}</div>,
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  ),
  Title: ({ children, fz, c }) => (
    <h1 data-testid="title" data-font-size={fz} data-color={c}>
      {children}
    </h1>
  ),
  Text: ({ children, fz }) => (
    <p data-testid="text" data-font-size={fz}>
      {children}
    </p>
  ),
}))

describe('ProjectMemberRegistrationHeader', () => {
  it('renders the component correctly', () => {
    render(<ProjectMemberRegistrationHeader />)

    // Check if the Group component is rendered
    expect(screen.getByTestId('group')).toBeInTheDocument()

    // Check if the Stack component is rendered with the correct gap prop
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveAttribute('data-gap', 'xs')

    // Check if the Title component is rendered with correct props and text
    const title = screen.getByTestId('title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-font-size', 'var(--size-2xl)')
    expect(title).toHaveAttribute('data-color', 'var(--clr-black)')
    expect(title).toHaveTextContent('Project Onboarding')

    // Check if the Text component is rendered with correct prop and text
    const text = screen.getByTestId('text')
    expect(text).toBeInTheDocument()
    expect(text).toHaveAttribute('data-font-size', 'var(--size-sm)')
    expect(text).toHaveTextContent(
      'Enter your details below to get started with the project',
    )
  })
})
