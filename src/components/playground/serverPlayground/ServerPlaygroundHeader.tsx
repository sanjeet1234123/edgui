import { Group, Text, Button, Tooltip } from '@mantine/core'
import { PlugZap } from 'lucide-react'
import { useSelectedServersStore } from '@/store/selectedServersStore'
import { useWebSocketStore } from '@/store/websocketStore'
import { useState, useEffect } from 'react'

function ServerPlaygroundHeader() {
  const { selectedServers, mcpServersFinalData } = useSelectedServersStore()

  const { connect } = useWebSocketStore()

  const [allConfigsFilled, setAllConfigsFilled] = useState(false)

  useEffect(() => {
    const filled =
      selectedServers?.length > 0 &&
      selectedServers?.every(server => {
        const mcpServers = server?.mcp_config?.mcpServers || {}
        return Object.entries(mcpServers)
          .filter(([_, serverConfig]) => !!serverConfig?.env)
          .every(([key]) => {
            try {
              return (
                !!mcpServersFinalData?.mcpServers?.[key] &&
                typeof mcpServersFinalData.mcpServers[key] === 'object'
              )
            } catch {
              return false
            }
          })
      })
    setAllConfigsFilled(filled)
  }, [selectedServers, mcpServersFinalData])

  return (
    <Group justify="space-between" align="center">
      <Text className="Title">MCP Server Playground</Text>
      {/* Connect button at the bottom */}
      <Tooltip label="Edit configuration first" disabled={allConfigsFilled}>
        <Button
          size="md"
          disabled={!allConfigsFilled}
          onClick={() => {
            connect(mcpServersFinalData || {})
          }}
          leftSection={<PlugZap strokeWidth={1.5} size={24} />}
        >
          Connect
        </Button>
      </Tooltip>
    </Group>
  )
}

export default ServerPlaygroundHeader
