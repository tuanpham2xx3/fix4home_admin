export enum BookingStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Booking {
  id: number
  title: string
  address: string
  date: string
  notes?: string
  phone: string
  name: string
  wardCode: string
  needsSurvey: boolean
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export interface BookingListResponse {
  bookings: Booking[]
  total: number
  page: number
  limit: number
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus
  note?: string
}

