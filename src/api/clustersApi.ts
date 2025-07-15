import axiosInstance from '@/lib/axiosMiddleware'

class ClustersApi {
  private axiosInstance = axiosInstance

  async getClusters() {
    const response = await this.axiosInstance.get('/clusters')
    return response.data
  }

  async deleteCluster(id: number) {
    const response = await this.axiosInstance.delete(`/infrastructure/${id}`)
    return response.data
  }
}

const clustersApi = new ClustersApi()
export default clustersApi
