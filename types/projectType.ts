export type inviteProjectMemberForm = {
  email: string
  role: string
  environments: {
    development: boolean
    staging: boolean
    production: boolean
  }
}

export type inviteProjectMemberRequest = {
  email: string
  role: string
  role_id: number
  project_id: string
  environment_access: Array<{
    environment: string
    permissions: Array<string>
  }>
  workspace: string
}

export type projectMember = {
  id: number
  role: string
  role_id: number
  email: string
  name: string
  status: string
  environment_access: Array<{
    id: number
    member_id: number
    environment: string
    permissions: Array<string>
  }>
  user_id: number
  project_id: string
  workspace: string
  project_name: string
}

export type projectMemberResponse = Array<projectMember>

export type projectActivity = {
  email: string
  name: string
  environment: string
  workspace: string
  activity_name: string
  status: string
  reason: string
  client_ip: string
  client_agent: string
  timestamp: number
  project_id: number
}

export type projectActivityResponse = {
  data: Array<projectActivity>
}
