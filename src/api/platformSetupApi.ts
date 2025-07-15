import type {
  CheckWorkspaceAvailabilityRequest,
  InviteMembersRequest,
  WorkspaceCreationRequest,
} from '@/types/platformSetupType'
import axiosInstance from '@/lib/axiosMiddleware'

class PlatformSetupApi {
  private axiosInstance = axiosInstance

  async createWorkspace(data: WorkspaceCreationRequest) {
    const response = await this.axiosInstance.post('/workspaces', data)
    return response.data
  }

  async checkWorkspaceAvailability(data: CheckWorkspaceAvailabilityRequest) {
    const response = await this.axiosInstance.post(
      '/workspace_availability',
      data,
    )
    return response.data
  }

  async inviteMembers(data: InviteMembersRequest) {
    const response = await this.axiosInstance.post('/workspaces/member', data)
    return response.data
  }
}

const platformSetupApi = new PlatformSetupApi()
export default platformSetupApi
