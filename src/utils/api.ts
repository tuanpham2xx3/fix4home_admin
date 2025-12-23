import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/api'
import { ApiResponse } from '@/types/article'
import { apiLogger } from './logger'
import { getCookie, deleteCookies } from './cookies'

// Log API configuration
console.log('🔧 [API] API Configuration:', {
  baseURL: API_BASE_URL,
  env: import.meta.env.MODE,
})

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookie only (no localStorage)
    const token = getCookie('token')
    
    console.log('🔍 [API INTERCEPTOR] Token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'none',
      allCookies: document.cookie.split(';').map(c => c.trim().split('=')[0]),
    })
    
    // Set Authorization header FIRST (before handling Content-Type)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ [API INTERCEPTOR] Authorization header set:', `Bearer ${token.substring(0, 30)}...`)
    } else if (!token) {
      console.warn('⚠️ [API INTERCEPTOR] No token available, request will be sent without Authorization header')
    }
    
    // For FormData, delete Content-Type to let browser add it with boundary
    if (config.data instanceof FormData) {
      if (config.headers) {
        // Delete Content-Type header completely
        delete config.headers['Content-Type']
        console.log('📦 [API INTERCEPTOR] FormData detected, Content-Type deleted (browser will add boundary)')
      }
    }
    
    const method = config.method?.toUpperCase() || 'UNKNOWN'
    const url = config.url || ''
    const fullURL = `${config.baseURL}${url}`
    
    // Log final headers before sending
    console.log('📡 [API] Request:', {
      method,
      url,
      baseURL: config.baseURL,
      fullURL,
      hasAuth: !!token,
      isFormData: config.data instanceof FormData,
      authHeader: config.headers?.Authorization || 'none',
      contentType: config.headers?.['Content-Type'] || 'none',
      allHeaderKeys: config.headers ? Object.keys(config.headers) : [],
    })
    
    // Log to logger (but don't log FormData content)
    if (config.data instanceof FormData) {
      apiLogger.logRequest(method, fullURL, { type: 'FormData', fileCount: Array.from(config.data.keys()).length })
    } else {
      apiLogger.logRequest(method, fullURL, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('❌ [API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase() || 'UNKNOWN'
    const url = `${response.config.baseURL}${response.config.url}`
    
    console.log('✅ [API] Response received:')
    console.log('✅ [API] Status:', response.status, response.statusText)
    console.log('✅ [API] URL:', response.config.url)
    console.log('✅ [API] Response Data JSON:')
    console.log(JSON.stringify(response.data, null, 2))
    console.log('✅ [API] Response Headers:', JSON.stringify(response.headers, null, 2))
    
    // Log to logger
    apiLogger.logResponse(method, url, response.status, response.data)
    
    return response
  },
  (error) => {
    // Network Error - no response from server
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const fullURL = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL'
      console.error('🌐 [API] Network Error - Cannot connect to server:', {
        message: error.message,
        code: error.code,
        url: fullURL,
        baseURL: error.config?.baseURL,
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        possibleCauses: [
          'Server is not running',
          'CORS issue - server needs to allow origin',
          'Wrong API URL',
          'Network connectivity issue',
          'Firewall blocking the request',
        ],
      })
      
      // Add more details to error object
      error.networkErrorDetails = {
        fullURL,
        baseURL: error.config?.baseURL,
        endpoint: error.config?.url,
        method: error.config?.method,
        message: 'Cannot connect to server. Please check if the backend server is running.',
      }
    } else {
      // Other errors (with response)
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
      const url = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown'
      
      console.error('❌ [API] Response error:')
      console.error('❌ [API] Message:', error.message)
      console.error('❌ [API] Code:', error.code)
      console.error('❌ [API] Status:', error.response?.status, error.response?.statusText)
      console.error('❌ [API] URL:', error.config?.url)
      console.error('❌ [API] Full URL:', url)
      console.error('❌ [API] Error Response Data JSON:')
      console.error(JSON.stringify(error.response?.data, null, 2))
      console.error('❌ [API] Error Response Headers JSON:')
      console.error(JSON.stringify(error.response?.headers, null, 2))
      
      // Log to logger
      apiLogger.logError(method, url, error.response?.status, error.response?.data || error.message)
    }
    
    // Handle authentication errors (401 or 400 with auth message)
    const isAuthError = error.response?.status === 401 || 
      (error.response?.status === 400 && 
       (error.response?.data?.message?.toLowerCase().includes('not authenticated') ||
        error.response?.data?.message?.toLowerCase().includes('authentication')))
    
    if (isAuthError) {
      // Unauthorized/Not authenticated - clear cookies
      console.warn('⚠️ [API] Authentication error - clearing cookies:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error.response?.data,
      })
      // Clear all auth cookies
      deleteCookies(['token', 'refreshToken', 'userInfo'])
      // DISABLED: Auto redirect to login (commented out for debugging)
      // Uncomment below to enable auto redirect
      // if (window.location.pathname !== '/login') {
      //   window.location.href = '/login'
      // }
      console.warn('⚠️ [API] Auto-redirect disabled for debugging. Cookies cleared but staying on current page.')
    }
    return Promise.reject(error)
  }
)

// Helper to extract data from ApiResponse
export const extractData = <T>(response: { data: ApiResponse<T> }): T => {
  return response.data.data
}

export default apiClient

