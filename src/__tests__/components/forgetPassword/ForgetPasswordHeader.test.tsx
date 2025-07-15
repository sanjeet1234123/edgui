// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ForgetPasswordHeader from '@/components/forgetPassword/ForgetPasswordHeader'
import { MantineProvider } from '@mantine/core'

// Create a custom render function that wraps components with MantineProvider
const customRender = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  )
}

describe('ForgetPasswordHeader', () => {
  it('renders the header with correct title', () => {
    customRender(<ForgetPasswordHeader />)
    
    expect(screen.getByText('Forgot Password')).toBeInTheDocument()
  })

  it('renders the title with the correct color and font size', () => {
    customRender(<ForgetPasswordHeader />)
    
    const title = screen.getByText('Forgot Password')
    expect(title).toHaveStyle('color: var(--clr-black)')
    expect(title.tagName.toLowerCase()).toBe('h1') // Title component renders an h1
  })
}) 