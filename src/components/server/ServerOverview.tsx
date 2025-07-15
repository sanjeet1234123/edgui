import { Card, Stack, Table, Text } from '@mantine/core'
import { CodeHighlight } from '@mantine/code-highlight'
import type { MCPConfig, ServerCharacteristics } from '@/types/serversType'

type ServerOverviewProps = {
  characteristicsData: ServerCharacteristics
  mcpConfigData: MCPConfig
}

function ServerOverview({
  characteristicsData,
  mcpConfigData,
}: ServerOverviewProps) {
  return (
    <Stack>
      <Card>
        <div className="overflow-x-auto">
          <Table variant="vertical" layout="fixed" verticalSpacing="sm">
            <Table.Tbody>
              {Object.entries(characteristicsData).map(([key, value]) => (
                <Table.Tr key={key}>
                  <Table.Th w={220}>
                    <Text fw={500} tt="capitalize">
                      {key.replaceAll('_', ' ')}
                    </Text>
                  </Table.Th>
                  <Table.Td miw={400}>
                    <Text className="whitespace-nowrap">{value}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <Stack gap="sm">
          <Text fz="var(--size-lg)" fw={600}>
            Server Config
          </Text>
          <CodeHighlight
            radius="md"
            code={JSON.stringify(mcpConfigData, null, 4)}
            language="json"
            copyLabel="Copy MCP Config"
            copiedLabel="Copied!"
          />
        </Stack>
      </Card>
    </Stack>
  )
}

export default ServerOverview
