import { Card, Stack, Title, Text, Group } from '@mantine/core'
import { IconServer } from '@tabler/icons-react'
import classes from './Overview.module.css'

function Environments() {
  return (
    <Card withBorder radius="md" h="100%">
      <Stack h="100%">
        <Stack gap={4}>
          <Title order={3} classNames={{ root: classes.cardTitle }}>
            Environments
          </Title>
          <Text classNames={{ root: classes.cardDescription }}>
            Manage your project environments
          </Text>
        </Stack>
        <Stack justify="center" h="100%">
          {[
            {
              name: 'Development',
              description: 'Development and testing environment',
            },
            {
              name: 'Staging',
              description: 'Pre-production testing environment',
            },
            {
              name: 'Production',
              description: 'Live environment for end users',
            },
          ].map((environment, i) => (
            <Group gap="md" className={classes.environment} key={i}>
              <IconServer size={24} color="#737478" />
              <Stack gap={0}>
                <Text className={classes.environmentName}>
                  {environment.name}
                </Text>
                <Text className={classes.environmentDescription}>
                  {environment.description}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

export default Environments
