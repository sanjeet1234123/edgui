import type { Model, UpscaleModelResponse } from '@/types/marketplaceType'
import { LoadingOverlay, Stack, Table, Text } from '@mantine/core'
import RenderModelsTable from './RenderModelsTable'
import { useUpscaleModelMutation } from '@/hooks/mutations/useMarketplaceMutations'
import { useNavigate } from '@tanstack/react-router'
import classes from './marketplace.module.css'
import { useModelStore } from '@/store/modelStore'
import { PATHS } from '@/constants/paths'

interface ModelSectionTableProps {
  models: Array<Model>
  user?: boolean
}

function ModelSectionTable({ models, user }: ModelSectionTableProps) {
  const navigate = useNavigate()
  const { setCurrentModel, setIngressUrl, searchedModel } = useModelStore()
  const { mutate: upscaleModel, isPending: isUpscaling } =
    useUpscaleModelMutation()

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

  const filteredModels = models.filter(model =>
    searchedModel
      ? model.model_name
          .toLowerCase()
          .replace(' ', '')
          .includes(searchedModel.toLowerCase().replace(' ', ''))
      : true,
  )

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
        <div className="h-155 overflow-x-auto overflow-y-auto">
          <Table
            highlightOnHover
            withTableBorder
            horizontalSpacing="lg"
            classNames={classes}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '120px' }}>Name</Table.Th>
                <Table.Th style={{ minWidth: '350px' }}>Description</Table.Th>
                <Table.Th>Hardware</Table.Th>
                <Table.Th style={{ minWidth: '180px' }}>Vulnerability</Table.Th>
                <Table.Th style={{ minWidth: '180px' }}>Playground</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredModels.length > 0 ? (
                filteredModels.map(model => (
                  <RenderModelsTable
                    handleCardClick={handleCardClick}
                    model={model}
                    user={user}
                  />
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4} align="center">
                    <Text size="lg" fw={500}>
                      No models found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      </Stack>
    </>
  )
}

export default ModelSectionTable
