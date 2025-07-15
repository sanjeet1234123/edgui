import { Card, Group, Skeleton, Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'

function DeploymentsFallback() {
  const is1600px = useMediaQuery('(max-width: 1600px)')
  const is1024px = useMediaQuery('(max-width: 1024px)')

  return (
    <Stack className="flex-grow" gap="xl">
      {/* Header Skeleton */}
      <Group justify="space-between">
        <Skeleton height={40} width={200} />
        <Skeleton height={40} width={180} />
      </Group>

      {/* Deployment Cards Skeleton */}
      {[1, 2, 3].map((index) => (
        <Card key={index} padding="xl">
          <Group justify="space-between" gap="xl" align="flex-start">
            {/* Left side skeleton */}
            <Stack style={{ flex: 1 }} gap="xl">
              <Group justify="space-between">
                <Group gap="xs">
                  <Skeleton height={44} width={44} circle />
                  <Skeleton height={40} width={200} />
                </Group>
                <Skeleton height={32} width={100} />
              </Group>

              <Stack gap="md">
                {[1, 2, 3].map((row) => (
                  <Group key={row} gap="md">
                    <Skeleton height={24} width={160} />
                    <Skeleton height={24} width={200} />
                  </Group>
                ))}
              </Stack>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Skeleton height={24} width={120} />
                  <Skeleton height={32} width={100} />
                </Group>
                <Skeleton height={40} width="100%" />
              </Stack>

              {/* Action buttons for mobile view */}
              {is1600px && (
                <Group justify="flex-end">
                  {is1024px ? (
                    <Skeleton height={40} width={40} />
                  ) : (
                    <Group>
                      {[1, 2, 3, 4, 5].map((btn) => (
                        <Skeleton key={btn} height={40} width={40} />
                      ))}
                    </Group>
                  )}
                </Group>
              )}
            </Stack>

            {/* Right side skeleton - only shown on larger screens */}
            {!is1600px && (
              <Stack gap="xl" w={600}>
                <Group justify="flex-end" gap="md">
                  {[1, 2, 3, 4, 5].map((btn) => (
                    <Skeleton key={btn} height={40} width={40} />
                  ))}
                </Group>

                <Stack gap="xl">
                  <Stack gap={0}>
                    <Skeleton height={24} width={120} />
                    <Group>
                      <Skeleton height={48} width={100} />
                      <Skeleton height={24} width={80} />
                    </Group>
                  </Stack>
                  <Skeleton height={80} width={500} />
                </Stack>
              </Stack>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  )
}

export default DeploymentsFallback
