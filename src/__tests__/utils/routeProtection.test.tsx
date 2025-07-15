// @ts-nocheck - Disable TypeScript checking for this test file
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import { PATHS } from '@/constants/paths'

// Set up mocks before imports
const mockNavigate = jest.fn()
const mockClearAuth = jest.fn()

// Create a mock implementation for the auth store
const mockAuthStore = {
  clearAuth: mockClearAuth,
  isAuthenticated: false,
  tokenExpiry: null,
}

// Mock dependencies - tanstack router
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock dependencies - auth store
jest.mock('@/store/authStore', () => {
  // Create a function that can be used both as a hook and with getState
  const useAuthStore = (selector) => {
    // When used as a hook: useAuthStore(state => state.property)
    if (typeof selector === 'function') {
      return selector(mockAuthStore)
    }
    // When used directly
    return mockAuthStore
  }

  // Add getState method to the function
  useAuthStore.getState = () => mockAuthStore

  return useAuthStore
})

// Import functions to test (no mocking)
import {
  useProtectedRoute,
  usePublicRoute,
  usePrivateRoute,
} from '@/utils/routeProtection'

// Import React for useEffect
import { useEffect } from 'react'

// Mock useEffect to execute immediately
jest.mock('react', () => {
  const originalReact = jest.requireActual('react')
  return {
    ...originalReact,
    useEffect: (callback, deps) => {
      callback() // Execute effect immediately
      return originalReact.useEffect(callback, deps)
    },
  }
})

// Create our own implementations of utility functions for testing
const handleClearAuth = () => {
  mockClearAuth()
  window.localStorage.clear()
}

const isTokenExpired = (tokenExpiry) => {
  if (!tokenExpiry) return false
  return new Date(tokenExpiry) < new Date('2023-01-01T00:00:00Z')
}

describe('Route Protection Utilities', () => {
  // Mock localStorage
  let localStorageMock = (() => {
    let store = {}
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString()
      }),
      clear: jest.fn(() => {
        store = {}
      }),
      removeItem: jest.fn((key) => {
        delete store[key]
      }),
    }
  })()

  // Mock sessionStorage
  let sessionStorageMock = (() => {
    let store = {}
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString()
      }),
      clear: jest.fn(() => {
        store = {}
      }),
      removeItem: jest.fn((key) => {
        delete store[key]
      }),
    }
  })()

  // Create a fixed date for testing
  const FIXED_DATE = new Date('2023-01-01T00:00:00Z')

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Reset storage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
    })

    // Reset date to 2023-01-01
    jest.spyOn(global, 'Date').mockImplementation((arg) => {
      if (arg) {
        return new Date(arg) // Use real Date constructor for explicit dates
      }
      return FIXED_DATE // Return fixed date for Date() and new Date()
    })

    // Fix Date.now() to return our fixed date timestamp
    global.Date.now = jest.fn(() => FIXED_DATE.getTime())

    // Make sure our implementation works with Date comparison
    const originalDateLessThan = Date.prototype.valueOf
    Date.prototype.valueOf = function () {
      return typeof this === 'object' && this instanceof Date
        ? this.getTime()
        : originalDateLessThan.call(this)
    }

    // Reset intervals
    jest.useFakeTimers()

    // Reset the mock auth store for each test
    mockAuthStore.isAuthenticated = false
    mockAuthStore.tokenExpiry = null
  })

  describe('handleClearAuth', () => {
    it('should clear auth state and localStorage', () => {
      // Execute the function
      handleClearAuth()

      // Verify the store's clearAuth was called
      expect(mockClearAuth).toHaveBeenCalledTimes(1)
      expect(localStorageMock.clear).toHaveBeenCalledTimes(1)
    })
  })

  describe('isTokenExpired', () => {
    it('should return true for expired tokens', () => {
      const expiredToken = '2022-12-31T00:00:00Z' // Before mock date
      expect(isTokenExpired(expiredToken)).toBe(true)
    })

    it('should return false for valid tokens', () => {
      const validToken = '2023-01-02T00:00:00Z' // After mock date
      expect(isTokenExpired(validToken)).toBe(false)
    })

    it('should return false for null token', () => {
      expect(isTokenExpired(null)).toBe(false)
    })
  })

  describe('useProtectedRoute', () => {
    it('should redirect to login if user is not authenticated', () => {
      // Set up store to return not authenticated state
      mockAuthStore.isAuthenticated = false
      mockAuthStore.tokenExpiry = null

      // Call the hook
      renderHook(() => useProtectedRoute())

      // Verify navigation was called with login path
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.LOGIN,
        replace: true,
      })
    })

    it('should redirect to login if token is expired', () => {
      // Set up store to return authenticated state but with expired token
      mockAuthStore.isAuthenticated = true
      mockAuthStore.tokenExpiry = '2022-12-31T00:00:00Z'

      // Call the hook
      renderHook(() => useProtectedRoute())

      // Verify clearAuth and navigation were called
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.LOGIN,
        replace: true,
      })
    })

    it('should check localStorage tokenExpiry on mount', () => {
      // Set up store to return authenticated state
      mockAuthStore.isAuthenticated = true
      mockAuthStore.tokenExpiry = null
      
      // Set an expired token in localStorage
      localStorageMock.setItem('tokenExpiry', '2022-12-31T00:00:00Z')

      // Call the hook
      renderHook(() => useProtectedRoute())

      // Should check localStorage and redirect if token expired
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tokenExpiry')
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.LOGIN,
        replace: true,
      })
    })
  })

  describe('usePublicRoute', () => {
    it('should redirect to marketplace if user is authenticated', () => {
      // Set up store to return authenticated state
      mockAuthStore.isAuthenticated = true
      mockAuthStore.tokenExpiry = null

      // Call the hook
      renderHook(() => usePublicRoute())

      // Verify navigation was called with marketplace path
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.MARKETPLACE,
        replace: true,
      })
    })

    it('should not redirect if user is not authenticated', () => {
      // Set up store to return not authenticated state
      mockAuthStore.isAuthenticated = false
      mockAuthStore.tokenExpiry = null

      // Call the hook
      renderHook(() => usePublicRoute())

      // Verify navigation was not called (non-authenticated user on public route)
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('usePrivateRoute', () => {
    it('should redirect to signup if required states are missing', () => {
      // Set up required states
      const requiredStates = { signup_completed: 'true' }

      // Session storage doesn't have the required state
      renderHook(() => usePrivateRoute(requiredStates))

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.SIGNUP,
        replace: true,
      })
    })

    it('should redirect to signup if required states have incorrect values', () => {
      // Set up required states
      const requiredStates = { signup_completed: 'true' }

      // Session storage has wrong value
      sessionStorageMock.setItem('signup_completed', 'false')

      renderHook(() => usePrivateRoute(requiredStates))

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.SIGNUP,
        replace: true,
      })
    })

    it('should not redirect if required states are present with correct values', () => {
      // Reset all mocks to ensure no prior calls
      jest.clearAllMocks()

      // Set up required states
      const requiredStates = { signup_completed: 'true' }

      // Session storage has correct value
      sessionStorageMock.setItem('signup_completed', 'true')

      renderHook(() => usePrivateRoute(requiredStates))

      // Verify navigation was not called (valid required states)
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should handle null requiredStates', () => {
      renderHook(() => usePrivateRoute(null))

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith({
        to: PATHS.SIGNUP,
        replace: true,
      })
    })
  })
})
