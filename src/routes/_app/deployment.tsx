import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Group, Stack, Title } from '@mantine/core'
import type { Model } from '@/types/marketplaceType'
import { ClustersList, ModalDetails } from '@/components/deployment/index'
import { useModelStore } from '@/store/modelStore'
import { PATHS } from '@/constants/paths'
import { useGetClustersQuery } from '@/hooks/queries/useDeploymentQuery'
import ClustersFallback from '@/components/deployment/ClustersFallback'

export const Route = createFileRoute('/_app/deployment')({
  component: RouteComponent,
  pendingComponent: ClustersFallback,
  validateSearch: (search) => ({
    model: search.model as string | undefined,
  }),
})

function RouteComponent() {
  const { model } = Route.useSearch()
  const navigate = useNavigate()
  const { currentModel } = useModelStore()

  const { data: clustersData, refetch: refetchClusters } = useGetClustersQuery(
    currentModel?.hf_model_name ?? '',
  )

  useEffect(() => {
    if (!model) {
      navigate({ to: PATHS.MARKETPLACE })
    }
  }, [model, navigate])

  return (
    <Stack gap="3rem" className="flex-grow">
      {/* Deployment Header */}
      <Group>
        <Title className="Title">Model Deployment</Title>
      </Group>

      {/* Modal Details */}
      <ModalDetails model={currentModel} refetchClusters={refetchClusters} />

      {/* Clusters List */}
      <ClustersList
        clustersData={clustersData}
        model={currentModel ?? ({} as Model)}
      />
    </Stack>
  )
}
