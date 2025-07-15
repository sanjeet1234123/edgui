import { Group, Accordion, Text, Chip, Grid, Stack } from '@mantine/core'
import { IconCpu2, IconSitemap, IconDatabase } from '@tabler/icons-react'
import { useModelStore } from '@/store/modelStore'
import { MemoryStick } from 'lucide-react'
import { useEffect } from 'react'
import { useGetModelStatusQuery } from '@/hooks/queries/usePlaygroundQueries'

type ChatCardHeaderProps = {
  setModelStatus: (modelStatus: boolean) => void
  modelStatus: boolean
}

function ChatCardHeader({ setModelStatus, modelStatus }: ChatCardHeaderProps) {
  const { currentModel, ingressUrl } = useModelStore()

  const { data } = useGetModelStatusQuery({
    deployment_name: currentModel?.deployment_name ?? '',
    hf_model_name: currentModel?.model_name ?? '',
    ingress_model: ingressUrl ?? '',
  })

  useEffect(() => {
    if (data?.error) {
      setModelStatus(false)
    } else {
      setModelStatus(true)
    }
  }, [data])

  return (
    <Accordion variant="contained" radius="lg">
      <Accordion.Item value="model-chat-card-header">
        <Accordion.Control>
          <Group justify="space-between" gap="xl" p="xs">
            <Text fw="500" fz="var(--size-xl)">
              {currentModel?.model_name ?? 'Model Name'}
            </Text>

            <Group gap="xl">
              <Chip
                checked={modelStatus}
                color={modelStatus ? 'green' : 'red'}
                fz="var(--size-sm)"
                fw={600}
              >
                {modelStatus ? 'Active' : 'Inactive'}
              </Chip>
            </Group>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack p="xs" gap="lg">
            <Text fz="var(--size-lg)" fw="500">
              Recommended Infrastructure Requirements
            </Text>
            <Grid gutter="lg">
              {[
                {
                  icon: IconCpu2,
                  title: 'Processor',
                  value: `${currentModel?.processor} (${currentModel?.cores} cores)`,
                },
                {
                  icon: IconSitemap,
                  title: 'Cluster',
                  value: `${currentModel?.cluster_type} (${currentModel?.nodes} Nodes)`,
                },
                {
                  icon: MemoryStick,
                  title: 'RAM',
                  value: `${currentModel?.ram}`,
                },
                {
                  icon: IconDatabase,
                  title: 'Storage',
                  value: `${currentModel?.storage}`,
                },
              ].map((item, index) => (
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }} key={index}>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <item.icon
                        size={20}
                        color="var(--clr-model-playground-chat-header-configs)"
                      />
                      <Text
                        fz="var(--size-sm)"
                        fw="600"
                        c="var(--clr-model-playground-chat-header-configs)"
                      >
                        {item.title}
                      </Text>
                    </Group>
                    <Text
                      fz="var(--size-sm)"
                      c="var(--clr-model-playground-chat-header-configs)"
                    >
                      {item.value}
                    </Text>
                  </Group>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ChatCardHeader
