// @ts-nocheck
import memberInvitationApi from '@/api/memberInvitationApi'
import axiosInstance from '@/lib/axiosMiddleware'

jest.mock('@/constants/endpoint', () => ({
  __esModule: true,
  default: 'http://localhost/v1',
}))

describe('memberInvitationApi', () => {
  const mockPost = jest.fn()
  beforeAll(() => {
    jest.spyOn(axiosInstance, 'post').mockImplementation(mockPost)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('memberLogin calls correct endpoint and returns data', async () => {
    const mockData = { token: 'abc' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com', password: 'pass' }
    const result = await memberInvitationApi.memberLogin(payload)
    expect(mockPost).toHaveBeenCalledWith('/login', payload)
    expect(result).toBe(mockData)
  })

  it('memberSignup calls correct endpoint and returns data', async () => {
    const mockData = { user: 'abc' }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com', password: 'pass', name: 'Test' }
    const result = await memberInvitationApi.memberSignup(payload)
    expect(mockPost).toHaveBeenCalledWith('/membersignup', payload)
    expect(result).toBe(mockData)
  })

  it('memberRegistration calls correct endpoint and returns data', async () => {
    const mockData = { registered: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { email: 'test@test.com', code: '1234' }
    const result = await memberInvitationApi.memberRegistration(payload)
    expect(mockPost).toHaveBeenCalledWith('/memberregistration', payload)
    expect(result).toBe(mockData)
  })

  it('projectMemberRegistration calls correct endpoint and returns data', async () => {
    const mockData = { projectRegistered: true }
    mockPost.mockResolvedValueOnce({ data: mockData })
    const payload = { project_id: 1, email: 'test@test.com' }
    const result = await memberInvitationApi.projectMemberRegistration(payload)
    expect(mockPost).toHaveBeenCalledWith('/projects/member/register', payload)
    expect(result).toBe(mockData)
  })
})
