import { Card, Grid, Group, Skeleton, Stack } from '@mantine/core'
import classes from './addCluster.module.css'

function AddClusterFallback() {
  return (
    <>
      <Stack className="flex-grow">
        {/* Skeleton for header */}
        <Group>
          <Skeleton height={36} width="50%" radius="md" />
        </Group>

        {/* Skeleton for cluster cards */}
        <Grid gutter="xl" mb="xl">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={index}>
                <Card
                  h="100%"
                  padding="xl"
                  shadow="md"
                  classNames={{
                    root: classes.cardStyle,
                  }}
                >
                  <Stack gap="xl">
                    <Skeleton height={52} width={52} radius="sm" />
                    <Stack gap="xs">
                      <Skeleton height={24} width="70%" radius="md" />
                      <Skeleton height={16} radius="md" />
                      <Skeleton height={16} radius="md" />
                      <Skeleton height={16} width="80%" radius="md" />
                    </Stack>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
        </Grid>

        {/* Skeleton for action buttons */}
        <Group>
          <Skeleton height={42} width={200} radius="md" />
        </Group>
      </Stack>
    </>
  )
}

export default AddClusterFallback
