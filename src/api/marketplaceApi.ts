import type {
  LoadModelRequest,
  UpscaleModelRequest,
} from '@/types/marketplaceType'
import axiosInstance from '@/lib/axiosMiddleware'

class MarketplaceApi {
  private axiosInstance = axiosInstance

  async getModels(category: string) {
    const response = await this.axiosInstance.get(
      `/models?category=${category}`,
    )
    return response.data
  }

  async upscaleModel(data: UpscaleModelRequest) {
    const response = await this.axiosInstance.post('/upscale_model', data)
    return response.data
  }

  async loadModel(data: LoadModelRequest) {
    const response = await this.axiosInstance.post('/models/load', data)
    return response.data
  }
}

const marketplaceApi = new MarketplaceApi()
export default marketplaceApi
