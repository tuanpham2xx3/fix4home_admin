import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PublishIcon from '@mui/icons-material/Publish'
import UnpublishedIcon from '@mui/icons-material/Unpublished'
import DeleteIcon from '@mui/icons-material/Delete'
import { articlesApi } from '@/api/articles'
import { Article, ArticleStatus } from '@/types/article'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function ArticleList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | undefined>()
  const [page, setPage] = useState(0)
  const [limit] = useState(10)
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; article: Article } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<Article | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['articles', 'admin', statusFilter, page, limit],
    queryFn: () => articlesApi.getAll(statusFilter, page, limit),
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => articlesApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('Article published successfully')
      setMenuAnchor(null)
    },
    onError: () => {
      toast.error('Failed to publish article')
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => articlesApi.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('Article unpublished successfully')
      setMenuAnchor(null)
    },
    onError: () => {
      toast.error('Failed to unpublish article')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('Article deleted successfully')
      setDeleteDialog(null)
      setMenuAnchor(null)
    },
    onError: () => {
      toast.error('Failed to delete article')
    },
  })

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.PUBLISHED:
        return 'success'
      case ArticleStatus.DRAFT:
        return 'warning'
      case ArticleStatus.UNPUBLISHED:
        return 'error'
      default:
        return 'default'
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, article: Article) => {
    setMenuAnchor({ el: event.currentTarget, article })
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handlePublish = () => {
    if (menuAnchor) {
      publishMutation.mutate(menuAnchor.article.id)
    }
  }

  const handleUnpublish = () => {
    if (menuAnchor) {
      unpublishMutation.mutate(menuAnchor.article.id)
    }
  }

  const handleDelete = () => {
    if (deleteDialog) {
      deleteMutation.mutate(deleteDialog.id)
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Articles</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/articles/new')}
        >
          New Article
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={3}>
        <Chip
          label="All"
          onClick={() => setStatusFilter(undefined)}
          color={statusFilter === undefined ? 'primary' : 'default'}
          variant={statusFilter === undefined ? 'filled' : 'outlined'}
        />
        <Chip
          label="Published"
          onClick={() => setStatusFilter(ArticleStatus.PUBLISHED)}
          color={statusFilter === ArticleStatus.PUBLISHED ? 'primary' : 'default'}
          variant={statusFilter === ArticleStatus.PUBLISHED ? 'filled' : 'outlined'}
        />
        <Chip
          label="Draft"
          onClick={() => setStatusFilter(ArticleStatus.DRAFT)}
          color={statusFilter === ArticleStatus.DRAFT ? 'primary' : 'default'}
          variant={statusFilter === ArticleStatus.DRAFT ? 'filled' : 'outlined'}
        />
        <Chip
          label="Unpublished"
          onClick={() => setStatusFilter(ArticleStatus.UNPUBLISHED)}
          color={statusFilter === ArticleStatus.UNPUBLISHED ? 'primary' : 'default'}
          variant={statusFilter === ArticleStatus.UNPUBLISHED ? 'filled' : 'outlined'}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No articles found
                </TableCell>
              </TableRow>
            ) : (
              data?.articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.slug}</TableCell>
                  <TableCell>
                    <Chip
                      label={article.status}
                      color={getStatusColor(article.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{article.metadata.author}</TableCell>
                  <TableCell>
                    {dayjs(article.createdAt).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, article)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/articles/${menuAnchor?.article.id}/edit`)
          handleMenuClose()
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        {menuAnchor?.article.status === ArticleStatus.DRAFT && (
          <MenuItem onClick={handlePublish}>
            <PublishIcon sx={{ mr: 1 }} fontSize="small" />
            Publish
          </MenuItem>
        )}
        {menuAnchor?.article.status === ArticleStatus.PUBLISHED && (
          <MenuItem onClick={handleUnpublish}>
            <UnpublishedIcon sx={{ mr: 1 }} fontSize="small" />
            Unpublish
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setDeleteDialog(menuAnchor?.article || null)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Article</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

