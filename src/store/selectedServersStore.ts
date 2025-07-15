import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Server } from '@/types/serversType'

export type ServerConfigData = {
  id: number
  serverKey: string
  env?: Record<string, string>
  hasEnv: boolean
}

export type MCPServerConfig = {
  command: string
  args: string[]
  env?: Record<string, string>
}

export type MCPServersFinalData = {
  mcpServers: Record<string, MCPServerConfig>
}

interface SelectedServersState {
  selectedServers: Array<Server>
  serverConfigsData: Array<ServerConfigData>
  mcpServersFinalData?: MCPServersFinalData
  toggleServer: (server: Server) => void
  isServerSelected: (serverId: number) => boolean
  clearSelectedServers: () => void
  initializeServerConfigsData: () => void
  updateServerConfigEnv: (data: ServerConfigData) => void
  setMcpServersFinalData: (data: MCPServersFinalData) => void
}

export const useSelectedServersStore = create<SelectedServersState>()(
  persist(
    (set, get) => ({
      selectedServers: [],
      serverConfigsData: [],
      mcpServersFinalData: undefined,

      toggleServer: (server: Server) => {
        set(state => {
          const isSelected = state.selectedServers.some(s => s.id === server.id)
          if (isSelected) {
            // Server is being unselected
            const newSelectedServers = state.selectedServers.filter(
              s => s.id !== server.id,
            )

            // Update mcpServersFinalData to remove configs from unselected server
            let newMcpServersFinalData = state.mcpServersFinalData
            if (newMcpServersFinalData && server.mcp_config?.mcpServers) {
              const updatedMcpServers = { ...newMcpServersFinalData.mcpServers }

              // Remove all server keys from the unselected server
              Object.keys(server.mcp_config.mcpServers).forEach(serverKey => {
                delete updatedMcpServers[serverKey]
              })

              newMcpServersFinalData = {
                mcpServers: updatedMcpServers,
              }
            }

            return {
              ...state,
              selectedServers: newSelectedServers,
              mcpServersFinalData: newMcpServersFinalData,
            }
          }
          return {
            ...state,
            selectedServers: [...state.selectedServers, server],
          }
        })
        // Initialize server configs after toggling
        get().initializeServerConfigsData()
      },

      isServerSelected: (serverId: number) => {
        return get().selectedServers.some(server => server.id === serverId)
      },

      clearSelectedServers: () =>
        set({
          selectedServers: [],
          serverConfigsData: [],
          mcpServersFinalData: undefined,
        }),

      initializeServerConfigsData: () => {
        set(state => {
          const initialConfigs: Array<ServerConfigData> = []

          state.selectedServers.forEach(server => {
            if (server.mcp_config && server.mcp_config.mcpServers) {
              Object.keys(server.mcp_config.mcpServers).forEach(serverKey => {
                initialConfigs.push({
                  id: server.id,
                  serverKey,
                  hasEnv:
                    server.mcp_config.mcpServers[serverKey].env !== undefined,
                })
              })
            }
          })

          return { ...state, serverConfigsData: initialConfigs }
        })
      },

      updateServerConfigEnv: (data: ServerConfigData) => {
        set(state => ({
          ...state,
          serverConfigsData: state.serverConfigsData.map(item =>
            item.id === data.id && item.serverKey === data.serverKey
              ? { ...item, env: data.env }
              : item,
          ),
        }))
      },

      setMcpServersFinalData: (data: MCPServersFinalData) =>
        set({ mcpServersFinalData: data }),
    }),
    {
      name: 'selected-servers-storage',
    },
  ),
)
