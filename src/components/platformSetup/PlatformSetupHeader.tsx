import { Stack, Text, Title } from '@mantine/core'
import classes from './platformSetup.module.css'

function PlatformSetupHeader() {
  return (
    <Stack gap="xs">
      <Title className={classes.title}>Platform Setup</Title>
      <Text className={classes.text}>
        Please follow the steps by setting up your Team, Project and workspace
      </Text>
    </Stack>
  )
}

export default PlatformSetupHeader
