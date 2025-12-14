import apiClient, { extractData } from '@/utils/api'
import { ApiResponse } from '@/types/article'
import { Image, ImageListResponse, UploadImageResponse } from '@/types/image'
import { API_ENDPOINTS } from '@/config/api'
import { getCookie } from '@/utils/cookies'

export const imagesApi = {
  /**
   * Upload an image
   * @param file - Image file to upload
   * @param description - Optional description
   * @param isPublic - Whether the image is public (default: true)
   */
  upload: async (
    file: File,
    description?: string,
    isPublic: boolean = true
  ): Promise<UploadImageResponse> => {
    // Check token before upload (cookies only)
    const token = getCookie('token')
    if (!token) {
      console.error('❌ [IMAGES API] No authentication token found')
      throw new Error('User not authenticated. Please login and try again.')
    }

    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    formData.append('isPublic', isPublic.toString())

    console.log('📤 [IMAGES API] Uploading image:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      description,
      isPublic,
      hasToken: !!token,
      tokenLength: token?.length,
    })

    try {
      // Don't set Content-Type header - let axios/browser set it automatically with boundary
      const response = await apiClient.post<ApiResponse<any>>(
        API_ENDPOINTS.IMAGES.UPLOAD,
        formData
      )
      
      console.log('✅ [IMAGES API] Upload successful:', response.data)
      
      // Map backend response (fileUrl) to frontend format (url)
      const backendData = extractData(response)
      return {
        id: backendData.id,
        url: backendData.fileUrl || backendData.url, // Support both field names
        description: backendData.description,
        isPublic: backendData.isPublic ?? true,
      }
    } catch (error: any) {
      console.error('❌ [IMAGES API] Upload error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fullError: error,
      })
      throw error
    }
  },

  /**
   * Get all images with pagination
   * @param page - Page number (0-indexed)
   * @param size - Page size
   * @param isPublic - Filter by public status (optional)
   */
  getAll: async (
    page?: number,
    size?: number,
    isPublic?: boolean
  ): Promise<ImageListResponse> => {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (size !== undefined) params.append('size', size.toString())
    if (isPublic !== undefined) params.append('isPublic', isPublic.toString())

    const response = await apiClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.IMAGES.BASE}?${params.toString()}`
    )
    const data = extractData(response)
    
    // Map backend response (fileUrl) to frontend format (url)
    const mappedContent = (data.content || []).map((item: any) => ({
      ...item,
      url: item.fileUrl || item.url, // Support both field names
    }))
    
    // Backend returns Spring Data Page format, ensure content is always an array
    return {
      ...data,
      content: mappedContent,
    }
  },

  /**
   * Get image by ID
   * @param id - Image ID
   */
  getById: async (id: number): Promise<Image> => {
    const response = await apiClient.get<ApiResponse<Image>>(
      API_ENDPOINTS.IMAGES.BY_ID(id)
    )
    return extractData(response)
  },

  /**
   * Update image metadata
   * @param id - Image ID
   * @param data - Update data (description, isPublic)
   */
  update: async (
    id: number,
    data: { description?: string; isPublic?: boolean }
  ): Promise<Image> => {
    const response = await apiClient.put<ApiResponse<Image>>(
      API_ENDPOINTS.IMAGES.BY_ID(id),
      data
    )
    return extractData(response)
  },

  /**
   * Delete an image
   * @param id - Image ID
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.IMAGES.BY_ID(id))
  },
}

