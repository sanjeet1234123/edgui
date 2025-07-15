/**
 * @jest-environment jsdom
 */
// @ts-nocheck
import { describe, it, expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock image imports
jest.mock(
  '@/assets/images/authentication-image.png',
  () => 'authentication-image-mock',
)
jest.mock('@/assets/logos/nexastack-logo.png', () => 'nexastack-logo-mock')
jest.mock(
  '@/assets/logos/nexastack-dark-logo.png',
  () => 'nexastack-dark-logo-mock',
)

// Mock Mantine components
jest.mock('@mantine/core', () => {
  let mockColorScheme = 'light'

  const AppShell = ({ children, classNames }) => (
    <div data-testid="app-shell" className={classNames?.root}>
      {children}
    </div>
  )

  AppShell.Main = ({ children }) => (
    <div data-testid="app-shell-main" className="authContainerMain">
      {children}
    </div>
  )

  return {
    AppShell,
    Group: ({ children }) => <div data-testid="group">{children}</div>,
    Image: ({ src, alt, className }) => (
      <img
        src={src}
        alt={alt || ''}
        className={className}
        data-testid="image"
      />
    ),
    Stack: ({ children, justify, align, w, h }) => (
      <div
        data-testid="stack"
        data-justify={justify}
        data-align={align}
        style={{ width: w, height: h }}
      >
        {children}
      </div>
    ),
    Text: ({ children, ta, w, c, fw, fz }) => (
      <p
        data-testid="text"
        data-ta={ta}
        data-w={w}
        data-c={c}
        data-fw={fw}
        data-fz={fz}
      >
        {children}
      </p>
    ),
    Title: ({ children, ta, c, fw }) => (
      <h1 data-testid="title" data-ta={ta} data-c={c} data-fw={fw}>
        {children}
      </h1>
    ),
    useMantineColorScheme: jest.fn().mockImplementation(() => ({
      colorScheme: mockColorScheme,
      setColorScheme: scheme => {
        mockColorScheme = scheme
      },
    })),
  }
})

// Import the actual component
import AuthContainer from '@/components/authContainer/authContainer'

describe('AuthContainer', () => {
  it('renders the container with correct structure and children', () => {
    const testContent = 'Test Child Content'
    render(
      <AuthContainer>
        <div data-testid="test-child">{testContent}</div>
      </AuthContainer>,
    )

    // Test main structure
    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
    expect(screen.getByTestId('app-shell-main')).toBeInTheDocument()

    // Test left side content
    const leftSide = screen
      .getByTestId('app-shell-main')
      .querySelector('.authContainerLeft')
    expect(leftSide).toBeInTheDocument()
    expect(
      screen.getByText('Built for Security and Privacy Private Cloud Compute'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Unified Inference Platform for any model, on any cloud. Built for Security and Privacy, Private Cloud Compute',
      ),
    ).toBeInTheDocument()

    // Test right side content
    const rightSide = screen
      .getByTestId('app-shell-main')
      .querySelector('.authContainerRight')
    expect(rightSide).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText(testContent)).toBeInTheDocument()
  })

  it('uses correct logo based on color scheme', () => {
    const { useMantineColorScheme } = require('@mantine/core')

    // First test with light mode
    useMantineColorScheme.mockImplementation(() => ({
      colorScheme: 'light',
      setColorScheme: jest.fn(),
    }))

    const { rerender } = render(
      <AuthContainer>
        <div>Child content</div>
      </AuthContainer>,
    )

    // Check light mode logo
    const lightLogo = screen.getAllByTestId('image')[1] // Second image is the logo
    expect(lightLogo).toHaveAttribute('src', 'nexastack-logo-mock')

    // Change to dark mode and rerender
    useMantineColorScheme.mockImplementation(() => ({
      colorScheme: 'dark',
      setColorScheme: jest.fn(),
    }))

    rerender(
      <AuthContainer>
        <div>Child content</div>
      </AuthContainer>,
    )

    // Check dark mode logo
    const darkLogo = screen.getAllByTestId('image')[1] // Second image is the logo
    expect(darkLogo).toHaveAttribute('src', 'nexastack-dark-logo-mock')
  })

  it('renders with correct styling classes', () => {
    render(
      <AuthContainer>
        <div>Child content</div>
      </AuthContainer>,
    )

    const appShell = screen.getByTestId('app-shell')
    const appShellMain = screen.getByTestId('app-shell-main')

    expect(appShell).toHaveClass('authContainer')
    expect(appShellMain).toHaveClass('authContainerMain')
  })
})
