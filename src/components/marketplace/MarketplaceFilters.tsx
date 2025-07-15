import { Button, Group, Stack } from '@mantine/core'
import classes from './marketplace.module.css'
import MarketplaceSearch from './MarketplaceSearch'
import { useModelStore } from '@/store/modelStore'
import { prefetchModels } from '@/hooks/queries/useMarketplaceQueries'
import { useQueryClient } from '@tanstack/react-query'

function MarketplaceFilters() {
  const { selectedModelCategory, setSelectedModelCategory } = useModelStore()
  const queryClient = useQueryClient()

  const modelTypes = [
    { label: 'All', value: '' },
    { label: 'LLM', value: 'llm' },
    { label: 'LCM', value: 'lcm' },
    { label: 'LAM', value: 'lam' },
    { label: 'MoE', value: 'moe' },
    { label: 'VLM', value: 'vlm' },
    { label: 'SLM', value: 'slm' },
    { label: 'MLM', value: 'mlm' },
    { label: 'SAM', value: 'sam' },
  ]

  const handleSelectModelCategory = (category: string) => {
    setSelectedModelCategory(category)
    // Properly prefetch using query client
    queryClient.prefetchQuery(prefetchModels(category))
  }

  return (
    <>
      <Stack gap={24}>
        {/* Model type toggle buttons */}
        <Group justify="space-evenly">
          {modelTypes.map(type => (
            <Button
              className={`${classes.toggleButtons} ${
                selectedModelCategory === type.value
                  ? classes.selectedButton
                  : classes.unselectedButton
              }`}
              key={type.value}
              onClick={() => handleSelectModelCategory(type.value)}
              size="sm"
              radius="md"
              classNames={{
                label: classes.buttonLabel,
              }}
            >
              {type.label}
            </Button>
          ))}
        </Group>
        {/* Search and filters */}
        <MarketplaceSearch />
      </Stack>
    </>
  )
}

export default MarketplaceFilters
