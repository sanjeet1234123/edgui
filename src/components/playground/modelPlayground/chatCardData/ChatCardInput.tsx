import { Button, Card, Group, Textarea } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import styles from './chatCard.module.css'

type ChatCardInputProps = {
  message: string
  setMessage: (message: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  handleSendMessage: () => void
  isLoading: boolean
  disabled: boolean
}

function ChatCardInput({
  message,
  setMessage,
  handleKeyDown,
  handleSendMessage,
  isLoading,
  disabled,
}: ChatCardInputProps) {
  return (
    <Card padding="md">
      <Textarea
        variant="unstyled"
        placeholder="How can I help you?"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        autosize
        minRows={1}
        maxRows={3}
        classNames={{
          input: styles.searchInput,
        }}
      />
      <Group justify="flex-end" mt="md">
        <Button
          size="md"
          onClick={handleSendMessage}
          disabled={isLoading || disabled}
          rightSection={<IconSend size={20} />}
        >
          Send
        </Button>
      </Group>
    </Card>
  )
}

export default ChatCardInput
