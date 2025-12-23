import { useEffect } from 'react'
import { Modal, Form, Select, Input } from 'antd'
import { bookingsApi } from '@/api/bookings'
import { BookingStatus, UpdateBookingStatusRequest } from '@/types/booking'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const { TextArea } = Input

interface StatusUpdateModalProps {
  open: boolean
  bookingId: number | null
  currentStatus: BookingStatus
  onCancel: () => void
  onSuccess?: () => void
}

export default function StatusUpdateModal({
  open,
  bookingId,
  currentStatus,
  onCancel,
  onSuccess,
}: StatusUpdateModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation({
    mutationFn: (data: UpdateBookingStatusRequest) => {
      if (!bookingId) throw new Error('Booking ID is required')
      return bookingsApi.updateStatus(bookingId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      toast.success('Booking status updated successfully')
      form.resetFields()
      onCancel()
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update booking status'
      toast.error(errorMessage)
    },
  })

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      updateStatusMutation.mutate({
        status: values.status,
        note: values.note || undefined,
      })
    } catch (error) {
      // Form validation error
      console.error('Form validation error:', error)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="Update Booking Status"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={updateStatusMutation.isPending}
      okText="Update"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: undefined,
          note: '',
        }}
      >
        <Form.Item
          name="status"
          label="New Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select status" size="large">
            <Select.Option value={BookingStatus.COMPLETED}>
              COMPLETED
            </Select.Option>
            <Select.Option value={BookingStatus.CANCELLED}>
              CANCELLED
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="note" label="Note (Optional)">
          <TextArea
            rows={4}
            placeholder="Enter a note about this status update..."
          />
        </Form.Item>

        {currentStatus !== BookingStatus.PENDING && (
          <div style={{ color: '#ff4d4f', marginTop: 8 }}>
            Warning: Only bookings with PENDING status can be updated. Current
            status: {currentStatus}
          </div>
        )}
      </Form>
    </Modal>
  )
}

