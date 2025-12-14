import { useRef, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { Box } from '@mui/material'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  height?: number
}

export default function RichTextEditor({ value, onChange, height = 400 }: RichTextEditorProps) {
  const editorRef = useRef<any>(null)

  return (
    <Box sx={{ '& .tox-tinymce': { border: '1px solid #ccc', borderRadius: 1 } }}>
      <Editor
        apiKey="no-api-key" // Replace with your TinyMCE API key or use self-hosted
        onInit={(evt, editor) => {
          editorRef.current = editor
        }}
        value={value}
        onEditorChange={(content) => {
          onChange(content)
        }}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          branding: false,
        }}
      />
    </Box>
  )
}

