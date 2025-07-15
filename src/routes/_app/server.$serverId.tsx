import { createFileRoute } from '@tanstack/react-router'
import { Center, Loader, Stack } from '@mantine/core'
import { useGetServerQuery } from '@/hooks/queries/useServerQueries'
import { ComponentError } from '@/components/ui'
import { ServerBody, ServerHeader } from '@/components/server'
import type { Server } from '@/types/serversType'

export const Route = createFileRoute('/_app/server/$serverId')({
  component: RouteComponent,
  errorComponent: (error) => <ComponentError error={error} />,
})

function RouteComponent() {
  const { serverId } = Route.useParams()

  const { data, isLoading } = useGetServerQuery(serverId)

 
  const server = data?.data?.filter((v:Server)=>{
    return v.name.toLowerCase() === serverId.toLowerCase()
  })

  console.log('Server data:', server)

  if (isLoading) {
    return (
      <Center className="flex-grow">
        <Loader />
      </Center>
    )
  }

  return (
    <Stack className="flex-grow">
      <ServerHeader server={server[0]} />
      <ServerBody server={server[0]} />
    </Stack>
  )
}
