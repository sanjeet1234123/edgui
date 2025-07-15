// @ts-nocheck
import clustersApi from '@/api/clustersApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('clustersApi', () => {
  const mockGet = jest.fn()
  const mockDelete = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
    jest.spyOn(axiosInstance, 'delete').mockImplementation(mockDelete)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getClusters calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, name: 'cluster1' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await clustersApi.getClusters()
    expect(mockGet).toHaveBeenCalledWith('/clusters')
    expect(result).toBe(mockData)
  })

  it('deleteCluster calls correct endpoint and returns data', async () => {
    const mockData = { success: true }
    mockDelete.mockResolvedValueOnce({ data: mockData })
    const id = 123
    const result = await clustersApi.deleteCluster(id)
    expect(mockDelete).toHaveBeenCalledWith(`/infrastructure/${id}`)
    expect(result).toBe(mockData)
  })
})
