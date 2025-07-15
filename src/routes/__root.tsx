import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
// import LogRocket from 'logrocket'
import TanstackQueryLayout from '../integrations/tanstack-query/layout'
import type { QueryClient } from '@tanstack/react-query'
import { FullPageError, FullPageLoader, NotFound } from '@/components/ui'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: (error) => <FullPageError error={error} />,
  notFoundComponent: () => <NotFound />,
})

function Root() {
  useTokenRefresh()
  // LogRocket.init('0bdkjy/demoproject')

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <TanstackQueryLayout />
    </>
  )
}
