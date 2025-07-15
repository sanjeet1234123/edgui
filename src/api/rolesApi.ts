import axiosInstance from '@/lib/axiosMiddleware'

class RolesApi {
  private axiosInstance = axiosInstance

  async getRoles() {
    const response = await this.axiosInstance.get('/roles')
    return response.data
  }
}

const rolesApi = new RolesApi()
export default rolesApi
