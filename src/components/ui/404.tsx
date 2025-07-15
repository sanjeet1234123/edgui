import { Stack, Text, Title } from '@mantine/core'

function NotFound() {
  return (
    <Stack align="center" justify="center" h="100vh">
      <Title fz="var(--size-7xl)" c="var(--clr-black)">
        404
      </Title>
      <Text fz="var(--size-lg)" fw={500} c="var(--clr-black)">
        Page not found
      </Text>
    </Stack>
  )
}

export default NotFound
