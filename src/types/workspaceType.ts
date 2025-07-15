export type WorkspaceMember = {
  id: number
  name: string
  email: string
  role: string
  joined: number
}

export interface WorkspaceResponse {
  members: Array<WorkspaceMember>
}

export type InviteFormValues = {
  email: string
  role: string
}

export type InviteWorkspaceMembersRequest = Array<{
  email: string
  role: string
  duplicate: boolean
}>
