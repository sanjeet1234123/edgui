import { create } from 'zustand'

interface RoleState {
  isAdmin: boolean
  isOwner: boolean
  isUser: boolean
  checkRoles: () => void
}

export const useRoleStore = create<RoleState>((set) => ({
  isAdmin: false,
  isOwner: false,
  isUser: false,
  checkRoles: () => {
    const workspaceMemberRole =
      localStorage?.getItem('workspace_role')?.toLowerCase() || ''

    set({
      isAdmin: workspaceMemberRole === 'admin',
      isOwner: workspaceMemberRole === 'owner',
      isUser: workspaceMemberRole === 'user',
    })
  },
}))
