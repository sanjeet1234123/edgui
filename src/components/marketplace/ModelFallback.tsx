import { Group, Card, Stack, Grid, Skeleton, Text } from '@mantine/core'
import MarketplaceHeader from './MarketplaceHeader'
import { useMediaQuery } from '@mantine/hooks'

function ModelFallback() {
  const isMobile = useMediaQuery('(max-width: 36em)')
  const isTablet = useMediaQuery('(max-width: 48em)')

  const getInitialCount = () => {
    if (isMobile) return 1
    if (isTablet) return 2
    return 3
  }
  return (
    <Stack h="100%" w="100%" gap="xl">
      <MarketplaceHeader
        pageTitle="Model Marketplace"
      />
      {/* All Models section skeleton */}
      <Stack>
        <Group>
          <Text fw="600" size="var(--size-2xl)" c="#4453B0">
            Models
          </Text>
        </Group>
        <Grid gutter={{ base: 16, md: 24 }}>
          {Array.from({ length: 3 * getInitialCount() }).map((_, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
              <Card p="lg" radius="md" withBorder shadow="sm">
                <Stack gap="lg">
                  {/* Card Header */}
                  <Group justify="apart">
                    <Group>
                      <Skeleton height={40} width={40} radius="xl" />
                      <Stack gap={4}>
                        <Skeleton height={20} width={120} />
                        <Group>
                          <Skeleton height={16} width={60} radius="xl" />
                        </Group>
                      </Stack>
                    </Group>
                  </Group>

                  {/* Card Body */}
                  <Stack gap="xs">
                    <Skeleton height={16} width="90%" />
                    <Skeleton height={16} width="75%" />
                    <Skeleton height={16} width="80%" />
                  </Stack>

                  {/* Card Footer */}
                  <Group justify="apart" mt="auto">
                    <Skeleton height={14} width={100} />
                    <Skeleton height={36} width={100} radius="md" />
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

export default ModelFallback
