import { Drawer, Descriptions, Button, Spin, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import { BookingStatus } from '@/types/booking'
import dayjs from 'dayjs'
import StatusUpdateModal from '@/components/Bookings/StatusUpdateModal'
import { useState } from 'react'

interface BookingDetailProps {
  open: boolean
  bookingId: number | null
  onClose: () => void
}

export default function BookingDetail({
  open,
  bookingId,
  onClose,
}: BookingDetailProps) {
  const [statusModalOpen, setStatusModalOpen] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => {
      if (!bookingId) throw new Error('Booking ID is required')
      return bookingsApi.getById(bookingId)
    },
    enabled: open && !!bookingId,
  })

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'warning'
      case BookingStatus.COMPLETED:
        return 'success'
      case BookingStatus.CANCELLED:
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <>
      <Drawer
        title="Booking Details"
        placement="right"
        size="large"
        onClose={onClose}
        open={open}
        extra={
          booking?.status === BookingStatus.PENDING && (
            <Button
              type="primary"
              onClick={() => setStatusModalOpen(true)}
            >
              Update Status
            </Button>
          )
        }
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : booking ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{booking.id}</Descriptions.Item>
            <Descriptions.Item label="Title">{booking.title}</Descriptions.Item>
            <Descriptions.Item label="Name">{booking.name}</Descriptions.Item>
            <Descriptions.Item label="Phone">{booking.phone}</Descriptions.Item>
            <Descriptions.Item label="Address">{booking.address}</Descriptions.Item>
            <Descriptions.Item label="Ward Code">{booking.wardCode}</Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(booking.date).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(booking.status)}>
                {booking.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Needs Survey">
              {booking.needsSurvey ? 'Yes' : 'No'}
            </Descriptions.Item>
            {booking.notes && (
              <Descriptions.Item label="Notes">{booking.notes}</Descriptions.Item>
            )}
            <Descriptions.Item label="Created At">
              {dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {dayjs(booking.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            No booking data available
          </div>
        )}
      </Drawer>

      {booking && (
        <StatusUpdateModal
          open={statusModalOpen}
          bookingId={booking.id}
          currentStatus={booking.status}
          onCancel={() => setStatusModalOpen(false)}
          onSuccess={() => {
            // Query will automatically refetch
          }}
        />
      )}
    </>
  )
}

