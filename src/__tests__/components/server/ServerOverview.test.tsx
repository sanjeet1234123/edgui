// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerOverview from '@/components/server/ServerOverview'
import type { MCPConfig, ServerCharacteristics } from '@/types/serversType'

// Mock the Mantine components
jest.mock(
  '@mantine/core',
  () => {
    const mockTable = ({ children, variant, layout, verticalSpacing }) => (
      <table
        data-testid="mantine-table"
        data-variant={variant}
        data-layout={layout}
        data-vertical-spacing={verticalSpacing}
      >
        {children}
      </table>
    )

    mockTable.Tbody = ({ children }) => (
      <tbody data-testid="mantine-table-tbody">{children}</tbody>
    )
    mockTable.Tr = ({ children }) => (
      <tr data-testid="mantine-table-tr">{children}</tr>
    )
    mockTable.Th = ({ children, w }) => (
      <th data-testid="mantine-table-th" style={{ width: w }}>
        {children}
      </th>
    )
    mockTable.Td = ({ children, miw }) => (
      <td data-testid="mantine-table-td" style={{ minWidth: miw }}>
        {children}
      </td>
    )

    return {
      __esModule: true,
      Card: ({ children }) => <div data-testid="mantine-card">{children}</div>,
      Stack: ({ children, gap }) => (
        <div data-testid="mantine-stack" data-gap={gap}>
          {children}
        </div>
      ),
      Table: mockTable,
      Text: ({ children, fw, tt, fz, className }) => (
        <span
          data-testid="mantine-text"
          data-fw={fw}
          data-tt={tt}
          data-fz={fz}
          className={className}
        >
          {children}
        </span>
      ),
      MantineProvider: ({ children }) => (
        <div data-testid="mantine-provider">{children}</div>
      ),
      useMantineTheme: () => ({
        colors: { blue: ['#000', '#111', '#222', '#333', '#444', '#555'] },
      }),
    }
  },
  { virtual: true },
)

// Mock the CodeHighlight component
jest.mock('@mantine/code-highlight', () => ({
  CodeHighlight: ({ code, language, radius, copyLabel, copiedLabel }) => (
    <div
      data-testid="code-highlight"
      data-code={code}
      data-language={language}
      data-radius={radius}
      data-copy-label={copyLabel}
      data-copied-label={copiedLabel}
    >
      {code}
    </div>
  ),
}))

describe('ServerOverview', () => {
  // Mock data
  const mockCharacteristicsData: ServerCharacteristics = {
    image_source: 'GitHub',
    docker_image: 'nexastack/test-image:latest',
    author: 'NexaStack Team',
    repository: 'https://github.com/nexastack/test-repo',
    dockerfile: '/Dockerfile',
    docker_image_built_by: 'GitHub Actions',
    docker_scout_health_score: '98/100',
    license: 'MIT',
  }

  const mockMcpConfigData: MCPConfig = {
    mcpServers: {
      serverOne: {
        args: ['--verbose', '--port=8080'],
        command: 'node server.js',
        env: {
          NODE_ENV: 'production',
          DEBUG: true,
        },
      },
    },
  }

  // Common render function
  const renderComponent = (
    characteristicsData = mockCharacteristicsData,
    mcpConfigData = mockMcpConfigData,
  ) => {
    return render(
      <ServerOverview
        characteristicsData={characteristicsData}
        mcpConfigData={mcpConfigData}
      />,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with all elements', () => {
    renderComponent()

    // Check main structure components
    expect(screen.getAllByTestId('mantine-stack')[0]).toBeInTheDocument() // Get the first (outer) Stack
    expect(screen.getAllByTestId('mantine-card').length).toBe(2)
  })

  it('renders characteristics data in the table', () => {
    renderComponent()

    // Check table structure
    expect(screen.getByTestId('mantine-table')).toBeInTheDocument()
    expect(screen.getByTestId('mantine-table-tbody')).toBeInTheDocument()
    expect(screen.getAllByTestId('mantine-table-tr').length).toBe(
      Object.keys(mockCharacteristicsData).length,
    )

    // Check specific data rendering
    Object.entries(mockCharacteristicsData).forEach(([key, value]) => {
      // Check the value in table data - this is unique and won't have duplication issues
      expect(screen.getByText(value)).toBeInTheDocument()
    })
  })

  it('properly formats the keys by replacing underscores with spaces', () => {
    renderComponent()

    // Check specific formatting for a key with underscores - use a more specific match
    const dockerImageElement = screen.getAllByText(/^docker image$/i)[0]
    expect(dockerImageElement).toBeInTheDocument()
    expect(dockerImageElement).toHaveAttribute('data-tt', 'capitalize')
  })

  it('renders the Server Config section with CodeHighlight', () => {
    renderComponent()

    // Check section title
    const sectionTitle = screen.getByText(/^Server Config$/i)
    expect(sectionTitle).toBeInTheDocument()
    expect(sectionTitle).toHaveAttribute('data-fw', '600')

    // Check CodeHighlight component
    const codeHighlight = screen.getByTestId('code-highlight')
    expect(codeHighlight).toBeInTheDocument()
    expect(codeHighlight).toHaveAttribute('data-language', 'json')
    expect(codeHighlight).toHaveAttribute('data-radius', 'md')
    expect(codeHighlight).toHaveAttribute('data-copy-label', 'Copy MCP Config')
    expect(codeHighlight).toHaveAttribute('data-copied-label', 'Copied!')

    // Check code content is properly stringified
    const expectedJson = JSON.stringify(mockMcpConfigData, null, 4)
    expect(codeHighlight).toHaveAttribute('data-code', expectedJson)
  })

  it('handles empty characteristics data', () => {
    const emptyCharacteristics = {} as ServerCharacteristics
    renderComponent(emptyCharacteristics, mockMcpConfigData)

    // Should not render any table rows
    expect(screen.queryAllByTestId('mantine-table-tr').length).toBe(0)
  })

  it('handles empty MCP config data', () => {
    const emptyConfig = { mcpServers: {} } as MCPConfig
    renderComponent(mockCharacteristicsData, emptyConfig)

    // Should still render the CodeHighlight component with empty object
    const codeHighlight = screen.getByTestId('code-highlight')
    const expectedJson = JSON.stringify(emptyConfig, null, 4)
    expect(codeHighlight).toHaveAttribute('data-code', expectedJson)
  })

  it('passes the correct styling props to table elements', () => {
    renderComponent()

    // Check table variant and layout
    const table = screen.getByTestId('mantine-table')
    expect(table).toHaveAttribute('data-variant', 'vertical')
    expect(table).toHaveAttribute('data-layout', 'fixed')
    expect(table).toHaveAttribute('data-vertical-spacing', 'sm')

    // Check Th has correct width
    const tableHeaders = screen.getAllByTestId('mantine-table-th')
    tableHeaders.forEach(th => {
      expect(th).toHaveStyle({ width: '220px' })
    })

    // Check Td has correct min-width
    const tableCells = screen.getAllByTestId('mantine-table-td')
    tableCells.forEach(td => {
      expect(td).toHaveStyle({ minWidth: '400px' })
    })
  })
})
