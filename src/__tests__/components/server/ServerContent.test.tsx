// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ServerContent from '@/components/server/ServerContent'

// Mock the CSS imports
jest.mock('@/styles/github-markdown.css', () => ({}))
jest.mock('@/components/server/server.module.css', () => ({
  markdownCard: 'markdownCard',
}))

// Mock the useGetRawGithubFileQuery hook
jest.mock('@/hooks/queries/useServerQueries', () => ({
  useGetRawGithubFileQuery: jest.fn(),
}))

// Mock the Mantine components
jest.mock('@mantine/core', () => ({
  Card: ({ children, className, 'data-theme': theme }) => (
    <div data-testid="mantine-card" className={className} data-theme={theme}>
      {children}
    </div>
  ),
  Center: ({ children }) => <div data-testid="mantine-center">{children}</div>,
  Loader: () => <div data-testid="mantine-loader">Loading...</div>,
  useMantineColorScheme: () => ({ colorScheme: 'light' }),
}))

// Mock ReactMarkdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children, remarkPlugins, rehypePlugins, skipHtml }) => (
    <div
      data-testid="react-markdown"
      data-remark-plugins={remarkPlugins ? 'true' : 'false'}
      data-rehype-plugins={rehypePlugins ? 'true' : 'false'}
      data-skip-html={skipHtml.toString()}
    >
      {children}
    </div>
  ),
}))

// Mock remark-gfm
jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: 'remarkGfm-mock',
}))

// Mock rehype-raw
jest.mock('rehype-raw', () => ({
  __esModule: true,
  default: 'rehypeRaw-mock',
}))

// Import the hooks being mocked
import { useGetRawGithubFileQuery } from '@/hooks/queries/useServerQueries'

describe('ServerContent', () => {
  // Setup QueryClient for testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // Setup the test renderer with QueryClient provider
  const renderComponent = (serverId = 'test-server-id') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ServerContent serverId={serverId} />
      </QueryClientProvider>,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when data is being fetched', () => {
    // Set up mock implementation for loading state
    useGetRawGithubFileQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderComponent()

    // Check that loading spinner is displayed
    expect(screen.getByTestId('mantine-center')).toBeInTheDocument()
    expect(screen.getByTestId('mantine-loader')).toBeInTheDocument()
  })

  it('renders markdown content when data is loaded', () => {
    // Set up mock implementation for loaded state
    const mockMarkdownContent =
      '# Test Markdown\nThis is a test markdown content.'

    useGetRawGithubFileQuery.mockReturnValue({
      data: mockMarkdownContent,
      isLoading: false,
    })

    renderComponent()

    // Check that the card and markdown components are rendered
    expect(screen.getByTestId('mantine-card')).toBeInTheDocument()
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument()

    // Check content is passed correctly
    expect(screen.getByTestId('react-markdown').textContent).toBe(
      mockMarkdownContent,
    )

    // Check that the markdown component has the correct props
    expect(
      screen.getByTestId('react-markdown').getAttribute('data-remark-plugins'),
    ).toBe('true')
    expect(
      screen.getByTestId('react-markdown').getAttribute('data-rehype-plugins'),
    ).toBe('true')
    expect(
      screen.getByTestId('react-markdown').getAttribute('data-skip-html'),
    ).toBe('false')
  })

  it('passes correct className and theme to the Card component', () => {
    // Set up mock implementation
    useGetRawGithubFileQuery.mockReturnValue({
      data: 'Some markdown content',
      isLoading: false,
    })

    renderComponent()

    // Check the card has the correct class and theme
    const card = screen.getByTestId('mantine-card')
    expect(card).toHaveClass('markdownCard')
    expect(card).toHaveAttribute('data-theme', 'light')
  })

  it('correctly passes the theme to the markdown body div', () => {
    // Set up mock implementation
    useGetRawGithubFileQuery.mockReturnValue({
      data: 'Some markdown content',
      isLoading: false,
    })

    renderComponent()

    // Check that the markdown body div has the theme attribute
    const markdownBody = screen
      .getByTestId('mantine-card')
      .querySelector('.markdown.markdown-body')
    expect(markdownBody).toHaveAttribute('data-theme', 'light')
  })

  it('passes serverId to the query hook', () => {
    // Set up mock implementation
    useGetRawGithubFileQuery.mockReturnValue({
      data: 'Test content',
      isLoading: false,
    })

    const testServerId = 'specific-server-id'
    renderComponent(testServerId)

    // Check that the hook was called with the correct serverId
    expect(useGetRawGithubFileQuery).toHaveBeenCalledWith(testServerId)
  })

  it('handles undefined data gracefully', () => {
    // Set up mock implementation with undefined data but not loading
    useGetRawGithubFileQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    })

    renderComponent()

    // Check that the markdown component is still rendered with empty content
    expect(screen.getByTestId('mantine-card')).toBeInTheDocument()
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument()
    expect(screen.getByTestId('react-markdown').textContent).toBe('')
  })
})
