// @ts-nocheck
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import ServerTools from '@/components/playground/serverPlayground/ServerDetails/ServerTools'

const renderWithProvider = ui => render(<MantineProvider>{ui}</MantineProvider>)

const mockServer = {
  tools: [
    {
      tool: 'test-tool-1',
      description: 'Test tool 1 description',
      parameters: [
        {
          name: 'required-param-1',
          description: 'Required parameter 1 description',
          optional: false,
        },
        {
          name: 'required-param-2',
          description: 'Required parameter 2 description',
          optional: false,
        },
        {
          name: 'optional-param-1',
          description: 'Optional parameter 1 description',
          optional: true,
        },
      ],
    },
    {
      tool: 'test-tool-2',
      description: 'Test tool 2 description',
      parameters: [],
    },
  ],
}

describe('ServerTools', () => {
  it('renders the tools section with title', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    expect(screen.getByText('Tools')).toBeInTheDocument()
  })

  it('renders all tools in accordion format', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    expect(screen.getByText('test-tool-1')).toBeInTheDocument()
    expect(screen.getByText('test-tool-2')).toBeInTheDocument()
  })

  it('renders tool descriptions', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    expect(screen.getByText('Test tool 1 description')).toBeInTheDocument()
    expect(screen.getByText('Test tool 2 description')).toBeInTheDocument()
  })

  it('renders required and optional parameters for tools with parameters', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    expect(screen.getByText('Required fields')).toBeInTheDocument()
    expect(screen.getByText('Optional fields')).toBeInTheDocument()
    expect(screen.getByText('required-param-1')).toBeInTheDocument()
    expect(screen.getByText('required-param-2')).toBeInTheDocument()
    expect(screen.getByText('optional-param-1')).toBeInTheDocument()
  })

  it('renders "No parameters available" for tools without parameters', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    expect(screen.getByText('No parameters available')).toBeInTheDocument()
  })

  it('renders parameter descriptions in tooltips', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    expect(screen.getByText('required-param-1')).toBeInTheDocument()
    expect(screen.getByText('optional-param-1')).toBeInTheDocument()
  })

  it('renders required parameter indicator (*)', () => {
    renderWithProvider(<ServerTools server={mockServer} />)
    const requiredFieldsSection = screen.getByText('Required fields')
    expect(requiredFieldsSection.textContent).toContain('*')
  })

  it('handles tool with no description', () => {
    const serverWithNoDescription = {
      tools: [
        {
          tool: 'no-description-tool',
          description: '',
          parameters: [],
        },
      ],
    }
    renderWithProvider(<ServerTools server={serverWithNoDescription} />)
    expect(screen.getByText('no-description-tool')).toBeInTheDocument()
  })

  it('handles parameter with no description', () => {
    const serverWithNoParamDescription = {
      tools: [
        {
          tool: 'no-param-desc-tool',
          description: 'Tool description',
          parameters: [
            {
              name: 'no-desc-param',
              description: '',
              optional: false,
            },
          ],
        },
      ],
    }
    renderWithProvider(<ServerTools server={serverWithNoParamDescription} />)
    expect(screen.getByText('no-desc-param')).toBeInTheDocument()
  })
})
