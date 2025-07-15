import { useMemo, lazy, Suspense } from 'react'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Box, Card, Text, Flex, ScrollArea, Table, Loader } from '@mantine/core'

import { useMantineColorScheme } from '@mantine/core'
import { cleanContent } from '@/utils/commonFunction'
import classes from './chatArea.module.css'
import { useChatStore } from '@/store/chatStore'

// Lazy load the code highlighting functionality using absolute path
const CodeHighlightMarkdown = lazy(
  () =>
    import(
      '@/components/playground/serverPlayground/ChatArea/CodeHighlightMarkdown'
    ),
)

export default function RenderMessages() {
  const { messages } = useChatStore()
  const { colorScheme } = useMantineColorScheme()

  // Custom table component for better responsive rendering
  const CustomTable = ({ children, ...props }: any) => (
    <ScrollArea>
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        style={{ minWidth: '100%' }}
        {...props}
      >
        {children}
      </Table>
    </ScrollArea>
  )

  // Custom components for react-markdown
  const markdownComponents = {
    table: CustomTable,
    // Ensure table cells wrap content properly
    td: ({ children, ...props }: any) => (
      <Table.Td
        style={{ wordBreak: 'break-word', maxWidth: '200px' }}
        {...props}
      >
        {children}
      </Table.Td>
    ),
    th: ({ children, ...props }: any) => (
      <Table.Th
        style={{ wordBreak: 'break-word', maxWidth: '200px' }}
        {...props}
      >
        {children}
      </Table.Th>
    ),
  }

  // Check if any message contains code blocks
  const hasCodeBlocks = useMemo(() => {
    return messages.some(
      message =>
        message.content &&
        (message.content.includes('```') ||
          message.content.includes('<code>') ||
          message.content.includes('<pre>')),
    )
  }, [messages])

  // Memoize messages to prevent unnecessary re-renders
  const renderedMessages = useMemo(() => {
    return messages.map(message => {
      if (message.isUser) {
        return (
          <Box key={message.id} className="flex flex-col">
            <Card
              p="8px 16px"
              shadow="0"
              radius="xl"
              className={classes.chatAreaUserMessage}
            >
              <Text>{message.content}</Text>
            </Card>
            <Flex justify="flex-end" mt="xs">
              <Text fz="var(--size-xs)" c="var(--clr-black)">
                {moment(Number(message.timestamp)).format('MMM D, h:mm a')}
              </Text>
            </Flex>
          </Box>
        )
      } else {
        const content = cleanContent(
          message.content ? message.content : "Sorry, I don't understand that.",
        )

        return (
          <Box key={message.id} style={{ padding: '4px 0' }}>
            <div
              className={`markdown markdown-body ${classes.chatAreaBotMessage}`}
              data-theme={colorScheme}
            >
              {hasCodeBlocks ? (
                <Suspense fallback={<Loader size="sm" />}>
                  <CodeHighlightMarkdown
                    content={content}
                    components={markdownComponents}
                  />
                </Suspense>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  skipHtml={false}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
              )}
              {message.id !== 'initial-greeting' && (
                <Flex mt="xs">
                  <Text fz="var(--size-xs)" c="var(--clr-black)">
                    {moment(Number(message.timestamp)).format('MMM D, h:mm a')}
                  </Text>
                </Flex>
              )}
            </div>
          </Box>
        )
      }
    })
  }, [messages, colorScheme, hasCodeBlocks, markdownComponents])

  return renderedMessages
}
