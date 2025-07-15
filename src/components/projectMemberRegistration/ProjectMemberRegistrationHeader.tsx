import { Group, Stack, Text, Title } from '@mantine/core'

function ProjectMemberRegistrationHeader() {
  return (
    <Group>
      <Stack gap="xs">
        <Title fz="var(--size-2xl)" c="var(--clr-black)">
          Project Onboarding
        </Title>
        <Text fz="var(--size-sm)">
          Enter your details below to get started with the project
        </Text>
      </Stack>
    </Group>
  )
}

export default ProjectMemberRegistrationHeader
