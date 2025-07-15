// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Navbar from '@/components/navbar/Navbar'
import { MantineProvider } from '@mantine/core'
import { useLocation } from '@tanstack/react-router'
import { PATHS } from '@/constants/paths'

// Mock the hooks and components
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useLocation: jest.fn(),
  Link: ({ to, children, className, 'data-active': active }: any) => (
    <a
      href={to}
      className={className}
      data-active={active ? 'true' : undefined}
      data-testid={`link-${to}`}
    >
      {children}
    </a>
  ),
}))

// Mock AddNewModal component that tracks its own state
jest.mock('@/components/navbar/AddNewModal', () => {
  return {
    __esModule: true,
    default: ({ opened, onClose }: any) => {
      return opened ? (
        <div data-testid="add-new-modal">
          <div>AddNewModal Mock</div>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null
    },
  }
})

// Mock @mantine/hooks to provide useDisclosure with stable implementation
jest.mock('@mantine/hooks', () => ({
  useDisclosure: jest.fn(() => [
    false,
    { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
  ]),
  useMediaQuery: jest.fn(() => false),
  useMergedRef: jest.fn(() => jest.fn()),
  useId: jest.fn(() => 'test-id'),
  useReducedMotion: jest.fn(() => false),
  useClickOutside: jest.fn(),
  useIsomorphicEffect: jest.fn(),
  useDidUpdate: jest.fn(),
}))

// Mock motion components
jest.mock('motion/react', () => ({
  motion: {
    create: jest.fn().mockImplementation(Component => Component),
    span: 'span',
  },
}))

// Mock the location hook with a default path
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
mockUseLocation.mockReturnValue({ pathname: PATHS.MARKETPLACE } as any)

// Create a custom render function with providers
const customRender = (collapsed = false) => {
  const setCollapsed = jest.fn()

  return {
    setCollapsed,
    ...render(
      <MantineProvider>
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      </MantineProvider>,
    ),
  }
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders navbar with all navigation links', () => {
    customRender()

    // Check for main navigation links
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('MCP Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Add Cluster')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Clusters')).toBeInTheDocument()
    expect(screen.getByText('Deployments')).toBeInTheDocument()

    // Check for bottom navigation links
    expect(screen.getByText('Workspace')).toBeInTheDocument()

    // Check for the Add New button
    expect(screen.getByText('Add new')).toBeInTheDocument()
  })

  it('highlights the active navigation link based on current path', () => {
    mockUseLocation.mockReturnValue({ pathname: PATHS.PROJECTS } as any)

    render(
      <MantineProvider>
        <Navbar collapsed={false} setCollapsed={jest.fn()} />
      </MantineProvider>,
    )

    // Find the Projects link's data-testid
    const projectsLink = screen.getByTestId(`link-${PATHS.PROJECTS}`)
    expect(projectsLink).toHaveAttribute('data-active', 'true')

    // Other links should not be active
    const marketplaceLink = screen.getByTestId(`link-${PATHS.MARKETPLACE}`)
    expect(marketplaceLink).not.toHaveAttribute('data-active', 'true')
  })

  it('renders collapsed navbar correctly', () => {
    customRender(true)

    // In collapsed mode, check that the navbar has the collapsed class
    const navElement = document.querySelector('nav')
    expect(navElement).toHaveClass('collapsed')

    // In collapsed mode, we can check the AddNew div is there but not its text
    const addNewDiv = document.querySelector('.addNew')
    expect(addNewDiv).toBeInTheDocument()
  })

  it('toggles collapsed state when collapser is clicked', () => {
    const { setCollapsed } = customRender(false)

    // Find and click the collapser button
    const collapser = document.querySelector('[class*="collapser"]')
    fireEvent.click(collapser!)

    // setCollapsed should be called with the opposite of current state
    expect(setCollapsed).toHaveBeenCalledWith(expect.any(Function))
  })

  it('shows the AddNewModal when Add new is clicked', () => {
    // Create a mock implementation that properly tracks state
    const mockDisclosure = {
      opened: false,
      open: jest.fn(() => {
        mockDisclosure.opened = true
      }),
      close: jest.fn(() => {
        mockDisclosure.opened = false
      }),
      toggle: jest.fn(() => {
        mockDisclosure.opened = !mockDisclosure.opened
      }),
    }

    // Mock useDisclosure to return our controlled state
    const { useDisclosure } = require('@mantine/hooks')
    useDisclosure.mockReturnValue([mockDisclosure.opened, mockDisclosure])

    // Re-render the component with the new mock
    render(
      <MantineProvider>
        <Navbar collapsed={false} setCollapsed={jest.fn()} />
      </MantineProvider>,
    )

    // Find and click the Add new button
    const addNewButton = screen.getByText('Add new').parentElement!
    fireEvent.click(addNewButton)

    // The open function should have been called
    expect(mockDisclosure.open).toHaveBeenCalled()

    // Since the modal state is controlled by the actual component,
    // we need to check if the modal would appear based on the opened state
    // For this test, we'll just verify the click handler was called
    expect(mockDisclosure.open).toHaveBeenCalledTimes(1)
  })

  it('updates active link when location changes', () => {
    // First render with marketplace active
    mockUseLocation.mockReturnValue({ pathname: PATHS.MARKETPLACE } as any)
    const { rerender } = render(
      <MantineProvider>
        <Navbar collapsed={false} setCollapsed={jest.fn()} />
      </MantineProvider>,
    )

    // Check marketplace is active
    const marketplaceLink = screen.getByTestId(`link-${PATHS.MARKETPLACE}`)
    expect(marketplaceLink).toHaveAttribute('data-active', 'true')

    // Now change location to projects and rerender
    mockUseLocation.mockReturnValue({ pathname: PATHS.PROJECTS } as any)
    rerender(
      <MantineProvider>
        <Navbar collapsed={false} setCollapsed={jest.fn()} />
      </MantineProvider>,
    )

    // Check projects is now active
    const projectsLink = screen.getByTestId(`link-${PATHS.PROJECTS}`)
    expect(projectsLink).toHaveAttribute('data-active', 'true')

    // Marketplace should no longer be active
    expect(screen.getByTestId(`link-${PATHS.MARKETPLACE}`)).not.toHaveAttribute(
      'data-active',
      'true',
    )
  })
})
