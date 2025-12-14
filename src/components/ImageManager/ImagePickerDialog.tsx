import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ImageManager from './ImageManager'

interface ImagePickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function ImagePickerDialog({ open, onClose, onSelect }: ImagePickerDialogProps) {
  const handleSelect = (url: string) => {
    onSelect(url)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Select Image
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ImageManager onSelectImage={handleSelect} selectMode={true} />
      </DialogContent>
    </Dialog>
  )
}

