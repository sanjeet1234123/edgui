import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import {
  prefetchDeployments,
  useDeploymentsQuery,
} from '@/hooks/queries/useDeploymentsQueries'
import { ComponentError } from '@/components/ui'
import {
  DeploymentsFallback,
  DeploymentsHeader,
  DeploymentsList,
} from '@/components/deployments'

export const Route = createFileRoute('/_app/deployments')({
  loader: ({ context }) => {
    const { queryClient } = context
    queryClient.prefetchQuery(prefetchDeployments)
    return { pageTitle: 'Deployments' }
  },
  component: RouteComponent,
  pendingComponent: () => <DeploymentsFallback />,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { pageTitle } = Route.useLoaderData()

  const { data: deployments } = useDeploymentsQuery()

  return (
    <Stack className="flex-grow">
      <DeploymentsHeader pageTitle={pageTitle} />
      <DeploymentsList deployments={deployments} />
    </Stack>
  )
}
