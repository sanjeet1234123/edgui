import axiosInstance from '@/lib/axiosMiddleware'

class ServersApi {
  private axiosInstance = axiosInstance

  async getServers(page = 1, limit = 12, search = '') {
    const response = await this.axiosInstance.get('/mcp/marketplace', {
      params: { page, limit, search },
    })
    return response.data
  }
}

const serversApi = new ServersApi()
export default serversApi
