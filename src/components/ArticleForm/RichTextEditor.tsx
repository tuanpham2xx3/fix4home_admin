import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { Box } from '@mui/material'
import { API_BASE_URL } from '@/config/api'
import { getCookie } from '@/utils/cookies'

// Import TinyMCE core
import 'tinymce/tinymce'

// Import TinyMCE icons (required)
import 'tinymce/icons/default'

// Import TinyMCE theme
import 'tinymce/themes/silver'

// Import TinyMCE models (required for v6+)
import 'tinymce/models/dom'

// Import TinyMCE CSS for styling
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/content/default/content.min.css'

// Import TinyMCE plugins
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/help'
import 'tinymce/plugins/wordcount'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  height?: number
  disabled?: boolean
}

export default function RichTextEditor({ value, onChange, height = 400, disabled = false }: RichTextEditorProps) {
  const editorRef = useRef<any>(null)

  // Use API key from env variable if provided, otherwise use self-hosted (no key needed)
  // Only pass apiKey prop if it exists, otherwise omit it completely for self-hosted mode
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY

  // Build editor props - only include apiKey if it exists
  const editorProps: any = {
    disabled,
    onInit: (_evt: any, editor: any) => {
      editorRef.current = editor
      // Enable editor if not disabled
      if (!disabled) {
        editor.mode.set('design')
      }
    },
    value,
    onEditorChange: (content: string) => {
      if (!disabled) {
        onChange(content)
      }
    },
    init: {
      height,
      menubar: true,
      readonly: disabled,
      license_key: 'gpl', // Required for self-hosted (free version)
      skin_url: '/tinymce/skins/ui/oxide', // Path to skins in public folder
      content_css: '/tinymce/skins/content/default/content.min.css', // Path to content CSS
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
      // Image upload handler
      automatic_uploads: true,
      images_upload_handler: async (blobInfo: any, progress: (percent: number) => void) => {
        return new Promise((resolve, reject) => {
          // Get auth token from cookie only
          const token = getCookie('token')
          if (!token) {
            console.error('❌ [TinyMCE Upload] No authentication token found')
            reject({ message: 'User not authenticated. Please login and try again.', remove: true })
            return
          }

          const formData = new FormData()
          formData.append('file', blobInfo.blob(), blobInfo.filename())
          formData.append('isPublic', 'true')

          // Use XMLHttpRequest for upload progress
          const xhr = new XMLHttpRequest()
          xhr.withCredentials = false

          const uploadUrl = `${API_BASE_URL}/images/upload`
          console.log('📤 [TinyMCE Upload] Starting upload:', {
            fileName: blobInfo.filename(),
            fileSize: blobInfo.blob().size,
            url: uploadUrl,
            hasToken: !!token,
          })

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 100
              progress(percent)
              console.log(`📊 [TinyMCE Upload] Progress: ${percent.toFixed(1)}%`)
            }
          })

          xhr.addEventListener('load', () => {
            console.log('📥 [TinyMCE Upload] Response received:', {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText.substring(0, 200),
            })

            // Handle authentication errors
            if (xhr.status === 401 || xhr.status === 403) {
              console.error('❌ [TinyMCE Upload] Authentication error:', xhr.status)
              try {
                const json = JSON.parse(xhr.responseText)
                reject({ 
                  message: json.message || json.userMessage || 'User not authenticated. Please login and try again.', 
                  remove: true 
                })
              } catch {
                reject({ 
                  message: 'User not authenticated. Please login and try again.', 
                  remove: true 
                })
              }
              return
            }

            if (xhr.status < 200 || xhr.status >= 300) {
              console.error('❌ [TinyMCE Upload] HTTP error:', xhr.status)
              try {
                const json = JSON.parse(xhr.responseText)
                reject(json.message || json.userMessage || `HTTP Error: ${xhr.status}`)
              } catch {
                reject(`HTTP Error: ${xhr.status} ${xhr.statusText}`)
              }
              return
            }

            try {
              const json = JSON.parse(xhr.responseText)
              console.log('✅ [TinyMCE Upload] Upload successful:', json)
              
              // Support both fileUrl and url field names
              const imageUrl = json.data?.fileUrl || json.data?.url
              if (imageUrl) {
                resolve(imageUrl)
              } else {
                console.error('❌ [TinyMCE Upload] No URL in response:', json)
                reject('Invalid response: No image URL returned')
              }
            } catch (e) {
              console.error('❌ [TinyMCE Upload] JSON parse error:', e, xhr.responseText)
              reject('Invalid JSON response: ' + xhr.responseText.substring(0, 100))
            }
          })

          xhr.addEventListener('error', (e) => {
            console.error('❌ [TinyMCE Upload] Network error:', e)
            reject('Image upload failed: Network error')
          })

          xhr.addEventListener('abort', () => {
            console.warn('⚠️ [TinyMCE Upload] Upload aborted')
            reject('Image upload aborted')
          })

          xhr.open('POST', uploadUrl)
          
          // Set Authorization header
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          
          // Don't set Content-Type - let browser set it with boundary
          
          console.log('📡 [TinyMCE Upload] Sending request to:', uploadUrl)
          xhr.send(formData)
        })
      },
      // Ensure editor is editable
      setup: (editor: any) => {
        editor.on('init', () => {
          if (!disabled) {
            editor.mode.set('design')
          }
        })
      },
    },
  }

  // Only add apiKey if it exists (for cloud mode), otherwise use self-hosted
  if (apiKey) {
    editorProps.apiKey = apiKey
  }

  return (
    <Box sx={{ '& .tox-tinymce': { border: '1px solid #ccc', borderRadius: 1 } }}>
      <Editor {...editorProps} />
    </Box>
  )
}

