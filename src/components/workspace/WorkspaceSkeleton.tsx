import { Group, Stack, Card, Skeleton } from '@mantine/core'

function WorkspaceSkeleton() {
  return (
    <Stack className="flex-grow">
      {/* Header Skeleton */}
      <Group justify="space-between">
        <Group align="center" gap="1rem">
          <Skeleton height={32} width={200} />
        </Group>
        <Skeleton height={40} width={40} radius="md" />
      </Group>

      {/* Body Skeleton */}
      <Stack>
        {/* Tab Control Skeleton */}
        <Group>
          <Skeleton height={36} width={300} radius="md" />
        </Group>

        {/* Content Skeleton */}
        <Group grow>
          {/* Workspace Details Card */}
          <Card withBorder radius="md" h="100%">
            <Stack h="100%">
              <Stack gap={4}>
                <Skeleton height={24} width={150} />
                <Skeleton height={16} width={200} />
              </Stack>
              <Stack gap={4}>
                <Skeleton height={16} width={100} />
                <Skeleton height={24} width="80%" />
              </Stack>
              <Group justify="space-between">
                <Stack gap={4}>
                  <Skeleton height={16} width={120} />
                  <Skeleton height={24} width="90%" />
                </Stack>
                <Skeleton height={32} width={32} radius="md" />
              </Group>
            </Stack>
          </Card>

          {/* Workspace Members Card */}
          <Card withBorder radius="md" h="100%">
            <Stack h="100%">
              <Group justify="space-between">
                <Stack gap={4}>
                  <Skeleton height={24} width={180} />
                  <Skeleton height={16} width={220} />
                </Stack>
                <Skeleton height={36} width={100} radius="md" />
              </Group>
              <Stack gap="md">
                {[1, 2, 3].map((index) => (
                  <Group key={index} justify="space-between">
                    <Group gap="sm">
                      <Skeleton height={40} width={40} radius="xl" />
                      <Stack gap={4}>
                        <Skeleton height={16} width={120} />
                        <Skeleton height={14} width={100} />
                      </Stack>
                    </Group>
                    <Skeleton height={24} width={80} radius="md" />
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Group>
      </Stack>
    </Stack>
  )
}

export default WorkspaceSkeleton
