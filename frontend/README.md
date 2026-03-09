# FeedMind Frontend

Next.js-based frontend application for FeedMind.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
```

Frontend will be available at **http://localhost:3000**

## 📁 Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard pages (grouped route)
│   ├── auth/              # Authentication pages
│   ├── f/                 # Public form pages
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Home page
│   └── providers.jsx      # Context providers
│
├── components/            # React components
│   ├── analytics/        # Analytics components
│   ├── dashboard/        # Dashboard components
│   ├── forms/            # Form builder components
│   ├── shared/           # Shared components
│   └── ui/               # UI primitives
│
├── lib/                  # Utilities and libraries
│   ├── api/              # API client functions
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   └── utils.js          # Helper functions
│
├── public/               # Static assets
├── styles/               # Global styles
└── package.json
```

## 🔌 API Integration

The frontend communicates with the backend API at `NEXT_PUBLIC_API_URL`.

### Example API Client

```javascript
// lib/api/client.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Usage
import { apiRequest } from '@/lib/api/client.js';

const forms = await apiRequest('/api/forms');
const newForm = await apiRequest('/api/forms', {
  method: 'POST',
  body: JSON.stringify(formData),
});
```

## 🔐 Authentication

Authentication is handled via JWT tokens stored in localStorage.

### Auth Context

```javascript
// lib/contexts/AuthContext.jsx
import { useAuth } from '@/lib/contexts/AuthContext.jsx';

function MyComponent() {
  const { user, token, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Protected Routes

```javascript
// middleware.js (if using Next.js middleware)
export function middleware(request) {
  const token = request.cookies.get('auth_token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/forms/:path*'],
};
```

## 🎨 Styling

The project uses **Tailwind CSS** with custom theming.

### Theme Customization

Edit `tailwind.config.js` to customize colors, spacing, etc.

### Global Styles

Global styles are in `app/globals.css`.

## 📦 Components

### UI Components

Pre-built UI components powered by Radix UI in `components/ui/`.

```javascript
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
```

### Form Builder

Form builder components in `components/forms/`:
- `form-builder.jsx` - Main form builder
- `question-card.jsx` - Question editing card
- `ai-prompt-panel.jsx` - AI generation panel

### Dashboard

Dashboard components in `components/dashboard/`:
- `stats-card.jsx` - Statistics display
- `form-list.jsx` - Forms list
- `response-chart.jsx` - Response charts

## 🛠 Development

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Adding New Pages

1. Create file in `app/` directory
2. Export default component
3. Use `layout.jsx` for shared layouts

```javascript
// app/my-page/page.jsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Adding New API Functions

```javascript
// lib/api/myResource.js
import { apiRequest } from './client.js';

export async function getResource(id) {
  return apiRequest(`/api/resource/${id}`);
}

export async function createResource(data) {
  return apiRequest('/api/resource', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set in deployment platform:
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Build

```bash
npm run build
npm start
```

## 🔧 Troubleshooting

### API Connection Issues

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend is running
3. Check browser console for CORS errors

### Import Errors

Make sure to include `.js` or `.jsx` extensions:

```javascript
// Wrong
import { MyComponent } from './MyComponent';

// Correct
import { MyComponent } from './MyComponent.jsx';
```

### Authentication Issues

1. Check token is stored correctly
2. Verify token format in API requests
3. Check backend CORS settings

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

## 📄 License

MIT
