import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { IconCube } from '@tabler/icons-react'
import classes from './marketplace.module.css'
import type { Model } from '@/types/marketplaceType'
import { AgentIcons } from '@/assets/agent-icons'

type ModelCardProps = {
  model: Model
  handleCardClick: (model: Model) => void
  user: boolean
}

function ModelCard({ model, handleCardClick, user }: ModelCardProps) {
  const providerKey = model.provider_base64_image.trim().toLowerCase()

  const IconComponent =
    providerKey === ''
      ? AgentIcons.user
      : AgentIcons[providerKey as keyof typeof AgentIcons]

  return (
    <Card
      classNames={{
        root: `${classes.modelCard} ${user ? classes.userCard : ''}`,
      }}
      onClick={e => {
        e.preventDefault()
        handleCardClick(model)
      }}
    >
      <Stack>
        {/* Header */}
        <Group align="flex-start" style={{ flexWrap: 'nowrap', width: '100%' }}>
          {IconComponent && <IconComponent className={classes.cardIcon} />}
          <Stack style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ minWidth: 0, width: '100%' }}>
              <Tooltip label={model.model_name} position="top-start">
                <Text classNames={{ root: classes.cardTitle }}>
                  {model.model_name}
                </Text>
              </Tooltip>
            </Box>
            <Group>
              {model.processor_type && (
                <Badge color="var(--clr-secondary)">
                  {model.processor_type}
                </Badge>
              )}
              {model.vulnerability && (
                <Badge
                  tt="capitalize"
                  color={
                    model.vulnerability.toLowerCase() === 'safe'
                      ? 'green'
                      : model.vulnerability.toLowerCase() === 'unsafe'
                        ? 'red'
                        : model.vulnerability.toLowerCase() ===
                            'use with caution'
                          ? 'yellow'
                          : 'gray'
                  }
                  variant="light"
                >
                  {model.vulnerability}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>
        {/* Description */}
        <Box
          style={{
            minHeight: '80px',
            width: '100%',
          }}
        >
          <Text lineClamp={3} classNames={{ root: classes.cardDescription }}>
            {model.description}
          </Text>
        </Box>
      </Stack>

      {/* Footer */}
      <Group justify="flex-end">
        {user ? (
          <Badge size="lg" color="var(--clr-primary)">
            {model.status}
          </Badge>
        ) : (
          <Button
            size="compact-md"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              handleCardClick(model)
            }}
            variant="transparent"
            fw={500}
            c="var(--clr-marketplace-card-playground)"
            leftSection={
              <IconCube
                size={24}
                color="var(--clr-marketplace-card-playground)"
              />
            }
          >
            Playground
          </Button>
        )}
      </Group>
    </Card>
  )
}

export default ModelCard
