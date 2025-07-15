import { useNavigate } from '@tanstack/react-router'
import {
  Accordion,
  Button,
  Center,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconArrowUpRight, IconTools } from '@tabler/icons-react'
import classes from './server.module.css'
import type { ServerTool } from '@/types/serversType'
import { PATHS } from '@/constants/paths'
import { removeBackticks } from '@/utils/commonFunction'

type ServerToolsProps = {
  toolsData: Array<ServerTool>
  serverName: string
}

function ServerTools({ toolsData, serverName }: ServerToolsProps) {
  const navigate = useNavigate()

  const handleTryInPlayground = () => {
    navigate({ to: PATHS.PLAYGROUND, search: { server: serverName } })
  }

  return (
    <Stack gap="xl">
      <Group gap="xs">
        <IconTools size={24} />
        <Title order={3} fz="var(--size-2xl)">
          Tools
        </Title>
      </Group>

      <Accordion
        variant="separated"
        radius="lg"
        classNames={{
          item: classes.accordionItem,
        }}
      >
        {toolsData.map((item, index) => (
          <Accordion.Item value={item.tool} key={index}>
            <Accordion.Control>
              <Text fz="var(--size-lg)" fw={500}>
                {removeBackticks(item.tool)}
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xl">
                {/* Description */}
                <Text
                  fz="var(--size-sm)"
                  fw={400}
                  c="var(--clr-server-details-accordion-description)"
                >
                  {removeBackticks(item.description)}
                </Text>

                {/* Parameters Input Fields */}
                <Stack>
                  {item.parameters.length > 0 ? (
                    item.parameters.map((parameter, i) => (
                      <TextInput
                        key={i}
                        size="md"
                        label={removeBackticks(parameter.name)}
                        placeholder={`Enter ${removeBackticks(parameter.name)}${parameter.optional ? ' (optional)' : ''}`}
                        required={!parameter.optional}
                      />
                    ))
                  ) : (
                    <Center>
                      <Text
                        fz="var(--size-sm)"
                        fw={400}
                        c="var(--clr-server-details-no-parameters)"
                      >
                        No parameters available
                      </Text>
                    </Center>
                  )}
                </Stack>

                {/* Try in Playground Button */}
                <Group>
                  <Button
                    size="md"
                    rightSection={<IconArrowUpRight size={20} />}
                    onClick={handleTryInPlayground}
                  >
                    Try in Playground
                  </Button>
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  )
}

export default ServerTools
