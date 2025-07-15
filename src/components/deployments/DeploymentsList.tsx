import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Center, Stack, Text } from '@mantine/core'
import DeploymentsCard from './DeploymentsCard'
import type {
  Deployment,
  DeploymentResponse,
  DeploymentsCardType,
} from '@/types/deploymentsType'
import axiosInstance from '@/lib/axiosMiddleware'
import { formatDeploymentsDate } from '@/utils/commonFunction'

const getIngressHealthStatus = async (ingress_url: string) => {
  const response = await axiosInstance.get(`${ingress_url}/health`)
  return { status: 'running', data: response.data }
}

type DeploymentsListProps = {
  deployments: DeploymentResponse
}

function DeploymentsList({ deployments }: DeploymentsListProps) {
  if (deployments.deployment.length === 0) {
    return (
      <Center className="flex-grow">
        <Text fz="var(--size-lg)" fw={500}>
          No deployments found
        </Text>
      </Center>
    )
  }

  // Using useQueries for multiple health checks
  const healthQueries = useQueries({
    queries: useMemo(() => {
      if (!deployments.deployment.length) return []

      return deployments.deployment.map((deployment) => ({
        queryKey: ['deployment-health', deployment.id, deployment.ingress],
        queryFn: async () => {
          if (!deployment.ingress)
            return { id: deployment.id, status: 'pending' }
          const healthStatus = await getIngressHealthStatus(deployment.ingress)
          return { id: deployment.id, status: healthStatus.status }
        },
        refetchInterval: 10000,
        enabled: !!deployment.ingress,
      }))
    }, [deployments.deployment]),
  })

  // Create a mapping of deployment ID to health status
  const deploymentStatuses = useMemo(() => {
    const statuses: Record<number, string> = {}

    healthQueries.forEach((query) => {
      if (query.data) {
        statuses[query.data.id] = query.data.status
      }
    })

    return statuses
  }, [healthQueries])

  const deploymentData = deployments.deployment.map(
    (deployment: Deployment) => {
      return {
        id: Number(deployment.id) || 0,
        model_name: deployment.hf_model_name || 'N/A',
        mode_icon: 'qwen',
        deployed_by: deployment.user_email || 'N/A',
        Created_at: formatDeploymentsDate(deployment.deployed_at),
        cluster: deployment.cluster_name || 'N/A',
        endpoint_url: deployment.ingress || 'N/A',
        token_usage: 21024,
        token_usage_percentage: 20,
        status: deploymentStatuses[deployment.id] || 'pending',
        observability_url: deployment.observability_url,
        logs_url: deployment.logs_url,
        governance_url: deployment.governance_url,
        data: [
          1000, 900, 976, 989, 800, 876, 700, 600, 565, 899, 454, 876, 700, 600,
          565, 342, 234, 100, 89, 56, 78, 45, 34, 23, 876, 700, 600, 565, 8, 76,
          45, 23, 23, 12, 45, 56, 34, 56, 67, 78, 98, 78, 76, 45, 23, 23, 12,
        ],
      }
    },
  )

  return (
    <Stack gap="xl" mt={24}>
      {deploymentData.map((data: DeploymentsCardType) => (
        <DeploymentsCard key={data.id} data={data} />
      ))}
    </Stack>
  )
}

export default DeploymentsList
