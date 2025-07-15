import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Group,
  Popover,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { Sparkline } from '@mantine/charts'
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconDeviceIpadHorizontalShare,
  IconDotsVertical,
  IconListSearch,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react'
import { Landmark, Link } from 'lucide-react'
import DeleteDeploymentModal from './DeleteDeploymentsModal'
import classes from './deployments.module.css'
import type { DeploymentsCardType } from '@/types/deploymentsType'
import { AgentIcons } from '@/assets/agent-icons'
import { useDeploymentsQuery } from '@/hooks/queries/useDeploymentsQueries'
import { getDeploymentStatusColor, isValidUrl } from '@/utils/commonFunction'

type DeploymentCardProps = {
  data: DeploymentsCardType
}

function DeploymentCard({ data }: DeploymentCardProps) {
  const { refetch } = useDeploymentsQuery()
  const [opened, { open, close }] = useDisclosure(false)

  const is1600px = useMediaQuery('(max-width: 1600px)')
  const is1024px = useMediaQuery('(max-width: 1024px)')
  const ModelIcon = AgentIcons[data.mode_icon as keyof typeof AgentIcons]

  const model_status = data.status || 'unknown'

  return (
    <>
      <Card padding="xl">
        <Group justify="space-between" gap="xl" align="flex-start">
          {/* Left */}
          <Stack style={{ flex: 1 }} justify="space-between" gap="xl">
            <Group justify="space-between">
              <Group gap="xl">
                <Group gap="xs">
                  <ModelIcon className={classes.modelIcon} />
                  <Box w={{ base: 200, sm: 300, md: 350, lg: 400 }}>
                    <Tooltip label={data.model_name} position="top-start">
                      <Title
                        order={2}
                        fz={{ md: 'var(--size-2xl)', lg: 'var(--size-3xl)' }}
                        c="#001F63"
                        fw="500"
                        style={{
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        }}
                      >
                        {data.model_name}
                      </Title>
                    </Tooltip>
                  </Box>
                </Group>
                <Badge
                  size="xl"
                  variant="light"
                  color={getDeploymentStatusColor(model_status)}
                  fz={{ md: 'var(--size-sm)', lg: 'var(--size-base)' }}
                  tt="capitalize"
                >
                  {model_status}
                </Badge>
              </Group>

              {is1600px && (
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
                              label: 'Refresh',
                              icon: IconRefresh,
                              color: '#001F63',
                              onClick: () => refetch(),
                            },
                            {
                              label: 'View Logs',
                              icon: IconListSearch,
                              color: '#001F63',
                              disabled: !isValidUrl(data.logs_url),
                              onClick: () => {
                                if (isValidUrl(data.logs_url)) {
                                  window.open(data.logs_url, '_blank')
                                }
                              },
                            },
                            {
                              label: 'Observability',
                              icon: IconDeviceIpadHorizontalShare,
                              color: '#001F63',
                              disabled: !isValidUrl(data.observability_url),
                              onClick: () => {
                                if (isValidUrl(data.observability_url)) {
                                  window.open(data.observability_url, '_blank')
                                }
                              },
                            },
                            {
                              label: 'Governance',
                              icon: Landmark,
                              color: '#001F63',
                              disabled: !isValidUrl(data.governance_url),
                              onClick: () => {
                                if (isValidUrl(data.governance_url)) {
                                  window.open(data.governance_url, '_blank')
                                }
                              },
                            },
                            {
                              label: 'Delete',
                              icon: IconTrash,
                              color: '#FB1212',
                              onClick: open,
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
                          label: 'Refresh',
                          icon: IconRefresh,
                          color: '#001F63',
                          onClick: () => refetch(),
                        },
                        {
                          label: 'View Logs',
                          icon: IconListSearch,
                          color: '#001F63',
                          disabled: !isValidUrl(data.logs_url),
                          onClick: () => {
                            if (isValidUrl(data.logs_url)) {
                              window.open(data.logs_url, '_blank')
                            }
                          },
                        },
                        {
                          label: 'Observability',
                          icon: IconDeviceIpadHorizontalShare,
                          color: '#001F63',
                          disabled: !isValidUrl(data.observability_url),
                          onClick: () => {
                            if (isValidUrl(data.observability_url)) {
                              window.open(data.observability_url, '_blank')
                            }
                          },
                        },
                        {
                          label: 'Governance',
                          icon: Landmark,
                          color: '#001F63',
                          disabled: !isValidUrl(data.governance_url),
                          onClick: () => {
                            if (isValidUrl(data.governance_url)) {
                              window.open(data.governance_url, '_blank')
                            }
                          },
                        },
                        {
                          label: 'Delete',
                          icon: IconTrash,
                          color: '#FB1212',
                          onClick: open,
                        },
                      ].map((item, index) => (
                        <Tooltip key={index} label={item.label} position="top">
                          <ActionIcon
                            variant="transparent"
                            color={item.color}
                            size="lg"
                            onClick={item.onClick}
                            disabled={item.disabled}
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

            <Table
              variant="vertical"
              layout="fixed"
              withRowBorders={false}
              styles={{
                tr: {
                  backgroundColor: 'transparent',
                },
                th: {
                  backgroundColor: 'transparent',
                },
                td: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Table.Tbody>
                {[
                  { label: 'Deployed by', value: data.deployed_by },
                  { label: 'Created at', value: data.Created_at },
                  { label: 'Cluster', value: data.cluster },
                ].map((row) => (
                  <Table.Tr key={row.label}>
                    <Table.Th w={160}>
                      <Text classNames={{ root: classes.modelCardTh }}>
                        {row.label}
                      </Text>
                    </Table.Th>
                    <Table.Td>
                      <Text classNames={{ root: classes.modelCardTd }}>
                        {row.value}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Stack gap="xs">
              <Group justify="space-between">
                <Text classNames={{ root: classes.modelCardText }}>
                  Endpoint URL
                </Text>
                <CopyButton value={data.endpoint_url}>
                  {({ copied, copy }) => (
                    <Button
                      size="compact-sm"
                      variant="transparent"
                      color={
                        copied ? 'var(--mantine-color-green-8)' : '#025ED7'
                      }
                      onClick={copy}
                      leftSection={<Link size={20} />}
                    >
                      {copied ? 'Copied' : 'Copy URL'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
              <TextInput
                size="md"
                variant="filled"
                radius="md"
                value={data.endpoint_url}
                readOnly
                c="#000000"
              />
            </Stack>
          </Stack>

          {/* Right */}
          {!is1600px && (
            <Stack gap="xl" w={600}>
              {/* Button */}
              <Group justify="flex-end" w="100%" gap="md" mb="lg">
                <Tooltip label="Refresh" position="top">
                  <ActionIcon
                    variant="transparent"
                    color="#001F63"
                    size="lg"
                    onClick={() => refetch()}
                  >
                    <IconRefresh size={28} strokeWidth={1.5} />
                  </ActionIcon>
                </Tooltip>

                {[
                  {
                    label: 'View Logs',
                    icon: IconListSearch,
                    url: data.logs_url,
                  },
                  {
                    label: 'Observability',
                    icon: IconDeviceIpadHorizontalShare,
                    url: data.observability_url,
                  },
                  {
                    label: 'Governance',
                    icon: Landmark,
                    url: data.governance_url,
                  },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    leftSection={<item.icon size={24} strokeWidth={1.5} />}
                    disabled={!isValidUrl(item.url)}
                    onClick={() => {
                      if (isValidUrl(item.url)) {
                        window.open(item.url, '_blank')
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                <Tooltip label="Delete" position="top">
                  <ActionIcon
                    variant="transparent"
                    color="#FB1212"
                    size="lg"
                    onClick={open}
                  >
                    <IconTrash size={28} strokeWidth={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {/* Graph */}
              <Stack gap="xl">
                <Stack gap={0}>
                  <Text fz="var(--size-base)">Token Usage</Text>
                  <Group>
                    <Text fz="var(--size-4xl)" fw={500}>
                      {data.token_usage}
                    </Text>
                    <Group gap={4}>
                      {data.token_usage_percentage > 0 ? (
                        <IconArrowUpRight color="#16A34A" />
                      ) : (
                        <IconArrowDownRight color="#FB1212" />
                      )}
                      <Text
                        c={
                          data.token_usage_percentage > 0
                            ? '#16A34A'
                            : '#FB1212'
                        }
                      >
                        {data.token_usage_percentage}%
                      </Text>
                    </Group>
                  </Group>
                </Stack>
                <Sparkline
                  w={500}
                  h={80}
                  data={data.data}
                  curveType="linear"
                  color={
                    data.token_usage_percentage > 0 ? '#16A34A' : '#FB1212'
                  }
                  fillOpacity={0}
                  withGradient={false}
                  strokeWidth={3}
                />
              </Stack>
            </Stack>
          )}
        </Group>
      </Card>

      {/* Delete Model Modal */}
      {opened && (
        <DeleteDeploymentModal opened={opened} onClose={close} id={data.id} />
      )}
    </>
  )
}

export default DeploymentCard
