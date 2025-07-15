import {
  Card,
  Grid,
  Group,
  Pagination,
  Skeleton,
  Stack,
  TextInput,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

function ServersFallback() {
  return (
    <Stack className="flex-grow">
      {/* Header Skeleton */}
      <Group>
        <Skeleton height={40} width={250} radius="md" />
      </Group>

      {/* Section Skeleton */}
      <Stack justify="space-between" className="flex-grow">
        <Stack>
          {/* Search Skeleton */}
          <TextInput
            placeholder="Search"
            value=""
            disabled
            rightSection={<IconSearch size={16} />}
          />

          {/* Cards Grid Skeleton */}
          <Grid gutter={{ base: 16, md: 24 }}>
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={index}>
                  <Card h="100%">
                    <Stack>
                      <Group>
                        <Skeleton height={40} width={40} radius="xl" />
                        <Skeleton height={24} width={120} radius="md" />
                      </Group>
                      <Skeleton height={40} width="100%" radius="md" />
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
          </Grid>
        </Stack>

        {/* Pagination Skeleton */}
        <Group justify="center" mt="xl">
          <Pagination value={1} total={5} disabled />
        </Group>
      </Stack>
    </Stack>
  )
}

export default ServersFallback
