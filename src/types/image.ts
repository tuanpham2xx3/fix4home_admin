export interface Image {
  id: number
  url: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// Spring Data Page format
export interface ImageListResponse {
  content: Image[]
  totalElements: number
  totalPages: number
  number: number // current page (0-indexed)
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface UploadImageResponse {
  id: number
  url: string
  description?: string
  isPublic: boolean
}

