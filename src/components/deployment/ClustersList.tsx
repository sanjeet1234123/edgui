import { useNavigate } from '@tanstack/react-router'
import { ActionIcon, Button, Group, Stack, Title, Tooltip } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import type { ClusterResponse } from '@/types/clustersType'
import type { Model } from '@/types/marketplaceType'
import { PATHS } from '@/constants/paths'
import RenderClusters from './RenderClusters'

type ClustersListProps = {
  clustersData: ClusterResponse
  model: Model
}

function ClustersList({ clustersData, model }: ClustersListProps) {
  const navigate = useNavigate()

  const is768 = useMediaQuery('(max-width: 768px)')

  return (
    <>
      <Stack gap="lg" className="flex-grow">
        <Group justify="space-between">
          <Title order={2}>Select Cluster to deploy</Title>
          {is768 ? (
            <Tooltip label="Add Cluster">
              <ActionIcon
                onClick={() => navigate({ to: PATHS.ADD_CLUSTER })}
                size={32}
              >
                <IconPlus />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate({ to: PATHS.ADD_CLUSTER })}
              leftSection={<IconPlus />}
            >
              Add Cluster
            </Button>
          )}
        </Group>

        <RenderClusters clustersData={clustersData} model={model} />
      </Stack>
    </>
  )
}

export default ClustersList
