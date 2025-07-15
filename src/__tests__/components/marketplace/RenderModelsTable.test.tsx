// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import RenderModelsTable from '@/components/marketplace/RenderModelsTable'

// Mock AgentIcons with fallback handling
jest.mock('@/assets/agent-icons', () => ({
  AgentIcons: new Proxy(
    {
      user: () => <span data-testid="user-icon">UserIcon</span>,
      openai: () => <span data-testid="openai-icon">OpenAIIcon</span>,
      huggingface: () => (
        <span data-testid="huggingface-icon">HuggingFaceIcon</span>
      ),
      meta: () => <span data-testid="meta-icon">MetaIcon</span>,
    },
    {
      get: function (target, prop) {
        return target[prop] || target.user // Fallback to user icon for unknown providers
      },
    },
  ),
}))

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconCube: () => <span data-testid="icon-cube">CubeIcon</span>,
}))

// Create a wrapper component to properly render table rows
const TableWrapper = ({ children }) => (
  <table>
    <tbody>{children}</tbody>
  </table>
)

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  Badge: ({ children, color, tt, variant }) => (
    <span
      data-testid="badge"
      data-color={color}
      data-tt={tt}
      data-variant={variant}
    >
      {children}
    </span>
  ),
  Box: ({ children, style }) => (
    <div data-testid="box" style={style}>
      {children}
    </div>
  ),
  Button: ({ children, rightSection, variant, size, p, color, onClick }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      data-p={p}
      data-color={color}
      onClick={onClick}
    >
      {children}
      {rightSection}
    </button>
  ),
  Group: ({ children, wrap }) => (
    <div data-testid="group" data-wrap={wrap}>
      {children}
    </div>
  ),
  Table: {
    Tr: ({ children }) => <tr data-testid="table-row">{children}</tr>,
    Td: ({ children, style }) => (
      <td data-testid="table-cell" style={style}>
        {children}
      </td>
    ),
  },
  Text: ({ children, style, lineClamp }) => (
    <span data-testid="text" style={style} data-line-clamp={lineClamp}>
      {children}
    </span>
  ),
}))

describe('RenderModelsTable', () => {
  const mockModel = {
    model_id: 1,
    model_name: 'Test Model',
    description: 'This is a test model description',
    processor_type: 'GPU',
    vulnerability: 'safe',
    provider_base64_image: 'openai',
  }

  const mockHandleCardClick = jest.fn()

  const defaultProps = {
    model: mockModel,
    handleCardClick: mockHandleCardClick,
    user: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders table row with correct structure', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    expect(screen.getByTestId('table-row')).toBeInTheDocument()
    expect(screen.getAllByTestId('table-cell')).toHaveLength(5) // Name, Description, Hardware, Vulnerability, Playground
  })

  it('displays model name correctly', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    expect(screen.getByText('Test Model')).toBeInTheDocument()
  })

  it('displays model description correctly', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    expect(
      screen.getByText('This is a test model description'),
    ).toBeInTheDocument()
  })

  it('shows processor type badge when processor_type exists', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const badges = screen.getAllByTestId('badge')
    const processorBadge = badges.find(badge => badge.textContent === 'GPU')
    expect(processorBadge).toHaveAttribute('data-color', 'var(--clr-secondary)')
  })

  it('shows N/A when processor_type is missing', () => {
    const modelWithoutProcessor = { ...mockModel, processor_type: null }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={modelWithoutProcessor} />
      </TableWrapper>,
    )

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('displays vulnerability badge with correct color for safe vulnerability', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const vulnerabilityBadge = screen
      .getAllByTestId('badge')
      .find(badge => badge.textContent === 'safe')
    expect(vulnerabilityBadge).toHaveAttribute('data-color', 'green')
    expect(vulnerabilityBadge).toHaveAttribute('data-variant', 'light')
    expect(vulnerabilityBadge).toHaveAttribute('data-tt', 'capitalize')
  })

  it('displays vulnerability badge with correct color for unsafe vulnerability', () => {
    const unsafeModel = { ...mockModel, vulnerability: 'unsafe' }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={unsafeModel} />
      </TableWrapper>,
    )

    const vulnerabilityBadge = screen
      .getAllByTestId('badge')
      .find(badge => badge.textContent === 'unsafe')
    expect(vulnerabilityBadge).toHaveAttribute('data-color', 'red')
  })

  it('displays vulnerability badge with correct color for "use with caution" vulnerability', () => {
    const cautionModel = { ...mockModel, vulnerability: 'use with caution' }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={cautionModel} />
      </TableWrapper>,
    )

    const vulnerabilityBadge = screen
      .getAllByTestId('badge')
      .find(badge => badge.textContent === 'use with caution')
    expect(vulnerabilityBadge).toHaveAttribute('data-color', 'yellow')
  })

  it('displays vulnerability badge with gray color for unknown vulnerability', () => {
    const unknownModel = { ...mockModel, vulnerability: 'unknown' }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={unknownModel} />
      </TableWrapper>,
    )

    const vulnerabilityBadge = screen
      .getAllByTestId('badge')
      .find(badge => badge.textContent === 'unknown')
    expect(vulnerabilityBadge).toHaveAttribute('data-color', 'gray')
  })

  it('shows N/A when vulnerability is missing', () => {
    const modelWithoutVulnerability = { ...mockModel, vulnerability: null }
    render(
      <TableWrapper>
        <RenderModelsTable
          {...defaultProps}
          model={modelWithoutVulnerability}
        />
      </TableWrapper>,
    )

    // Should have N/A text for vulnerability
    const naTags = screen.getAllByText('N/A')
    expect(naTags.length).toBeGreaterThan(0)
  })

  it('renders playground button with correct properties', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const playgroundButton = screen.getByTestId('button')
    expect(playgroundButton).toHaveTextContent('Playground')
    expect(playgroundButton).toHaveAttribute('data-variant', 'transparent')
    expect(playgroundButton).toHaveAttribute('data-size', 'xs')
    expect(playgroundButton).toHaveAttribute('data-p', '0')
    expect(playgroundButton).toHaveAttribute(
      'data-color',
      'var(--clr-marketplace-card-playground)',
    )

    // Check for icon
    expect(screen.getByTestId('icon-cube')).toBeInTheDocument()
  })

  it('calls handleCardClick when playground button is clicked', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const playgroundButton = screen.getByTestId('button')
    fireEvent.click(playgroundButton)

    expect(mockHandleCardClick).toHaveBeenCalledWith(mockModel)
  })

  it('displays correct icon based on provider_base64_image', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    expect(screen.getByTestId('openai-icon')).toBeInTheDocument()
  })

  it('displays user icon when provider_base64_image is empty', () => {
    const modelWithEmptyProvider = { ...mockModel, provider_base64_image: '' }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={modelWithEmptyProvider} />
      </TableWrapper>,
    )

    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('displays user icon when provider_base64_image is whitespace', () => {
    const modelWithWhitespaceProvider = {
      ...mockModel,
      provider_base64_image: '   ',
    }
    render(
      <TableWrapper>
        <RenderModelsTable
          {...defaultProps}
          model={modelWithWhitespaceProvider}
        />
      </TableWrapper>,
    )

    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('displays fallback user icon for unknown provider', () => {
    const modelWithUnknownProvider = {
      ...mockModel,
      provider_base64_image: 'unknown-provider',
    }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={modelWithUnknownProvider} />
      </TableWrapper>,
    )

    // Should fallback to user icon for unknown providers
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('openai-icon')).not.toBeInTheDocument()
  })

  it('handles case insensitive provider matching', () => {
    const modelWithUppercaseProvider = {
      ...mockModel,
      provider_base64_image: 'OPENAI',
    }
    render(
      <TableWrapper>
        <RenderModelsTable
          {...defaultProps}
          model={modelWithUppercaseProvider}
        />
      </TableWrapper>,
    )

    expect(screen.getByTestId('openai-icon')).toBeInTheDocument()
  })

  it('applies correct styles to model name text', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const modelNameText = screen.getByText('Test Model')
    expect(modelNameText).toHaveAttribute(
      'style',
      expect.stringContaining('overflow: hidden'),
    )
    expect(modelNameText).toHaveAttribute(
      'style',
      expect.stringContaining('text-overflow: ellipsis'),
    )
    expect(modelNameText).toHaveAttribute(
      'style',
      expect.stringContaining('white-space: nowrap'),
    )
  })

  it('applies correct styles to description box', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const descriptionBox = screen.getByTestId('box')
    expect(descriptionBox).toHaveAttribute(
      'style',
      expect.stringContaining('min-height: 60px'),
    )
    expect(descriptionBox).toHaveAttribute(
      'style',
      expect.stringContaining('width: 100%'),
    )
    expect(descriptionBox).toHaveAttribute(
      'style',
      expect.stringContaining('text-align: justify'),
    )
    expect(descriptionBox).toHaveAttribute(
      'style',
      expect.stringContaining('display: flex'),
    )
    expect(descriptionBox).toHaveAttribute(
      'style',
      expect.stringContaining('align-items: center'),
    )
  })

  it('applies line clamp to description text', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const descriptionText = screen.getByText('This is a test model description')
    expect(descriptionText).toHaveAttribute('data-line-clamp', '3')
  })

  it('renders with user prop correctly', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} user={true} />
      </TableWrapper>,
    )

    // Component should still render normally
    expect(screen.getByTestId('table-row')).toBeInTheDocument()
    expect(screen.getByText('Test Model')).toBeInTheDocument()
  })

  it('handles model without processor_type gracefully', () => {
    const modelWithoutProcessor = { ...mockModel, processor_type: undefined }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={modelWithoutProcessor} />
      </TableWrapper>,
    )

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('handles model without vulnerability gracefully', () => {
    const modelWithoutVulnerability = { ...mockModel, vulnerability: undefined }
    render(
      <TableWrapper>
        <RenderModelsTable
          {...defaultProps}
          model={modelWithoutVulnerability}
        />
      </TableWrapper>,
    )

    const naTags = screen.getAllByText('N/A')
    expect(naTags.length).toBeGreaterThan(0)
  })

  it('renders all table cells with proper content', () => {
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} />
      </TableWrapper>,
    )

    const cells = screen.getAllByTestId('table-cell')
    expect(cells).toHaveLength(5)

    // Name cell
    expect(cells[0]).toHaveTextContent('Test Model')

    // Description cell
    expect(cells[1]).toHaveTextContent('This is a test model description')

    // Hardware cell
    expect(cells[2]).toHaveTextContent('GPU')

    // Vulnerability cell
    expect(cells[3]).toHaveTextContent('safe')

    // Playground cell
    expect(cells[4]).toHaveTextContent('Playground')
  })

  it('trims provider key correctly', () => {
    const modelWithSpacedProvider = {
      ...mockModel,
      provider_base64_image: '  openai  ',
    }
    render(
      <TableWrapper>
        <RenderModelsTable {...defaultProps} model={modelWithSpacedProvider} />
      </TableWrapper>,
    )

    expect(screen.getByTestId('openai-icon')).toBeInTheDocument()
  })
})
