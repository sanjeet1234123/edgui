import { Card, Group, Skeleton, Stack, Table } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

function ClustersFallback() {
  const is1440px = useMediaQuery('(max-width: 1440px)')
  const is1024px = useMediaQuery('(max-width: 1024px)')

  return (
    <Stack className="flex-grow" gap="xl">
      {/* Header Skeleton */}
      <Group justify="space-between">
        <Skeleton height={40} width={200} />
        <Skeleton height={40} width={150} />
      </Group>

      {/* Cards Skeleton */}
      <Stack gap="xl">
        {[1, 2, 3].map((index) => (
          <Card key={index} padding="xl">
            <Group
              justify="space-between"
              gap="xl"
              align="flex-start"
              wrap={is1024px ? 'wrap' : 'nowrap'}
            >
              <Stack gap="xl" style={{ flex: 1 }}>
                <Group justify="space-between" align="flex-start">
                  <Stack gap="xs">
                    <Skeleton height={40} width={100} />
                    <Stack gap="xs">
                      <Skeleton height={32} width={200} />
                      <Skeleton height={24} width={250} />
                    </Stack>
                  </Stack>
                  {is1440px && <Skeleton height={40} width={40} />}
                </Group>

                {/* Node Metrics Table Skeleton */}
                <Table withRowBorders={false}>
                  <Table.Thead>
                    <Table.Tr>
                      {['GPU', 'CPU', 'RAM', 'Node'].map((header) => (
                        <Table.Th key={header}>
                          <Skeleton height={24} width={80} />
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {[1, 2].map((rowIndex) => (
                      <Table.Tr key={rowIndex}>
                        {[1, 2, 3, 4].map((colIndex) => (
                          <Table.Td key={colIndex}>
                            <Skeleton height={24} width={60} />
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>

              {!is1440px && (
                <Stack w={is1024px ? '100%' : 550} gap="xl">
                  <Group justify="flex-end" gap="xl">
                    <Skeleton height={40} width={120} />
                    <Skeleton height={40} width={120} />
                  </Group>
                  <Stack gap="xs">
                    {/* GPU Utilization Skeleton */}
                    <Group gap="sm">
                      <Skeleton height={90} width={90} circle />
                      <Stack gap={4}>
                        <Skeleton height={24} width={120} />
                        <Skeleton height={20} width={200} />
                      </Stack>
                    </Group>
                    {/* CPU Utilization Skeleton */}
                    <Group gap="sm">
                      <Skeleton height={90} width={90} circle />
                      <Stack gap={4}>
                        <Skeleton height={24} width={120} />
                        <Skeleton height={20} width={200} />
                      </Stack>
                    </Group>
                  </Stack>
                </Stack>
              )}
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

export default ClustersFallback
