// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServersHeader from '@/components/servers/ServersHeader'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children }) => <div data-testid="group">{children}</div>,
  Text: ({ children, className }) => (
    <span data-testid="text" className={className}>
      {children}
    </span>
  ),
}))

describe('ServersHeader', () => {
  it('renders correctly with the provided page title', () => {
    render(<ServersHeader pageTitle="Test Servers" />)

    // Check if the text element contains the correct title
    const textElement = screen.getByTestId('text')
    expect(textElement).toBeInTheDocument()
    expect(textElement).toHaveTextContent('Test Servers')
  })

  it('applies the correct className to the Text component', () => {
    render(<ServersHeader pageTitle="Servers List" />)

    const textElement = screen.getByTestId('text')
    expect(textElement).toHaveClass('Title')
  })

  it('renders within a Group component', () => {
    render(<ServersHeader pageTitle="Server Management" />)

    const groupElement = screen.getByTestId('group')
    expect(groupElement).toBeInTheDocument()

    // Verify the Group contains the Text component
    const textElement = screen.getByTestId('text')
    expect(groupElement).toContainElement(textElement)
  })

  it('correctly passes props to the component', () => {
    const customTitle = 'Custom Server Header'
    render(<ServersHeader pageTitle={customTitle} />)

    const textElement = screen.getByTestId('text')
    expect(textElement).toHaveTextContent(customTitle)
  })
})
