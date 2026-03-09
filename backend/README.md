# FeedMind Backend API

Express.js backend API server for FeedMind application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev

# Start production server
npm start
```

## 📂 Project Structure

```
backend/
├── server.js              # Main Express server
├── config/
│   └── index.js          # Configuration
├── controllers/
│   └── aiController.js   # AI/LLM logic
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── forms.js          # Form management routes
│   ├── ai.js             # AI generation routes
│   ├── nlp.js            # NLP model integration
│   ├── data.js           # Data upload routes
│   ├── submit.js         # Form submission (public)
│   └── user.js           # User profile routes
├── services/
│   └── nlp.js            # NLP service client
└── utils/
    ├── prisma.js         # Prisma client
    └── helpers.js        # Utility functions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Email login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Logout

### Forms
- `GET /api/forms` - Get all user forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:formId` - Get specific form
- `PUT /api/forms/:formId` - Update form
- `DELETE /api/forms/:formId` - Delete form
- `POST /api/forms/:formId/publish` - Toggle publish status
- `GET /api/forms/:formId/responses` - Get form responses

### AI
- `POST /api/ai/generate-form` - Generate form from prompt
- `POST /api/ai/suggest-questions` - Suggest questions
- `POST /api/ai/analyze` - Analyze form responses

### Submissions
- `POST /api/submit/:formId` - Submit form response (public)
- `GET /api/submit/:formId/public` - Get public form details

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/apikey` - Update API key
- `DELETE /api/user/account` - Delete account

### Data
- `POST /api/data/upload` - Upload file for NLP
- `POST /api/data/train` - Train NLP model

### NLP
- `POST /api/nlp/suggest-questions` - NLP question suggestions
- `POST /api/nlp/suggest-from-document` - Generate from document

### Health
- `GET /health` - Health check
- `GET /status` - Service status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 🛠 Technologies

- **Express.js** - Web framework
- **Prisma** - Database ORM
- **JWT** - Authentication
- **GROQ SDK** - AI/LLM integration
- **Multer** - File uploads
- **CORS** - Cross-origin support

## 📝 Environment Variables

See `.env.example` for all required configuration variables.

## 🔗 Related

- Frontend: `../frontend/`
- NLP Model: `../nlp_model/`
- Database Schema: `../prisma/`

## 📄 License

MIT
