export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100/api/v1'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  // Articles
  ARTICLES: {
    BASE: '/articles',
    ADMIN: '/articles/admin',
    PUBLISH: (id: number) => `/articles/${id}/publish`,
    UNPUBLISH: (id: number) => `/articles/${id}/unpublish`,
    BY_ID: (id: number) => `/articles/${id}`,
    BY_SLUG: (slug: string) => `/articles/slug/${slug}`,
    SEARCH: '/articles/search',
  },
} as const

