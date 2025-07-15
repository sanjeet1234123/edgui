import { act } from 'react-dom/test-utils'
import { useWebSocketStore } from '../../store/websocketStore'

// Mock useChatStore
jest.mock('../../store/chatStore', () => ({
  useChatStore: {
    getState: () => ({
      addMessage: jest.fn(),
    }),
  },
}))

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onclose: ((event: any) => void) | null = null
  sent: any[] = []
  closed = false
  url: string

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }
  send(msg: any) {
    this.sent.push(msg)
  }
  close() {
    this.closed = true
    if (this.onclose) this.onclose({ code: 1000, reason: 'Closed by test' })
  }
}
global.WebSocket = MockWebSocket as any

describe('useWebSocketStore', () => {
  beforeEach(() => {
    // Reset Zustand store state
    useWebSocketStore.setState({
      isConnected: false,
      connectionStatus: 'WebSocket Disconnected',
      errorMessage: null,
      websocket: null,
      lastConnectedTime: null,
    })
    MockWebSocket.instances.length = 0
  })

  it('should have initial state', () => {
    const state = useWebSocketStore.getState()
    expect(state.isConnected).toBe(false)
    expect(state.connectionStatus).toBe('WebSocket Disconnected')
    expect(state.errorMessage).toBeNull()
    expect(state.websocket).toBeNull()
    expect(state.lastConnectedTime).toBeNull()
  })

  it('connects and sets state on open', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    expect(ws).toBeDefined()
    expect(useWebSocketStore.getState().connectionStatus).toContain(
      'Connecting',
    )
    act(() => {
      ws.onopen && ws.onopen()
    })
    expect(useWebSocketStore.getState().isConnected).toBe(true)
    expect(useWebSocketStore.getState().connectionStatus).toBe(
      'WebSocket Connected',
    )
    expect(useWebSocketStore.getState().websocket).toBe(ws)
    expect(useWebSocketStore.getState().errorMessage).toBeNull()
    expect(useWebSocketStore.getState().lastConnectedTime).not.toBeNull()
  })

  it('sends initial message on connect', () => {
    act(() => {
      useWebSocketStore.getState().connect({ foo: 'bar' })
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onopen && ws.onopen()
    })
    expect(ws.sent[0]).toBe(JSON.stringify({ foo: 'bar' }))
  })

  it('handles onerror and sets errorMessage', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onerror && ws.onerror('err')
    })
    expect(useWebSocketStore.getState().errorMessage).toContain(
      'Connection error',
    )
    expect(useWebSocketStore.getState().connectionStatus).toContain('Error')
  })

  it('handles onclose with code 1006', () => {
    jest.useFakeTimers()
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onclose && ws.onclose({ code: 1006, reason: '' })
    })
    expect(useWebSocketStore.getState().isConnected).toBe(false)
    expect(useWebSocketStore.getState().errorMessage).toContain('1006')
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('handles onclose with code 1015', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onclose && ws.onclose({ code: 1015, reason: '' })
    })
    expect(useWebSocketStore.getState().errorMessage).toContain('TLS handshake')
  })

  it('handles onclose with custom reason', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onclose && ws.onclose({ code: 1000, reason: 'Custom reason' })
    })
    expect(useWebSocketStore.getState().errorMessage).toContain('Custom reason')
  })

  it('disconnect closes websocket and updates state', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onopen && ws.onopen()
      useWebSocketStore.getState().disconnect()
    })
    expect(ws.closed).toBe(true)
    expect(useWebSocketStore.getState().isConnected).toBe(false)
    expect(useWebSocketStore.getState().websocket).toBeNull()
  })

  it('reconnect calls disconnect and connect', () => {
    jest.useFakeTimers()
    const connectSpy = jest.spyOn(useWebSocketStore.getState(), 'connect')
    const disconnectSpy = jest.spyOn(useWebSocketStore.getState(), 'disconnect')
    act(() => {
      useWebSocketStore.getState().reconnect({ foo: 'bar' })
    })
    expect(disconnectSpy).toHaveBeenCalled()
    jest.advanceTimersByTime(1000)
    expect(connectSpy).toHaveBeenCalledWith({ foo: 'bar' })
    jest.useRealTimers()
  })

  it('sendMessage sends object as JSON', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    act(() => {
      ws.onopen && ws.onopen()
      useWebSocketStore.getState().sendMessage({ foo: 'bar' })
    })
    expect(ws.sent).toContain(JSON.stringify({ foo: 'bar' }))
  })

  it('sendMessage sets errorMessage on send error', () => {
    act(() => {
      useWebSocketStore.getState().connect()
    })
    const ws = MockWebSocket.instances[0]
    ws.send = () => {
      throw new Error('fail')
    }
    act(() => {
      ws.onopen && ws.onopen()
      useWebSocketStore.getState().sendMessage('fail')
    })
    expect(useWebSocketStore.getState().errorMessage).toContain(
      'Failed to send message',
    )
  })
})
