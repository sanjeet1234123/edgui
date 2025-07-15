import { Center, Stack, Text } from '@mantine/core'
import ClustersCard from './ClustersCard'
import type { Cluster, ClusterResponse } from '@/types/clustersType'

type ClustersListProps = {
  clusters: ClusterResponse
}

function ClustersList({ clusters }: ClustersListProps) {
  if (!clusters.suitable_clusters || clusters.suitable_clusters.length === 0) {
    return (
      <Center className="flex-grow">
        <Text fz="var(--size-lg)" fw={500}>
          No clusters found
        </Text>
      </Center>
    )
  }

  const clusterData = clusters.suitable_clusters.map((cluster: Cluster) => {
    return {
      id: Number(cluster.id) || 0,
      cluster_name: cluster.cluster_name || 'N/A',
      provider_name: cluster.cloud_type,
      onboarded_by: cluster.user_email || 'N/A',
      environment: cluster.environment || 'N/A',
      node_metrics:
        cluster.node_metrics?.map((node) => ({
          GPU: node.gpu_allocatable,
          CPU: node.cpu_allocatable,
          RAM: node.memory_allocatable,
          Node: node.node_name,
        })) || [],
      gpu_utilization: Number(cluster.gpu_utilization) || 0,
      cpu_utilization: Number(cluster.total_cpu_utilization) || 0,
      observability_url: cluster.observability_url,
    }
  })

  return (
    <Stack gap="xl" className="flex-grow">
      {clusterData.map((cluster) => (
        <ClustersCard key={cluster.id} data={cluster} />
      ))}
    </Stack>
  )
}

export default ClustersList
