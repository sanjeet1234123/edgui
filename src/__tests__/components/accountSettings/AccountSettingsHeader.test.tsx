// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AccountSettingsHeader from '@/components/accountSettings/AccountSettingsHeader'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children, justify, align, gap }) => (
    <div data-justify={justify} data-align={align} data-gap={gap}>
      {children}
    </div>
  ),
  Title: ({ children, className }) => <h1 className={className}>{children}</h1>,
}))

describe('AccountSettingsHeader', () => {
  it('renders the page title correctly', () => {
    render(<AccountSettingsHeader pageTitle="Test Page Title" />)
    expect(screen.getByText('Test Page Title')).toBeInTheDocument()
  })

  it('applies correct styling to the title', () => {
    render(<AccountSettingsHeader pageTitle="Test Page Title" />)
    const title = screen.getByText('Test Page Title')
    expect(title).toHaveClass('Title')
  })

  it('renders with correct Group props', () => {
    render(<AccountSettingsHeader pageTitle="Test Page Title" />)
    const outerGroup = screen
      .getByText('Test Page Title')
      .closest('[data-justify]')
    expect(outerGroup).toHaveAttribute('data-justify', 'space-between')
  })

  it('renders inner Group with correct props', () => {
    render(<AccountSettingsHeader pageTitle="Test Page Title" />)
    const innerGroup = screen
      .getByText('Test Page Title')
      .closest('[data-align]')
    expect(innerGroup).toHaveAttribute('data-align', 'center')
    expect(innerGroup).toHaveAttribute('data-gap', '1rem')
  })
})
