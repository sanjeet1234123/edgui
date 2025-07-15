import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { z } from 'zod'
import type { Model } from '@/types/marketplaceType'
import {
  prefetchModels,
  useModelsQuery,
} from '@/hooks/queries/useMarketplaceQueries'
import {
  MarketplaceHeader,
  ModelFallback,
  ModelSection,
  MarketplaceFilters,
  ModelSectionTable,
} from '@/components/marketplace/index'
import { ComponentError } from '@/components/ui'
import { useModelStore } from '@/store/modelStore'
import { useEffect, useState } from 'react'

const MarketplaceSearchParams = z.object({
  upload: z.string().optional(),
})

type MarketplaceSearchParams = z.infer<typeof MarketplaceSearchParams>

export const Route = createFileRoute('/_app/marketplace')({
  loader: ({ context }) => {
    const { queryClient } = context
    // Prefetch the default 'all' category initially
    queryClient.prefetchQuery(prefetchModels(''))
    return { pageTitle: 'Model Marketplace' }
  },
  component: MarketplacePage,
  pendingComponent: () => <ModelFallback />,
  errorComponent: error => <ComponentError error={error} />,
  validateSearch: search => MarketplaceSearchParams.parse(search),
})

function MarketplacePage() {
  const { pageTitle } = Route.useLoaderData()

  const isMobile = useMediaQuery('(max-width: 36em)')
  const isTablet = useMediaQuery('(max-width: 48em)')

  const { filters, viewMode, selectedModelCategory } = useModelStore()

  const { data: marketplaceModels } = useModelsQuery(selectedModelCategory)
  const [filteredModels, setFilteredModels] = useState<Array<Model>>([])

  const getInitialCount = () => {
    if (isMobile) return 1
    if (isTablet) return 2
    return 3
  }

  useEffect(() => {
    let filterModels: Array<Model> = []
    if (marketplaceModels?.models) {
      if (filters) {
        // Apply filters when they exist
        filterModels = marketplaceModels.models.filter((model: Model) => {
          if (
            filters.safety &&
            model.vulnerability.toLowerCase() !== filters.safety
          )
            return false
          if (
            filters.hardware &&
            model.processor_type.toLowerCase() !== filters.hardware
          )
            return false
          return true
        })
      } else {
        // Show all models when no filters are applied
        filterModels = marketplaceModels.models
      }
    }
    setFilteredModels(filterModels)
  }, [marketplaceModels, filters])

  const models = {
    all: filteredModels?.filter((model: Model) => !model.trending),
    user: filteredModels?.filter((model: Model) => model.trending),
  }

  return (
    <Stack gap={24}>
      <MarketplaceHeader pageTitle={pageTitle} />
      <MarketplaceFilters />
      <Stack>
        {viewMode === 'grid' ? (
          <>
            <ModelSection
              title="Models"
              seeAll="See all models"
              models={models.all}
              initialCount={3 * getInitialCount()}
              user={false}
            />
            {models.user.length > 0 && (
              <ModelSection
                title="Yours Models"
                seeAll="See all yours models"
                models={models.user}
                initialCount={getInitialCount()}
                user={true}
              />
            )}
          </>
        ) : (
          <>
            <ModelSectionTable models={models.all} user={false} />
            {models.user.length > 0 && (
              <ModelSectionTable models={models.user} user={true} />
            )}
          </>
        )}
      </Stack>
    </Stack>
  )
}
