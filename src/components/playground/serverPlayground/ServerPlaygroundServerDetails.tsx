import { Card, Stack } from '@mantine/core'
import { useEffect } from 'react'
import ServerDetails from './ServerDetails/ServerDetails'
import ConnectServers from './ServerDetails/ConnectServers'
import ServerTools from './ServerDetails/ServerTools'
import { useSelectedServersStore } from '@/store/selectedServersStore'

function ServerPlaygroundServerDetails() {
  const {
    selectedServers,
    mcpServersFinalData,
    initializeServerConfigsData,
    setMcpServersFinalData,
  } = useSelectedServersStore()

  // Initialize serverConfigsData with all selected servers
  useEffect(() => {
    initializeServerConfigsData()
  }, [initializeServerConfigsData])

  // Helper to get the config string for a given server name
  const getConfigValue = (serverName: string, defaultValue: string) => {
    return mcpServersFinalData?.mcpServers?.[serverName]
      ? JSON.stringify(mcpServersFinalData.mcpServers[serverName], null, 2)
      : defaultValue
  }

  // Handler to update config in mcpServersFinalData object
  const handleConfigChange = (serverName: string, value: string) => {
    try {
      const parsed = JSON.parse(value)
      setMcpServersFinalData({
        mcpServers: {
          ...mcpServersFinalData?.mcpServers,
          [serverName]: parsed,
        },
      })
    } catch {
      // If not valid JSON, do not update
    }
  }

  return (
    <Stack gap="xl">
      {selectedServers.length > 0 &&
        selectedServers.map((server, index) => {
          return (
            <Card p="md" m="0 2.5rem" key={index}>
              <Stack gap="xl">
                {/* Server Details */}
                <ServerDetails server={server} />

                {/* Connect Servers */}
                {Object.entries(server?.mcp_config?.mcpServers || {}).map(
                  ([key, serverConfig]) => {
                    if (!serverConfig) return null 

                    return (
                      <ConnectServers
                        serverConfig={serverConfig}
                        key={key}
                        serverName={key}
                        configValue={getConfigValue(
                          key,
                          JSON.stringify(serverConfig, null, 2),
                        )}
                        onConfigChange={handleConfigChange}
                      />
                    )
                  },
                )}

                {/* Server Tools */}
                <ServerTools server={server} />
              </Stack>
            </Card>
          )
        })}
    </Stack>
  )
}

export default ServerPlaygroundServerDetails
