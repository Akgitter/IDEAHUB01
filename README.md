# IdeaHub - University Startup Ideas Platform

A complete full-stack web application for university students to share, discuss, and rate startup ideas within their community.

## 🌟 Features

### Core Features
- **Authentication & Authorization**: Secure JWT-based authentication with email verification and password reset
- **Domain-Restricted Signup**: Configurable email domain restrictions (default: @dtu.ac.in)
- **Live Feed**: Browse and discover innovative startup ideas with cursor pagination
- **Post Ideas**: Share startup concepts with rich descriptions, tags, and file attachments
- **Interactive Voting**: Smart upvote/downvote system with single vote per user enforcement
- **Nested Comments**: Engage in discussions with threaded comment replies
- **User Profiles**: Comprehensive profiles with bio, avatar, and activity tracking
- **Follow System**: Follow other users and get personalized feeds
- **Real-time Updates**: Live notifications via Socket.IO
- **Trending Algorithm**: Intelligent ranking based on votes, comments, shares, and time decay
- **Share Tracking**: Track how many times ideas are shared
- **Admin Panel**: Platform management and content moderation

### Advanced Features
- **File Uploads**: S3-integrated image and document uploads
- **Email Notifications**: SendGrid-powered email system
- **Redis Caching**: Performance optimization with Redis
- **Soft Deletes**: Safe content deletion with recovery options
- **Rate Limiting**: Protection against abuse
- **API Documentation**: Interactive Swagger/OpenAPI docs

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: CSS Modules with modern, minimal design
- **State Management**: React Context API

### Backend (New! 🎉)
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **Caching**: Redis for performance and pub/sub
- **Authentication**: JWT (access + refresh tokens)
- **File Storage**: AWS S3
- **Email**: SendGrid
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, rate limiting, input validation
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI, Postman collection

## 📁 Project Structure

```
IDEAHUB01/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React Context providers
│   ├── services/          # Service layer
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   ├── types/             # TypeScript type definitions
│   └── styles/            # CSS stylesheets
│
└── backend/               # NestJS Backend API
    ├── src/
    │   ├── auth/          # Authentication module
    │   ├── users/         # User management
    │   ├── posts/         # Post/Idea management
    │   ├── comments/      # Comments with nesting
    │   ├── votes/         # Voting system
    │   ├── notifications/ # Notifications
    │   ├── admin/         # Admin functionality
    │   ├── uploads/       # File upload handling
    │   ├── realtime/      # Socket.IO gateway
    │   └── common/        # Shared utilities
    ├── test/              # E2E tests
    ├── README.md          # Backend documentation
    ├── DEV-RUNBOOK.md     # Developer guide
    ├── SCHEMA.md          # Database schema
    └── docker-compose.yml # Docker configuration
```
│   ├── Feed.css
│   ├── PostIdea.css
│   ├── Profile.css
│   ├── IdeaCard.css
│   └── Layout.css
├── config/             # Configuration files
│   └── index.ts
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites

**Frontend:**
- Node.js >= 16.x
- npm or yarn

**Backend:**
- Node.js >= 18.x
- MongoDB Atlas account (or local MongoDB)
- Redis server
- AWS S3 bucket (for file uploads)
- SendGrid account (for emails)

### Frontend Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd IDEAHUB01
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file (optional):**
```bash
cp .env.example .env
```

4. **Run the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start Redis** (required):
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

5. **Seed the database:**
```bash
npm run seed
```

6. **Start the backend server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/docs`

### Running with Docker

```bash
cd backend
docker-compose up -d
```

This starts both the backend API and Redis.

## 📚 Documentation

- **Backend README**: `backend/README.md` - Comprehensive backend documentation
- **Developer Runbook**: `backend/DEV-RUNBOOK.md` - Development guides and common tasks
- **Database Schema**: `backend/SCHEMA.md` - Complete database schema documentation
- **API Documentation**: `http://localhost:3000/api/docs` - Interactive Swagger docs
- **Postman Collection**: `backend/postman/IdeaHub-API.postman_collection.json`

## 🔐 Sample Credentials

After running the seed script:
- **Admin**: `admin@dtu.ac.in` / `Admin123!`
- **User**: `user1@dtu.ac.in` / `User123!` (through `user10@dtu.ac.in`)

## 🧪 Testing

### Frontend
```bash
npm run lint
npm run build
```

### Backend
```bash
cd backend
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report
npm run lint          # Linting
```

## 🔧 Key Backend Features

### Authentication Flow
1. Register with university email
2. Verify email via token
3. Login to receive JWT access + refresh tokens
4. Use tokens for authenticated requests
5. Refresh when access token expires

### Trending Algorithm
Posts are ranked using a weighted formula:
```
score = (netVotes × 1.0 + comments × 0.5 + shares × 0.3) / (1 + hoursSinceCreation / 72)
```
Weights are configurable via environment variables.

### Email Domain Configuration
Add/modify allowed domains in `.env`:
```env
ALLOWED_EMAIL_DOMAINS=dtu.ac.in,iitd.ac.in,nitd.ac.in
```

## 💡 Usage

### Frontend Application
1. **Login**: Enter your university email (@dtu.ac.in)
2. **Browse Feed**: View all shared ideas with voting and comments
3. **Post Idea**: Share your startup concept with tags
4. **Interact**: Vote, comment, share, and follow users
5. **Profile**: Manage your profile and view your activity

### API Endpoints (Backend)

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/refresh` - Refresh access token

**Posts:**
- `GET /api/v1/posts` - Get all posts (cursor pagination)
- `GET /api/v1/posts/trending` - Get trending posts
- `POST /api/v1/posts` - Create post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post (soft)

**Votes:**
- `POST /api/v1/votes/upvote/:postId` - Upvote post
- `POST /api/v1/votes/downvote/:postId` - Downvote post
- `DELETE /api/v1/votes/:postId` - Remove vote

**Comments:**
- `POST /api/v1/comments` - Create comment
- `GET /api/v1/comments/post/:postId` - Get post comments
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

See full API documentation at: `http://localhost:3000/api/docs`

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy

### Backend (Heroku/Railway/Render)

**MongoDB Atlas Setup:**
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Configure network access
3. Create database user
4. Get connection string → Update `MONGODB_URI` in environment

**Deploy to Heroku:**
```bash
heroku create ideahub-backend
heroku addons:create heroku-redis:hobby-dev
heroku config:set MONGODB_URI=<your-uri>
heroku config:set JWT_SECRET=<your-secret>
# ... set all other env vars
git push heroku main
heroku run npm run seed
```

See `backend/README.md` for detailed deployment instructions.

## 📈 Development Roadmap

Current features are complete! Future enhancements could include:
- [ ] Advanced search with filters
- [ ] Real-time collaboration on ideas
- [ ] Idea categories and tagging system
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered idea suggestions
- [ ] Integration with project management tools
- [ ] Gamification and achievements

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Frontend issues: Open an issue in GitHub
- Backend issues: See `backend/DEV-RUNBOOK.md` for troubleshooting
- API documentation: `http://localhost:3000/api/docs`

## 👏 Acknowledgments

Built with:
- React 18
- NestJS
- MongoDB Atlas
- Redis
- Socket.IO
- AWS S3
- SendGrid
- And many other amazing open-source technologies!

