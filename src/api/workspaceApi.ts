import axiosInstance from '@/lib/axiosMiddleware'
import type { InviteWorkspaceMembersRequest } from '@/types/workspaceType'

class WorkspaceApi {
  private axiosInstance = axiosInstance

  async getWorkspaceMembers() {
    const response = await this.axiosInstance.get('/workspaces/member')
    return response.data
  }

  async inviteWorkspaceMembers(data: InviteWorkspaceMembersRequest) {
    const response = await this.axiosInstance.post('/workspaces/member', data)
    return response.data
  }
}

const workspaceApi = new WorkspaceApi()
export default workspaceApi
