import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/accounts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/accounts"!</div>
}
