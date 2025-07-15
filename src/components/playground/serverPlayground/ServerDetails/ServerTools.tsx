import { Accordion, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconTools } from '@tabler/icons-react'
import classes from './serverDetails.module.css'
import type { Server } from '@/types/serversType'
import { removeBackticks } from '@/utils/commonFunction'

type ServerToolsProps = {
  server: Server
}

function ServerTools({ server }: ServerToolsProps) {
  if (!server || !Array.isArray(server.tools) || server.tools.length === 0) {
    return null // or a fallback UI if you prefer
  }

  const renderParameterSection = (
    title: string,
    params: Array<any>,
    isRequired: boolean = false,
  ) => {
    if (params.length === 0) return null

    return (
      <Stack gap="xs">
        <Text fz="var(--size-base)" fw={500}>
          {title}{' '}
          {isRequired && (
            <span style={{ color: 'var(--clr-notification-error)' }}>*</span>
          )}
        </Text>
        <Stack gap={4} w="fit-content">
          {params.map(({ name, description }, i) => (
            <Tooltip label={description || 'No description available'}>
              <Text key={i} fz="var(--size-sm)" c="gray.6">
                {removeBackticks(name)}
              </Text>
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    )
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
        defaultValue={server.tools[0].tool}
        classNames={{
          item: classes.accordionItem,
        }}
      >
        {server.tools.map(({ tool, description, parameters }, index) => {
          const requiredParams = parameters.filter(param => !param.optional)
          const optionalParams = parameters.filter(param => param.optional)

          return (
            <Accordion.Item value={tool} key={index}>
              <Accordion.Control>
                <Text fz="var(--size-lg)" fw={500}>
                  {removeBackticks(tool)}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text fz="var(--size-sm)" fw={400} mb="md">
                  {removeBackticks(description)}
                </Text>

                {parameters.length > 0 ? (
                  <Stack>
                    {renderParameterSection(
                      'Required fields',
                      requiredParams,
                      true,
                    )}
                    {renderParameterSection('Optional fields', optionalParams)}
                  </Stack>
                ) : (
                  <Text fz="var(--size-sm)" fw={400}>
                    No parameters available
                  </Text>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </Stack>
  )
}

export default ServerTools
