// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { useSelectedServersStore } from '@/store/selectedServersStore'

describe('useSelectedServersStore', () => {
  const serverA = {
    id: 1,
    name: 'Server A',
    mcp_config: {
      mcpServers: {
        keyA: { command: 'run', args: ['a'], env: { FOO: 'bar' } },
        keyB: { command: 'run', args: ['b'] },
      },
    },
  }
  const serverB = {
    id: 2,
    name: 'Server B',
    mcp_config: {
      mcpServers: {
        keyC: { command: 'start', args: ['c'], env: { BAR: 'baz' } },
      },
    },
  }

  beforeEach(() => {
    localStorage.clear()
    useSelectedServersStore.setState({
      selectedServers: [],
      serverConfigsData: [],
      mcpServersFinalData: undefined,
    })
  })

  it('should have initial state', () => {
    const state = useSelectedServersStore.getState()
    expect(state.selectedServers).toEqual([])
    expect(state.serverConfigsData).toEqual([])
    expect(state.mcpServersFinalData).toBeUndefined()
  })

  it('should toggle server selection and initialize configs', () => {
    useSelectedServersStore.getState().toggleServer(serverA)
    let state = useSelectedServersStore.getState()
    expect(state.selectedServers).toHaveLength(1)
    expect(state.selectedServers[0].id).toBe(1)
    expect(state.serverConfigsData).toEqual([
      { id: 1, serverKey: 'keyA', hasEnv: true },
      { id: 1, serverKey: 'keyB', hasEnv: false },
    ])
    // Toggle again to remove
    useSelectedServersStore.getState().toggleServer(serverA)
    state = useSelectedServersStore.getState()
    expect(state.selectedServers).toHaveLength(0)
    expect(state.serverConfigsData).toEqual([])
  })

  it('should check if server is selected', () => {
    useSelectedServersStore.getState().toggleServer(serverA)
    expect(useSelectedServersStore.getState().isServerSelected(1)).toBe(true)
    expect(useSelectedServersStore.getState().isServerSelected(2)).toBe(false)
  })

  it('should clear selected servers and configs', () => {
    useSelectedServersStore.getState().toggleServer(serverA)
    useSelectedServersStore.getState().toggleServer(serverB)
    useSelectedServersStore.getState().clearSelectedServers()
    const state = useSelectedServersStore.getState()
    expect(state.selectedServers).toEqual([])
    expect(state.serverConfigsData).toEqual([])
    expect(state.mcpServersFinalData).toBeUndefined()
  })

  it('should update server config env', () => {
    useSelectedServersStore.getState().toggleServer(serverA)
    useSelectedServersStore.getState().updateServerConfigEnv({
      id: 1,
      serverKey: 'keyA',
      env: { FOO: 'updated' },
      hasEnv: true,
    })
    const config = useSelectedServersStore
      .getState()
      .serverConfigsData.find(c => c.id === 1 && c.serverKey === 'keyA')
    expect(config.env).toEqual({ FOO: 'updated' })
  })

  it('should set mcpServersFinalData', () => {
    const data = { mcpServers: { key: { command: 'run', args: [] } } }
    useSelectedServersStore.getState().setMcpServersFinalData(data)
    expect(useSelectedServersStore.getState().mcpServersFinalData).toEqual(data)
  })

  it('should initialize configs for multiple servers', () => {
    useSelectedServersStore.getState().toggleServer(serverA)
    useSelectedServersStore.getState().toggleServer(serverB)
    const configs = useSelectedServersStore.getState().serverConfigsData
    expect(configs).toEqual(
      expect.arrayContaining([
        { id: 1, serverKey: 'keyA', hasEnv: true },
        { id: 1, serverKey: 'keyB', hasEnv: false },
        { id: 2, serverKey: 'keyC', hasEnv: true },
      ]),
    )
  })
})
