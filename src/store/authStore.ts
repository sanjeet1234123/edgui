import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type AuthState = {
  token: string | null
  tokenExpiry: string | null
  name: string | null
  role: string | null
  email: string | null
  userId: string | null
  workspaceId: string | null
  workspaceName: string | null
  workspaceRole: string | null
  isAuthenticated: boolean
  phone: string | null
}

type AuthActions = {
  setAuth: (data: Omit<AuthState, 'isAuthenticated'>) => void
  clearAuth: () => void
}

// Combine the state and actions
type AuthStore = AuthState & AuthActions

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: localStorage.getItem('token') || null,
      tokenExpiry: localStorage.getItem('tokenExpiry') || null,
      name: localStorage.getItem('name') || null,
      role: localStorage.getItem('role') || null,
      email: localStorage.getItem('email') || null,
      userId: localStorage.getItem('user_id') || null,
      workspaceId: localStorage.getItem('workspace_id') || null,
      workspaceName: localStorage.getItem('workspace_name') || null,
      workspaceRole: localStorage.getItem('workspace_role') || null,
      isAuthenticated: !!localStorage.getItem('token'),
      phone: localStorage.getItem('phone') || null,

      setAuth: (data) =>
        set({
          token: data.token,
          tokenExpiry: data.tokenExpiry,
          name: data.name,
          role: data.role,
          email: data.email,
          userId: data.userId,
          workspaceId: data.workspaceId,
          workspaceName: data.workspaceName,
          workspaceRole: data.workspaceRole,
          isAuthenticated: true,
          phone: data.phone,
        }),

      clearAuth: () =>
        set({
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
          phone: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useAuthStore
