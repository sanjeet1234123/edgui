import { Grid, Group, Skeleton, Stack } from '@mantine/core'

export default function ClustersFallback() {
  return (
    <Stack gap="3rem">
      <Group>
        <Skeleton height={36} width={200} />
      </Group>

      {/* Modal Details Skeleton */}
      <Skeleton height={200} radius="md" />

      {/* Clusters Grid Skeleton */}
      <Grid gutter="lg">
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid.Col span={{ base: 12, md: 6, lg: 6, xl: 4 }} key={index}>
            <Skeleton height={300} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  )
}
