import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PATHS } from '@/constants/paths'
import ComponentError from '@/components/ui/componentError'
import ModelPlayground from '@/components/playground/modelPlayground'
import ServerPlayground from '@/components/playground/serverPlayground'

export const Route = createFileRoute('/_app/playground')({
  component: RouteComponent,
  errorComponent: error => <ComponentError error={error} />,
  validateSearch: search => ({
    model: search.model as string | undefined,
    server: search.server as string | undefined,
  }),
})

function RouteComponent() {
  const { server, model } = Route.useSearch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!model && !server) {
      navigate({ to: PATHS.MARKETPLACE })
    }
  }, [model, server, navigate])

  // prevent rendering if no model or server is provided
  if (!model && !server) return null

  if (model) {
    return <ModelPlayground />
  }

  if (server) {
    return <ServerPlayground server={server} />
  }

  return null
}
