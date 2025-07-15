import { Loader, Stack, Text } from '@mantine/core'

type FullPageLoaderProps = {
  message?: string
}

function FullPageLoader({ message = 'Loading...' }: FullPageLoaderProps) {
  return (
    <Stack align="center" justify="center" h="100vh">
      <Loader size="md" />
      <Text>{message}</Text>
    </Stack>
  )
}

export default FullPageLoader
