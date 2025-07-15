import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import {
  prefetchClusters,
  useClustersQuery,
} from '@/hooks/queries/useClustersQueries'
import { ComponentError } from '@/components/ui'
import {
  ClustersFallback,
  ClustersHeader,
  ClustersList,
} from '@/components/clusters'

export const Route = createFileRoute('/_app/clusters')({
  loader: ({ context }) => {
    const { queryClient } = context
    queryClient.prefetchQuery(prefetchClusters)
    return { pageTitle: 'Kubernetes Clusters' }
  },
  component: RouteComponent,
  pendingComponent: () => <ClustersFallback />,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { pageTitle } = Route.useLoaderData()
  const { data: clusters } = useClustersQuery()

  return (
    <Stack className="flex-grow">
      <ClustersHeader pageTitle={pageTitle} />
      <ClustersList clusters={clusters} />
    </Stack>
  )
}
