import type { ReactNode } from 'react'
import {
  useProtectedRoute,
  usePublicRoute,
  usePrivateRoute,
} from '@/utils/routeProtection'

interface RouteProps {
  children: ReactNode
}

interface PrivateRouteProps extends RouteProps {
  requiredStates: Record<string, any> | null
}

/**
 * ProtectedRoute - Only allows authenticated users to access the route
 * Redirects to login if not authenticated or if token is expired
 */
export const ProtectedRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useProtectedRoute()

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * PublicRoute - Only allows unauthenticated users to access the route
 * Redirects to marketplace if already authenticated
 */
export const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = usePublicRoute()

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * PrivateRoute - Checks for specific session data before allowing access
 * Used for multi-step flows where certain data must be present
 * Redirects to signup if required session data is missing
 */
export const PrivateRoute = ({
  children,
  requiredStates,
}: PrivateRouteProps) => {
  const { isValid } = usePrivateRoute(requiredStates)

  if (!isValid) {
    return null
  }

  return <>{children}</>
}
