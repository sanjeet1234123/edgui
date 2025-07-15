import type { inviteProjectMemberRequest } from '@/types/projectType'
import axiosInstance from '@/lib/axiosMiddleware'

class ProjectApi {
  private axiosInstance = axiosInstance

  async getProject(projectId: string) {
    const response = await this.axiosInstance.get(`/projects/${projectId}`)
    return response.data
  }

  async getProjectActivities(projectId: string) {
    const response = await this.axiosInstance.get(
      `/projects/${projectId}/activities`,
    )
    return response.data
  }

  async getProjectMembers(projectId: string) {
    const response = await this.axiosInstance.get(
      `/projects/${projectId}/members`,
    )
    return response.data
  }

  async inviteProjectMember(data: inviteProjectMemberRequest) {
    const response = await this.axiosInstance.post(
      `/projects/member/invite`,
      data,
    )
    return response.data
  }

  async deleteProject(projectId: string) {
    const response = await this.axiosInstance.delete(`/projects/${projectId}`)
    return response.data
  }
}

const projectApi = new ProjectApi()
export default projectApi
