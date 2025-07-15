import { Title, Text, Grid, Paper, Group, Badge, Stack } from '@mantine/core'
import { features } from './constants'
import type { Feature } from './constants'

const UpcomingFeatures = () => {
  // Group features by section
  const groupedFeatures = features.reduce(
    (acc, feature) => {
      if (!acc[feature.section]) {
        acc[feature.section] = []
      }
      acc[feature.section].push(feature)
      return acc
    },
    {} as Record<string, Feature[]>,
  )

  // Define status colors for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Coming Soon':
        return 'blue'
      case 'In Development':
        return 'green'
      case 'Planning':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  return (
    <Stack gap="xl">
      <Title
        order={2}
        fz="var(--size-3xl)"
        fw={600}
        c="var(--clr-black)"
      >
        Upcoming Features
      </Title>

      {Object.entries(groupedFeatures).map(([section, sectionFeatures]) => (
        <Stack key={section}>
          <Title
            order={3}
            fw={600}
            className="text-[#2c3e50] mb-6 pb-2 border-b-2 border-[#e3f2fd]"
          >
            {section}
          </Title>

          <Grid gutter="lg">
            {sectionFeatures.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 6, lg: 6 }}>
                <Paper
                  shadow="sm"
                  radius="md"
                  p="md"
                  className="h-full transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
                >
                  <Stack h="100%">
                    <Title
                      order={4}
                      fw={600}
                      className="text-[#2c3e50] font-medium text-base"
                    >
                      {feature.title}
                    </Title>

                    <Text size="sm" className="text-gray-600 flex-grow">
                      {feature.description}
                    </Text>

                    <Group justify="space-between" className="mt-auto">
                      <Badge
                        color={getStatusColor(feature.status)}
                        size="md"
                        variant="light"
                        radius="xl"
                      >
                        {feature.status}
                      </Badge>
                      <Text size="sm" className="text-gray-600">
                        ETA: {feature.eta}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  )
}

export default UpcomingFeatures
