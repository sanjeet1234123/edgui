// @ts-nocheck
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClustersList from '@/components/deployment/ClustersList'

// Mock the react-router
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
}))

// Mock the media query hook
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn(),
}))

// Mock constants
jest.mock('@/constants/paths', () => ({
  PATHS: {
    ADD_CLUSTER: '/clusters/add',
  },
}))

// Mock the RenderClusters component
jest.mock('@/components/deployment/RenderClusters', () => ({
  __esModule: true,
  default: jest.fn(({ clustersData, model }) => (
    <div
      data-testid="render-clusters"
      data-clusters={JSON.stringify(clustersData)}
      data-model={JSON.stringify(model)}
    >
      RenderClusters Component
    </div>
  )),
}))

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ActionIcon: ({ children, onClick, size }) => (
    <button data-testid="action-icon" onClick={onClick} data-size={size}>
      {children}
    </button>
  ),
  Button: ({ children, onClick, size, leftSection }) => (
    <button data-testid="button" onClick={onClick} data-size={size}>
      {leftSection}
      {children}
    </button>
  ),
  Group: ({ children, justify }) => (
    <div data-testid="group" data-justify={justify}>
      {children}
    </div>
  ),
  Stack: ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap} className="flex-grow">
      {children}
    </div>
  ),
  Title: ({ children, order }) => (
    <h2 data-testid="title" data-order={order}>
      {children}
    </h2>
  ),
  Tooltip: ({ children, label }) => (
    <div data-testid="tooltip" data-label={label}>
      {children}
    </div>
  ),
}))

// Mock icons
jest.mock('@tabler/icons-react', () => ({
  IconPlus: () => <div data-testid="plus-icon">Plus Icon</div>,
}))

describe('ClustersList', () => {
  // Sample data for testing
  const mockClustersData = {
    suitable_clusters: [
      {
        cluster_name: 'Test Cluster',
        cloud_type: 'aws',
        user_email: 'test@example.com',
        environment: 'dev',
        gpu: '2',
        cpu: '4',
        ram: '16GB',
        storage: '100GB',
        nodes: '3',
        node_metrics: [
          {
            gpu_allocatable: '2',
            cpu_allocatable: '4',
            memory_allocatable: '16GB',
            node_name: 'node-1',
          },
        ],
        is_suffiecient_resource: true,
      },
    ],
  }

  const mockModel = {
    name: 'Test Model',
    deployment_name: 'test-deployment',
    hf_model_name: 'test/model',
  }

  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    require('@tanstack/react-router').useNavigate.mockReturnValue(mockNavigate)
  })

  it('renders the title correctly', () => {
    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    expect(screen.getByText('Select Cluster to deploy')).toBeInTheDocument()
  })

  it('renders the RenderClusters component with correct props', () => {
    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const renderClustersComponent = screen.getByTestId('render-clusters')
    expect(renderClustersComponent).toBeInTheDocument()

    // Verify data is passed correctly
    expect(
      JSON.parse(renderClustersComponent.getAttribute('data-clusters')),
    ).toEqual(mockClustersData)
    expect(
      JSON.parse(renderClustersComponent.getAttribute('data-model')),
    ).toEqual(mockModel)
  })

  it('renders a button to add clusters in desktop view', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const addButton = screen.getByTestId('button')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveTextContent('Add Cluster')

    // Verify the plus icon is rendered
    const plusIcon = screen.getByTestId('plus-icon')
    expect(plusIcon).toBeInTheDocument()
  })

  it('renders an action icon to add clusters in mobile view', () => {
    // Mock mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveAttribute('data-label', 'Add Cluster')

    const actionIcon = screen.getByTestId('action-icon')
    expect(actionIcon).toBeInTheDocument()

    // Verify the plus icon is rendered
    const plusIcon = screen.getByTestId('plus-icon')
    expect(plusIcon).toBeInTheDocument()
  })

  it('navigates to add cluster page when desktop button is clicked', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const addButton = screen.getByTestId('button')
    fireEvent.click(addButton)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/clusters/add' })
  })

  it('navigates to add cluster page when mobile action icon is clicked', () => {
    // Mock mobile view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(true)

    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const actionIcon = screen.getByTestId('action-icon')
    fireEvent.click(actionIcon)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/clusters/add' })
  })

  it('renders with the correct group justification', () => {
    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const group = screen.getByTestId('group')
    expect(group).toHaveAttribute('data-justify', 'space-between')
  })

  it('passes the correct size to the button in desktop view', () => {
    // Mock desktop view
    require('@mantine/hooks').useMediaQuery.mockReturnValue(false)

    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    const button = screen.getByTestId('button')
    expect(button).toHaveAttribute('data-size', 'lg')
  })

  it('renders with the expected structure', () => {
    render(<ClustersList clustersData={mockClustersData} model={mockModel} />)

    // Check stack component
    const stack = screen.getByTestId('stack')
    expect(stack).toBeInTheDocument()
    expect(stack).toHaveAttribute('data-gap', 'lg')
    expect(stack).toHaveClass('flex-grow')

    // Check title component
    const title = screen.getByTestId('title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-order', '2')
  })
})
