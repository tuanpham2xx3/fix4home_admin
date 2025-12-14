import apiClient, { extractData } from '@/utils/api'
import {
  Article,
  ArticleListResponse,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleStatus,
  ApiResponse,
} from '@/types/article'
import { API_ENDPOINTS } from '@/config/api'

export const articlesApi = {
  // Admin endpoints
  getAll: async (status?: ArticleStatus, page?: number, limit?: number): Promise<ArticleListResponse> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (page !== undefined) params.append('page', page.toString())
    if (limit !== undefined) params.append('limit', limit.toString())
    
    const response = await apiClient.get<ApiResponse<ArticleListResponse>>(
      `${API_ENDPOINTS.ARTICLES.ADMIN}?${params.toString()}`
    )
    return extractData(response)
  },

  getById: async (id: number, adminAccess = true): Promise<Article> => {
    const endpoint = adminAccess 
      ? `${API_ENDPOINTS.ARTICLES.ADMIN}/${id}`
      : API_ENDPOINTS.ARTICLES.BY_ID(id)
    const response = await apiClient.get<ApiResponse<Article>>(endpoint)
    return extractData(response)
  },

  create: async (data: CreateArticleRequest): Promise<Article> => {
    const response = await apiClient.post<ApiResponse<Article>>(
      API_ENDPOINTS.ARTICLES.BASE,
      data
    )
    return extractData(response)
  },

  update: async (id: number, data: UpdateArticleRequest): Promise<Article> => {
    const response = await apiClient.put<ApiResponse<Article>>(
      API_ENDPOINTS.ARTICLES.BY_ID(id),
      data
    )
    return extractData(response)
  },

  publish: async (id: number): Promise<Article> => {
    const response = await apiClient.post<ApiResponse<Article>>(
      API_ENDPOINTS.ARTICLES.PUBLISH(id)
    )
    return extractData(response)
  },

  unpublish: async (id: number): Promise<Article> => {
    const response = await apiClient.post<ApiResponse<Article>>(
      API_ENDPOINTS.ARTICLES.UNPUBLISH(id)
    )
    return extractData(response)
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ARTICLES.BY_ID(id))
  },

  // Public endpoints
  getPublished: async (page?: number, limit?: number): Promise<ArticleListResponse> => {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (limit !== undefined) params.append('limit', limit.toString())
    
    const response = await apiClient.get<ApiResponse<ArticleListResponse>>(
      `${API_ENDPOINTS.ARTICLES.BASE}?${params.toString()}`
    )
    return extractData(response)
  },

  search: async (keyword: string, page?: number, limit?: number): Promise<ArticleListResponse> => {
    const params = new URLSearchParams()
    params.append('keyword', keyword)
    if (page !== undefined) params.append('page', page.toString())
    if (limit !== undefined) params.append('limit', limit.toString())
    
    const response = await apiClient.get<ApiResponse<ArticleListResponse>>(
      `${API_ENDPOINTS.ARTICLES.SEARCH}?${params.toString()}`
    )
    return extractData(response)
  },
}

