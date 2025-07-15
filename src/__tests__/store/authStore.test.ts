// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import useAuthStore from '@/store/authStore'

describe('useAuthStore', () => {
  const initialAuth = {
    token: 'token123',
    tokenExpiry: '2025-12-31T23:59:59Z',
    name: 'Test User',
    role: 'admin',
    email: 'test@example.com',
    userId: 'user-1',
    workspaceId: 'ws-1',
    workspaceName: 'Workspace',
    workspaceRole: 'owner',
  }

  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear()
    useAuthStore.setState({
      token: null,
      tokenExpiry: null,
      name: null,
      role: null,
      email: null,
      userId: null,
      workspaceId: null,
      workspaceName: null,
      workspaceRole: null,
      isAuthenticated: false,
    })
  })

  it('should have initial state with all nulls and isAuthenticated false', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.tokenExpiry).toBeNull()
    expect(state.name).toBeNull()
    expect(state.role).toBeNull()
    expect(state.email).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.workspaceId).toBeNull()
    expect(state.workspaceName).toBeNull()
    expect(state.workspaceRole).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set auth and update isAuthenticated', () => {
    useAuthStore.getState().setAuth(initialAuth)
    const state = useAuthStore.getState()
    expect(state.token).toBe(initialAuth.token)
    expect(state.tokenExpiry).toBe(initialAuth.tokenExpiry)
    expect(state.name).toBe(initialAuth.name)
    expect(state.role).toBe(initialAuth.role)
    expect(state.email).toBe(initialAuth.email)
    expect(state.userId).toBe(initialAuth.userId)
    expect(state.workspaceId).toBe(initialAuth.workspaceId)
    expect(state.workspaceName).toBe(initialAuth.workspaceName)
    expect(state.workspaceRole).toBe(initialAuth.workspaceRole)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should clear auth and set all fields to null and isAuthenticated false', () => {
    useAuthStore.getState().setAuth(initialAuth)
    useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.tokenExpiry).toBeNull()
    expect(state.name).toBeNull()
    expect(state.role).toBeNull()
    expect(state.email).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.workspaceId).toBeNull()
    expect(state.workspaceName).toBeNull()
    expect(state.workspaceRole).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should persist auth state to localStorage', () => {
    useAuthStore.getState().setAuth(initialAuth)
    // Simulate reload by rehydrating from localStorage
    const persisted = JSON.parse(localStorage.getItem('auth-storage'))
    expect(persisted.state.token).toBe(initialAuth.token)
    expect(persisted.state.isAuthenticated).toBe(true)
  })

  it('should update only the provided fields in setAuth', () => {
    useAuthStore.getState().setAuth(initialAuth)
    useAuthStore.getState().setAuth({ ...initialAuth, name: 'Changed Name' })
    expect(useAuthStore.getState().name).toBe('Changed Name')
    expect(useAuthStore.getState().token).toBe(initialAuth.token)
  })
})
