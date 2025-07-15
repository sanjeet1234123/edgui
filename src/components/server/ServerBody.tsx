import { useState } from 'react'
import { Center, Grid, SegmentedControl, Stack } from '@mantine/core'
import { IconFileText, IconInfoCircle } from '@tabler/icons-react'
import ServerOverview from './ServerOverview'
import ServerContent from './ServerContent'
import ServerTools from './ServerTools'
import type { Server } from '@/types/serversType'
import classes from './server.module.css'

type ServerBodyProps = {
  server: Server
}

function ServerBody({ server }: ServerBodyProps) {
  const [activeTab, setActiveTab] = useState<string>('overview')

  const serverName = server?.name
  const serverId = server?.id.toString()
  const characteristicsData = server?.characteristics
  const mcpConfigData = server?.mcp_config
  const toolsData = server?.tools

  return (
    <Grid gutter="xl">
      {/* Overview and Content */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="lg">
          <SegmentedControl
            color="var(--clr-primary)"
            value={activeTab}
            onChange={setActiveTab}
            withItemsBorders={false}
            size="md"
            radius="md"
            data={[
              {
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconInfoCircle size={20} />
                    <span>Overview</span>
                  </Center>
                ),
                value: 'overview',
              },
              {
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconFileText size={20} />
                    <span>Content</span>
                  </Center>
                ),
                value: 'content',
              },
            ]}
            classNames={{ root: classes.segmentedControl }}
          />
          {activeTab === 'overview' && characteristicsData && mcpConfigData && (
            <ServerOverview
              characteristicsData={characteristicsData}
              mcpConfigData={mcpConfigData}
            />
          )}
          {activeTab === 'content' && serverId && (
            <ServerContent serverId={serverId} />
          )}
        </Stack>
      </Grid.Col>

      {/* Tools */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        {toolsData && serverName && (
          <ServerTools toolsData={toolsData} serverName={serverName} />
        )}
      </Grid.Col>
    </Grid>
  )
}

export default ServerBody
