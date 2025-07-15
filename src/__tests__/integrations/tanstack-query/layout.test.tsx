// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LayoutAddition from '@/integrations/tanstack-query/layout'

// Mock the Devtools to avoid side effects and check rendering
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: jest.fn(({ buttonPosition }) => (
    <div data-testid="react-query-devtools" data-position={buttonPosition} />
  )),
}))

describe('LayoutAddition', () => {
  it('renders ReactQueryDevtools with correct button position', () => {
    render(<LayoutAddition />)
    const devtools = screen.getByTestId('react-query-devtools')
    expect(devtools).toBeInTheDocument()
    expect(devtools).toHaveAttribute('data-position', 'bottom-right')
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<LayoutAddition />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders only one Devtools instance', () => {
    render(<LayoutAddition />)
    expect(screen.getAllByTestId('react-query-devtools')).toHaveLength(1)
  })
})
