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

export type ProjectResponse = {
  project: Project[]
}

export type ProjectFormValues = {
  name: string
  description?: string
}

export type addProjectRequest = {
  name: string
  description?: string
  workspace_id: string
}
