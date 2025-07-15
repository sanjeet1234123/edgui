// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { useRoleStore } from '@/store/roleStore'

describe('useRoleStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useRoleStore.setState({ isAdmin: false, isOwner: false, isUser: false })
  })

  it('should have initial state as all false', () => {
    const state = useRoleStore.getState()
    expect(state.isAdmin).toBe(false)
    expect(state.isOwner).toBe(false)
    expect(state.isUser).toBe(false)
  })

  it('should set isAdmin true when workspace_role is admin', () => {
    localStorage.setItem('workspace_role', 'admin')
    useRoleStore.getState().checkRoles()
    const state = useRoleStore.getState()
    expect(state.isAdmin).toBe(true)
    expect(state.isOwner).toBe(false)
    expect(state.isUser).toBe(false)
  })

  it('should set isOwner true when workspace_role is owner', () => {
    localStorage.setItem('workspace_role', 'owner')
    useRoleStore.getState().checkRoles()
    const state = useRoleStore.getState()
    expect(state.isAdmin).toBe(false)
    expect(state.isOwner).toBe(true)
    expect(state.isUser).toBe(false)
  })

  it('should set isUser true when workspace_role is user', () => {
    localStorage.setItem('workspace_role', 'user')
    useRoleStore.getState().checkRoles()
    const state = useRoleStore.getState()
    expect(state.isAdmin).toBe(false)
    expect(state.isOwner).toBe(false)
    expect(state.isUser).toBe(true)
  })

  it('should set all false for unknown or missing workspace_role', () => {
    localStorage.setItem('workspace_role', 'guest')
    useRoleStore.getState().checkRoles()
    let state = useRoleStore.getState()
    expect(state.isAdmin).toBe(false)
    expect(state.isOwner).toBe(false)
    expect(state.isUser).toBe(false)

    localStorage.removeItem('workspace_role')
    useRoleStore.getState().checkRoles()
    state = useRoleStore.getState()
    expect(state.isAdmin).toBe(false)
    expect(state.isOwner).toBe(false)
    expect(state.isUser).toBe(false)
  })
})
