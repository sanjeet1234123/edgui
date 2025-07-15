import type {
  DeployClusterRequest,
  DeploymentPodStatusRequest,
  DownscaleModelRequest,
} from '@/types/deploymentType'
import axiosInstance from '@/lib/axiosMiddleware'

class DeploymentApi {
  private axiosInstance = axiosInstance

  async getClusters(modelName: string) {
    const response = await this.axiosInstance.get(`/clusters?name=${modelName}`)
    return response.data
  }

  async handleDeploymentPodStatus(payload: DeploymentPodStatusRequest) {
    const response = await this.axiosInstance.post(
      '/playground/podstatus',
      payload,
    )
    return response
  }

  async deployCluster(payload: DeployClusterRequest) {
    const response = await this.axiosInstance.post('/install_model', payload)
    return response
  }

  async handleDownscaleModel(payload: DownscaleModelRequest) {
    const response = await this.axiosInstance.post(`/downscale_model`, payload)
    return response.data
  }
}

const deploymentApi = new DeploymentApi()
export default deploymentApi
