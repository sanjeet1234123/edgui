import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import { ComponentError } from '@/components/ui'
import {
  AddClusterCards,
  AddClusterFallback,
  AddClusterHeader,
} from '@/components/addCluster'

export const Route = createFileRoute('/_app/add-cluster')({
  component: RouteComponent,
  pendingComponent: () => <AddClusterFallback />,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  return (
    <Stack className="flex-grow">
      <AddClusterHeader />
      <AddClusterCards />
    </Stack>
  )
}
