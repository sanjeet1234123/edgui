import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button, Grid, Group, LoadingOverlay, Stack, Text } from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import ModelCard from './ModelCard'
import type { Model, UpscaleModelResponse } from '@/types/marketplaceType'
import { useUpscaleModelMutation } from '@/hooks/mutations/useMarketplaceMutations'
import { PATHS } from '@/constants/paths'
import { useModelStore } from '@/store/modelStore'

type ModelSectionProps = {
  title?: string
  seeAll: string
  models: Array<Model>
  initialCount: number
  user: boolean
}
function ModelSection({
  title,
  seeAll,
  models,
  initialCount,
  user,
}: ModelSectionProps) {
  const navigate = useNavigate()

  const { setCurrentModel, setIngressUrl, searchedModel } = useModelStore()

  const [showAll, setShowAll] = useState(false)
  const displayedModels = showAll ? models : models.slice(0, initialCount)

  const { mutate: upscaleModel, isPending: isUpscaling } =
    useUpscaleModelMutation()

  const filteredModels = displayedModels.filter(model =>
    searchedModel
      ? model.model_name
          .toLowerCase()
          .replace(' ', '')
          .includes(searchedModel.toLowerCase().replace(' ', ''))
      : true,
  )

  const handleCardClick = (model: Model) => {
    if (!user) {
      setCurrentModel(model)
      upscaleModel(
        {
          deployment_name: model.deployment_name,
        },
        {
          onSuccess: (data: UpscaleModelResponse) => {
            setIngressUrl(data.ingress_url)
            navigate({
              to: PATHS.PLAYGROUND,
              search: {
                model: model.model_name,
              },
            })
          },
        },
      )
    }
  }

  return (
    <>
      <LoadingOverlay
        visible={isUpscaling}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      >
        <Text>{isUpscaling ? 'Please wait setting up the model' : ''}</Text>
      </LoadingOverlay>

      <Stack>
        {title && (
          <Group>
            <Text fw="600" size="var(--size-2xl)" c="#4453B0">
              {title}
            </Text>
          </Group>
        )}
        <Grid gutter={{ base: 16, md: 24 }}>
          {filteredModels.length > 0 ? (
            filteredModels.map((model, index) => (
              <Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={index}>
                <ModelCard
                  model={model}
                  handleCardClick={handleCardClick}
                  user={user}
                />
              </Grid.Col>
            ))
          ) : (
            <Grid.Col span={12}>
              <Text ta="center">No models available</Text>
            </Grid.Col>
          )}
        </Grid>
        {filteredModels.length > 0 && (
          <Group justify="center">
            <Button
              fw={500}
              variant="transparent"
              onClick={() => setShowAll(!showAll)}
              c="var(--clr-marketplace-title)"
              rightSection={
                showAll ? (
                  <IconChevronUp size={20} />
                ) : (
                  <IconChevronDown size={20} />
                )
              }
            >
              {showAll ? 'Show less' : seeAll}
            </Button>
          </Group>
        )}
      </Stack>
    </>
  )
}

export default ModelSection
