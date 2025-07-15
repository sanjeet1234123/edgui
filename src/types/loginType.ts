export type LoginForm = {
  workspace: string
  email: string
  password: string
  rememberMe: boolean
}

export type LoginRequest = {
  workspace: string
  email: string
  password: string
  rememberMe: boolean
}

export type LoginResponse = {
  token: string
  expire: string
  name: string
  role_id: string
  email: string
  id: string
  workspace_id: string
  workspace_name: string
  workspace_role: string
  phone: string
}
