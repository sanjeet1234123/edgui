import type { addProjectRequest } from '@/types/projectsType'
import axiosInstance from '@/lib/axiosMiddleware'

class ProjectsApi {
  private axiosInstance = axiosInstance

  async getProjects() {
    const response = await this.axiosInstance.get('/user/projects')
    return response.data
  }

  async createProject(data: addProjectRequest) {
    const response = await this.axiosInstance.post('/projects', data)
    return response.data
  }
}

const projectsApi = new ProjectsApi()
export default projectsApi
