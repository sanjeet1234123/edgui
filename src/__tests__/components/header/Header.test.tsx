// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

// Mock image imports
jest.mock('@/assets/logos/nexastack-logo.png', () => 'nexastack-logo-mock')
jest.mock(
  '@/assets/logos/nexastack-dark-logo.png',
  () => 'nexastack-dark-logo-mock',
)
jest.mock('@/assets/images/nexastack-logo.svg', () => 'nexastack-icon-mock')

// Mock CSS modules
jest.mock('@/components/header/Header.module.css', () => ({
  logo: 'logo',
  agentSRE: 'agentSRE',
}))

// Mock media queries
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Mock NotificationDrawer component
jest.mock('@/components/notificationDrawer/index', () => ({
  NotificationDrawer: () => (
    <div data-testid="notification-drawer">Notification Drawer</div>
  ),
}))

// Mock ProjectPopover component
jest.mock('@/components/header/ProjectPopover', () => ({
  __esModule: true,
  default: () => <div data-testid="project-popover">Project Popover</div>,
}))

// Mock the Link component from @tanstack/react-router
jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} data-testid="logo-link" {...props}>
      {children}
    </a>
  ),
}))

// Mock Tabler icons with test IDs
jest.mock('@tabler/icons-react', () => ({
  IconCode: props => (
    <span data-testid="icon-code" {...props}>
      IconCode
    </span>
  ),
  IconCube: props => (
    <span data-testid="icon-cube" {...props}>
      IconCube
    </span>
  ),
  IconMoon: props => (
    <span data-testid="icon-moon" {...props}>
      IconMoon
    </span>
  ),
  IconSun: props => (
    <span data-testid="icon-sun" {...props}>
      IconSun
    </span>
  ),
  IconMenu2: props => (
    <span data-testid="icon-menu2" {...props}>
      IconMenu2
    </span>
  ),
  IconX: props => (
    <span data-testid="icon-x" {...props}>
      IconX
    </span>
  ),
}))

// Mock the color scheme hook and Mantine components
jest.mock('@mantine/core', () => ({
  useMantineColorScheme: jest.fn(() => ({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
  })),
  Group: ({ children, ...props }) => (
    <div data-testid="group" {...props}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    className,
    leftSection,
    ...props
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid="button"
      {...props}
    >
      {leftSection}
      {children}
    </button>
  ),
  ActionIcon: ({ children, onClick, 'data-testid': testId, ...props }) => (
    <button onClick={onClick} data-testid={testId || 'action-icon'} {...props}>
      {children}
    </button>
  ),
  Tooltip: ({ label, children, ...props }) => (
    <div aria-label={label} {...props}>
      {children}
    </div>
  ),
  ThemeIcon: ({ children, onClick, ...props }) => (
    <button onClick={onClick} data-testid="theme-icon" {...props}>
      {children}
    </button>
  ),
}))

// Import the actual Header component
import Header from '@/components/header/Header'

// Mock window.open
const originalOpen = window.open
const mockWindowOpen = jest.fn()

beforeEach(() => {
  window.open = mockWindowOpen
  jest.clearAllMocks()

  // Set up media query mocks
  const { useMediaQuery } = require('@mantine/hooks')
  useMediaQuery.mockImplementation(query => {
    if (query === '(min-width: 1140px)') return true
    if (query === '(max-width: 768px)') return false
    return false
  })

  // Mock document.body.classList
  document.body.classList.add = jest.fn()
  document.body.classList.remove = jest.fn()

  // Reset color scheme mock
  const { useMantineColorScheme } = require('@mantine/core')
  useMantineColorScheme.mockReturnValue({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
  })
})

afterEach(() => {
  window.open = originalOpen
})

describe('Header Component', () => {
  const defaultProps = {
    setCollapsed: jest.fn(),
    toggle: jest.fn(),
    setSidebarOpen: jest.fn(),
    sidebarOpen: false,
  }

  describe('Logo Display', () => {
    it('renders desktop logo in light mode when screen is large', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        if (query === '(max-width: 768px)') return false
        return false
      })

      render(<Header {...defaultProps} />)

      const logo = screen.getByAltText('Nexastack Logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', 'nexastack-logo-mock')
      expect(logo).toHaveClass('logo')
    })

    it('renders desktop logo in dark mode when colorScheme is dark', () => {
      const { useMantineColorScheme } = require('@mantine/core')
      const mockSetColorScheme = jest.fn()
      useMantineColorScheme.mockReturnValue({
        colorScheme: 'dark',
        setColorScheme: mockSetColorScheme,
      })

      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        if (query === '(max-width: 768px)') return false
        return false
      })

      render(<Header {...defaultProps} />)

      const logo = screen.getByAltText('Nexastack Logo')
      expect(logo).toHaveAttribute('src', 'nexastack-dark-logo-mock')
    })

    it('renders mobile icon when screen is small (768px or less)', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        if (query === '(max-width: 768px)') return true
        return false
      })

      render(<Header {...defaultProps} />)

      const icon = screen.getByAltText('Nexastack Icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('src', 'nexastack-icon-mock')
      expect(icon).toHaveAttribute('width', '30')
    })

    it('logo links to home page', () => {
      render(<Header {...defaultProps} />)

      const logoLink = screen.getByTestId('logo-link')
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Desktop Navigation (1140px+)', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        if (query === '(max-width: 768px)') return false
        return false
      })
    })

    it('renders Agent SRE button', () => {
      render(<Header {...defaultProps} />)

      const agentSREButton = screen.getByText('Agent SRE')
      expect(agentSREButton).toBeInTheDocument()
      expect(agentSREButton).toHaveClass('agentSRE')
    })

    it('opens Agent SRE link in new tab when clicked', () => {
      render(<Header {...defaultProps} />)

      const agentSREButton = screen.getByText('Agent SRE')
      fireEvent.click(agentSREButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://agentsre.prod.neuralcompany.team/',
        '_blank',
      )
    })

    it('renders Help center button as disabled', () => {
      render(<Header {...defaultProps} />)

      const helpCenterButton = screen.getByText('Help center')
      expect(helpCenterButton).toBeInTheDocument()
      expect(helpCenterButton).toBeDisabled()
    })
  })

  describe('Mobile Navigation (< 1140px)', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return false
        if (query === '(max-width: 768px)') return false
        return false
      })
    })

    it('does not render Agent SRE button on smaller screens', () => {
      render(<Header {...defaultProps} />)

      const agentSREButton = screen.queryByText('Agent SRE')
      expect(agentSREButton).not.toBeInTheDocument()
    })

    it('does not render Help center button on smaller screens', () => {
      render(<Header {...defaultProps} />)

      const helpCenterButton = screen.queryByText('Help center')
      expect(helpCenterButton).not.toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('shows dark mode tooltip in light mode', () => {
      render(<Header {...defaultProps} />)

      const tooltip = screen.getByLabelText('Dark mode')
      expect(tooltip).toBeInTheDocument()
    })

    it('shows light mode tooltip in dark mode', () => {
      const { useMantineColorScheme } = require('@mantine/core')
      const mockSetColorScheme = jest.fn()
      useMantineColorScheme.mockReturnValue({
        colorScheme: 'dark',
        setColorScheme: mockSetColorScheme,
      })

      render(<Header {...defaultProps} />)

      const tooltip = screen.getByLabelText('Light mode')
      expect(tooltip).toBeInTheDocument()
    })

    it('calls setColorScheme when theme toggle is clicked in light mode', () => {
      const { useMantineColorScheme } = require('@mantine/core')
      const mockSetColorScheme = jest.fn()
      useMantineColorScheme.mockReturnValue({
        colorScheme: 'light',
        setColorScheme: mockSetColorScheme,
      })

      render(<Header {...defaultProps} />)

      const themeButton = screen
        .getByLabelText('Dark mode')
        .querySelector('button')
      fireEvent.click(themeButton)

      expect(mockSetColorScheme).toHaveBeenCalledWith('dark')
    })

    it('calls setColorScheme when theme toggle is clicked in dark mode', () => {
      const { useMantineColorScheme } = require('@mantine/core')
      const mockSetColorScheme = jest.fn()
      useMantineColorScheme.mockReturnValue({
        colorScheme: 'dark',
        setColorScheme: mockSetColorScheme,
      })

      render(<Header {...defaultProps} />)

      const themeButton = screen
        .getByLabelText('Light mode')
        .querySelector('button')
      fireEvent.click(themeButton)

      expect(mockSetColorScheme).toHaveBeenCalledWith('light')
    })

    it('displays correct icon in light mode', () => {
      render(<Header {...defaultProps} />)

      const moonIcon = screen.getByTestId('icon-moon')
      expect(moonIcon).toBeInTheDocument()
    })

    it('displays correct icon in dark mode', () => {
      const { useMantineColorScheme } = require('@mantine/core')
      const mockSetColorScheme = jest.fn()
      useMantineColorScheme.mockReturnValue({
        colorScheme: 'dark',
        setColorScheme: mockSetColorScheme,
      })

      render(<Header {...defaultProps} />)

      const sunIcon = screen.getByTestId('icon-sun')
      expect(sunIcon).toBeInTheDocument()
    })
  })

  describe('useEffect for body class management', () => {
    it('removes dark-mode class from body in light mode', () => {
      render(<Header {...defaultProps} />)

      expect(document.body.classList.remove).toHaveBeenCalledWith('dark-mode')
    })

    it('adds dark-mode class to body in dark mode', () => {
      const { useMantineColorScheme } = require('@mantine/core')
      const mockSetColorScheme = jest.fn()
      useMantineColorScheme.mockReturnValue({
        colorScheme: 'dark',
        setColorScheme: mockSetColorScheme,
      })

      render(<Header {...defaultProps} />)

      expect(document.body.classList.add).toHaveBeenCalledWith('dark-mode')
    })
  })

  describe('Mobile Sidebar Toggle', () => {
    it('renders mobile menu button', () => {
      render(<Header {...defaultProps} />)

      const mobileMenuButton = screen.getByTestId('action-icon')
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('shows X icon when sidebar is closed', () => {
      render(<Header {...defaultProps} sidebarOpen={false} />)

      const closeIcon = screen.getByTestId('icon-x')
      expect(closeIcon).toBeInTheDocument()
    })

    it('shows menu icon when sidebar is open', () => {
      render(<Header {...defaultProps} sidebarOpen={true} />)

      const menuIcon = screen.getByTestId('icon-menu2')
      expect(menuIcon).toBeInTheDocument()
    })

    it('calls all handler functions when mobile menu is clicked', () => {
      const mockProps = {
        setCollapsed: jest.fn(),
        toggle: jest.fn(),
        setSidebarOpen: jest.fn(),
        sidebarOpen: false,
      }

      render(<Header {...mockProps} />)

      const mobileMenuButton = screen.getByTestId('action-icon')
      fireEvent.click(mobileMenuButton)

      expect(mockProps.toggle).toHaveBeenCalled()
      expect(mockProps.setCollapsed).toHaveBeenCalledWith(false)
      expect(mockProps.setSidebarOpen).toHaveBeenCalledWith(true)
    })

    it('toggles sidebar state correctly when clicked', () => {
      const mockProps = {
        setCollapsed: jest.fn(),
        toggle: jest.fn(),
        setSidebarOpen: jest.fn(),
        sidebarOpen: true,
      }

      render(<Header {...mockProps} />)

      const mobileMenuButton = screen.getByTestId('action-icon')
      fireEvent.click(mobileMenuButton)

      expect(mockProps.setSidebarOpen).toHaveBeenCalledWith(false)
    })
  })

  describe('Component Integration', () => {
    it('renders ProjectPopover component', () => {
      render(<Header {...defaultProps} />)

      const projectPopover = screen.getByTestId('project-popover')
      expect(projectPopover).toBeInTheDocument()
    })

    it('renders NotificationDrawer component', () => {
      render(<Header {...defaultProps} />)

      const notificationDrawer = screen.getByTestId('notification-drawer')
      expect(notificationDrawer).toBeInTheDocument()
    })
  })

  describe('Props handling', () => {
    it('accepts and uses all required props', () => {
      const props = {
        setCollapsed: jest.fn(),
        toggle: jest.fn(),
        setSidebarOpen: jest.fn(),
        sidebarOpen: true,
      }

      expect(() => render(<Header {...props} />)).not.toThrow()
    })
  })

  describe('Responsive behavior combinations', () => {
    it('handles mobile view with icon logo correctly', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return false
        if (query === '(max-width: 768px)') return true
        return false
      })

      render(<Header {...defaultProps} />)

      // Should show icon instead of full logo
      expect(screen.getByAltText('Nexastack Icon')).toBeInTheDocument()
      expect(screen.queryByAltText('Nexastack Logo')).not.toBeInTheDocument()

      // Should not show desktop navigation
      expect(screen.queryByText('Agent SRE')).not.toBeInTheDocument()
      expect(screen.queryByText('Help center')).not.toBeInTheDocument()
    })

    it('handles tablet view (between mobile and desktop)', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return false
        if (query === '(max-width: 768px)') return false
        return false
      })

      render(<Header {...defaultProps} />)

      // Should show desktop logo but no desktop navigation
      expect(screen.getByAltText('Nexastack Logo')).toBeInTheDocument()
      expect(screen.queryByText('Agent SRE')).not.toBeInTheDocument()
      expect(screen.queryByText('Help center')).not.toBeInTheDocument()
    })
  })

  describe('Edge cases and complete coverage', () => {
    it('handles different screen size combinations correctly', () => {
      // Test all possible media query combinations
      const combinations = [
        { '(min-width: 1140px)': true, '(max-width: 768px)': false }, // Desktop
        { '(min-width: 1140px)': false, '(max-width: 768px)': false }, // Tablet
        { '(min-width: 1140px)': false, '(max-width: 768px)': true }, // Mobile
      ]

      combinations.forEach((combo, index) => {
        const { useMediaQuery } = require('@mantine/hooks')
        useMediaQuery.mockImplementation(query => combo[query] || false)

        const { unmount } = render(<Header {...defaultProps} />)

        // Component should render without errors
        expect(screen.getByTestId('logo-link')).toBeInTheDocument()

        unmount()
      })
    })

    it('verifies all interactive elements are present', () => {
      render(<Header {...defaultProps} />)

      // All major interactive elements should be present
      expect(screen.getByTestId('logo-link')).toBeInTheDocument()
      expect(screen.getByTestId('project-popover')).toBeInTheDocument()
      expect(screen.getByTestId('notification-drawer')).toBeInTheDocument()
      expect(screen.getByTestId('action-icon')).toBeInTheDocument()
      expect(screen.getByLabelText('Dark mode')).toBeInTheDocument()
    })

    it('handles multiple function calls in mobile toggle click', () => {
      const mockProps = {
        setCollapsed: jest.fn(),
        toggle: jest.fn(),
        setSidebarOpen: jest.fn(),
        sidebarOpen: false,
      }

      render(<Header {...mockProps} />)

      const mobileMenuButton = screen.getByTestId('action-icon')
      fireEvent.click(mobileMenuButton)

      // Verify all three functions are called
      expect(mockProps.toggle).toHaveBeenCalledTimes(1)
      expect(mockProps.setCollapsed).toHaveBeenCalledTimes(1)
      expect(mockProps.setSidebarOpen).toHaveBeenCalledTimes(1)
    })

    it('handles Agent SRE URL correctly', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        return false
      })

      render(<Header {...defaultProps} />)

      const agentSREButton = screen.getByText('Agent SRE')
      fireEvent.click(agentSREButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://agentsre.prod.neuralcompany.team/',
        '_blank',
      )
    })
  })

  describe('Icon rendering tests', () => {
    it('renders code icon in Agent SRE button', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        return false
      })

      render(<Header {...defaultProps} />)

      expect(screen.getByTestId('icon-code')).toBeInTheDocument()
    })

    it('renders cube icon in Help center button', () => {
      const { useMediaQuery } = require('@mantine/hooks')
      useMediaQuery.mockImplementation(query => {
        if (query === '(min-width: 1140px)') return true
        return false
      })

      render(<Header {...defaultProps} />)

      expect(screen.getByTestId('icon-cube')).toBeInTheDocument()
    })
  })
})
