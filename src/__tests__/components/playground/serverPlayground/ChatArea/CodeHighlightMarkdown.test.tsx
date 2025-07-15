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
import { render, screen } from '@testing-library/react'
import CodeHighlightMarkdown from '@/components/playground/serverPlayground/ChatArea/CodeHighlightMarkdown'

// Mock react-markdown
jest.mock('react-markdown', () => {
  const React = require('react')
  return function ReactMarkdown({
    children,
    remarkPlugins,
    rehypePlugins,
    skipHtml,
    components,
  }) {
    return React.createElement(
      'div',
      {
        'data-testid': 'react-markdown',
        'data-remark-plugins': remarkPlugins?.length || 0,
        'data-rehype-plugins': rehypePlugins?.length || 0,
        'data-skip-html': skipHtml,
        'data-has-components': !!components,
      },
      children,
    )
  }
})

// Mock remark-gfm
jest.mock('remark-gfm', () => {
  return jest.fn(() => 'remark-gfm-plugin')
})

// Mock rehype-raw
jest.mock('rehype-raw', () => {
  return jest.fn(() => 'rehype-raw-plugin')
})

// Mock rehype-highlight
jest.mock('rehype-highlight', () => {
  return jest.fn(() => 'rehype-highlight-plugin')
})

describe('CodeHighlightMarkdown', () => {
  const mockComponents = {
    table: ({ children }) => (
      <table data-testid="custom-table">{children}</table>
    ),
    code: ({ children }) => <code data-testid="custom-code">{children}</code>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      expect(() =>
        render(
          <CodeHighlightMarkdown
            content="# Test Content"
            components={mockComponents}
          />,
        ),
      ).not.toThrow()
    })

    it('renders ReactMarkdown with correct props', () => {
      render(
        <CodeHighlightMarkdown
          content="# Test Content"
          components={mockComponents}
        />,
      )

      const reactMarkdown = screen.getByTestId('react-markdown')
      expect(reactMarkdown).toBeInTheDocument()
      expect(reactMarkdown).toHaveAttribute('data-remark-plugins', '1')
      expect(reactMarkdown).toHaveAttribute('data-rehype-plugins', '2')
      expect(reactMarkdown).toHaveAttribute('data-skip-html', 'false')
      expect(reactMarkdown).toHaveAttribute('data-has-components', 'true')
    })

    it('displays the provided content', () => {
      const testContent = '# Hello World\nThis is a test.'
      render(
        <CodeHighlightMarkdown
          content={testContent}
          components={mockComponents}
        />,
      )

      const reactMarkdown = screen.getByTestId('react-markdown')
      // DOM textContent collapses newlines to spaces
      expect(reactMarkdown).toHaveTextContent('# Hello World This is a test.')
    })
  })

  describe('Props Handling', () => {
    it('handles string content correctly', () => {
      const content = 'Simple text content'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      expect(screen.getByTestId('react-markdown')).toHaveTextContent(content)
    })

    it('handles markdown content with headers', () => {
      const content = '# Header 1\n## Header 2\nSome content'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '# Header 1 ## Header 2 Some content',
      )
    })

    it('handles code blocks in content', () => {
      const content = '```javascript\nconsole.log("Hello");\n```'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '```javascript console.log("Hello"); ```',
      )
    })

    it('handles empty content', () => {
      render(<CodeHighlightMarkdown content="" components={mockComponents} />)

      const reactMarkdown = screen.getByTestId('react-markdown')
      expect(reactMarkdown).toBeInTheDocument()
      expect(reactMarkdown).toBeEmptyDOMElement()
    })

    it('passes components prop correctly', () => {
      const customComponents = {
        h1: ({ children }) => <h1 data-testid="custom-h1">{children}</h1>,
        p: ({ children }) => <p data-testid="custom-p">{children}</p>,
      }

      render(
        <CodeHighlightMarkdown
          content="# Title\nParagraph"
          components={customComponents}
        />,
      )

      expect(screen.getByTestId('react-markdown')).toHaveAttribute(
        'data-has-components',
        'true',
      )
    })

    it('handles null/undefined components', () => {
      render(<CodeHighlightMarkdown content="# Test" components={null} />)

      expect(screen.getByTestId('react-markdown')).toHaveAttribute(
        'data-has-components',
        'false',
      )
    })
  })

  describe('Plugin Configuration', () => {
    it('configures remarkGfm plugin', () => {
      render(
        <CodeHighlightMarkdown content="# Test" components={mockComponents} />,
      )

      const reactMarkdown = screen.getByTestId('react-markdown')
      expect(reactMarkdown).toHaveAttribute('data-remark-plugins', '1')
    })

    it('configures rehype plugins correctly', () => {
      render(
        <CodeHighlightMarkdown content="# Test" components={mockComponents} />,
      )

      const reactMarkdown = screen.getByTestId('react-markdown')
      expect(reactMarkdown).toHaveAttribute('data-rehype-plugins', '2')
    })

    it('sets skipHtml to false', () => {
      render(
        <CodeHighlightMarkdown
          content="<div>HTML content</div>"
          components={mockComponents}
        />,
      )

      const reactMarkdown = screen.getByTestId('react-markdown')
      expect(reactMarkdown).toHaveAttribute('data-skip-html', 'false')
    })
  })

  describe('Content Types', () => {
    it('handles markdown with lists', () => {
      const content = '- Item 1\n- Item 2\n- Item 3'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '- Item 1 - Item 2 - Item 3',
      )
    })

    it('handles markdown with links', () => {
      const content = '[Link text](https://example.com)'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      expect(screen.getByTestId('react-markdown')).toHaveTextContent(content)
    })

    it('handles markdown with tables', () => {
      const content = '| Col 1 | Col 2 |\n|-------|-------|\n| A | B |'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '| Col 1 | Col 2 | |-------|-------| | A | B |',
      )
    })

    it('handles markdown with inline code', () => {
      const content = 'This is `inline code` in text'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      expect(screen.getByTestId('react-markdown')).toHaveTextContent(content)
    })

    it('handles markdown with blockquotes', () => {
      const content = '> This is a blockquote\n> with multiple lines'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '> This is a blockquote > with multiple lines',
      )
    })
  })

  describe('HTML Content', () => {
    it('handles HTML tags in content', () => {
      const content = '<strong>Bold text</strong> and <em>italic text</em>'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      expect(screen.getByTestId('react-markdown')).toHaveTextContent(content)
    })

    it('handles mixed markdown and HTML', () => {
      const content =
        '# Markdown Header\n<div>HTML div</div>\n**Bold markdown**'
      render(
        <CodeHighlightMarkdown content={content} components={mockComponents} />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '# Markdown Header <div>HTML div</div> **Bold markdown**',
      )
    })
  })

  describe('Component Integration', () => {
    it('integrates with DOM correctly', () => {
      const { container } = render(
        <CodeHighlightMarkdown content="# Test" components={mockComponents} />,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('maintains component structure', () => {
      const { container } = render(
        <CodeHighlightMarkdown content="# Test" components={mockComponents} />,
      )

      expect(
        container.querySelector('[data-testid="react-markdown"]'),
      ).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('renders without console errors', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      render(
        <CodeHighlightMarkdown content="# Test" components={mockComponents} />,
      )

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles component lifecycle gracefully', () => {
      const { rerender, unmount } = render(
        <CodeHighlightMarkdown content="# Test" components={mockComponents} />,
      )

      // Should handle rerender
      rerender(
        <CodeHighlightMarkdown
          content="# Updated Test"
          components={mockComponents}
        />,
      )

      // Should handle unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('handles large content efficiently', () => {
      const largeContent = '# Large Content\n' + 'Line of text\n'.repeat(1000)

      expect(() =>
        render(
          <CodeHighlightMarkdown
            content={largeContent}
            components={mockComponents}
          />,
        ),
      ).not.toThrow()
    })

    it('handles complex component configurations', () => {
      const complexComponents = {
        h1: ({ children }) => <h1>{children}</h1>,
        h2: ({ children }) => <h2>{children}</h2>,
        p: ({ children }) => <p>{children}</p>,
        code: ({ children }) => <code>{children}</code>,
        pre: ({ children }) => <pre>{children}</pre>,
        table: ({ children }) => <table>{children}</table>,
        tr: ({ children }) => <tr>{children}</tr>,
        td: ({ children }) => <td>{children}</td>,
        th: ({ children }) => <th>{children}</th>,
      }

      expect(() =>
        render(
          <CodeHighlightMarkdown
            content="# Header\n```js\ncode\n```\n| A | B |\n|---|---|\n| 1 | 2 |"
            components={complexComponents}
          />,
        ),
      ).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('maintains accessible structure', () => {
      render(
        <CodeHighlightMarkdown
          content="# Accessible Content\nThis is accessible."
          components={mockComponents}
        />,
      )

      const markdown = screen.getByTestId('react-markdown')
      expect(markdown).toBeInTheDocument()
    })

    it('preserves semantic meaning', () => {
      const semanticContent = '# Main Title\n## Subtitle\nParagraph text'
      render(
        <CodeHighlightMarkdown
          content={semanticContent}
          components={mockComponents}
        />,
      )

      // DOM textContent collapses newlines to spaces
      expect(screen.getByTestId('react-markdown')).toHaveTextContent(
        '# Main Title ## Subtitle Paragraph text',
      )
    })
  })

  describe('TypeScript Interface', () => {
    it('accepts correct prop types', () => {
      const validProps = {
        content: 'Valid string content',
        components: { h1: ({ children }) => <h1>{children}</h1> },
      }

      expect(() =>
        render(<CodeHighlightMarkdown {...validProps} />),
      ).not.toThrow()
    })

    it('handles various component types', () => {
      const componentTypes = {
        function: ({ children }) => <div>{children}</div>,
        arrow: ({ children }) => <span>{children}</span>,
      }

      expect(() =>
        render(
          <CodeHighlightMarkdown
            content="# Test"
            components={componentTypes}
          />,
        ),
      ).not.toThrow()
    })
  })
})
