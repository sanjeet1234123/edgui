import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Cpu, Database, MemoryStick, Network } from 'lucide-react'
import { IconRefresh } from '@tabler/icons-react'
import type { Model } from '@/types/marketplaceType'
import { AgentIcons } from '@/assets/agent-icons'

type ModalDetailsProps = {
  model: Model | null
  refetchClusters: () => void
}

function ModalDetails({ model, refetchClusters }: ModalDetailsProps) {
  const is480 = useMediaQuery('(max-width: 480px)')

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchClusters()
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!model) {
    return <Text>No model selected.</Text>
  }

  const providerKey =
    model.provider_base64_image.toLowerCase() as keyof typeof AgentIcons
  const ModelIcon = AgentIcons[providerKey] || AgentIcons.anthropic // Fallback to a default icon

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Group className="flex-nowrap">
          <ModelIcon style={{ width: 44, height: 44, flexShrink: 0 }} />
          <Box w={{ base: 150, xs: 300, sm: 'auto' }}>
            <Tooltip label={model.hf_model_name} position="top-start">
              <Text
                fz={{ base: 'var(--size-2xl)', lg: 'var(--size-3xl)' }}
                fw={500}
                c="var(--clr-deplyment-model-name)"
                truncate="end"
              >
                {model.hf_model_name}
              </Text>
            </Tooltip>
          </Box>
        </Group>
        {is480 ? (
          <Tooltip label="Refresh">
            <ActionIcon
              variant="transparent"
              size="compact-xl"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <IconRefresh size={24} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Button
            c="var(--clr-deplyment-refresh-button)"
            size="compact-xl"
            variant="transparent"
            fz="var(--size-lg)"
            leftSection={<IconRefresh size={24} />}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        )}
      </Group>
      <Stack gap="xs">
        <Text fw={600} fz="var(--size-xl)">
          Infra Requirements
        </Text>
        <Divider />
        <Grid gutter="lg">
          <Grid.Col span={10}>
            <Grid gutter="lg">
              {[
                {
                  icon: Cpu,
                  title: 'Processor',
                  value: `${model.processor} (${model.cores} cores)`,
                },
                {
                  icon: Network,
                  title: 'Cluster',
                  value: `${model.cluster_type} (${model.nodes} Nodes)`,
                },
                {
                  icon: MemoryStick,
                  title: 'RAM',
                  value: `${model.ram}`,
                },
                {
                  icon: Database,
                  title: 'Storage',
                  value: `${model.storage}`,
                },
              ].map((item, index) => (
                <Grid.Col span={{ base: 12, sm: 8, md: 6, lg: 6 }} key={index}>
                  <Flex
                    justify="space-between"
                    align={is480 ? 'flex-start' : 'center'}
                    direction={is480 ? 'column' : 'row'}
                    gap={is480 ? 'xs' : 'md'}
                  >
                    <Group gap="xs">
                      <ThemeIcon
                        variant="transparent"
                        c="var(--clr-deployment-model-configs)"
                        size={is480 ? 'md' : 'lg'}
                      >
                        <item.icon />
                      </ThemeIcon>
                      <Text
                        fz="var(--size-base)"
                        fw={600}
                        c="var(--clr-deployment-model-configs)"
                      >
                        {item.title}
                      </Text>
                    </Group>
                    <Text
                      fz="var(--size-base)"
                      c="var(--clr-deployment-model-configs)"
                    >
                      {item.value}
                    </Text>
                  </Flex>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>
        </Grid>
      </Stack>
    </Stack>
  )
}

export default ModalDetails
