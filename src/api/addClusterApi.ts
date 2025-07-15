import type {
  AddClusterRequest,
  AssignPermissionsRequest,
  GCPOnboardRequest,
  GetAWSInstancesResponse,
  ManagedClusterRequest,
  RegisterClusterRequest,
} from '@/types/addClusterType'
import axiosInstance from '@/lib/axiosMiddleware'

class AddClusterApi {
  private axiosInstance = axiosInstance

  // Upload cluster file - Onpremises and Azure
  async uploadClusterFile(payload: AddClusterRequest) {
    const response = await this.axiosInstance.post(
      '/save/config/file',
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  }

  // Managed by Nexastack
  async managedCluster(payload: ManagedClusterRequest) {
    const response = await this.axiosInstance.post(
      '/onboard/config/file',
      payload,
    )
    return response.data
  }

  // AWS Onboarding APIs
  async getAwsRole() {
    const response = await this.axiosInstance.get('/aws/role')
    return response.data
  }

  async assignPermissions(payload: AssignPermissionsRequest) {
    const response = await this.axiosInstance.post(
      '/aws/role/register',
      payload,
    )
    return response.data
  }

  async getAWSInstances(user_id: number): Promise<GetAWSInstancesResponse> {
    const response = await this.axiosInstance.get(
      `/aws/clusters?user_id=${user_id}`,
    )
    return response.data
  }

  async registerCluster(payload: RegisterClusterRequest) {
    const response = await this.axiosInstance.post(
      '/aws/cluster/register',
      payload,
    )
    return response.data
  }

  // GCP Onboarding APIs
  async gcpOnboard(payload: GCPOnboardRequest) {
    const response = await this.axiosInstance.post('/gcp/onboard', payload)
    return response.data
  }
}

const addClusterApi = new AddClusterApi()
export default addClusterApi
