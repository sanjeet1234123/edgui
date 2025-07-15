import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import { PATHS } from '@/constants/paths'

// Function to clear auth data
export const handleClearAuth = () => {
  // Clear Zustand store
  useAuthStore.getState().clearAuth()
  // Clear localStorage items
  localStorage.clear()
}

// Check if token is expired
export const isTokenExpired = (tokenExpiry: string | null) => {
  return tokenExpiry && new Date(tokenExpiry) < new Date()
}

// Custom hook for protected routes
export const useProtectedRoute = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const tokenExpiry = useAuthStore((state) => state.tokenExpiry)

  useEffect(() => {
    // Check if token is expired
    if (isTokenExpired(tokenExpiry)) {
      handleClearAuth()
      navigate({ to: PATHS.LOGIN, replace: true })
      return
    }

    // Regular authentication check
    if (!isAuthenticated) {
      navigate({ to: PATHS.LOGIN, replace: true })
    }
  }, [isAuthenticated, tokenExpiry, navigate])

  // Check token expiration on mount and periodically
  useEffect(() => {
    const checkTokenExpiry = () => {
      const currentTokenExpiry = localStorage.getItem('tokenExpiry')
      if (isTokenExpired(currentTokenExpiry)) {
        handleClearAuth()
        navigate({ to: PATHS.LOGIN, replace: true })
      }
    }

    // Check immediately
    checkTokenExpiry()

    // Set up interval to check periodically (every minute)
    const intervalId = setInterval(checkTokenExpiry, 60 * 1000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [navigate])

  return { isAuthenticated }
}

// Custom hook for public routes
export const usePublicRoute = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: PATHS.MARKETPLACE, replace: true })
    }
  }, [isAuthenticated, navigate])

  return { isAuthenticated }
}

// Custom hook for private routes that need specific session data
export const usePrivateRoute = (requiredStates: Record<string, any> | null) => {
  const navigate = useNavigate()

  const checkRequiredStates = () => {
    try {
      if (!requiredStates || typeof requiredStates !== 'object') {
        return false
      }

      for (const [key, value] of Object.entries(requiredStates)) {
        const storedValue = sessionStorage.getItem(key)
        if (
          !storedValue ||
          (value !== null && storedValue !== value.toString())
        ) {
          console.warn(`Missing or invalid required state: ${key}`)
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Error checking required states:', error)
      return false
    }
  }

  useEffect(() => {
    if (!requiredStates || typeof requiredStates !== 'object') {
      console.error('PrivateRoute: requiredStates must be an object')
      navigate({ to: PATHS.SIGNUP, replace: true })
      return
    }

    const isValid = checkRequiredStates()
    if (!isValid) {
      navigate({ to: PATHS.SIGNUP, replace: true })
    }
  }, [navigate, requiredStates])

  return { isValid: checkRequiredStates() }
}
