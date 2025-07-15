import { useEffect, useRef } from 'react'
import { Typewriter } from 'react-simple-typewriter'
import { Box, Stack, useMantineColorScheme } from '@mantine/core'
import { useWebSocketStore } from '@/store/websocketStore'
import { useChatStore } from '@/store/chatStore'
import RenderMessages from './RenderMessages'

function ChatArea() {
  const { colorScheme } = useMantineColorScheme()
  const { messages } = useChatStore()
  const { isSendingMessage } = useWebSocketStore()

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Dynamically load highlight.js theme CSS by injecting a <link> tag
  useEffect(() => {
    const theme = colorScheme === 'dark' ? 'github-dark.css' : 'github.css'
    const existingLink = document.getElementById(
      'hljs-theme-style',
    ) as HTMLLinkElement | null
    const themeHref = `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/${theme}`
    if (existingLink) {
      existingLink.href = themeHref
      document.head.appendChild(existingLink)
    } else {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.id = 'hljs-theme-style'
      link.href = themeHref
      document.head.appendChild(link)
    }
    return () => {
      const link = document.getElementById('hljs-theme-style')
      if (link) link.remove()
    }
  }, [colorScheme])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <>
      <Stack
        gap={0}
        ref={chatContainerRef}
        className="flex-grow h-100 pr-2"
        style={{ overflowY: 'auto' }}
      >
        <RenderMessages />
      </Stack>
      {isSendingMessage && (
        <Box h={32} style={{ minHeight: 32 }}>
          <Typewriter
            words={['Processing your request...']}
            loop={false}
            cursor
            cursorStyle=""
            typeSpeed={50}
            deleteSpeed={30}
            delaySpeed={1000}
          />
        </Box>
      )}
    </>
  )
}

export default ChatArea
