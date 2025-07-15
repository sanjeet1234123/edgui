// @ts-nocheck
import addClusterApi from '@/api/addClusterApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('addClusterApi', () => {
  const mockPost = jest.fn()
  const mockGet = jest.fn()
  beforeAll(() => {
    // Polyfill import.meta.env for Vite env variables in Jest
    if (!globalThis.importMetaEnvPatched) {
      // Check if the property already exists and is configurable
      const descriptor = Object.getOwnPropertyDescriptor(global, 'import')
      if (!descriptor || descriptor.configurable) {
        Object.defineProperty(global, 'import', {
          value: {
            meta: { env: { VITE_API_BASE_URL: 'http://localhost' } },
          },
          configurable: true,
          writable: true,
        })
      } else if (global.import && !global.import.meta) {
        // If import exists but doesn't have meta, add it
        global.import.meta = { env: { VITE_API_BASE_URL: 'http://localhost' } }
      }
      globalThis.importMetaEnvPatched = true
    }
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uploadClusterFile calls correct endpoint and returns data', async () => {
    const mockData = { success: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = {
      cluster_name: 'test',
      cloud_type: 'azure',
      framework: 'k8s',
      ingress: 'nginx',
      ingress_class: 'nginx',
      file: new File([''], 'test.yaml'),
    }
    const result = await addClusterApi.uploadClusterFile(payload)
    expect(mockPost).toHaveBeenCalledWith(
      '/save/config/file',
      payload,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'multipart/form-data',
        }),
      }),
    )
    expect(result).toBe(mockData)
  })

  it('managedCluster calls correct endpoint and returns data', async () => {
    const mockData = { managed: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { cluster_name: 'test', ingress: 'nginx' }
    const result = await addClusterApi.managedCluster(payload)
    expect(mockPost).toHaveBeenCalledWith('/onboard/config/file', payload)
    expect(result).toBe(mockData)
  })

  it('getAwsRole calls correct endpoint and returns data', async () => {
    const mockData = { role: 'aws-role' }
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await addClusterApi.getAwsRole()
    expect(mockGet).toHaveBeenCalledWith('/aws/role')
    expect(result).toBe(mockData)
  })

  it('assignPermissions calls correct endpoint and returns data', async () => {
    const mockData = { assigned: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = {
      region: 'us-east-1',
      user_id: 1,
      user_resource_arn: 'arn:aws:iam::1:role/test',
    }
    const result = await addClusterApi.assignPermissions(payload)
    expect(mockPost).toHaveBeenCalledWith('/aws/role/register', payload)
    expect(result).toBe(mockData)
  })

  it('getAWSInstances calls correct endpoint and returns data', async () => {
    const mockData = { account_id: 'acc', clusters: ['c1', 'c2'] }
    mockGet.mockResolvedValueOnce({ data: mockData })
    const userId = 42
    const result = await addClusterApi.getAWSInstances(userId)
    expect(mockGet).toHaveBeenCalledWith(`/aws/clusters?user_id=${userId}`)
    expect(result).toBe(mockData)
  })

  it('registerCluster calls correct endpoint and returns data', async () => {
    const mockData = { registered: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { cluster_name: 'test', user_id: 1, account_id: 'acc' }
    const result = await addClusterApi.registerCluster(payload)
    expect(mockPost).toHaveBeenCalledWith('/aws/cluster/register', payload)
    expect(result).toBe(mockData)
  })

  it('gcpOnboard calls correct endpoint and returns data', async () => {
    const mockData = { onboarded: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = {
      credentials_file: new File([''], 'gcp.json'),
      cluster_name: 'gcp-cluster',
    }
    const result = await addClusterApi.gcpOnboard(payload)
    expect(mockPost).toHaveBeenCalledWith('/gcp/onboard', payload)
    expect(result).toBe(mockData)
  })
})
