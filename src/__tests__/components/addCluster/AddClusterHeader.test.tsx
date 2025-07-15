// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import AddClusterHeader from '../../../components/addCluster/AddClusterHeader'

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Group: ({ children }) => <div data-testid="mantine-group">{children}</div>,
  Text: ({ children, className }) => (
    <span data-testid="mantine-text" className={className}>
      {children}
    </span>
  ),
}))

describe('AddClusterHeader', () => {
  it('renders the header group and title text', () => {
    render(<AddClusterHeader />)
    const group = screen.getByTestId('mantine-group')
    expect(group).toBeInTheDocument()
    const text = screen.getByTestId('mantine-text')
    expect(text).toBeInTheDocument()
    expect(text).toHaveTextContent('Add Your Infrastructure')
    expect(text.className).toContain('Title')
  })
})
