import { Stack, Text, Title } from '@mantine/core'
import classes from './forgetWorkspace.module.css'

export default function ForgetWorkspaceHeader() {
  return (
    <Stack gap="xs">
      <Title fz="var(--size-2xl)" c="var(--clr-black)">
        Forgot Workspace
      </Title>
      <Text className={classes.label}>
        We'll email you instructions on how to reset your workspace.
      </Text>
    </Stack>
  )
}
