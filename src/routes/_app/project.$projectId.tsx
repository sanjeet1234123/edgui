import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import {
  prefetchProject,
  prefetchProjectActivities,
  prefetchProjectMembers,
} from '@/hooks/queries/useProjectQueries'
import { ComponentError } from '@/components/ui'
import { useRoleStore } from '@/store/roleStore'
import { ProjectBody, ProjectHeader } from '@/components/project/index'

export const Route = createFileRoute('/_app/project/$projectId')({
  loader: ({ context, params }) => {
    const { queryClient } = context
    queryClient.prefetchQuery(prefetchProject(params.projectId))
    queryClient.prefetchQuery(prefetchProjectActivities(params.projectId))
    queryClient.prefetchQuery(prefetchProjectMembers(params.projectId))
    return { pageTitle: 'Project' }
  },
  component: RouteComponent,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { pageTitle } = Route.useLoaderData()
  const { projectId } = Route.useParams()

  const { checkRoles } = useRoleStore()

  useEffect(() => {
    checkRoles()
  }, [checkRoles])

  return (
    <Stack className="flex-grow">
      <ProjectHeader title={pageTitle} projectId={projectId} />
      <ProjectBody />
    </Stack>
  )
}
