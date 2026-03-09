# FeedMind - Quick Start Guide

## 🎯 What Was Done

Your project has been restructured to separate frontend and backend, similar to the [rag-incident-responder](https://github.com/Nithinbharathi93/rag-incident-responder) repository structure:

### ✅ Completed
- **Backend** - Fully converted to Express.js with JavaScript
  - Created Express server at `backend/server.js`
  - Converted all API routes from Next.js to Express
  - Implemented JWT authentication
  - Created all route handlers, controllers, and middleware
  - Set up Prisma integration
  
- **Frontend Structure** - Set up with JavaScript configuration
  - Created frontend directory with Next.js config
  - Set up package.json and configuration files
  - Created example structures and patterns
  
- **Documentation** - Comprehensive guides created
  - `PROJECT_README.md` - Main project documentation
  - `MIGRATION_GUIDE.md` - Complete TypeScript to JavaScript conversion guide
  - `backend/README.md` - Backend API documentation
  - `frontend/README.md` - Frontend setup guide

### 📝 Next Steps (For You)

1. **Convert Frontend Files** - Use the conversion script:
   ```bash
   node convert-ts-to-js.mjs app/
   node convert-ts-to-js.mjs components/
   node convert-ts-to-js.mjs lib/
   ```

2. **Move Files to Frontend**:
   ```bash
   # Copy converted files to frontend directory
   cp -r app/* frontend/app/
   cp -r components/* frontend/components/
   cp -r lib/* frontend/lib/
   ```

3. **Update API Calls** - Replace direct database calls with API requests

## 🚀 Starting the Application

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start backend (runs on http://localhost:3001)
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env to point to backend: NEXT_PUBLIC_API_URL=http://localhost:3001

# Start frontend (runs on http://localhost:3000)
npm run dev
```

### 3. NLP Model (Optional)

```bash
# Navigate to NLP model (in a new terminal)
cd nlp_model

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start NLP API (runs on http://localhost:8000)
python run_api.py
```

## 📁 New Project Structure

```
feedmind/
├── backend/                    # Express.js API (Port 3001) ✅
│   ├── server.js              # Main server
│   ├── routes/                # API endpoints
│   ├── controllers/           # Business logic
│   ├── middleware/            # Authentication
│   ├── services/              # External services
│   ├── config/                # Configuration
│   └── utils/                 # Helpers
│
├── frontend/                  # Next.js App (Port 3000) 🔄
│   ├── app/                   # Pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── package.json
│
├── nlp_model/                 # Python NLP API (Port 8000)
│   ├── api/                   # FastAPI routes
│   └── core/                  # ML models
│
├── prisma/                    # Database schema (shared)
│   └── schema.prisma
│
├── PROJECT_README.md          # Main documentation
├── MIGRATION_GUIDE.md         # Conversion guide
└── convert-ts-to-js.mjs       # Conversion script
```

## 🔧 Key Changes

### Backend
- **TypeScript → JavaScript**: All code converted
- **Next.js API → Express**: RESTful API structure
- **Next-Auth → JWT**: Token-based authentication
- **API Routes**: `/api/auth`, `/api/forms`, `/api/ai`, etc.

### Frontend
- **Structure**: Ready for JavaScript components
- **API Calls**: External backend API instead of Next.js routes
- **Auth**: JWT token storage and management

## 📖 Documentation

- [PROJECT_README.md](PROJECT_README.md) - Complete project overview
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Detailed conversion guide
- [backend/README.md](backend/README.md) - Backend API docs
- [frontend/README.md](frontend/README.md) - Frontend setup guide

## 🔐 Authentication Flow

1. User enters email on login page
2. Frontend calls `POST http://localhost:3001/api/auth/login`
3. Backend returns JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in all API requests:
   ```javascript
   Authorization: Bearer <token>
   ```

## 🛠 Available Commands

### Backend
```bash
npm run dev          # Start with auto-reload
npm start            # Production start
npm run prisma:*     # Database operations
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production build
```

## 🐛 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` in backend/.env
- Run `npm run prisma:generate`
- Ensure PostgreSQL is running

### Frontend can't connect
- Check `NEXT_PUBLIC_API_URL` in frontend/.env
- Verify backend is running
- Check browser console for CORS errors

### Database errors
- Run: `cd backend && npm run prisma:migrate`
- Verify database connection
- Check Prisma schema

## 📞 Need Help?

1. Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for conversion examples
2. Review [PROJECT_README.md](PROJECT_README.md) for architecture details
3. See API documentation in [backend/README.md](backend/README.md)

## ⚡ Quick Test

After starting both servers:

```bash
# Test backend health
curl http://localhost:3001/health

# Test login (returns JWT token)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Visit frontend
open http://localhost:3000
```

---

**Status**: Backend ✅ Complete | Frontend 🔄 Ready for conversion

Follow the steps above to complete your migration!
