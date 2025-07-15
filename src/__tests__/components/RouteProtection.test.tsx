import { render, screen } from '@testing-library/react'
import {
  ProtectedRoute,
  PublicRoute,
  PrivateRoute,
} from '@/components/RouteProtection'
import * as routeProtection from '@/utils/routeProtection'

// Mock the route protection hooks
jest.mock('@/utils/routeProtection')

describe('RouteProtection Components', () => {
  const mockChildren = <div>Test Content</div>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ProtectedRoute', () => {
    it('renders children when user is authenticated', () => {
      jest.spyOn(routeProtection, 'useProtectedRoute').mockReturnValue({
        isAuthenticated: true,
      })

      render(<ProtectedRoute>{mockChildren}</ProtectedRoute>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders nothing when user is not authenticated', () => {
      jest.spyOn(routeProtection, 'useProtectedRoute').mockReturnValue({
        isAuthenticated: false,
      })

      const { container } = render(
        <ProtectedRoute>{mockChildren}</ProtectedRoute>,
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('PublicRoute', () => {
    it('renders children when user is not authenticated', () => {
      jest.spyOn(routeProtection, 'usePublicRoute').mockReturnValue({
        isAuthenticated: false,
      })

      render(<PublicRoute>{mockChildren}</PublicRoute>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders nothing when user is authenticated', () => {
      jest.spyOn(routeProtection, 'usePublicRoute').mockReturnValue({
        isAuthenticated: true,
      })

      const { container } = render(<PublicRoute>{mockChildren}</PublicRoute>)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('PrivateRoute', () => {
    const requiredStates = { step: 'completed' }

    it('renders children when required states are valid', () => {
      jest.spyOn(routeProtection, 'usePrivateRoute').mockReturnValue({
        isValid: true,
      })

      render(
        <PrivateRoute requiredStates={requiredStates}>
          {mockChildren}
        </PrivateRoute>,
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders nothing when required states are invalid', () => {
      jest.spyOn(routeProtection, 'usePrivateRoute').mockReturnValue({
        isValid: false,
      })

      const { container } = render(
        <PrivateRoute requiredStates={requiredStates}>
          {mockChildren}
        </PrivateRoute>,
      )
      expect(container).toBeEmptyDOMElement()
    })

    it('handles null requiredStates', () => {
      jest.spyOn(routeProtection, 'usePrivateRoute').mockReturnValue({
        isValid: true,
      })

      render(<PrivateRoute requiredStates={null}>{mockChildren}</PrivateRoute>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })
})
