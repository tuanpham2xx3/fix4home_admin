# Fix4Home Admin Web

React frontend application for managing news articles in the Fix4Home platform.

## Features

- 📝 Article Management (Create, Read, Update, Delete)
- 📊 Dashboard with article statistics
- 🔐 Admin authentication
- ✏️ Rich Text Editor (TinyMCE) for article content
- 📱 Responsive design with Material-UI
- 🔄 Real-time updates with React Query

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Material-UI (MUI)** - UI components
- **React Router v6** - Routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Yup** - Validation
- **TinyMCE** - Rich Text Editor
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8100`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8100/api/v1
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
ADMIN_WEB/
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable components
│   │   ├── Layout/      # Layout components
│   │   └── ArticleForm/  # Article form components
│   ├── config/           # Configuration files
│   ├── pages/            # Page components
│   │   ├── Articles/     # Article management pages
│   │   └── Login.tsx    # Login page
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── package.json
└── vite.config.ts
```

## API Integration

The app connects to the backend API at `http://localhost:8100/api/v1`.

### Authentication

- Login endpoint: `POST /auth/login`
- JWT token stored in localStorage
- Token automatically added to request headers

### Article Endpoints

- List articles: `GET /articles/admin`
- Get article: `GET /articles/admin/{id}`
- Create article: `POST /articles`
- Update article: `PUT /articles/{id}`
- Publish article: `POST /articles/{id}/publish`
- Unpublish article: `POST /articles/{id}/unpublish`
- Delete article: `DELETE /articles/{id}`

## Features

### Article Management

- Create new articles with rich text content
- Edit existing articles
- Publish/Unpublish articles
- Delete articles
- Filter articles by status (All, Published, Draft, Unpublished)
- View article statistics on dashboard

### Rich Text Editor

The app uses TinyMCE for rich text editing. To use the full version, you need to:

1. Get a TinyMCE API key from [tinymce.com](https://www.tiny.cloud/)
2. Update the API key in `src/components/ArticleForm/RichTextEditor.tsx`

Or use the self-hosted version by configuring TinyMCE differently.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Notes

- Make sure the backend API is running before starting the frontend
- Default admin credentials should be set up in the backend
- The app requires ADMIN role to access

