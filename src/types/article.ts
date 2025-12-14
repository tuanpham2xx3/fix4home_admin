export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

export interface HeroImage {
  url: string
  alt?: string
  caption?: string
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'orderedList' | 'unorderedList' | 'image' | 'link' | 'section'
  content?: string
  level?: number
  items?: string[]
  url?: string
  alt?: string
  caption?: string
  linkUrl?: string
  linkText?: string
  openInNewTab?: boolean
  sectionTitle?: string
  sectionContent?: ContentBlock[]
  spacing?: 'small' | 'medium' | 'large'
  additionalProperties?: Record<string, unknown>
}

export interface ContentStructure {
  type: 'structured' | 'markdown' | 'html'
  blocks: ContentBlock[]
}

export interface Section {
  title?: string
  content?: string
  bulletPoints?: string[]
}

export interface ContactInfo {
  websiteUrl?: string
  bookingPhone?: string
  consultationPhones?: string[]
}

export interface ArticleMetadata {
  author: string
  authorId: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  tags?: string[]
  category?: string
}

export interface Article {
  id: number
  title: string
  shortDescription?: string
  slug: string
  content: ContentStructure
  heroImage?: HeroImage
  metaDescription?: string
  metaKeywords?: string
  status: ArticleStatus
  sections?: Section[]
  contactInfo?: ContactInfo
  metadata: ArticleMetadata
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateArticleRequest {
  title: string
  shortDescription?: string
  slug: string
  content: ContentStructure
  heroImage?: HeroImage
  metaDescription?: string
  metaKeywords?: string
  sections?: Section[]
  contactInfo?: ContactInfo
}

export interface UpdateArticleRequest {
  title?: string
  shortDescription?: string
  slug?: string
  content?: ContentStructure
  heroImage?: HeroImage | null
  metaDescription?: string
  metaKeywords?: string
  sections?: Section[]
  contactInfo?: ContactInfo
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

