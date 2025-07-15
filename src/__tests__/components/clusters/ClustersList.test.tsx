// @ts-nocheck
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MantineProvider } from '@mantine/core'
import ClustersList from '@/components/clusters/ClustersList'

// Mock the ClustersCard component
jest.mock('@/components/clusters/ClustersCard', () => ({
  __esModule: true,
  default: ({ data }) => (
    <div data-testid="cluster-card" data-cluster-id={data.id}>
      {data.cluster_name}
    </div>
  ),
}))

describe('ClustersList', () => {
  const renderComponent = clusters => {
    return render(
      <MantineProvider>
        <ClustersList clusters={clusters} />
      </MantineProvider>,
    )
  }

  it('renders "No clusters found" message when clusters array is empty', () => {
    renderComponent({ suitable_clusters: [] })
    expect(screen.getByText('No clusters found')).toBeInTheDocument()
  })

  it('renders "No clusters found" message when suitable_clusters is undefined', () => {
    renderComponent({ suitable_clusters: undefined })
    expect(screen.getByText('No clusters found')).toBeInTheDocument()
  })

  it('renders cluster cards when clusters are available', () => {
    const mockClusters = {
      suitable_clusters: [
        {
          id: '1',
          cluster_name: 'Test Cluster 1',
          cloud_type: 'AWS',
          user_email: 'test@example.com',
          environment: 'Production',
          node_metrics: [
            {
              gpu_allocatable: '4',
              cpu_allocatable: '8',
              memory_allocatable: '16GB',
              node_name: 'node-1',
            },
          ],
          gpu_utilization: '75',
          total_cpu_utilization: '60',
          observability_url: 'http://example.com',
        },
        {
          id: '2',
          cluster_name: 'Test Cluster 2',
          cloud_type: 'GCP',
          user_email: 'test2@example.com',
          environment: 'Staging',
          node_metrics: [
            {
              gpu_allocatable: '2',
              cpu_allocatable: '4',
              memory_allocatable: '8GB',
              node_name: 'node-2',
            },
          ],
          gpu_utilization: '50',
          total_cpu_utilization: '40',
          observability_url: 'http://example2.com',
        },
      ],
    }

    renderComponent(mockClusters)

    const clusterCards = screen.getAllByTestId('cluster-card')
    expect(clusterCards).toHaveLength(2)
    expect(clusterCards[0]).toHaveAttribute('data-cluster-id', '1')
    expect(clusterCards[1]).toHaveAttribute('data-cluster-id', '2')
  })

  it('handles missing optional fields gracefully', () => {
    const mockClusters = {
      suitable_clusters: [
        {
          id: '1',
          cluster_name: 'Test Cluster',
          cloud_type: 'AWS',
          // Missing optional fields
          node_metrics: [],
        },
      ],
    }

    renderComponent(mockClusters)

    const clusterCard = screen.getByTestId('cluster-card')
    expect(clusterCard).toBeInTheDocument()
    expect(clusterCard).toHaveAttribute('data-cluster-id', '1')
  })
})
