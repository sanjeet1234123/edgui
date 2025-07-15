import axiosInstance from '@/lib/axiosMiddleware'

class DeploymentsApi {
  private axiosInstance = axiosInstance

  async getDeployments() {
    const response = await this.axiosInstance.get('/deployed_model')
    return response.data
  }

  async deleteDeployment(id: number) {
    const response = await this.axiosInstance.delete(`/deployed_model/${id}`)
    return response.data
  }
}

const deploymentsApi = new DeploymentsApi()
export default deploymentsApi
