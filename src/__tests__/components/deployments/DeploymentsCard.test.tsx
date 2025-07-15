// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import DeploymentCard from '@/components/deployments/DeploymentsCard'

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
  useDisclosure: jest
    .fn()
    .mockReturnValue([false, { open: jest.fn(), close: jest.fn() }]),
}))

// Mock the deployments query hook
jest.mock('@/hooks/queries/useDeploymentsQueries', () => ({
  useDeploymentsQuery: jest.fn().mockReturnValue({
    refetch: jest.fn(),
  }),
}))

// Mock the utility functions
jest.mock('@/utils/commonFunction', () => ({
  getDeploymentStatusColor: jest.fn().mockReturnValue('green'),
  isValidUrl: jest
    .fn()
    .mockImplementation(url =>
      Boolean(url && (url.startsWith('http://') || url.startsWith('https://'))),
    ),
}))

// Mock the CSS module
jest.mock('@/components/deployments/deployments.module.css', () => ({
  modelIcon: 'modelIcon-class',
  modelCardTh: 'modelCardTh-class',
  modelCardTd: 'modelCardTd-class',
  modelCardText: 'modelCardText-class',
  popoverButton: 'popoverButton-class',
}))

// Mock agent icons with a user icon component that will work as default
const UserIconComponent = () => <div data-testid="user-icon" />

// Mock agent icons
jest.mock('@/assets/agent-icons', () => {
  // Create mock components for each icon
  const mockIcons = {
    openai: () => <div data-testid="openai-icon" />,
    anthropic: () => <div data-testid="anthropic-icon" />,
    gemini: () => <div data-testid="gemini-icon" />,
    mistral: () => <div data-testid="mistral-icon" />,
    user: UserIconComponent, // This will be used as a fallback
  }

  // Create proxy to handle unknown icon names
  return {
    AgentIcons: new Proxy(mockIcons, {
      get: (target, prop) => {
        // Return the requested icon or fall back to the user icon
        return target[prop] || UserIconComponent
      },
    }),
  }
})

// Mock DeleteDeploymentModal
jest.mock('@/components/deployments/DeleteDeploymentsModal', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ opened, onClose, id }) =>
    opened ? (
      <div data-testid="delete-modal" data-id={id}>
        Delete Modal
      </div>
    ) : null,
  ),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => {
  // Create a Popover component with proper subcomponents
  const PopoverComponent = ({ children, position }) => (
    <div data-testid="popover" data-position={position}>
      {children}
    </div>
  )
  PopoverComponent.Target = ({ children }) => (
    <div data-testid="popover-target">{children}</div>
  )
  PopoverComponent.Dropdown = ({ children }) => (
    <div data-testid="popover-dropdown">{children}</div>
  )

  // Create a CopyButton component
  const CopyButtonComponent = ({ value, children }) => {
    const renderProp =
      typeof children === 'function' ? children : () => children
    return renderProp({ copied: true, copy: jest.fn() })
  }

  // Create Table with nested components
  const TableComponent = ({
    children,
    variant,
    layout,
    withRowBorders,
    styles,
  }) => (
    <table
      data-testid="table"
      data-variant={variant}
      data-layout={layout}
      data-with-row-borders={withRowBorders}
    >
      {children}
    </table>
  )

  TableComponent.Tbody = ({ children }) => (
    <tbody data-testid="tbody">{children}</tbody>
  )
  TableComponent.Tr = ({ children }) => <tr data-testid="tr">{children}</tr>
  TableComponent.Th = ({ children, w }) => (
    <th data-testid="th" data-width={w}>
      {children}
    </th>
  )
  TableComponent.Td = ({ children }) => <td data-testid="td">{children}</td>

  return {
    ActionIcon: ({ children, variant, color, size, onClick, disabled }) => (
      <button
        data-testid="action-icon"
        data-variant={variant}
        data-color={color}
        data-size={size}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    ),
    Badge: ({ children, size, variant, color, fz, tt }) => (
      <span
        data-testid="badge"
        data-size={size}
        data-variant={variant}
        data-color={color}
        data-fz={fz}
        data-tt={tt}
      >
        {children}
      </span>
    ),
    Box: ({ children, w }) => (
      <div
        data-testid="box"
        data-width={typeof w === 'object' ? JSON.stringify(w) : w}
      >
        {children}
      </div>
    ),
    Button: ({
      children,
      variant,
      color,
      size,
      leftSection,
      onClick,
      disabled,
      justify,
      fullWidth,
      className,
    }) => (
      <button
        data-testid="button"
        data-variant={variant}
        data-color={color}
        data-size={size}
        data-justify={justify}
        data-fullwidth={fullWidth ? 'true' : 'false'}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {leftSection && (
          <span data-testid="button-left-section">{leftSection}</span>
        )}
        {children}
      </button>
    ),
    Card: ({ children, padding }) => (
      <div data-testid="card" data-padding={padding}>
        {children}
      </div>
    ),
    CopyButton: CopyButtonComponent,
    Group: ({ children, justify, gap, align, w, mb }) => (
      <div
        data-testid="group"
        data-justify={justify}
        data-gap={gap}
        data-align={align}
        data-width={w}
        data-mb={mb}
      >
        {children}
      </div>
    ),
    Popover: PopoverComponent,
    Stack: ({ children, style, justify, gap, w }) => (
      <div
        data-testid="stack"
        data-justify={justify}
        data-gap={gap}
        data-width={w}
        style={style}
      >
        {children}
      </div>
    ),
    Table: TableComponent,
    Text: ({ children, classNames, c, fz, fw }) => (
      <span
        data-testid="text"
        data-color={c}
        data-fz={fz}
        data-fw={fw}
        className={classNames?.root}
      >
        {children}
      </span>
    ),
    TextInput: ({ size, variant, radius, value, readOnly, c }) => (
      <input
        data-testid="text-input"
        data-size={size}
        data-variant={variant}
        data-radius={radius}
        data-readonly={readOnly ? 'true' : 'false'}
        data-color={c}
        value={value}
        readOnly={readOnly}
      />
    ),
    Title: ({ children, order, fz, c, fw, style }) => (
      <div
        data-testid="title"
        data-order={order}
        data-fz={typeof fz === 'object' ? JSON.stringify(fz) : fz}
        data-color={c}
        data-fw={fw}
        style={style}
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

// Mock Sparkline component
jest.mock('@mantine/charts', () => ({
  Sparkline: ({
    w,
    h,
    data,
    curveType,
    color,
    fillOpacity,
    withGradient,
    strokeWidth,
  }) => (
    <div
      data-testid="sparkline"
      data-width={w}
      data-height={h}
      data-curve-type={curveType}
      data-color={color}
      data-fill-opacity={fillOpacity}
      data-with-gradient={withGradient ? 'true' : 'false'}
      data-stroke-width={strokeWidth}
    >
      Sparkline Chart (Data points: {data.length})
    </div>
  ),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Landmark: () => <div data-testid="landmark-icon" />,
  Link: () => <div data-testid="link-icon" />,
  UserRound: () => <div data-testid="user-round-icon" />,
}))

// Mock Tabler icons
jest.mock('@tabler/icons-react', () => ({
  IconArrowDownRight: ({ color }) => (
    <div data-testid="arrow-down-icon" data-color={color} />
  ),
  IconArrowUpRight: ({ color }) => (
    <div data-testid="arrow-up-icon" data-color={color} />
  ),
  IconDeviceIpadHorizontalShare: () => <div data-testid="device-share-icon" />,
  IconDotsVertical: ({ size, strokeWidth }) => (
    <div
      data-testid="dots-icon"
      data-size={size}
      data-stroke-width={strokeWidth}
    />
  ),
  IconListSearch: () => <div data-testid="list-search-icon" />,
  IconRefresh: () => <div data-testid="refresh-icon" />,
  IconTrash: () => <div data-testid="trash-icon" />,
}))

// Mock window.open
const mockOpen = jest.fn()
global.open = mockOpen

describe('DeploymentCard', () => {
  // Create mock data for tests
  const mockData = {
    id: 123,
    model_name: 'Test GPT Model',
    mode_icon: 'openai',
    deployed_by: 'John Doe',
    Created_at: '2023-07-15T10:30:00',
    cluster: 'production-cluster',
    endpoint_url: 'https://api.example.com/model/123',
    token_usage: 5000,
    token_usage_percentage: 12,
    status: 'running',
    observability_url: 'https://observe.example.com/123',
    logs_url: 'https://logs.example.com/123',
    governance_url: 'https://governance.example.com/123',
    data: [10, 20, 30, 25, 40, 35, 45],
  }

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    mockOpen.mockClear()
  })

  it('renders the card with model name and status', () => {
    // Mock desktop view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    render(<DeploymentCard data={mockData} />)

    expect(screen.getByText('Test GPT Model')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
    expect(screen.getByTestId('openai-icon')).toBeInTheDocument()
  })

  it('shows correct model data in the card', () => {
    // Mock desktop view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    render(<DeploymentCard data={mockData} />)

    expect(screen.getByText('Deployed by')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Created at')).toBeInTheDocument()
    expect(screen.getByText('2023-07-15T10:30:00')).toBeInTheDocument()
    expect(screen.getByText('Cluster')).toBeInTheDocument()
    expect(screen.getByText('production-cluster')).toBeInTheDocument()
    expect(screen.getByText('Endpoint URL')).toBeInTheDocument()
    expect(screen.getByTestId('text-input')).toHaveValue(
      'https://api.example.com/model/123',
    )
  })

  it('displays token usage information correctly', () => {
    // Mock desktop view for larger screen
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentCard data={mockData} />)

    expect(screen.getByText('Token Usage')).toBeInTheDocument()
    expect(screen.getByText('5000')).toBeInTheDocument()
    expect(screen.getByText('12%')).toBeInTheDocument()
    // Should render a sparkline chart
    expect(screen.getByTestId('sparkline')).toBeInTheDocument()
  })

  it('renders correctly on smaller screens (< 1600px)', () => {
    // Mock tablet view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(false) // is1024px = false

    render(<DeploymentCard data={mockData} />)

    // Should display action buttons instead of side panel
    expect(screen.queryByText('Token Usage')).not.toBeInTheDocument()
    // Should show action buttons
    expect(screen.getAllByTestId('action-icon').length).toBeGreaterThan(0)
  })

  it('renders correctly on mobile screens (< 1024px)', () => {
    // Mock mobile view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(true) // is1024px = true

    render(<DeploymentCard data={mockData} />)

    // Should display the dots icon (menu) on mobile
    expect(screen.getByTestId('dots-icon')).toBeInTheDocument()
    // Should show a popover
    expect(screen.getByTestId('popover')).toBeInTheDocument()
  })

  it('handles the Copy URL button click when URL is copied', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentCard data={mockData} />)

    // Since our CopyButton mock returns copied: true, we should see "Copied" instead of "Copy URL"
    const copyButton = screen.getByText('Copied')
    expect(copyButton).toBeInTheDocument()
    fireEvent.click(copyButton)
  })

  it('handles the Delete button click and shows modal', () => {
    // Setup mock for useDisclosure
    const openMock = jest.fn()
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      false,
      { open: openMock, close: jest.fn() },
    ])

    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentCard data={mockData} />)

    // Find and click the delete button
    const deleteButton = screen.getByTestId('trash-icon').closest('button')
    fireEvent.click(deleteButton)

    expect(openMock).toHaveBeenCalled()
  })

  it('shows delete modal when opened state is true', () => {
    // Setup mock for useDisclosure to return opened=true
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      true,
      { open: jest.fn(), close: jest.fn() },
    ])

    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentCard data={mockData} />)

    // The delete modal should be shown
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
    expect(screen.getByTestId('delete-modal')).toHaveAttribute('data-id', '123')
  })

  it('opens URLs when corresponding buttons are clicked', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentCard data={mockData} />)

    // Find and click the buttons
    const buttons = screen.getAllByTestId('button')
    const viewLogsButton = buttons.find(button =>
      button.textContent.includes('View Logs'),
    )
    const observabilityButton = buttons.find(button =>
      button.textContent.includes('Observability'),
    )
    const governanceButton = buttons.find(button =>
      button.textContent.includes('Governance'),
    )

    fireEvent.click(viewLogsButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'https://logs.example.com/123',
      '_blank',
    )

    fireEvent.click(observabilityButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'https://observe.example.com/123',
      '_blank',
    )

    fireEvent.click(governanceButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'https://governance.example.com/123',
      '_blank',
    )
  })

  it('does not open URLs for buttons with invalid or empty URLs', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    // Create data with invalid URLs
    const invalidUrlData = {
      ...mockData,
      logs_url: '', // Empty URL
      observability_url: 'not-valid-url', // Invalid URL
    }

    // Mock isValidUrl to properly check URLs
    require('@/utils/commonFunction').isValidUrl.mockImplementation(url =>
      Boolean(url && (url.startsWith('http://') || url.startsWith('https://'))),
    )

    render(<DeploymentCard data={invalidUrlData} />)

    // Find and check buttons
    const buttons = screen.getAllByTestId('button')
    const viewLogsButton = buttons.find(button =>
      button.textContent.includes('View Logs'),
    )
    const observabilityButton = buttons.find(button =>
      button.textContent.includes('Observability'),
    )

    expect(viewLogsButton).toHaveAttribute('disabled', '')
    expect(observabilityButton).toHaveAttribute('disabled', '')

    // Attempt to click (should have no effect)
    fireEvent.click(viewLogsButton)
    fireEvent.click(observabilityButton)

    // Should not have called window.open for invalid URLs
    expect(mockOpen).not.toHaveBeenCalled()
  })

  it('handles token usage percentage for negative values', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    const negativePercentageData = {
      ...mockData,
      token_usage_percentage: -5,
    }

    render(<DeploymentCard data={negativePercentageData} />)

    expect(screen.getByText('-5%')).toBeInTheDocument()
    // Should render a downward arrow for negative percentage
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-down-icon')).toHaveAttribute(
      'data-color',
      '#FB1212',
    )
  })

  it('renders upward arrow for positive token usage percentage', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<DeploymentCard data={mockData} />) // Default mockData has 12% (positive)

    expect(screen.getByText('12%')).toBeInTheDocument()
    // Should render an upward arrow for positive percentage
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-up-icon')).toHaveAttribute(
      'data-color',
      '#16A34A',
    )
  })

  it('correctly handles the refresh button click', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    const refetchMock = jest.fn()
    require('@/hooks/queries/useDeploymentsQueries').useDeploymentsQuery.mockReturnValue(
      {
        refetch: refetchMock,
      },
    )

    render(<DeploymentCard data={mockData} />)

    // Find and click the refresh button
    const refreshButton = screen.getByTestId('refresh-icon').closest('button')
    fireEvent.click(refreshButton)

    expect(refetchMock).toHaveBeenCalled()
  })

  it('handles popover button clicks in mobile view', () => {
    // Mock mobile view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(true) // is1024px = true

    const refetchMock = jest.fn()
    require('@/hooks/queries/useDeploymentsQueries').useDeploymentsQuery.mockReturnValue(
      {
        refetch: refetchMock,
      },
    )

    // Mock the open method from useDisclosure
    const openMock = jest.fn()
    require('@mantine/hooks').useDisclosure.mockReturnValue([
      false,
      { open: openMock, close: jest.fn() },
    ])

    render(<DeploymentCard data={mockData} />)

    // Find the popover dropdown
    const popoverDropdown = screen.getByTestId('popover-dropdown')

    // Find buttons within the popover
    const popoverButtons = within(popoverDropdown).getAllByTestId('button')

    // Click the Refresh button
    const refreshButton = popoverButtons.find(button =>
      button.textContent.includes('Refresh'),
    )
    fireEvent.click(refreshButton)
    expect(refetchMock).toHaveBeenCalled()

    // Click the Delete button
    const deleteButton = popoverButtons.find(button =>
      button.textContent.includes('Delete'),
    )
    fireEvent.click(deleteButton)
    expect(openMock).toHaveBeenCalled()

    // Test URL buttons
    const viewLogsButton = popoverButtons.find(button =>
      button.textContent.includes('View Logs'),
    )
    fireEvent.click(viewLogsButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'https://logs.example.com/123',
      '_blank',
    )
  })

  it('handles unknown model icon gracefully', () => {
    // Mock desktop view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    // Data with unknown model icon
    const unknownIconData = {
      ...mockData,
      mode_icon: 'unknown_icon_name', // This doesn't exist in our mock AgentIcons
    }

    render(<DeploymentCard data={unknownIconData} />)

    // Should still render without crashing and use the user icon as fallback
    expect(screen.getByText('Test GPT Model')).toBeInTheDocument()
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('handles missing status and shows unknown', () => {
    // Mock desktop view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(false)
      .mockReturnValueOnce(false)

    // Data with undefined status
    const noStatusData = {
      ...mockData,
      status: undefined,
    }

    render(<DeploymentCard data={noStatusData} />)

    // Should show "unknown" as the status
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('renders the tablet view buttons with action icons', () => {
    // Mock tablet view (1600px > width > 1024px)
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(false) // is1024px = false

    render(<DeploymentCard data={mockData} />)

    // Should find the full row of action icons in the tablet view
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
    expect(screen.getByTestId('list-search-icon')).toBeInTheDocument()
    expect(screen.getByTestId('device-share-icon')).toBeInTheDocument()
    expect(screen.getByTestId('landmark-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument()

    // Click the refresh icon
    const refreshAction = screen.getByTestId('refresh-icon').closest('button')
    fireEvent.click(refreshAction)

    // Should call refetch
    expect(
      require('@/hooks/queries/useDeploymentsQueries').useDeploymentsQuery()
        .refetch,
    ).toHaveBeenCalled()
  })

  it('tests conditional rendering of url buttons in mobile view', () => {
    // Mock mobile view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(true) // is1024px = true

    // Create data with some invalid URLs
    const mixedUrlData = {
      ...mockData,
      logs_url: 'https://valid-logs.example.com',
      observability_url: '', // Invalid empty URL
    }

    render(<DeploymentCard data={mixedUrlData} />)

    // Find the popover dropdown
    const popoverDropdown = screen.getByTestId('popover-dropdown')

    // Find buttons within the popover
    const popoverButtons = within(popoverDropdown).getAllByTestId('button')

    // Verify View Logs button is enabled (valid URL)
    const viewLogsButton = popoverButtons.find(button =>
      button.textContent.includes('View Logs'),
    )
    expect(viewLogsButton).not.toHaveAttribute('disabled', '')

    // Verify Observability button is disabled (invalid URL)
    const observabilityButton = popoverButtons.find(button =>
      button.textContent.includes('Observability'),
    )
    expect(observabilityButton).toHaveAttribute('disabled', '')

    // Click the enabled View Logs button
    fireEvent.click(viewLogsButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'https://valid-logs.example.com',
      '_blank',
    )
  })

  it('handles URLs in tablet view (between mobile and desktop)', () => {
    // Mock tablet view
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(false) // is1024px = false

    // Create data with mixed URL validity
    const mixedUrlData = {
      ...mockData,
      logs_url: 'https://valid-logs.example.com',
      observability_url: '', // Empty URL - invalid
      governance_url: 'http://valid-governance.example.com',
    }

    // Mock isValidUrl function
    require('@/utils/commonFunction').isValidUrl.mockImplementation(url =>
      Boolean(url && (url.startsWith('http://') || url.startsWith('https://'))),
    )

    render(<DeploymentCard data={mixedUrlData} />)

    // Get all the action icons
    const actionIcons = screen.getAllByTestId('action-icon')

    // Test clicking on each button with a valid URL
    // Logs button should be enabled
    const logsButton = actionIcons.find(button =>
      button.innerHTML.includes('list-search-icon'),
    )
    expect(logsButton).not.toHaveAttribute('disabled', '')
    fireEvent.click(logsButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'https://valid-logs.example.com',
      '_blank',
    )

    // Observability button should be disabled
    const observabilityButton = actionIcons.find(button =>
      button.innerHTML.includes('device-share-icon'),
    )
    expect(observabilityButton).toHaveAttribute('disabled', '')

    // Governance button should be enabled
    const governanceButton = actionIcons.find(button =>
      button.innerHTML.includes('landmark-icon'),
    )
    expect(governanceButton).not.toHaveAttribute('disabled', '')
    fireEvent.click(governanceButton)
    expect(mockOpen).toHaveBeenCalledWith(
      'http://valid-governance.example.com',
      '_blank',
    )
  })

  it('tests sparkline chart with different token usage values', () => {
    // Mock desktop view for larger screen
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    // Test with zero percentage data
    const zeroPercentageData = {
      ...mockData,
      token_usage_percentage: 0,
    }

    render(<DeploymentCard data={zeroPercentageData} />)

    // Should display 0% with a downward arrow for zero percent
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument()

    // Check the sparkline chart is using the correct color for zero percentage
    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-color', '#FB1212') // Should use red for 0%

    // Cleanup
    cleanup()

    // Test with positive percentage data
    render(<DeploymentCard data={mockData} />)

    // Check that the sparkline chart is using the correct color for positive percentage
    const positiveSparkline = screen.getByTestId('sparkline')
    expect(positiveSparkline).toHaveAttribute('data-color', '#16A34A') // Should use green for positive
  })

  it('tests governance URL in mobile view and desktop action buttons', () => {
    // Test mobile view for governance URL handling
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(true) // is1600px = true
      .mockReturnValueOnce(true) // is1024px = true

    // Create data with a specific governance URL
    const governanceData = {
      ...mockData,
      governance_url: 'https://governance-test.example.com',
    }

    render(<DeploymentCard data={governanceData} />)

    // Find the popover dropdown
    const popoverDropdown = screen.getByTestId('popover-dropdown')

    // Find the governance button within the popover
    const popoverButtons = within(popoverDropdown).getAllByTestId('button')
    const governanceButton = popoverButtons.find(button =>
      button.textContent.includes('Governance'),
    )

    // Click the governance button
    fireEvent.click(governanceButton)

    // Verify the URL was opened
    expect(mockOpen).toHaveBeenCalledWith(
      'https://governance-test.example.com',
      '_blank',
    )

    // Cleanup
    cleanup()
    mockOpen.mockClear()

    // Now test non-mobile view (desktop) with action buttons
    require('@mantine/hooks')
      .useMediaQuery.mockReturnValueOnce(false) // is1600px = false
      .mockReturnValueOnce(false) // is1024px = false

    render(<DeploymentCard data={governanceData} />)

    // Find desktop buttons directly without using a specific stack
    const governanceDesktopButton = screen
      .getAllByTestId('button')
      .find(button => button.textContent.includes('Governance'))

    // Ensure button was found
    expect(governanceDesktopButton).toBeTruthy()

    // Click the governance button
    fireEvent.click(governanceDesktopButton)

    // Verify the URL was opened
    expect(mockOpen).toHaveBeenCalledWith(
      'https://governance-test.example.com',
      '_blank',
    )
  })
})
