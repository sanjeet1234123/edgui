import axios from 'axios'
import {
  getToken,
  willTokenExpireSoon,
  refreshToken,
  clearSession,
} from './tokenService'
import { PATHS } from '@/constants/paths'
import BASE_URL from '@/constants/endpoint'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getToken()

    try {
      if (token) {
        if (willTokenExpireSoon()) {
          const newToken = await refreshToken()
          config.headers.Authorization = `Bearer ${newToken}`
        } else {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch (e) {
      // silently fail, let the response interceptor handle it
    }

    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await refreshToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (err) {
        clearSession()
        window.location.replace(PATHS.LOGIN)
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
