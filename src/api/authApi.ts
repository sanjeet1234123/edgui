import type {
  ConfirmEmailRequest,
  RequestVerificationCodeRequest,
} from '@/types/confirmEmailType'
import type { LoginRequest } from '@/types/loginType'
import type { SignupRequest } from '@/types/signupType'
import type { ForgetWorkspaceRequest } from '@/types/forgetWorkspaceType'
import type { ForgetPasswordRequest } from '@/types/forgetPasswordType'
import axiosInstance from '@/lib/axiosMiddleware'

class AuthApi {
  private axiosInstance = axiosInstance

  async login(data: LoginRequest) {
    const response = await this.axiosInstance.post('/login', data)
    return response.data
  }

  async signup(data: SignupRequest) {
    const response = await this.axiosInstance.post('/signup', data)
    return response.data
  }

  async logout() {
    const response = await this.axiosInstance.get('/logout')
    return response.data
  }

  async verifyEmail(data: ConfirmEmailRequest) {
    const response = await this.axiosInstance.post('/verifymail', data)
    return response.data
  }

  async requestVerificationCode(data: RequestVerificationCodeRequest) {
    const response = await this.axiosInstance.post('/send_code_again', data)
    return response.data
  }

  async forgetPassword(data: ForgetPasswordRequest) {
    const response = await this.axiosInstance.post('/forgotpass', data)
    return response.data
  }

  async forgetWorkspace(data: ForgetWorkspaceRequest) {
    const response = await this.axiosInstance.post('/forgot_workspace', data)
    return response.data
  }
}

const authApi = new AuthApi()
export default authApi
