// @ts-nocheck
import rolesApi from '@/api/rolesApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('rolesApi', () => {
  const mockGet = jest.fn()

  beforeAll(() => {
    jest.spyOn(axiosInstance, 'get').mockImplementation(mockGet)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getRoles calls correct endpoint and returns data', async () => {
    const mockData = [
      { id: 1, name: 'admin' },
      { id: 2, name: 'user' },
    ]
    mockGet.mockResolvedValueOnce({ data: mockData })

    const result = await rolesApi.getRoles()

    expect(mockGet).toHaveBeenCalledWith('/roles')
    expect(result).toBe(mockData)
  })

  it('getRoles handles error correctly', async () => {
    const error = new Error('Network error')
    mockGet.mockRejectedValueOnce(error)

    await expect(rolesApi.getRoles()).rejects.toThrow('Network error')
  })
})
