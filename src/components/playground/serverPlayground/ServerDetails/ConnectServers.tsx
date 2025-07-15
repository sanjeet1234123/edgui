import { Card, Group, Stack, Text } from '@mantine/core'
import { FilePen } from 'lucide-react'
import classes from './serverDetails.module.css'
import { useMantineColorScheme } from '@mantine/core'

import type { ServerConfig } from '@/types/serversType'

import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'

type ConnectServersProps = {
  serverConfig: ServerConfig
  key: string
  serverName: string
  configValue: string
  onConfigChange: (serverName: string, value: string) => void
}

function ConnectServers({
  serverConfig,
  key,
  serverName,
  configValue,
  onConfigChange,
}: ConnectServersProps) {
  const { colorScheme } = useMantineColorScheme()

  // Generate initial form values with empty strings for each env key
  const initialEnv: Record<string, string> = {}
  if (serverConfig.env) {
    Object.keys(serverConfig.env).forEach(sKey => {
      initialEnv[sKey] = ''
    })
  }

  return (
    <Stack key={key} data-testid="connect-servers">
      <Group gap="sm">
        <FilePen size={30} strokeWidth={2} />
        <Text className={classes.Heading}>Edit Configuration</Text>
      </Group>
      <Card>
        <Stack>
          <CodeMirror
            theme={colorScheme === 'light' ? githubLight : githubDark}
            value={configValue}
            height="300px"
            placeholder="Please enter the server configuration in JSON format"
            extensions={[json()]}
            onChange={(value: string) => {
              onConfigChange(serverName, value)
            }}
          />
        </Stack>
      </Card>
    </Stack>
  )
}

export default ConnectServers
