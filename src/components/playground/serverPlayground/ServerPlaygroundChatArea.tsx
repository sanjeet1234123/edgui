import { useEffect } from 'react'
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconPlugConnected,
  IconPlugConnectedX,
  IconTrash,
} from '@tabler/icons-react'
import classes from './serverPlayground.module.css'
import ChatArea from './ChatArea/ChatArea'
import ChatInput from './ChatArea/ChatInput'
import ThreeDotContainer from '@/assets/images/3dot-container.svg?react'
import { useChatStore } from '@/store/chatStore'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { useWebSocketStore } from '@/store/websocketStore'

function ServerPlaygroundChatArea() {
  const { clearMessages } = useChatStore()
  const { selectedServers, serverConfigsData, mcpServersFinalData } =
    useSelectedServersStore()

  const { isConnected, connectionStatus, errorMessage, connect, reconnect } =
    useWebSocketStore()

  // Check if we can connect to WebSocket based on server configs
  useEffect(() => {

    // Don't connect if no servers are selected
    if (selectedServers.length === 0) {
      useWebSocketStore.getState().disconnect()
      return
    }

    // Check if all servers with hasEnv=true have their env property populated
    const canConnect = serverConfigsData.every(server => {
      // If server doesn't require env (hasEnv=false), it's ready to connect
      if (!server.hasEnv) return true

      // If server requires env (hasEnv=true), check if env is populated
      return server.env !== undefined
    })

    if (canConnect && serverConfigsData.length > 0) {
      // Connect and send initial message
      connect(mcpServersFinalData ? { mcpServersFinalData } : undefined)
    } else {
      // Disconnect if we can't connect (missing env for servers that require it)
      useWebSocketStore.getState().disconnect()
    }

    // Cleanup on unmount
    return () => {
      useWebSocketStore.getState().disconnect()
    }
  }, [serverConfigsData, selectedServers])

  const handleClearChat = () => {
    clearMessages()
  }

  const handleReconnect = () => {
    // Don't reconnect if no servers are selected
    if (selectedServers.length === 0) {
      console.warn('Cannot connect: No servers selected')
      return
    }

    // Check if all servers with hasEnv=true have their env property populated
    const canConnect = serverConfigsData.every(server => {
      // If server doesn't require env (hasEnv=false), it's ready to connect
      if (!server.hasEnv) return true

      // If server requires env (hasEnv=true), check if env is populated
      return server.env !== undefined
    })

    if (canConnect && serverConfigsData.length > 0) {
      reconnect(mcpServersFinalData ? { mcpServersFinalData } : undefined)
    } else {
      // Show an error or notification that connection can't be established due to missing env variables
      console.warn(
        'Cannot connect: Some servers require environment variables that are not set',
      )
    }
  }

  return (
    <Card className={classes.chatAreaCard}>
      <ThreeDotContainer className={classes.SVGContainer} />

      <Group gap={4} className={classes.threeDotButton}>
        <Tooltip label={connectionStatus} position="left">
          <ThemeIcon size="sm" color={isConnected ? 'green' : 'red'}>
            {isConnected ? (
              <IconPlugConnected size={20} stroke={1.5} />
            ) : (
              <IconPlugConnectedX size={20} stroke={1.5} />
            )}
          </ThemeIcon>
        </Tooltip>

        <Tooltip label="Clear chat" position="left">
          <ActionIcon variant="transparent" size="md" onClick={handleClearChat}>
            <IconTrash size={20} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Stack className="flex-grow pt-6" justify="space-between">
        {errorMessage && !isConnected && (
          <Alert
            color="red"
            title="Connection Error"
            withCloseButton={false}
            className={classes.errorAlert}
          >
            <Text size="sm">{errorMessage}</Text>
            <Button
              variant="outline"
              color="red"
              size="xs"
              onClick={handleReconnect}
              mt="xs"
            >
              Try Reconnect
            </Button>
          </Alert>
        )}
        <ChatArea />
        <ChatInput disabled={!isConnected} />
      </Stack>
    </Card>
  )
}

export default ServerPlaygroundChatArea
