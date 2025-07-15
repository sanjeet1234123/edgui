import type {
  sendChatMessageRequest,
  ModelStatusRequest,
} from '@/types/playgroundType'
import axiosInstance from '@/lib/axiosMiddleware'

class PlaygroundApi {
  private axiosInstance = axiosInstance

  async sendChatMessage(data: sendChatMessageRequest) {
    const response = await this.axiosInstance.post(`/chat_response`, data)
    return response.data
  }

  async getModelStatus(data: ModelStatusRequest) {
    const response = await this.axiosInstance.post(`/deployment_status`, data)
    return response.data
  }

  async getModelVulnerability(modelName: string) {
    const response = await this.axiosInstance.get(
      `/vulnerabilities?model_name=${modelName}`,
    )
    return response.data
  }
}

const playgroundApi = new PlaygroundApi()

export default playgroundApi
