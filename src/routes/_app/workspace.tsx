import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import {
  WorkspaceBody,
  WorkspaceHeader,
  WorkspaceSkeleton,
} from '@/components/workspace'
import ComponentError from '@/components/ui/componentError'
import { prefetchWorkspaceMembers } from '@/hooks/queries/useWorkspaceQueries'
import { useRoleStore } from '@/store/roleStore'

export const Route = createFileRoute('/_app/workspace')({
  loader: ({ context }) => {
    const { queryClient } = context
    queryClient.prefetchQuery(prefetchWorkspaceMembers)
    return { pageTitle: 'Workspace' }
  },
  component: RouteComponent,
  pendingComponent: () => <WorkspaceSkeleton />,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { checkRoles } = useRoleStore()

  useEffect(() => {
    checkRoles()
  }, [])

  return (
    <Stack className="flex-grow">
      <WorkspaceHeader pageTitle="Workspace" />
      <WorkspaceBody />
    </Stack>
  )
}
