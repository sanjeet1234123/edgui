import { Badge, Button, Card, Group, Stack, Table, Text } from '@mantine/core'
import { IconDatabase, IconRocket } from '@tabler/icons-react'
import classes from './deployment.module.css'
import aws from '../../assets/images/aws.svg'
import azure from '../../assets/images/azure.svg'
import gcp from '../../assets/images/gcp-logo.svg'
import type { Cluster, NodeMetrics } from '@/types/deploymentType'

function getProviderLogo(provider_name: string) {
  switch (provider_name?.toLowerCase()) {
    case 'aws':
      return aws
    case 'azure cluster':
      return azure
    case 'gcp':
      return gcp
    case 'on-prem cluster':
      return <IconDatabase size={34} />
    default:
      return null
  }
}

type ClusterInfoCardProps = {
  data: Cluster
  onClick: () => void
}

function ClusterInfoCard({ data, onClick }: ClusterInfoCardProps) {
  const logo = getProviderLogo(data?.provider_name)

  return (
    <Card
      p="xl"
      radius="lg"
      withBorder
      shadow="md"
      onClick={onClick}
      h="100%"
      bg={data.status === 'ready' ? 'white' : 'var(--mantine-color-gray-2)'}
      classNames={{ root: classes.clusterCard }}
    >
      <Stack h="100%" justify="space-between">
        <Stack>
          <>
            {typeof logo === 'string' ? (
              <img
                src={logo}
                alt="logo"
                width={data?.provider_name === 'Azure Cluster' ? 80 : 60}
              />
            ) : (
              logo
            )}
          </>

          <Stack gap="xl">
            <Stack gap="xs">
              <Group gap="xl">
                <Text fw="500" fz="var(--size-2xl)" c="#001F63">
                  {data.cluster_name}
                </Text>
                <Badge
                  color={data.status === 'ready' ? 'green' : 'red'}
                  variant="light"
                  size="lg"
                  fz="var(--size-sm)"
                  tt="capitalize"
                >
                  {data.status}
                </Badge>
              </Group>
              <Text fz="var(--size-base)" c="#3B3B3B">
                Onboarded by : {data?.onboarded_by}
              </Text>
            </Stack>

            {data?.node_metrics && data.node_metrics.length > 0 && (
              <Table withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    {Object.keys(data.node_metrics[0]).map((key) => (
                      <Table.Th key={key} tt="capitalize">
                        {key.replaceAll('_', ' ')}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.node_metrics.map((node, index) => (
                    <Table.Tr key={index}>
                      {Object.keys(node).map((key) => (
                        <Table.Td key={key}>
                          {node[key as keyof NodeMetrics]}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Stack>

        {data.status === 'ready' && (
          <Group justify="flex-end">
            <Button
              variant="transparent"
              leftSection={<IconRocket />}
              color="#001F63"
              fz="var(--size-base)"
            >
              Deploy
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

export default ClusterInfoCard
