// @ts-nocheck
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import DeploymentsList from '@/components/deployments/DeploymentsList'
import axiosInstance from '@/lib/axiosMiddleware'

// Mock axios middleware
jest.mock('@/lib/axiosMiddleware', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

// Mock the DeploymentsCard component
jest.mock('@/components/deployments/DeploymentsCard', () => ({
  __esModule: true,
  default: ({ data }) => (
    <div data-testid={`deployment-card-${data.id}`}>
      <div>Model: {data.model_name}</div>
      <div>Status: {data.status}</div>
      <div>Endpoint: {data.endpoint_url}</div>
    </div>
  ),
}))

// Mock the formatDeploymentsDate function
jest.mock('@/utils/commonFunction', () => ({
  formatDeploymentsDate: jest.fn().mockImplementation(date => 'Formatted Date'),
}))

describe('DeploymentsList', () => {
  // Setup QueryClient for testing
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // Helper function to render the component with required props
  const renderComponent = (deployments = { deployment: [] }) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <DeploymentsList deployments={deployments} />
        </MantineProvider>
      </QueryClientProvider>,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  it('displays "No deployments found" message when deployment list is empty', () => {
    renderComponent()

    expect(screen.getByText('No deployments found')).toBeInTheDocument()
  })

  it('renders deployment cards for each deployment', async () => {
    // Mock data for multiple deployments
    const mockDeployments = {
      deployment: [
        {
          id: 1,
          hf_model_name: 'model-1',
          user_email: 'user1@example.com',
          deployed_at: '2023-01-01T00:00:00Z',
          cluster_name: 'cluster-1',
          ingress: 'https://api-1.example.com',
          observability_url: 'https://observe-1.example.com',
          logs_url: 'https://logs-1.example.com',
          governance_url: 'https://governance-1.example.com',
        },
        {
          id: 2,
          hf_model_name: 'model-2',
          user_email: 'user2@example.com',
          deployed_at: '2023-01-02T00:00:00Z',
          cluster_name: 'cluster-2',
          ingress: 'https://api-2.example.com',
          observability_url: 'https://observe-2.example.com',
          logs_url: 'https://logs-2.example.com',
          governance_url: 'https://governance-2.example.com',
        },
      ],
    }

    // Mock successful health check responses
    axiosInstance.get.mockImplementation(url => {
      if (url.includes('api-1.example.com')) {
        return Promise.resolve({ data: { status: 'running' } })
      } else if (url.includes('api-2.example.com')) {
        return Promise.resolve({ data: { status: 'running' } })
      }
      return Promise.reject(new Error('Unexpected URL'))
    })

    renderComponent(mockDeployments)

    // Check if both deployment cards are rendered
    expect(screen.getByTestId('deployment-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('deployment-card-2')).toBeInTheDocument()

    // Check model names are displayed correctly
    expect(screen.getByText('Model: model-1')).toBeInTheDocument()
    expect(screen.getByText('Model: model-2')).toBeInTheDocument()

    // Since health checks are async, these might not be updated immediately
    expect(
      screen.getByText('Endpoint: https://api-1.example.com'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Endpoint: https://api-2.example.com'),
    ).toBeInTheDocument()
  })

  it('handles deployments with no ingress URL correctly', async () => {
    // Mock data for deployment without ingress
    const mockDeployments = {
      deployment: [
        {
          id: 3,
          hf_model_name: 'model-3',
          user_email: 'user3@example.com',
          deployed_at: '2023-01-03T00:00:00Z',
          cluster_name: 'cluster-3',
          ingress: null, // No ingress URL
          observability_url: 'https://observe-3.example.com',
          logs_url: 'https://logs-3.example.com',
          governance_url: 'https://governance-3.example.com',
        },
      ],
    }

    renderComponent(mockDeployments)

    // Check the deployment card is rendered
    expect(screen.getByTestId('deployment-card-3')).toBeInTheDocument()

    // Check status shows as 'pending' for deployments without ingress
    expect(screen.getByText('Status: pending')).toBeInTheDocument()
    expect(screen.getByText('Endpoint: N/A')).toBeInTheDocument()
  })

  it('handles failed health check correctly', async () => {
    // Mock data for deployment with failing health check
    const mockDeployments = {
      deployment: [
        {
          id: 4,
          hf_model_name: 'model-4',
          user_email: 'user4@example.com',
          deployed_at: '2023-01-04T00:00:00Z',
          cluster_name: 'cluster-4',
          ingress: 'https://api-4.example.com',
          observability_url: 'https://observe-4.example.com',
          logs_url: 'https://logs-4.example.com',
          governance_url: 'https://governance-4.example.com',
        },
      ],
    }

    // Mock failed health check
    axiosInstance.get.mockRejectedValueOnce(new Error('Network error'))

    renderComponent(mockDeployments)

    // Check the deployment card is rendered
    expect(screen.getByTestId('deployment-card-4')).toBeInTheDocument()

    // Status should initially be 'pending'
    expect(screen.getByText('Status: pending')).toBeInTheDocument()
  })

  it('maps deployment data correctly to card props', async () => {
    // Mock data for a single deployment with all properties
    const mockDeployments = {
      deployment: [
        {
          id: 5,
          hf_model_name: 'model-5',
          user_email: 'user5@example.com',
          deployed_at: '2023-01-05T00:00:00Z',
          cluster_name: 'cluster-5',
          ingress: 'https://api-5.example.com',
          observability_url: 'https://observe-5.example.com',
          logs_url: 'https://logs-5.example.com',
          governance_url: 'https://governance-5.example.com',
        },
      ],
    }

    // Mock successful health check
    axiosInstance.get.mockResolvedValueOnce({ data: { status: 'running' } })

    renderComponent(mockDeployments)

    // Check the deployment card is rendered with correct data
    expect(screen.getByTestId('deployment-card-5')).toBeInTheDocument()
    expect(screen.getByText('Model: model-5')).toBeInTheDocument()
    expect(
      screen.getByText('Endpoint: https://api-5.example.com'),
    ).toBeInTheDocument()
  })

  it('handles missing properties in deployment data', async () => {
    // Mock data for deployment with missing properties
    const mockDeployments = {
      deployment: [
        {
          id: 6,
          // Missing hf_model_name
          // Missing user_email
          deployed_at: '2023-01-06T00:00:00Z',
          // Missing cluster_name
          ingress: 'https://api-6.example.com',
          // Missing some URLs
        },
      ],
    }

    // Mock successful health check
    axiosInstance.get.mockResolvedValueOnce({ data: { status: 'running' } })

    renderComponent(mockDeployments)

    // Check the deployment card is rendered with fallback values
    expect(screen.getByTestId('deployment-card-6')).toBeInTheDocument()
    expect(screen.getByText('Model: N/A')).toBeInTheDocument()
    expect(
      screen.getByText('Endpoint: https://api-6.example.com'),
    ).toBeInTheDocument()
  })

  it('updates deployment status when health check completes', async () => {
    // Mock data for deployment
    const mockDeployments = {
      deployment: [
        {
          id: 7,
          hf_model_name: 'model-7',
          user_email: 'user7@example.com',
          deployed_at: '2023-01-07T00:00:00Z',
          cluster_name: 'cluster-7',
          ingress: 'https://api-7.example.com',
          observability_url: 'https://observe-7.example.com',
          logs_url: 'https://logs-7.example.com',
          governance_url: 'https://governance-7.example.com',
        },
      ],
    }

    // Mock successful health check with slight delay to simulate async behavior
    axiosInstance.get.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: { status: 'running' } })
        }, 10)
      })
    })

    renderComponent(mockDeployments)

    // Initially the status might be pending
    expect(screen.getByTestId('deployment-card-7')).toBeInTheDocument()

    // Wait for the health check to complete and update the status
    await waitFor(() => {
      expect(screen.getByText('Status: running')).toBeInTheDocument()
    })
  })
})
