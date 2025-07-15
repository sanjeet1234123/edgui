//member-login

export type MemberLoginForm = {
  email: string
  password: string
}

export type MemberLoginRequest = {
  email: string
  password: string
  workspace: string
}

export type MemberLoginResponse = {
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

//member-signup

export type MemberSignupForm = {
  email: string
}

export type MemberSignupRequest = {
  email: string
  workspace: string
}

//member-registration

export type MemberRegistrationForm = {
  name: string
  contact: string
  password: string
  confirm_password: string
}

export type MemberRegistrationRequest = {
  name: string
  contact: string
  token: string
  password: string
  workspace: string
}

export type MemberRegistrationResponse = {
  token: string
  expire: string
  name: string
  role_id: string
  email: string
  id: string
  workspace_id: string
  workspace_name: string
  workspace_role: string
}

//project-member-registration

export type ProjectMemberRegistrationForm = {
  email: string
  password: string
}

export type ProjectMemberRegistrationRequest = {
  email: string
  password: string
  workspace: string
  project_id: string
  token: string
}

export type ProjectMemberRegistrationResponse = {
  token: string
  expire: string
  name: string
  role_id: string
  email: string
  id: string
  workspace_id: string
  workspace_name: string
  workspace_role: string
}
