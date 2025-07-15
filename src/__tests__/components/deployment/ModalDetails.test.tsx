// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModalDetails from '@/components/deployment/ModalDetails'

// Mock the mantine hooks
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Mock the tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconRefresh: () => <div data-testid="refresh-icon">Refresh Icon</div>,
}))

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Cpu: () => <div data-testid="cpu-icon">CPU Icon</div>,
  Database: () => <div data-testid="database-icon">Database Icon</div>,
  MemoryStick: () => <div data-testid="memory-icon">Memory Icon</div>,
  Network: () => <div data-testid="network-icon">Network Icon</div>,
}))

// Mock the agent icons
jest.mock('@/assets/agent-icons', () => ({
  AgentIcons: {
    anthropic: () => <div data-testid="anthropic-icon">Anthropic Icon</div>,
    openai: () => <div data-testid="openai-icon">OpenAI Icon</div>,
    gemini: () => <div data-testid="gemini-icon">Gemini Icon</div>,
  },
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const GridComponent = ({ children, gutter }) => (
    <div data-testid="grid" data-gutter={gutter}>
      {children}
    </div>
  )

  GridComponent.Col = ({ children, span }) => (
    <div data-testid="grid-col" data-span={JSON.stringify(span)}>
      {children}
    </div>
  )

  return {
    ActionIcon: ({ children, variant, size, onClick, loading }) => (
      <button
        data-testid="action-icon"
        data-variant={variant}
        data-size={size}
        data-loading={loading ? 'true' : 'false'}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    Box: ({ children, w }) => (
      <div data-testid="box" data-w={JSON.stringify(w)}>
        {children}
      </div>
    ),
    Button: ({
      children,
      size,
      variant,
      fz,
      leftSection,
      onClick,
      loading,
    }) => (
      <button
        data-testid="button"
        data-size={size}
        data-variant={variant}
        data-fz={fz}
        data-loading={loading ? 'true' : 'false'}
        onClick={onClick}
      >
        {leftSection}
        {children}
      </button>
    ),
    Divider: () => <hr data-testid="divider" />,
    Flex: ({ children, justify, align, direction, gap }) => (
      <div
        data-testid="flex"
        data-justify={justify}
        data-align={align}
        data-direction={direction}
        data-gap={gap}
      >
        {children}
      </div>
    ),
    Grid: GridComponent,
    Group: ({ children, justify, className, gap }) => (
      <div
        data-testid="group"
        data-justify={justify}
        data-gap={gap}
        className={className}
      >
        {children}
      </div>
    ),
    Stack: ({ children, gap }) => (
      <div data-testid="stack" data-gap={gap}>
        {children}
      </div>
    ),
    Text: ({ children, fw, fz, c, truncate }) => (
      <div
        data-testid="text"
        data-fw={fw}
        data-fz={fz}
        data-c={c}
        data-truncate={truncate}
      >
        {children}
      </div>
    ),
    ThemeIcon: ({ children, variant, c, size }) => (
      <div
        data-testid="theme-icon"
        data-variant={variant}
        data-c={c}
        data-size={size}
      >
        {children}
      </div>
    ),
    Tooltip: ({ children, label, position }) => (
      <div data-testid="tooltip" data-label={label} data-position={position}>
        {children}
      </div>
    ),
  }
})

describe('ModalDetails', () => {
  // Mock data for testing
  const mockModel = {
    hf_model_name: 'claude-3-sonnet-20240229',
    provider_base64_image: 'anthropic',
    processor: 'Intel Xeon',
    cores: '8',
    cluster_type: 'Standard',
    nodes: '3',
    ram: '16GB',
    storage: '512GB',
  }

  const mockRefetchClusters = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with model data', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // Check if model name is displayed
    expect(screen.getByText('claude-3-sonnet-20240229')).toBeInTheDocument()

    // Check if refresh button is displayed (desktop view)
    expect(screen.getByText('Refresh')).toBeInTheDocument()

    // Check if infra requirements title is displayed
    expect(screen.getByText('Infra Requirements')).toBeInTheDocument()

    // Check if all infrastructure details are displayed
    expect(screen.getByText('Processor')).toBeInTheDocument()
    expect(screen.getByText('Intel Xeon (8 cores)')).toBeInTheDocument()
    expect(screen.getByText('Cluster')).toBeInTheDocument()
    expect(screen.getByText('Standard (3 Nodes)')).toBeInTheDocument()
    expect(screen.getByText('RAM')).toBeInTheDocument()
    expect(screen.getByText('16GB')).toBeInTheDocument()
    expect(screen.getByText('Storage')).toBeInTheDocument()
    expect(screen.getByText('512GB')).toBeInTheDocument()

    // Check if all icons are displayed
    expect(screen.getByTestId('anthropic-icon')).toBeInTheDocument()
    expect(screen.getByTestId('cpu-icon')).toBeInTheDocument()
    expect(screen.getByTestId('network-icon')).toBeInTheDocument()
    expect(screen.getByTestId('memory-icon')).toBeInTheDocument()
    expect(screen.getByTestId('database-icon')).toBeInTheDocument()
  })

  it('renders correctly in mobile view', () => {
    // Mock mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // In mobile view, we should see the action icon instead of the button
    expect(screen.getByTestId('action-icon')).toBeInTheDocument()
    expect(screen.queryByText('Refresh')).not.toBeInTheDocument()

    // Check tooltip is present in mobile view - use getAllByTestId to handle multiple tooltips
    const tooltips = screen.getAllByTestId('tooltip')
    const refreshTooltip = tooltips.find(
      tooltip => tooltip.getAttribute('data-label') === 'Refresh',
    )
    expect(refreshTooltip).toBeInTheDocument()
  })

  it('displays fallback icon when provider icon is not found', () => {
    // Set a provider that doesn't exist in our mock
    const modelWithUnknownProvider = {
      ...mockModel,
      provider_base64_image: 'unknown_provider',
    }

    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(
      <ModalDetails
        model={modelWithUnknownProvider}
        refetchClusters={mockRefetchClusters}
      />,
    )

    // Should fallback to Anthropic icon
    expect(screen.getByTestId('anthropic-icon')).toBeInTheDocument()
  })

  it('handles refresh button click correctly', async () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // Find and click the refresh button
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    // Check if refetchClusters was called
    expect(mockRefetchClusters).toHaveBeenCalledTimes(1)
  })

  it('handles refresh icon click correctly in mobile view', async () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // Find and click the refresh icon
    const refreshIcon = screen.getByTestId('action-icon')
    fireEvent.click(refreshIcon)

    // Check if refetchClusters was called
    expect(mockRefetchClusters).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when refreshing', async () => {
    // Mock refetchClusters to return a promise that we can control
    const mockRefetchPromise = new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    mockRefetchClusters.mockReturnValue(mockRefetchPromise)

    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // Click the refresh button
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    // Check if button is in loading state
    const buttonElement = screen.getByTestId('button')
    expect(buttonElement).toHaveAttribute('data-loading', 'true')
  })

  it('displays a message when no model is selected', () => {
    render(<ModalDetails model={null} refetchClusters={mockRefetchClusters} />)

    // Should show a message indicating no model is selected
    expect(screen.getByText('No model selected.')).toBeInTheDocument()
  })

  it('renders flex items correctly in mobile view', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // Get all flex containers
    const flexContainers = screen.getAllByTestId('flex')

    // In mobile view, at least one flex container should have column direction
    const hasColumnDirection = flexContainers.some(
      container => container.getAttribute('data-direction') === 'column',
    )

    expect(hasColumnDirection).toBe(true)
  })

  it('renders flex items correctly in desktop view', () => {
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(
      <ModalDetails model={mockModel} refetchClusters={mockRefetchClusters} />,
    )

    // Get all flex containers
    const flexContainers = screen.getAllByTestId('flex')

    // In desktop view, at least one flex container should have row direction
    const hasRowDirection = flexContainers.some(
      container => container.getAttribute('data-direction') === 'row',
    )

    expect(hasRowDirection).toBe(true)
  })
})
