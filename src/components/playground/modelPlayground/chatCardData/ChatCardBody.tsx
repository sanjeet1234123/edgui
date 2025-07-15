import { useEffect, useRef } from 'react'
import { Group, Loader, Text } from '@mantine/core'
import styles from './chatCard.module.css'

type ChatCardBodyProps = {
  messages: Array<any>
  isLoading: boolean
  isError: boolean
  error: Error | null
}

function ChatCardBody({
  messages,
  isLoading,
  isError,
  error,
}: ChatCardBodyProps) {
  const messageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div className="flex-grow p-4 border-2 border-dashed border-gray-300 rounded-2xl min-h-[200px]">
      <div className={styles.messageContainer} ref={messageContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.role === 'user' ? styles.userMessage : ''
            }`}
          >
            <div
              className={`${styles.messageBubble} ${
                msg.role === 'user'
                  ? styles.userMessageBubble
                  : styles.botMessageBubble
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={styles.message}>
            <div
              className={`${styles.messageBubble} ${styles.botMessageBubble}`}
            >
              <Group gap="md">
                <Loader size="sm" color="#0569EC" />
                <Text size="var(--size-base)" c="#000000">
                  Generating response...
                </Text>
              </Group>
            </div>
          </div>
        )}
        {isError && error && (
          <div className={styles.message}>
            <div
              className={`${styles.messageBubble} ${styles.botMessageBubble}`}
            >
              <Text size="var(--size-base)" c="var(--mantine-color-red-7)">
                {error.message}
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatCardBody
