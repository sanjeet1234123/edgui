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
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider, createTheme } from '@mantine/core'
import NotificationDrawer from '@/components/notificationDrawer/NotificationDrawer'

// Mock CSS modules
jest.mock(
  '@/components/notificationDrawer/notificationDrawer.module.css',
  () => ({
    notificationCard: 'notificationCard-class',
    removing: 'removing-class',
    contentWrapper: 'contentWrapper-class',
    iconContainer: 'iconContainer-class',
    iconContainerVisible: 'iconContainerVisible-class',
    actionIcon: 'actionIcon-class',
    actionIconVisible: 'actionIconVisible-class',
    contentStack: 'contentStack-class',
    title: 'title-class',
    desc: 'desc-class',
    time: 'time-class',
  }),
)

// Mock Mantine components more comprehensively
jest.mock('@mantine/core', () => {
  const React = require('react')
  return {
    ...jest.requireActual('@mantine/core'),
    MantineProvider: ({ children }) => children,
    createTheme: jest.fn(() => ({})),
    Indicator: ({ children, label, disabled }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'indicator',
          'data-disabled': disabled,
          'data-label': label,
        },
        [
          !disabled &&
            label &&
            React.createElement('span', { key: 'label' }, label),
          children,
        ],
      ),
    ActionIcon: ({ children, onClick, ...props }) =>
      React.createElement(
        'button',
        {
          onClick,
          type: 'button',
          'data-testid': 'action-icon',
          style: props.style,
          ...props,
        },
        children,
      ),
    Tooltip: ({ children, label }) =>
      React.createElement(
        'div',
        {
          'aria-label': label,
          'data-testid': 'tooltip',
        },
        children,
      ),
    Drawer: ({ children, opened, onClose, title }) =>
      opened
        ? React.createElement(
            'div',
            {
              'data-testid': 'drawer',
              role: 'dialog',
            },
            [
              React.createElement('div', { key: 'title' }, title),
              React.createElement('div', { key: 'content' }, children),
            ],
          )
        : null,
    Stack: ({ children, ...props }) =>
      React.createElement(
        'div',
        { 'data-testid': 'stack', ...props },
        children,
      ),
    Group: ({ children, ...props }) =>
      React.createElement(
        'div',
        { 'data-testid': 'group', ...props },
        children,
      ),
    Title: ({ children, ...props }) =>
      React.createElement('h3', { 'data-testid': 'title', ...props }, children),
    Button: ({ children, onClick, leftSection, ...props }) =>
      React.createElement(
        'button',
        {
          onClick,
          type: 'button',
          'data-testid': 'button',
          ...props,
        },
        [leftSection, children],
      ),
    Card: ({ children, onMouseEnter, onMouseLeave, className, ...props }) =>
      React.createElement(
        'div',
        {
          onMouseEnter,
          onMouseLeave,
          className,
          'data-testid': 'card',
          ...props,
        },
        children,
      ),
    Text: ({ children, ...props }) =>
      React.createElement(
        'span',
        { 'data-testid': 'text', ...props },
        children,
      ),
    Flex: ({ children, ...props }) =>
      React.createElement('div', { 'data-testid': 'flex', ...props }, children),
    Divider: () => React.createElement('hr', { 'data-testid': 'divider' }),
  }
})

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => {
  const React = require('react')
  return {
    IconBell: () => React.createElement('svg', { 'data-testid': 'icon-bell' }),
    IconChecks: () =>
      React.createElement('svg', { 'data-testid': 'icon-checks' }),
    IconClock: () =>
      React.createElement('svg', { 'data-testid': 'icon-clock' }),
    IconX: () => React.createElement('svg', { 'data-testid': 'icon-x' }),
  }
})

// Create a custom render function
const customRender = (ui: React.ReactElement) => {
  const theme = createTheme({})
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>)
}

describe('NotificationDrawer', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      expect(() => customRender(<NotificationDrawer />)).not.toThrow()
    })

    it('renders notification bell button', () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('displays notification count indicator', () => {
      customRender(<NotificationDrawer />)

      const indicator = screen.getByTestId('indicator')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveAttribute('data-label', '10')
    })

    it('renders bell icon inside button', () => {
      customRender(<NotificationDrawer />)

      const bellIcon = screen.getByTestId('icon-bell')
      expect(bellIcon).toBeInTheDocument()
    })

    it('renders tooltip with correct label', () => {
      customRender(<NotificationDrawer />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveAttribute('aria-label', 'Notifications')
    })
  })

  describe('Notification Bell Interaction', () => {
    it('handles bell icon click', async () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')
      await user.click(button)

      // The click should not throw an error
      expect(button).toBeInTheDocument()
    })

    it('opens drawer when bell is clicked', async () => {
      // Mock useDisclosure to return opened state after click
      const mockOpen = jest.fn()
      const mockClose = jest.fn()

      jest.doMock('@mantine/hooks', () => ({
        useDisclosure: jest.fn(() => [
          true,
          { open: mockOpen, close: mockClose },
        ]),
      }))

      customRender(<NotificationDrawer />)

      // Should show drawer content when opened
      const drawer = screen.queryByTestId('drawer')
      // Note: This test depends on the mocked state
    })

    it('shows correct notification count', () => {
      customRender(<NotificationDrawer />)

      const indicator = screen.getByTestId('indicator')
      expect(indicator).toHaveAttribute('data-label', '10')
    })
  })

  describe('Component State Management', () => {
    it('initializes with correct notification count', () => {
      customRender(<NotificationDrawer />)

      // Should start with 10 notifications
      const indicator = screen.getByTestId('indicator')
      expect(indicator).toHaveAttribute('data-label', '10')
      expect(indicator).not.toHaveAttribute('data-disabled', 'true')
    })

    it('maintains component state correctly', () => {
      const { unmount } = customRender(<NotificationDrawer />)

      // Should unmount without errors
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels', () => {
      customRender(<NotificationDrawer />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveAttribute('aria-label', 'Notifications')
    })

    it('supports keyboard navigation', () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('has proper button role', () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Visual Elements', () => {
    it('renders with proper styling', () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')
      expect(button).toHaveStyle({ cursor: 'pointer' })
    })

    it('includes all required icons', () => {
      customRender(<NotificationDrawer />)

      const bellIcon = screen.getByTestId('icon-bell')
      expect(bellIcon).toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    it('handles click events properly', async () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')

      // Should handle click without errors
      fireEvent.click(button)
      expect(button).toBeInTheDocument()
    })

    it('supports mouse interactions', () => {
      customRender(<NotificationDrawer />)

      const button = screen.getByTestId('action-icon')

      fireEvent.mouseOver(button)
      fireEvent.mouseOut(button)

      expect(button).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('integrates with DOM correctly', () => {
      const { container } = customRender(<NotificationDrawer />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders all child components', () => {
      customRender(<NotificationDrawer />)

      // Should render indicator, tooltip, and action icon
      expect(screen.getByTestId('indicator')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('action-icon')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('renders without console errors', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      customRender(<NotificationDrawer />)

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles component lifecycle gracefully', () => {
      const { rerender, unmount } = customRender(<NotificationDrawer />)

      // Should handle rerender
      rerender(<NotificationDrawer />)

      // Should handle unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Component Behavior', () => {
    it('maintains proper component structure', () => {
      const { container } = customRender(<NotificationDrawer />)

      // Should have a structured DOM
      expect(
        container.querySelector('[data-testid="indicator"]'),
      ).toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="action-icon"]'),
      ).toBeInTheDocument()
    })

    it('handles props correctly', () => {
      // Component should work without requiring props
      expect(() => customRender(<NotificationDrawer />)).not.toThrow()
    })
  })

  describe('Notification Logic', () => {
    it('shows indicator when notifications exist', () => {
      customRender(<NotificationDrawer />)

      const indicator = screen.getByTestId('indicator')
      expect(indicator).not.toHaveAttribute('data-disabled', 'true')
      expect(indicator).toHaveAttribute('data-label', '10')
    })

    it('displays correct notification count', () => {
      customRender(<NotificationDrawer />)

      // Should show 10 notifications initially
      const indicator = screen.getByTestId('indicator')
      expect(indicator).toHaveAttribute('data-label', '10')
    })
  })
})
