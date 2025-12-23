import apiClient, { extractData } from '@/utils/api'
import {
  Booking,
  BookingListResponse,
  UpdateBookingStatusRequest,
  BookingStatus,
} from '@/types/booking'
import { ApiResponse } from '@/types/article'
import { API_ENDPOINTS } from '@/config/api'

export const bookingsApi = {
  // Get all bookings (admin)
  getAll: async (
    status?: BookingStatus,
    page?: number,
    limit?: number
  ): Promise<BookingListResponse> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (page !== undefined) params.append('page', page.toString())
    if (limit !== undefined) params.append('limit', limit.toString())

    const response = await apiClient.get<ApiResponse<BookingListResponse>>(
      `${API_ENDPOINTS.BOOKINGS.ADMIN}?${params.toString()}`
    )
    return extractData(response)
  },

  // Get booking by ID (admin)
  getById: async (id: number): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(
      API_ENDPOINTS.BOOKINGS.ADMIN_BY_ID(id)
    )
    return extractData(response)
  },

  // Update booking status (admin)
  updateStatus: async (
    id: number,
    data: UpdateBookingStatusRequest
  ): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(
      API_ENDPOINTS.BOOKINGS.ADMIN_UPDATE_STATUS(id),
      data
    )
    return extractData(response)
  },
}

