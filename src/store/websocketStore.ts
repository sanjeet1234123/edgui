import { create } from 'zustand'
import { useChatStore } from './chatStore'

interface WebSocketState {
  isConnected: boolean
  isSendingMessage: boolean
  connectionStatus: string
  errorMessage: string | null
  websocket: WebSocket | null
  lastConnectedTime: string | null
  connect: (initialMessage?: any) => void
  disconnect: () => void
  reconnect: (initialMessage?: any) => void
  sendMessage: (message: string | any) => void
}

export const useWebSocketStore = create<WebSocketState>()((set, get) => ({
  isConnected: false,
  isSendingMessage: false,
  connectionStatus: 'WebSocket Disconnected',
  errorMessage: null,
  websocket: null,
  lastConnectedTime: null,

  connect: (initialMessage?: any) => {
    // Close existing connection if any
    if (get().websocket) {
      get().websocket?.close()
    }

    set({
      errorMessage: null,
      connectionStatus: 'Connecting to WebSocket...',
    })

    try {
      // Determine the WebSocket URL based on environment
      let wsUrl
      if (process.env.NODE_ENV === 'development') {
        // Use the proxied URL in development
        wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
          window.location.host
        }/ws-proxy/v1/mcp/chat`
      } else {
        // In production, connect directly
        wsUrl =
          'wss://nexastack-python-backend.stage.neuralcompany.team/v1/mcp/chat'
      }

      console.log('Connecting to WebSocket:', wsUrl)

      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        set({
          isConnected: true,
          isSendingMessage: false,
          connectionStatus: 'WebSocket Connected',
          errorMessage: null,
          lastConnectedTime: new Date().toLocaleTimeString(),
          websocket: ws,
        })
        console.log('WebSocket connection established successfully')

        // Send initial message if provided
        if (initialMessage) {
          console.log(
            'Sending initial server configuration message:',
            initialMessage,
          )
          try {
            ws.send(JSON.stringify(initialMessage))
          } catch (err) {
            console.error('Error sending initial message:', err)
          }
        }
      }

      ws.onmessage = event => {
        set({
          isSendingMessage: false,
        })
        console.log('Received message:', event.data)
        const receivedMessage = event.data

        // Dont add System Logs to the chat store
        // if (receivedMessage.includes('[System Log]:')) return

        // Add the received message to the chat store
        useChatStore.getState().addMessage(receivedMessage, false)
      }

      ws.onerror = error => {
        console.error('WebSocket error:', error)
        set({
          connectionStatus: 'Error connecting to WebSocket',
          errorMessage: 'Connection error. Check console for details.',
        })
      }

      ws.onclose = event => {
        console.log(
          'WebSocket closed with code:',
          event.code,
          'reason:',
          event.reason,
        )

        set({
          isConnected: false,
          connectionStatus: 'WebSocket Disconnected',
          websocket: null,
        })

        // Set appropriate error message
        if (event.code === 1006) {
          set({
            errorMessage:
              'Connection closed abnormally (code 1006). Possible CORS or network issue.',
          })
        } else if (event.code === 1015) {
          set({
            errorMessage: 'TLS handshake failed. Try using wss:// instead.',
          })
        } else if (event.reason) {
          set({
            errorMessage: `Connection closed: ${event.reason}`,
          })
        }

        // Attempt to reconnect after 30 seconds
        setTimeout(() => {
          if (!get().isConnected) {
            console.log('Attempting to reconnect...')
            get().connect()
          }
        }, 30000)
      }

      set({ websocket: ws })
    } catch (err) {
      console.error('Error creating WebSocket:', err)
      set({
        connectionStatus: 'WebSocket Connection Failed',
        errorMessage: `Failed to create WebSocket: ${
          err instanceof Error ? err.message : String(err)
        }`,
      })
    }
  },

  disconnect: () => {
    const { websocket } = get()
    if (websocket) {
      websocket.close()
      set({
        isConnected: false,
        connectionStatus: 'WebSocket Disconnected',
        websocket: null,
      })
    }
  },

  reconnect: (initialMessage?: any) => {
    get().disconnect()
    setTimeout(() => {
      get().connect(initialMessage)
    }, 1000)
  },

  sendMessage: (message: string | any) => {
    const { websocket, isConnected } = get()
    if (isConnected && websocket) {
      console.log('Sending message:', message)
      set({ isSendingMessage: true })

      try {
        // If message is an object, stringify it
        const messageToSend =
          typeof message === 'string' ? message : JSON.stringify(message)

        websocket.send(messageToSend)

        // Add the sent message to the chat store
        // Only add string messages to the chat UI
        if (typeof message === 'string') {
          useChatStore.getState().addMessage(message, true)
        }
      } catch (err) {
        console.error('Error sending message:', err)
        set({
          isSendingMessage: false,
          errorMessage: `Failed to send message: ${
            err instanceof Error ? err.message : String(err)
          }`,
        })
      }
    }
  },
}))
