export type ConfirmEmailForm = {
  verificationCode: string
}

export type ConfirmEmailRequest = {
  email: string
  verification_code: string
}

export type RequestVerificationCodeRequest = {
  email: string
}
