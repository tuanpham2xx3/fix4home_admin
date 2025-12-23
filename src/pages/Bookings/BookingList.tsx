import { useState } from 'react'
import { Table, Tag, Select, Space, Button, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import { Booking, BookingStatus } from '@/types/booking'
import dayjs from 'dayjs'
import BookingDetail from './BookingDetail'
import StatusUpdateModal from '@/components/Bookings/StatusUpdateModal'

const { Title } = Typography

export default function BookingList() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>()
  const [page, setPage] = useState(0)
  const [limit] = useState(10)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  )
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusModalBooking, setStatusModalBooking] =
    useState<Booking | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'admin', statusFilter, page, limit],
    queryFn: () => bookingsApi.getAll(statusFilter, page, limit),
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

  const handleViewDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId)
    setDetailDrawerOpen(true)
  }

  const handleUpdateStatus = (booking: Booking) => {
    setStatusModalBooking(booking)
    setStatusModalOpen(true)
  }

  const columns: ColumnsType<Booking> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: BookingStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Booking) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
            size="small"
          >
            View
          </Button>
          {record.status === BookingStatus.PENDING && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdateStatus(record)}
              size="small"
            >
              Update
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Bookings</Title>

        <Space>
          <span>Filter by status:</span>
          <Select
            style={{ width: 200 }}
            placeholder="All statuses"
            allowClear
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value)
              setPage(0)
            }}
          >
            <Select.Option value={BookingStatus.PENDING}>PENDING</Select.Option>
            <Select.Option value={BookingStatus.COMPLETED}>
              COMPLETED
            </Select.Option>
            <Select.Option value={BookingStatus.CANCELLED}>
              CANCELLED
            </Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.bookings || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page + 1,
            pageSize: limit,
            total: data?.total || 0,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} bookings`,
            onChange: (newPage) => setPage(newPage - 1),
          }}
          scroll={{ x: 'max-content' }}
        />
      </Space>

      <BookingDetail
        open={detailDrawerOpen}
        bookingId={selectedBookingId}
        onClose={() => {
          setDetailDrawerOpen(false)
          setSelectedBookingId(null)
        }}
      />

      {statusModalBooking && (
        <StatusUpdateModal
          open={statusModalOpen}
          bookingId={statusModalBooking.id}
          currentStatus={statusModalBooking.status}
          onCancel={() => {
            setStatusModalOpen(false)
            setStatusModalBooking(null)
          }}
          onSuccess={() => {
            setStatusModalBooking(null)
          }}
        />
      )}
    </div>
  )
}

