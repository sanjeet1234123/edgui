// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerHeader from '@/components/server/ServerHeader'
import * as routerModule from '@tanstack/react-router'
import moment from 'moment'

// Mock the navigate function
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => mockNavigate),
}))

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false),
}))

// Mock the McpIcons
jest.mock('@/assets/mcp-icons', () => ({
  McpIcons: {
    openai: () => <div data-testid="openai-icon">OpenAI Icon</div>,
    user: () => <div data-testid="user-icon">User Icon</div>,
    github: () => <div data-testid="github-icon">GitHub Icon</div>,
  },
}))

// Mock the formatServerDate function
jest.mock('@/utils/commonFunction', () => ({
  formatServerDate: jest.fn(() => 'mocked date'),
}))

// Mock the CSS module
jest.mock('@/components/server/server.module.css', () => ({
  Description: 'Description',
  Created: 'Created',
}))

// Mock the IconArrowUpRight and IconBrandGithub components
jest.mock('@tabler/icons-react', () => ({
  IconArrowUpRight: () => (
    <div data-testid="arrow-up-right-icon">Arrow Up Right Icon</div>
  ),
  IconBrandGithub: () => (
    <div data-testid="github-brand-icon">GitHub Brand Icon</div>
  ),
}))

// Mock the Mantine components
jest.mock('@mantine/core', () => {
  return {
    useMantineColorScheme: jest.fn(() => ({
      colorScheme: 'light',
      setColorScheme: jest.fn(),
      toggleColorScheme: jest.fn(),
    })),
    ActionIcon: ({ children, size, variant, color, onClick }) => (
      <button
        data-testid={color ? 'github-action-icon' : 'playground-action-icon'}
        data-size={size}
        data-variant={variant}
        data-color={color}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    Button: ({ children, size, rightSection, onClick }) => (
      <button
        data-testid="playground-button"
        data-size={size}
        onClick={onClick}
      >
        {children}
        {rightSection}
      </button>
    ),
    Group: ({ children, justify, align }) => (
      <div data-testid="group" data-justify={justify} data-align={align}>
        {children}
      </div>
    ),
    Stack: ({ children, style }) => (
      <div data-testid="stack" style={style}>
        {children}
      </div>
    ),
    Text: ({ children, className }) => (
      <span data-testid="text" className={className}>
        {children}
      </span>
    ),
    Title: ({ children, className }) => (
      <h1 data-testid="title" className={className}>
        {children}
      </h1>
    ),
    Tooltip: ({ children, label }) => (
      <div data-testid="tooltip" data-label={label}>
        {children}
      </div>
    ),
  }
})

// Create a mock server response
const createMockServer = (serverName = 'openai', hasRepo = true) => ({
  data: [
    {
      name: serverName,
      description: 'Test server description',
      last_updated: '2023-06-15T12:00:00Z',
      characteristics: {
        repository: hasRepo ? 'https://github.com/test/repo' : '',
      },
    },
  ],
  limit: 10,
  page: 1,
  total: 1,
})

describe('ServerHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset media query mock to default (desktop view)
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)
  })

  it('renders the server name correctly', () => {
    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    const titleElement = screen.getByTestId('title')
    expect(titleElement).toHaveTextContent('openai')
  })

  it('renders the server description correctly', () => {
    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    const descriptionElement = screen
      .getAllByTestId('text')
      .find(el => el.className === 'Description')
    expect(descriptionElement).toHaveTextContent('Test server description')
    expect(descriptionElement).toHaveClass('Description')
  })

  it('renders the created date correctly', () => {
    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    const createdElement = screen
      .getAllByTestId('text')
      .find(el => el.className === 'Created')
    expect(createdElement).toHaveTextContent(/Created mocked date/)
    expect(createdElement).toHaveClass('Created')
  })

  it('shows correct icon when server name matches an icon key directly', () => {
    const mockServer = createMockServer('openai').data[0]
    render(<ServerHeader server={mockServer} />)
    expect(screen.getByTestId('openai-icon')).toBeInTheDocument()
  })

  it('shows fallback user icon when no matching icon is found', () => {
    const mockServer = createMockServer('non-existent-service').data[0]
    render(<ServerHeader server={mockServer} />)
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('navigates to playground when Try in Playground button is clicked on desktop', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    fireEvent.click(screen.getByTestId('playground-button'))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/playground',
      search: { server: 'openai' },
    })
  })

  it('navigates to playground when action icon is clicked on mobile', () => {
    // Mock mobile view (is768 = true)
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 768px)') return true
      return false
    })

    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    fireEvent.click(screen.getByTestId('playground-action-icon'))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/playground',
      search: { server: 'openai' },
    })
  })

  it('opens repository in new window when GitHub icon is clicked', () => {
    global.open = jest.fn()

    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    fireEvent.click(screen.getByTestId('github-action-icon'))
    expect(global.open).toHaveBeenCalledWith(
      'https://github.com/test/repo',
      '_blank',
    )
  })

  it('handles responsive layout for different screen sizes', () => {
    // Test tablet view (is1024 = true, is768 = false)
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1024px)') return true
      if (query === '(max-width: 768px)') return false
      return false
    })

    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    const stack = screen.getByTestId('stack')
    expect(stack).toHaveStyle({ maxWidth: '60%' })
    const button = screen.getByTestId('playground-button')
    expect(button).toHaveAttribute('data-size', 'md')
  })

  it('uses fallback value for icon when icon name is included in server name', () => {
    const mockServer = createMockServer('test-github-server').data[0]
    render(<ServerHeader server={mockServer} />)
    expect(screen.getByTestId('github-icon')).toBeInTheDocument()
  })

  it('handles mobile view correctly', () => {
    // Mock mobile view (is768 = true)
    require('@mantine/hooks').useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 768px)') return true
      return false
    })

    const mockServer = createMockServer().data[0]
    render(<ServerHeader server={mockServer} />)
    expect(screen.getByTestId('playground-action-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('playground-button')).not.toBeInTheDocument()
  })

  it('has a repository link that is properly shown in the UI', () => {
    // Create a server with a repo URL
    const serverWithRepo = createMockServer('openai', true).data[0]
    const { unmount } = render(<ServerHeader server={serverWithRepo} />)
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-label',
      'Go to repository',
    )
    unmount()
    const serverWithoutRepo = createMockServer('openai', false).data[0]
    render(<ServerHeader server={serverWithoutRepo} />)
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-label',
      'Go to repository',
    )
  })
})
