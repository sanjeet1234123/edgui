// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerTools from '@/components/server/ServerTools'
import { PATHS } from '@/constants/paths'

// Mock navigation
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock the server module CSS
jest.mock('@/components/server/server.module.css', () => ({
  accordionItem: 'accordionItem-class',
}))

// Mock the icons
jest.mock('@tabler/icons-react', () => ({
  IconTools: () => <div data-testid="tools-icon">Tools Icon</div>,
  IconArrowUpRight: () => (
    <div data-testid="arrow-up-right-icon">Arrow Up Right</div>
  ),
}))

// Mock the common function
jest.mock('@/utils/commonFunction', () => ({
  removeBackticks: jest.fn(text => (text ? text.replace(/`/g, '') : text)),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const AccordionComponent = ({ children, variant, radius, classNames }) => (
    <div
      data-testid="accordion"
      data-variant={variant}
      data-radius={radius}
      className={classNames?.item}
    >
      {children}
    </div>
  )

  AccordionComponent.Item = ({ children, value }) => (
    <div data-testid="accordion-item" data-value={value}>
      {children}
    </div>
  )

  AccordionComponent.Control = ({ children }) => (
    <div data-testid="accordion-control" onClick={() => {}}>
      {children}
    </div>
  )

  AccordionComponent.Panel = ({ children }) => (
    <div data-testid="accordion-panel">{children}</div>
  )

  return {
    Accordion: AccordionComponent,
    Button: ({ children, size, rightSection, onClick }) => (
      <button data-testid="button" data-size={size} onClick={onClick}>
        {children}
        {rightSection && (
          <span data-testid="button-right-section">{rightSection}</span>
        )}
      </button>
    ),
    Center: ({ children }) => <div data-testid="center">{children}</div>,
    Group: ({ children, gap, justify }) => (
      <div data-testid="group" data-gap={gap} data-justify={justify}>
        {children}
      </div>
    ),
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, fz, fw, c }) => (
      <span
        data-testid="text"
        data-font-size={fz}
        data-font-weight={fw}
        data-color={c}
      >
        {children}
      </span>
    ),
    Title: ({ children, order, fz }) => (
      <h3 data-testid="title" data-order={order} data-font-size={fz}>
        {children}
      </h3>
    ),
    TextInput: ({ size, label, placeholder, required }) => (
      <div data-testid="text-input-wrapper">
        <label data-testid="text-input-label">{label}</label>
        <input
          data-testid="text-input"
          data-size={size}
          placeholder={placeholder}
          required={required}
        />
      </div>
    ),
  }
})

describe('ServerTools', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
  })

  const mockToolsData = [
    {
      tool: 'tool1',
      description: 'This is the first tool description',
      parameters: [
        { name: 'param1', optional: false },
        { name: 'param2', optional: true },
      ],
    },
    {
      tool: 'tool2',
      description: 'This is the second tool description',
      parameters: [],
    },
  ]

  it('renders the tools header correctly', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    expect(screen.getByTestId('tools-icon')).toBeInTheDocument()
    expect(screen.getByTestId('title')).toHaveTextContent('Tools')
  })

  it('renders each tool as an accordion item', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    // We should have an accordion with the correct styling
    const accordion = screen.getByTestId('accordion')
    expect(accordion).toHaveAttribute('data-variant', 'separated')
    expect(accordion).toHaveAttribute('data-radius', 'lg')

    // Check all accordion items are rendered
    const accordionItems = screen.getAllByTestId('accordion-item')
    expect(accordionItems).toHaveLength(2)

    // Check tool names
    const controls = screen.getAllByTestId('accordion-control')
    expect(controls[0]).toHaveTextContent('tool1')
    expect(controls[1]).toHaveTextContent('tool2')
  })

  it('renders tool descriptions correctly', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    // Get all text elements and find the ones containing the descriptions
    const textElements = screen.getAllByTestId('text')
    const descriptions = textElements.filter(
      el =>
        el.textContent === 'This is the first tool description' ||
        el.textContent === 'This is the second tool description',
    )

    expect(descriptions).toHaveLength(2)
    expect(descriptions[0]).toHaveTextContent(
      'This is the first tool description',
    )
    expect(descriptions[1]).toHaveTextContent(
      'This is the second tool description',
    )
  })

  it('renders parameter inputs for tools with parameters', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    // Find all text inputs
    const inputs = screen.getAllByTestId('text-input-wrapper')
    expect(inputs).toHaveLength(2)

    // Check labels and required status
    const labels = screen.getAllByTestId('text-input-label')
    expect(labels[0]).toHaveTextContent('param1')
    expect(labels[1]).toHaveTextContent('param2')

    // Get all input fields
    const inputFields = screen.getAllByTestId('text-input')

    // First parameter should be required (non-optional), second should be optional
    expect(inputFields[0].required).toBeTruthy() // Now expecting true for the required parameter
    expect(inputFields[1].required).toBeFalsy() // And false for the optional parameter
  })

  it('shows "No parameters available" for tools without parameters', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    // Check the center component with the "No parameters" message
    const centers = screen.getAllByTestId('center')
    expect(centers[0]).toHaveTextContent('No parameters available')
  })

  it('navigates to playground when "Try in Playground" button is clicked', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    // Find and click the buttons
    const buttons = screen.getAllByTestId('button')
    fireEvent.click(buttons[0])

    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledWith({
      to: PATHS.PLAYGROUND,
      search: { server: 'test-server' },
    })
  })

  it('renders the IconArrowUpRight in the button', () => {
    render(<ServerTools toolsData={mockToolsData} serverName="test-server" />)

    // Verify the icon is in the button's right section
    const buttonRightSections = screen.getAllByTestId('button-right-section')
    expect(buttonRightSections[0]).toHaveTextContent('Arrow Up Right')
  })

  it('handles empty toolsData gracefully', () => {
    render(<ServerTools toolsData={[]} serverName="test-server" />)

    // Verify the header is still rendered
    expect(screen.getByTestId('title')).toHaveTextContent('Tools')

    // No accordion items should be rendered
    const accordionItems = screen.queryAllByTestId('accordion-item')
    expect(accordionItems).toHaveLength(0)
  })

  it('applies removeBackticks to tool names and descriptions', () => {
    const mockToolsWithBackticks = [
      {
        tool: '`tool1`',
        description: 'This is the `first` tool description',
        parameters: [],
      },
    ]

    const { removeBackticks } = require('@/utils/commonFunction')

    render(
      <ServerTools
        toolsData={mockToolsWithBackticks}
        serverName="test-server"
      />,
    )

    // Verify removeBackticks was called
    expect(removeBackticks).toHaveBeenCalledWith('`tool1`')
    expect(removeBackticks).toHaveBeenCalledWith(
      'This is the `first` tool description',
    )
  })
})
