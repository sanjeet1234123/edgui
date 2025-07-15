import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@mantine/core'
import {
  AccountSettingsHeader,
  AccountSettingsBody,
  AccountSettingsFallback,
} from '@/components/accountSettings/index'
import { ComponentError } from '@/components/ui'
import { prefetchUserDetails } from '@/hooks/queries/useUserDetailsQueries'

export const Route = createFileRoute('/_app/settings')({
  loader: ({ context }) => {
    const { queryClient } = context
    // Prefetch user details initially
    queryClient.prefetchQuery(prefetchUserDetails())
  },
  component: RouteComponent,
  pendingComponent: () => <AccountSettingsFallback />,
  errorComponent: error => <ComponentError error={error} />,
})

function RouteComponent() {
  return (
    <Stack className="flex-grow overflow-hidden">
      <AccountSettingsHeader pageTitle="Account Settings" />
      <AccountSettingsBody />
    </Stack>
  )
}
