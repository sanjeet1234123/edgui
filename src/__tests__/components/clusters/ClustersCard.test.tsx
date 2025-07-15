// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClustersCard from '../../../components/clusters/ClustersCard'
import { MantineProvider } from '@mantine/core'

// Mock image imports
jest.mock('@/assets/images/aws.svg', () => 'aws-logo')
jest.mock('@/assets/images/azure.svg', () => 'azure-logo')
jest.mock('@/assets/images/gcp-logo.svg', () => 'gcp-logo')
jest.mock('@/assets/images/database-icon.svg', () => 'database-icon')
jest.mock('@/assets/images/nexastack-logo.svg', () => 'nexastack-logo')

// Mock the media query hook
jest.mock('@mantine/hooks', () => {
  const actual = jest.requireActual('@mantine/hooks')
  const React = require('react')
  return {
    ...actual,
    useMediaQuery: jest.fn(),
    useDisclosure: (initial = false) => {
      const [opened, setOpened] = React.useState(initial)
      return [
        opened,
        {
          open: () => setOpened(true),
          close: () => setOpened(false),
        },
      ]
    },
  }
})

// Mock the DeleteClusterModal component
jest.mock('@/components/clusters/DeleteClusterModal', () => ({
  __esModule: true,
  default: ({ opened, onClose, id }) =>
    opened ? (
      <div data-testid="delete-modal" data-id={id}>
        Delete Modal
      </div>
    ) : null,
}))

// Mock the CSS module
jest.mock('@/components/clusters/clusters.module.css', () => ({
  popoverButton: 'popover-button-class',
}))

// Mock the commonFunction utility
jest.mock('@/utils/commonFunction', () => ({
  getResourceUsageText: jest
    .fn()
    .mockImplementation((resource, value) => `${resource} usage: ${value}%`),
  isValidUrl: jest.fn().mockImplementation(url => url.startsWith('http')),
}))

const renderWithMantine = ui => {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

describe('ClustersCard', () => {
  const mockData = {
    id: '1',
    cluster_name: 'Test Cluster',
    provider_name: 'aws',
    onboarded_by: 'Test User',
    gpu_utilization: 45,
    cpu_utilization: 60,
    observability_url: 'https://test.com',
    node_metrics: [
      { node_name: 'node1', status: 'Ready', cpu: '2/4', memory: '4/8' },
      { node_name: 'node2', status: 'Ready', cpu: '3/4', memory: '6/8' },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockReturnValue(false)
  })

  it('renders cluster information correctly', () => {
    renderWithMantine(<ClustersCard data={mockData} />)

    expect(screen.getByText('Test Cluster')).toBeInTheDocument()
    expect(screen.getByText('Onboarded by : Test User')).toBeInTheDocument()
  })

  it('renders node metrics table when metrics are available', () => {
    renderWithMantine(<ClustersCard data={mockData} />)

    expect(screen.getByText('node1')).toBeInTheDocument()
    expect(screen.getByText('node2')).toBeInTheDocument()
    expect(screen.getAllByText('Ready')).toHaveLength(2)
  })

  it('shows correct utilization values', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      return false
    })
    renderWithMantine(<ClustersCard data={mockData} />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('GPU usage: 45%')).toBeInTheDocument()
    expect(screen.getByText('CPU usage: 60%')).toBeInTheDocument()
  })

  it('opens observability URL when clicked', () => {
    const originalOpen = window.open
    window.open = jest.fn()

    renderWithMantine(<ClustersCard data={mockData} />)

    const observabilityButton = screen.getByText('Observability')
    fireEvent.click(observabilityButton)

    expect(window.open).toHaveBeenCalledWith('https://test.com', '_blank')

    window.open = originalOpen
  })

  it('opens delete modal when delete button is clicked', async () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      return false
    })
    renderWithMantine(<ClustersCard data={mockData} />)
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    const modal = await screen.findByTestId('delete-modal')
    expect(modal).toBeInTheDocument()
  })

  it('disables observability button when URL is invalid', () => {
    const invalidData = { ...mockData, observability_url: 'invalid-url' }
    renderWithMantine(<ClustersCard data={invalidData} />)

    const observabilityButton = screen.getByRole('button', {
      name: /observability/i,
    })
    expect(observabilityButton).toBeDisabled()
  })

  it('renders correct provider logo based on provider name', () => {
    renderWithMantine(<ClustersCard data={mockData} />)

    const logos = screen.getAllByAltText('logo')
    expect(logos).toHaveLength(1)
  })

  it('handles different screen sizes correctly', async () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return true
      if (query === '(max-width: 1024px)') return true
      return false
    })
    renderWithMantine(<ClustersCard data={mockData} />)
    const menuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(menuButton)
    const popover = await screen.findByRole('dialog')
    expect(popover).toBeInTheDocument()
  })

  it('renders different provider logos correctly', () => {
    const providers = ['aws', 'azure', 'gcp', 'on-prem', 'nexastack-managed']

    providers.forEach(provider => {
      const data = { ...mockData, provider_name: provider }
      renderWithMantine(<ClustersCard data={data} />)
      const logos = screen.getAllByAltText('logo')
      const lastLogo = logos[logos.length - 1]
      expect(lastLogo).toBeInTheDocument()
    })
  })

  it('shows correct resource usage text', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      return false
    })
    renderWithMantine(<ClustersCard data={mockData} />)

    expect(screen.getByText(/GPU usage: 45%/)).toBeInTheDocument()
    expect(screen.getByText(/CPU usage: 60%/)).toBeInTheDocument()
  })

  it('handles different utilization values and colors correctly', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      return false
    })

    const testCases = [
      { gpu: 0, cpu: 0 },
      { gpu: 25, cpu: 25 },
      { gpu: 45, cpu: 45 },
      { gpu: 75, cpu: 75 },
    ]

    testCases.forEach(({ gpu, cpu }) => {
      const data = { ...mockData, gpu_utilization: gpu, cpu_utilization: cpu }
      const { container } = renderWithMantine(<ClustersCard data={data} />)

      // Check if the correct percentage is displayed in the RingProgress components
      const percentageTexts = container.querySelectorAll('.mantine-Text-root')
      const foundPercentages = Array.from(percentageTexts)
        .map(el => el.textContent)
        .filter(text => text?.includes('%'))

      expect(foundPercentages).toContain(`${gpu}%`)
      expect(foundPercentages).toContain(`${cpu}%`)
    })
  })

  it('handles different screen sizes and responsive layouts', () => {
    const { useMediaQuery } = require('@mantine/hooks')

    // Test case 1: Large screen (>1440px)
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      if (query === '(max-width: 1024px)') return false
      return false
    })
    const { container: largeScreen } = renderWithMantine(
      <ClustersCard data={mockData} />,
    )
    expect(screen.getByText('Observability')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()

    cleanup()

    // Test case 2: Medium screen (1024px-1440px)
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return true
      if (query === '(max-width: 1024px)') return false
      return false
    })
    const { container: mediumScreen } = renderWithMantine(
      <ClustersCard data={mockData} />,
    )
    const actionIcons = screen.getAllByRole('button')
    expect(actionIcons.length).toBeGreaterThan(0)

    cleanup()

    // Test case 3: Small screen (<1024px)
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return true
      if (query === '(max-width: 1024px)') return true
      return false
    })
    const { container: smallScreen } = renderWithMantine(
      <ClustersCard data={mockData} />,
    )
    const menuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(menuButton)
    // Use findByText to wait for popover content
    return Promise.all([
      screen.findByText('Observability'),
      screen.findByText('Delete'),
    ]).then(([observability, del]) => {
      expect(observability).toBeInTheDocument()
      expect(del).toBeInTheDocument()
    })
  })

  it('handles empty node metrics correctly', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      return false
    })

    const dataWithoutMetrics = { ...mockData, node_metrics: [] }
    renderWithMantine(<ClustersCard data={dataWithoutMetrics} />)

    // Table should not be present
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('handles unknown provider name correctly', () => {
    const { useMediaQuery } = require('@mantine/hooks')
    useMediaQuery.mockImplementation(query => {
      if (query === '(max-width: 1440px)') return false
      return false
    })

    const dataWithUnknownProvider = {
      ...mockData,
      provider_name: 'unknown-provider',
    }
    renderWithMantine(<ClustersCard data={dataWithUnknownProvider} />)

    // Should still render a logo (default database icon)
    const logos = screen.getAllByAltText('logo')
    expect(logos).toHaveLength(1)
  })

  afterEach(cleanup)
})
