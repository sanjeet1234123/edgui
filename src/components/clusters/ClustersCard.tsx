import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Popover,
  RingProgress,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  IconDeviceIpadHorizontalShare,
  IconDotsVertical,
  IconTrash,
} from '@tabler/icons-react'
import DeleteClusterModal from './DeleteClusterModal'
import classes from './clusters.module.css'
import type { ClusterCardData } from '@/types/clustersType'
import aws from '@/assets/images/aws.svg'
import azure from '@/assets/images/azure.svg'
import gcp from '@/assets/images/gcp-logo.svg'
import iconDatabase from '@/assets/images/database-icon.svg'
import nexastack from '@/assets/images/nexastack-logo.svg'
import { getResourceUsageText, isValidUrl } from '@/utils/commonFunction'

// const cluster_names = {
//   aws: 'AWS Cluster',
//   azure: 'Azure Cluster',
//   gcp: 'GCP Cluster',
//   'on-prem': 'On-prem Cluster',
//   'nexastack-managed': 'Nexastack Managed Cluster',
// }

function getProviderLogo(provider_name: string) {
  const normalizedName = provider_name.toLowerCase().replace(/_/g, '-')
  switch (normalizedName) {
    case 'aws':
      return aws
    case 'azure':
      return azure
    case 'gcp':
      return gcp
    case 'on-prem':
      return iconDatabase
    case 'nexastack-managed':
      return nexastack
    default:
      return iconDatabase // Default to database icon for unknown providers
  }
}

const getColorByValue = (value: number) => {
  if (value === 0) {
    return 'var(--mantine-color-gray-5)'
  } else if (value < 31) {
    return '#22c55e' // Green for low values
  } else if (value > 30 && value < 61) {
    return '#eab308' // Yellow for medium values
  } else {
    return '#ef4444' // Red for high values
  }
}

type ClustersCardProps = {
  data: ClusterCardData
}

function ClustersCard({ data }: ClustersCardProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const is1440px = useMediaQuery('(max-width: 1440px)')
  const is1024px = useMediaQuery('(max-width: 1024px)')

  const utilisationData = [
    {
      value: data.gpu_utilization,
      title: 'GPU Utilization',
      description: getResourceUsageText('GPU', data.gpu_utilization),
    },
    {
      value: data.cpu_utilization,
      title: 'CPU Utilization',
      description: getResourceUsageText('CPU', data.cpu_utilization),
    },
  ]

  return (
    <>
      <Card padding="xl">
        <Group justify="space-between" gap="xl" align="flex-start">
          <Stack gap="xl" style={{ flex: 1 }}>
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <img
                  src={getProviderLogo(data.provider_name)}
                  alt="logo"
                  width={
                    data.provider_name === 'azure'
                      ? 80
                      : data.provider_name === 'nexastack-managed'
                        ? 32
                        : data.provider_name === 'on-prem'
                          ? 40
                          : 48
                  }
                />

                <Stack gap="xs">
                  <Title
                    order={2}
                    fz="var(--size-2xl)"
                    fw={600}
                    c="#001F63"
                    tt="capitalize"
                  >
                    {data.cluster_name}
                  </Title>
                  <Text c="#4D4D4E" fz="var(--size-lg)" fw={500}>
                    Onboarded by : {data.onboarded_by}
                  </Text>
                </Stack>
              </Stack>

              {is1440px && (
                <>
                  {is1024px ? (
                    <Popover position="bottom-end">
                      <Popover.Target>
                        <ActionIcon variant="transparent" size="lg">
                          <IconDotsVertical size={28} strokeWidth={1.5} />
                        </ActionIcon>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Stack gap="xs">
                          {[
                            {
                              label: 'Observability',
                              icon: IconDeviceIpadHorizontalShare,
                              disabled: !isValidUrl(data.observability_url),
                              onClick: () => {
                                if (isValidUrl(data.observability_url)) {
                                  window.open(data.observability_url, '_blank')
                                }
                              },
                            },
                            {
                              label: 'Delete',
                              icon: IconTrash,
                              color: '#FB1212',
                              onClick: () => {
                                open()
                              },
                            },
                          ].map((item, index) => (
                            <Button
                              key={index}
                              variant="transparent"
                              size="compact-md"
                              color={item.color}
                              leftSection={
                                <item.icon size={20} strokeWidth={1.5} />
                              }
                              onClick={item.onClick}
                              disabled={item.disabled}
                              fullWidth
                              justify="flex-start"
                              className={classes.popoverButton}
                            >
                              {item.label}
                            </Button>
                          ))}
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>
                  ) : (
                    <Group>
                      {[
                        {
                          label: 'Observability',
                          icon: IconDeviceIpadHorizontalShare,
                          disabled: !isValidUrl(data.observability_url),
                          onClick: () => {
                            if (isValidUrl(data.observability_url)) {
                              window.open(data.observability_url, '_blank')
                            }
                          },
                        },
                        {
                          label: 'Delete',
                          icon: IconTrash,
                          color: '#FB1212',
                          onClick: () => {
                            open()
                          },
                        },
                      ].map(item => (
                        <Tooltip label={item.label} position="top">
                          <ActionIcon
                            variant="transparent"
                            color={item.color}
                            size="lg"
                            disabled={item.disabled}
                            onClick={item.onClick}
                          >
                            <item.icon size={28} strokeWidth={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      ))}
                    </Group>
                  )}
                </>
              )}
            </Group>

            {data.node_metrics.length > 0 && (
              <Table withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    {Object.keys(data.node_metrics[0]).map(key => (
                      <Table.Th key={key} tt="capitalize">
                        {key.replaceAll('_', ' ')}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.node_metrics.map((node, index) => (
                    <Table.Tr key={index}>
                      {Object.keys(node).map(key => (
                        <Table.Td key={key}>
                          {node[key as keyof typeof node]}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>

          {!is1440px && (
            <Stack
              bg="var(--mantine-color-body)"
              align="flex-start"
              justify="space-between"
              gap="xl"
              w={550}
            >
              <Group w="100%" justify="flex-end" gap="xl">
                {[
                  {
                    label: 'Observability',
                    icon: IconDeviceIpadHorizontalShare,
                    disabled: !isValidUrl(data.observability_url),
                    onClick: () => {
                      if (isValidUrl(data.observability_url)) {
                        window.open(data.observability_url, '_blank')
                      }
                    },
                  },
                  {
                    label: 'Delete',
                    icon: IconTrash,
                    color: '#FB1212',
                    onClick: () => {
                      open()
                    },
                  },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    color={item.color}
                    leftSection={<item.icon size="24" strokeWidth={1.5} />}
                    disabled={item.disabled}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </Button>
                ))}
              </Group>

              <Stack
                bg="var(--mantine-color-body)"
                align="flex-start"
                justify="flex-start"
                gap="xs"
              >
                {utilisationData.map(utilisation => (
                  <Group gap="sm">
                    <RingProgress
                      label={
                        <Text
                          fz="var(--size-sm)"
                          ta="center"
                          fw="500"
                          c={
                            utilisation.value === 0
                              ? 'var(--mantine-color-gray-5)'
                              : '#262626'
                          }
                        >
                          {utilisation.value}%
                        </Text>
                      }
                      thickness={7}
                      size={90}
                      roundCaps
                      rootColor={
                        utilisation.value === 0
                          ? 'var(--mantine-color-gray-1)'
                          : utilisation.value < 31
                            ? '#D0FFD3'
                            : utilisation.value > 30 && utilisation.value < 61
                              ? '#F9E59E'
                              : 'hsla(8, 99%, 50%, 0.422)'
                      }
                      sections={[
                        {
                          value: utilisation.value,
                          color: getColorByValue(utilisation.value),
                        },
                      ]}
                    />
                    <Stack gap={4}>
                      <Text
                        fz="var(--size-lg)"
                        fw={600}
                        c={
                          utilisation.value === 0
                            ? 'var(--mantine-color-gray-6)'
                            : utilisation.value < 31
                              ? '#31CD01'
                              : utilisation.value > 30 && utilisation.value < 61
                                ? '#F1C21B'
                                : '#ef4444'
                        }
                      >
                        {utilisation.title}
                      </Text>
                      <Text fz="var(--size-sm)" c="#525252">
                        {utilisation.description}
                      </Text>
                    </Stack>
                  </Group>
                ))}
              </Stack>
            </Stack>
          )}
        </Group>
      </Card>
      {opened && (
        <DeleteClusterModal opened={opened} onClose={close} id={data.id} />
      )}
    </>
  )
}

export default ClustersCard
