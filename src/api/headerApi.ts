// @/api/headerApi.ts
import axiosInstance from '@/lib/axiosMiddleware'
import type { UpdateTokenParams, UpdateTokenResponse } from '@/types/headerType'

class HeaderApi {
  private axiosInstance = axiosInstance

  async getProjects() {
    const response = await this.axiosInstance.get('/user/projects')
    return response.data
  }

  async updateToken(params: UpdateTokenParams): Promise<UpdateTokenResponse> {
    // Ensure correct parameter format
    const payload = {
      project_id: params.project_id,
      environment: params.environment,
    }

    const response = await this.axiosInstance.post('/upgrade_token', payload)

    // Add additional properties to match what the component expects
    return {
      ...response.data,
      projectId: params.project_id,
      environment: params.environment,
    }
  }
}

const headerApi = new HeaderApi()
export default headerApi
