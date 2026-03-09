# FeedMind - Separated Frontend & Backend Architecture

This project has been restructured to separate frontend and backend into distinct Node.js applications, following the architecture pattern from [rag-incident-responder](https://github.com/Nithinbharathi93/rag-incident-responder).

## 📁 New Project Structure

```
feedmind/
├── backend/                    # Express.js API Server (Port 3001)
│   ├── server.js              # Main server file
│   ├── config/                # Configuration
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth & other middleware
│   ├── routes/                # API route handlers
│   ├── services/              # External services (NLP, etc.)
│   ├── utils/                 # Utilities & helpers
│   ├── package.json
│   └── README.md
│
├── frontend/                  # Next.js Application (Port 3000)
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components (JS)
│   ├── lib/                   # Frontend utilities
│   ├── public/                # Static assets
│   ├── styles/                # Global styles
│   ├── package.json
│   └── next.config.mjs
│
├── nlp_model/                 # Python NLP API (Port 8000)
│   ├── api/                   # FastAPI routes
│   ├── core/                  # ML models
│   ├── data/                  # Training data
│   └── requirements.txt
│
├── prisma/                    # Database schema (shared)
│   └── schema.prisma
│
├── MIGRATION_GUIDE.md         # Step-by-step conversion guide
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+ (for NLP model)
- PostgreSQL database
- Redis (optional, for sessions)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on **http://localhost:3001**

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env to point to backend API

# Start frontend server
npm run dev
```

Frontend will run on **http://localhost:3000**

### 3. NLP Model Setup (Optional)

```bash
# Navigate to NLP model
cd nlp_model

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start NLP API
python run_api.py
```

NLP API will run on **http://localhost:8000**

## 🔄 Key Changes from Original Structure

### Backend (TypeScript → JavaScript Express)
- ✅ Converted Next.js API routes to Express.js routes
- ✅ Replaced Next-Auth with JWT authentication
- ✅ Created RESTful API structure
- ✅ Separated business logic into controllers
- ✅ All code converted from TypeScript to JavaScript

### Frontend (TypeScript → JavaScript)
- Frontend directory contains the Next.js app structure
- All `.ts` and `.tsx` files need to be converted to `.js` and `.jsx`
- Updated to use external API calls instead of Next.js API routes
- See `MIGRATION_GUIDE.md` for conversion instructions

### Database
- Prisma schema remains at root level (shared between services)
- Backend uses Prisma Client for database operations

## 🔐 Authentication Flow

**Old:** Next-Auth with built-in API routes
**New:** JWT-based authentication

1. Frontend sends credentials to `POST /api/auth/login`
2. Backend validates and returns JWT token
3. Frontend stores token (localStorage/cookies)
4. Frontend includes token in Authorization header: `Bearer <token>`
5. Backend middleware validates token on protected routes

## 📡 API Communication

Frontend communicates with backend via HTTP:

```javascript
// Example API call from frontend
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forms`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🛠 Development Workflow

### Running All Services

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: NLP Model (optional)
cd nlp_model && python run_api.py
```

### Database Operations

```bash
# From backend directory
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Run migrations
npm run prisma:generate    # Generate Prisma Client
```

## 🔧 Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT secret key
- `GROQ_API_KEY` - AI API key
- `PORT` - Backend port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend URL

## 📦 NPM Scripts

### Backend
- `npm run dev` - Start with auto-reload
- `npm start` - Production start
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations

### Frontend
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚢 Deployment

### Backend
- Deploy to services like Railway, Render, or DigitalOcean
- Set environment variables
- Run `npm run prisma:generate` and `npm run prisma:migrate` on first deploy

### Frontend
- Deploy to Vercel, Netlify, or any Node.js hosting
- Set `NEXT_PUBLIC_API_URL` to your backend URL

### Database
- Use managed PostgreSQL (Railway, Supabase, Neon, etc.)
- Update `DATABASE_URL` in backend environment

## 📚 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Migration Guide](./MIGRATION_GUIDE.md) - Complete TypeScript to JavaScript conversion guide
- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

When contributing:
1. Backend changes go in `backend/` directory
2. Frontend changes go in `frontend/` directory
3. Keep components in JavaScript (no TypeScript)
4. Follow existing code patterns
5. Update documentation as needed

## 📝 Migration Status

- ✅ Backend fully converted to Express.js + JavaScript
- ✅ Backend API routes implemented
- ✅ Authentication system (JWT)
- ✅ Configuration files created
- ⏳ Frontend components need manual conversion (see MIGRATION_GUIDE.md)
- ⏳ Frontend API integration needs updating

## 🐛 Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Run `npm run prisma:generate`
- Ensure PostgreSQL is running

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in frontend .env
- Verify backend is running on correct port
- Check CORS configuration in backend

### Database errors
- Run migrations: `npm run prisma:migrate`
- Check Prisma schema syntax
- Verify database connection

## 📄 License

MIT

---

**Need Help?** Check the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed conversion instructions.
