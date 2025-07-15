import { AgentIcons } from '@/assets/agent-icons'
import type { Model } from '@/types/marketplaceType'
import { Badge, Box, Button, Group, Table, Text } from '@mantine/core'
import { IconCube } from '@tabler/icons-react'

interface RenderTableModelsProps {
  model: Model
  user?: boolean
  handleCardClick: (model: Model) => void
}

export function RenderModelsTable({
  model,
  handleCardClick,
  user,
}: RenderTableModelsProps) {
  const providerKey = model.provider_base64_image.trim().toLowerCase()

  const IconComponent =
    providerKey === ''
      ? AgentIcons.user
      : AgentIcons[providerKey as keyof typeof AgentIcons]

  return (
    <Table.Tr key={model.model_id}>
      {/* Logo and Name */}
      <Table.Td>
        <Group wrap="nowrap">
          <IconComponent width="22px" height="22px"/>
          <Text
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {model.model_name}
          </Text>
        </Group>
      </Table.Td>
      {/* Description */}
      <Table.Td>
        <Box
          style={{
            minHeight: '60px',
            width: '100%',
            textAlign: 'justify',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Text lineClamp={3}>{model.description}</Text>
        </Box>
      </Table.Td>
      {/* Hardware */}
      <Table.Td>
        {model.processor_type ? (
          <Badge color="var(--clr-secondary)">{model.processor_type}</Badge>
        ) : (
          <Text>N/A</Text>
        )}
      </Table.Td>
      {/* Vulnerability */}
      <Table.Td>
        {model.vulnerability ? (
          <Badge
            tt="capitalize"
            color={
              model.vulnerability.toLowerCase() === 'safe'
                ? 'green'
                : model.vulnerability.toLowerCase() === 'unsafe'
                  ? 'red'
                  : model.vulnerability.toLowerCase() === 'use with caution'
                    ? 'yellow'
                    : 'gray'
            }
            variant="light"
          >
            {model.vulnerability}
          </Badge>
        ) : (
          <Text>N/A</Text>
        )}
      </Table.Td>
      {/* Go to Playground */}
      <Table.Td>
        <Button
          rightSection={<IconCube />}
          variant="transparent"
          size="xs"
          p={0}
          color="var(--clr-marketplace-card-playground)"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            handleCardClick(model)
          }}
        >
          Playground
        </Button>
      </Table.Td>
    </Table.Tr>
  )
}

export default RenderModelsTable
