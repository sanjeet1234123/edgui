export type UpdateTokenParams = {
  project_id?: number
  environment?: string
}

export type UpdateTokenResponse = {
  token: string
  expire: string
  // Adding these fields to match the data structure expected in the component
  projectId?: number
  environment?: string
}

export interface Project {
  created_at: string
  created_by: number
  deleted_at: string | null
  description: string
  environment: string
  id: number
  members: null
  name: string
  organization_id: number
  project_id: number
  updated_at: string
  updated_by: number
  workspace_id: string
}

export type Environment = string
