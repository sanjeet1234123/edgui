export type PlatformSetupForm = {
  workspace_url: string
  team_name: string
  team_type: string
  team_size: string
}

export type WorkspaceCreationRequest = {
  workspace_url: string
  team_name: string
  team_type: string
  team_size: string
}

export type CheckWorkspaceAvailabilityRequest = {
  workspace_url: string
}

export type InviteMembersRequest = Array<InviteMember>

export type InviteMember = {
  email: string
  role: string
  duplicate: boolean
}
