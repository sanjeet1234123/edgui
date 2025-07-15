import { createFileRoute } from '@tanstack/react-router'
import { useMantineColorScheme } from '@mantine/core'
import { FullPageError, FullPageLoader } from '@/components/ui'
import { PrivateRoute } from '@/components/RouteProtection'
import ContainerWithTopBar from '@/components/containerWithTopBar/ContainerWithTopBar'
import {
  PlatformSetupHeader,
  PlatformSetupStepper,
} from '@/components/platformSetup'

// Define the route for the platform setup page
export const Route = createFileRoute('/platform-setup')({
  component: PrivateRouteWrapper,
  pendingComponent: () => <FullPageLoader />,
  errorComponent: (error) => <FullPageError error={error} />,
})

// Wrapper component that applies route protection
function PrivateRouteWrapper() {
  // Example: Requiring that 'verified_email' and 'signup_completed' exist in session storage
  const requiredStates = {
    verified_email: 'true',
    signup_completed: 'true',
  }

  return (
    <PrivateRoute requiredStates={requiredStates}>
      <PlatformSetupComponent />
    </PrivateRoute>
  )
}

function PlatformSetupComponent() {
  const { colorScheme } = useMantineColorScheme()

  return (
    <ContainerWithTopBar>
      <div
        className="h-full w-full flex flex-col gap-12 p-8 overflow-y-auto md:px-12 md:py-8"
        style={{
          backgroundColor:
            colorScheme === 'dark'
              ? 'var(--mantine-color-dark-8)'
              : 'var(--mantine-color-white)',
        }}
      >
        <PlatformSetupHeader />
        <PlatformSetupStepper />
      </div>
    </ContainerWithTopBar>
  )
}
