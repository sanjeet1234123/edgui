import moment from 'moment'
import axiosInstance from './axiosMiddleware'

let refreshPromise: Promise<string> | null = null

export const getToken = () => localStorage.getItem('token')

export const willTokenExpireSoon = () => {
  const expireStr = localStorage.getItem('expire')
  if (!expireStr) return false

  const expireTime = moment.utc(expireStr)
  return expireTime.diff(moment.utc(), 'minutes') <= 5
}

export const clearSession = () => {
  localStorage.clear()
}

export const refreshToken = async () => {
  if (refreshPromise) return refreshPromise

  const token = getToken()
  const projectId = localStorage.getItem('project_id')

  if (!token) throw new Error('No token to refresh')

  refreshPromise = (async () => {
    try {
      const response = await axiosInstance.post('/upgrade_token', {
        ...(projectId && { project_id: parseInt(projectId, 10) }),
      })

      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('expire', response.data.expire)
        return response.data.token
      } else {
        throw new Error('Invalid refresh response')
      }
    } catch (error) {
      clearSession()
      throw error
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
