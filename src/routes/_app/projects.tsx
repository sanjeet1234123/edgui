import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import { ComponentError } from '@/components/ui'
import {
  ProjectsBody,
  ProjectsFallback,
  ProjectsHeader,
} from '@/components/projects/index'
import {
  prefetchProjects,
  useGetProjectsQuery,
} from '@/hooks/queries/useProjectsQueries'
import { useRoleStore } from '@/store/roleStore'

export const Route = createFileRoute('/_app/projects')({
  loader: ({ context }) => {
    const { queryClient } = context
    queryClient.prefetchQuery(prefetchProjects)
    return { pageTitle: 'Projects' }
  },
  component: RouteComponent,
  pendingComponent: () => <ProjectsFallback />,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { pageTitle } = Route.useLoaderData()
  const { checkRoles } = useRoleStore()

  useEffect(() => {
    checkRoles()
  }, [checkRoles])

  const { data: projects } = useGetProjectsQuery()

  return (
    <Stack className="flex-grow">
      <ProjectsHeader pageTitle={pageTitle} />
      <ProjectsBody data={projects} />
    </Stack>
  )
}
