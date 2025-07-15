import axiosInstance from '@/lib/axiosMiddleware'
import type {
  ChangePasswordRequest,
  UpdateDetailsRequest,
} from '@/types/accountDetailsType'

class UserDetailsApi {
  private axiosInstance = axiosInstance

  async updateUserDetails(data: UpdateDetailsRequest) {
    const response = await this.axiosInstance.put('/updateprofile', data)
    return response.data
  }

  async changePassword(data: ChangePasswordRequest) {
    const response = await this.axiosInstance.put('/changepass', data)
    return response.data
  }

  async getUserDetails() {
    const response = await this.axiosInstance.get('/profile')
    return response.data
  }
}

const userDetailsApi = new UserDetailsApi()
export default userDetailsApi
