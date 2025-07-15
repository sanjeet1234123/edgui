import { useState } from 'react'
import {
  ActionIcon,
  Card,
  Group,
  Select,
  Stack,
  Textarea,
  Tooltip,
} from '@mantine/core'
import { IconArrowUp, IconChevronDown } from '@tabler/icons-react'
import AddFiles from './AddFiles'
import { useWebSocketStore } from '@/store/websocketStore'

interface ChatInputProps {
  disabled?: boolean
}

function ChatInput({ disabled = false }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedModel, setSelectedModel] = useState<string | null>(
    'gemini-2.0-flash',
  )

  const { sendMessage, isConnected } = useWebSocketStore()

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return

    // Send message via WebSocket
    sendMessage(inputValue)

    // Clear input
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card p="md">
      <Stack>
        <Textarea
          variant="unstyled"
          placeholder={
            disabled ? 'WebSocket disconnected...' : 'Type your message here...'
          }
          autosize
          minRows={1}
          maxRows={4}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          styles={{
            input: {
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
            },
          }}
        />

        <Group justify="space-between">
          <Group>
            <AddFiles disabled={!isConnected} />
            <Select
              placeholder="Select a model"
              data={[
                { label: 'gemini-2.0-flash', value: 'gemini-2.0-flash' },
                { label: 'gemini-2.0-pro', value: 'gemini-2.0-pro' },
                { label: 'gpt-4o', value: 'gpt-4o' },
                { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
                { label: 'gpt-o3', value: 'gpt-o3' },
              ]}
              value={selectedModel}
              onChange={setSelectedModel}
              rightSection={<IconChevronDown size={16} />}
              disabled={disabled}
            ></Select>
          </Group>

          <Tooltip
            label={disabled ? 'Disconnected' : 'Send message'}
            position="left"
          >
            <ActionIcon
              size="lg"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || disabled}
            >
              <IconArrowUp size={20} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Card>
  )
}

export default ChatInput
