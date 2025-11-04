# Quick Start Guide - IdeaHub Full Stack Application

This guide will help you get the complete IdeaHub application (frontend + backend) running on your local machine.

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Quick Setup (5 minutes)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vite-react
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

**Backend Configuration** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
# Minimum required configuration
MONGODB_URI=mongodb://localhost:27017/ideahub
JWT_SECRET=your_super_secret_jwt_key_change_this
FRONTEND_URL=http://localhost:5173

# Optional: Email configuration (for email verification)
# Leave commented out for development - emails will log to console
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
```

**Frontend Configuration** (`.env` in root):
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas** (Recommended for production)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `backend/.env`

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 6. Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Creating Your First Account

1. Click **Login** or navigate to the login page
2. Enter your details:
   - Name: Your Name
   - Email: yourname@dtu.ac.in (must be @dtu.ac.in)
   - Password: At least 6 characters with uppercase, lowercase, and number
3. Click **Register**
4. Check the **backend terminal** for the verification token (since email is not configured)
5. Verify your email:
   - Copy the verification URL from the backend logs
   - Paste it in your browser, or
   - Use the API directly (see below)

### Manual Email Verification (Development)

If email is not configured, you'll see the verification token in backend logs:
```
Email would be sent to: yourname@dtu.ac.in
Subject: Verify Your Email - IdeaHub
```

Copy the token from the URL and use it to verify:

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'
```

**Using browser console:**
```javascript
fetch('http://localhost:5000/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'YOUR_TOKEN_HERE' })
}).then(r => r.json()).then(console.log)
```

Now you can log in and start using the app!

## Testing the Features

### 1. Create an Idea

1. After logging in, click **Post Idea**
2. Fill in the details:
   - Title: Your startup idea title
   - Description: Detailed description
   - Tags: Optional tags (e.g., AI, Education, FinTech)
3. Click **Post**

### 2. Vote on Ideas

- Click the ⬆️ icon to upvote
- Click the ⬇️ icon to downvote
- Your votes affect the ranking

### 3. Comment on Ideas

1. Click on an idea to view details
2. Scroll to comments section
3. Add your comment
4. Submit

### 4. Follow Users

1. Go to **Profile**
2. Search for other users
3. Click **Follow**

## Common Issues & Solutions

### MongoDB Connection Error

**Error:** `Error connecting to MongoDB`

**Solutions:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- For local MongoDB: `mongodb://localhost:27017/ideahub`
- For Atlas: Use the connection string from Atlas dashboard

### CORS Error

**Error:** `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS`

**Solutions:**
- Check `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Restart the backend server
- Clear browser cache

### Email Verification Issues

**Error:** `Email not verified`

**Solutions:**
- Check backend logs for verification token
- Use manual verification method (see above)
- Or configure email settings in `backend/.env`

### Port Already in Use

**Error:** `Port 5000 is already in use` or `Port 5173 is already in use`

**Solutions:**
- Kill the process using the port:
  ```bash
  # macOS/Linux
  lsof -ti:5000 | xargs kill
  lsof -ti:5173 | xargs kill
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```
- Or change the port in configuration files

### JWT Token Expired

**Error:** `Invalid or expired token`

**Solutions:**
- Log out and log in again
- Tokens expire after 7 days by default
- Clear localStorage: `localStorage.clear()`

## Development Workflow

### Making Changes

**Frontend changes:**
- Edit files in `src/`
- Vite will auto-reload
- Check browser console for errors

**Backend changes:**
- Edit files in `backend/src/`
- tsx watch will auto-reload
- Check terminal for errors

### Building for Production

**Frontend:**
```bash
npm run build
# Output in dist/
```

**Backend:**
```bash
cd backend
npm run build
# Output in backend/dist/
```

### Running Tests

**Lint code:**
```bash
# Frontend
npm run lint

# Backend
cd backend
npm run lint
```

**Build check:**
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

## Project Structure

```
vite-react/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   ├── utils/          # Utilities
│   │   └── config/         # Configuration
│   ├── package.json
│   └── .env
├── src/                    # Frontend React app
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── services/         # API service
│   └── types/            # TypeScript types
├── package.json
├── .env
└── README.md
```

## API Documentation

See detailed API documentation in [backend/README.md](backend/README.md)

### Quick API Reference

**Authentication:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/verify-email` - Verify email
- GET `/api/auth/me` - Get current user

**Ideas:**
- GET `/api/ideas` - List all ideas
- POST `/api/ideas` - Create idea (auth required)
- POST `/api/ideas/:id/upvote` - Upvote (auth required)
- POST `/api/ideas/:id/downvote` - Downvote (auth required)

**Comments:**
- GET `/api/comments/idea/:ideaId` - Get comments
- POST `/api/comments/idea/:ideaId` - Add comment (auth required)

**Users:**
- GET `/api/users/search?query=` - Search users
- POST `/api/users/:id/follow` - Follow user (auth required)

## Next Steps

1. **Configure Email**: Set up email service for production-ready verification
2. **Customize Domain**: Change `ALLOWED_EMAIL_DOMAIN` in backend config
3. **Deploy**: See deployment guides for Vercel (frontend) and Render (backend)
4. **Explore**: Check out the integration guide for more details

## Resources

- [Backend README](backend/README.md) - Complete backend documentation
- [Integration Guide](INTEGRATION_GUIDE.md) - Frontend-backend integration
- [Security Summary](SECURITY_SUMMARY.md) - Security features and best practices
- [Main README](README.md) - Project overview and features

## Support

For issues or questions:
1. Check this guide first
2. Review the documentation
3. Create an issue on GitHub

## License

MIT License - See LICENSE file for details
