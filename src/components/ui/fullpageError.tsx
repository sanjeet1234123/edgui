import { Button, Stack, Text } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type { ErrorComponentProps } from '@tanstack/react-router'

type FullPageErrorProps = {
  error: ErrorComponentProps
  onRetry?: () => void
}

function FullPageError({
  error,
  onRetry = () => window.location.reload(),
}: FullPageErrorProps) {
  const message = `Error loading: ${error instanceof Error ? error.message : 'Something went wrong'}`

  return (
    <Stack align="center" justify="center" h="100vh">
      <IconAlertCircle size={40} color="red" />
      <Text c="red.7">{message}</Text>
      <Button onClick={onRetry} variant="outline">
        Retry
      </Button>
    </Stack>
  )
}

export default FullPageError
