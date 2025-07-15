import { useState } from 'react'
import { Center, Grid, Text } from '@mantine/core'
import ClusterInfoCard from './ClusterInfoCard'
import type { Model } from '@/types/marketplaceType'
import type { ClusterResponse } from '@/types/clustersType'
import {
  useDeployClusterMutation,
  useDeploymentPodStatusMutation,
  useDownscaleModelMutation,
} from '@/hooks/mutations/useDeploymentMutations'
import { showNotification } from '@/utils/notification'


type RenderClustersProps = {
  clustersData: ClusterResponse
  model: Model
}

const cluster_names = {
  aws: 'AWS Cluster',
  azure: 'Azure Cluster',
  gcp: 'GCP Cluster',
  'on-prem': 'On-prem Cluster',
}

export default function RenderClusters({
  clustersData,
  model,
}: RenderClustersProps) {
  // selected cluster
  const [selectedCluster, setSelectedCluster] = useState<string>('')

  // get model downscale
  const { mutate: downscaleModel } = useDownscaleModelMutation()

  // deploy cluster
  const { mutate: deployCluster } = useDeployClusterMutation()

  const { mutate: podStatus } = useDeploymentPodStatusMutation()
  if (
    !clustersData ||
    !clustersData.suitable_clusters ||
    clustersData.suitable_clusters.length === 0
  ) {
    return (
      <Center className="flex-grow">
        <Text fw={500} fz="var(--size-xl)">
          No Clusters has been added
        </Text>
      </Center>
    )
  }

  const clusters = clustersData.suitable_clusters.map((cluster) => {
    const getClusterName = (key: keyof typeof cluster_names) =>
      cluster_names[key] || 'N/A'

    return {
      cluster_name: cluster.cluster_name || 'N/A',
      provider_name: getClusterName(
        cluster.cloud_type as keyof typeof cluster_names,
      ),
      onboarded_by: cluster.user_email || 'N/A',
      environment: cluster.environment || 'N/A',
      clusterDataCards: {
        GPU: cluster.gpu || 'N/A',
        CPU: cluster.cpu || 'N/A',
        RAM: cluster.ram || 'N/A',
        Storage: cluster.storage || 'N/A',
        Node: cluster.nodes || 'N/A',
      },
      node_metrics:
        cluster?.node_metrics?.map((node) => {
          return {
            GPU: node.gpu_allocatable || 'N/A',
            CPU: node.cpu_allocatable || 'N/A',
            RAM: node.memory_allocatable || 'N/A',
            Node: node.node_name || 'N/A',
          }
        }) || [],
      status: cluster.is_suffiecient_resource ? 'ready' : 'Infra Mismatch',
    }
  })

  return (
    <Grid gutter="lg">
      {clusters.map((cluster, index) => (
        <Grid.Col span={{ base: 12, md: 6, lg: 6, xl: 4 }} key={index}>
          <ClusterInfoCard
            data={cluster}
            onClick={() => {
              setSelectedCluster(cluster.cluster_name)
              if (cluster.status === 'ready') {
                podStatus(
                  {
                    deployment_name: model.deployment_name,
                  },
                  {
                    onSuccess: () => {
                      deployCluster({
                        hf_model_name: model.hf_model_name,
                        cluster_name: selectedCluster,
                      })
                    },
                  },
                )
                downscaleModel({
                  deployment_name: model.deployment_name,
                })
              } else {
                showNotification('error', 'Cluster cannot be deployed')
              }
            }}
          />
        </Grid.Col>
      ))}
    </Grid>
  )
}
