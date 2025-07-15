import type {
  MemberLoginRequest,
  MemberRegistrationRequest,
  MemberSignupRequest,
  ProjectMemberRegistrationRequest,
} from '@/types/memberInvitationType'
import axiosInstance from '@/lib/axiosMiddleware'

class MemberInvitationApi {
  private axiosInstance = axiosInstance

  async memberLogin(data: MemberLoginRequest) {
    const response = await this.axiosInstance.post('/login', data)
    return response.data
  }

  async memberSignup(data: MemberSignupRequest) {
    const response = await this.axiosInstance.post('/membersignup', data)
    return response.data
  }

  async memberRegistration(data: MemberRegistrationRequest) {
    const response = await this.axiosInstance.post('/memberregistration', data)
    return response.data
  }

  async projectMemberRegistration(data: ProjectMemberRegistrationRequest) {
    const response = await this.axiosInstance.post(
      '/projects/member/register',
      data,
    )
    return response.data
  }
}

const memberInvitationApi = new MemberInvitationApi()
export default memberInvitationApi
