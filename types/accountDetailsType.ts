export type UpdateDetailsForm = {
  firstname: string
  lastname: string
  phone: string
}

export type UpdateDetailsRequest = {
  name: string
  phone: string
}

export type ChangePasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type ChangePasswordRequest = {
  old_password: string
  new_password: string
}
