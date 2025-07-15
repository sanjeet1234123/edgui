import { Card, Grid, Group, Skeleton, Stack } from '@mantine/core'

function ProjectsFallback() {
  return (
    <Stack gap="md" className="flex-grow">
      {/* Header Skeleton - matches ProjectHeader */}
      <Group justify="space-between" align="center">
        <Skeleton height={36} width={200} radius="md" />
        <Skeleton height={40} width={140} radius="md" />
      </Group>

      {/* Empty state or Grid of cards - matches ProjectBody */}
      <Grid gutter="lg">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={index}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Stack justify="space-between" h="100%">
                <Stack>
                  {/* Icon area */}
                  <Skeleton height={40} width={40} radius="xl" />
                  {/* Project name */}
                  <Skeleton height={28} width="70%" radius="md" />
                  {/* Project description */}
                  <Skeleton height={16} radius="md" />
                  <Skeleton height={16} width="80%" radius="md" />
                </Stack>
                {/* Date/status */}
                <Skeleton height={16} width={120} mt="md" radius="md" />
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  )
}

export default ProjectsFallback
