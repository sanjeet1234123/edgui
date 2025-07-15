// @ts-nocheck
import deploymentsApi from '@/api/deploymentsApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('deploymentsApi', () => {
  const mockGet = jest.fn()
  const mockDelete = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
    jest.spyOn(axiosInstance, 'delete').mockImplementation(mockDelete)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getDeployments calls correct endpoint and returns data', async () => {
    const mockData = [{ id: 1, name: 'deployment1' }]
    mockGet.mockResolvedValueOnce({ data: mockData })
    const result = await deploymentsApi.getDeployments()
    expect(mockGet).toHaveBeenCalledWith('/deployed_model')
    expect(result).toBe(mockData)
  })

  it('deleteDeployment calls correct endpoint and returns data', async () => {
    const mockData = { success: true }
    mockDelete.mockResolvedValueOnce({ data: mockData })
    const id = 123
    const result = await deploymentsApi.deleteDeployment(id)
    expect(mockDelete).toHaveBeenCalledWith(`/deployed_model/${id}`)
    expect(result).toBe(mockData)
  })
})
