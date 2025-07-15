import axiosInstance from '@/lib/axiosMiddleware'

class ServerApi {
  private axiosInstance = axiosInstance

  async getServer(serverId: string) {
    const response = await this.axiosInstance.get('/mcp/marketplace', {
      params: {
        search: serverId,
      },
    })
    return response.data
  }

  async getRawGithubFile(id: string) {
    const response = await this.axiosInstance.get(
      `/mcp/marketplace/${id}/readme`,
    )
    return response.data
  }
}

const serverApi = new ServerApi()
export default serverApi
