# IdeaHub Backend API

Production-ready backend for IdeaHub - A social platform for sharing and ranking startup ideas within university communities.

## 🚀 Features

- **Authentication & Authorization**
  - JWT access and refresh token flow
  - Email verification
  - Password reset functionality
  - Domain-restricted signup (configurable via environment variables)
  
- **User Management**
  - User profiles with bio and avatar
  - Follow/unfollow functionality
  - User search

- **Post/Idea Management**
  - Create, read, update, delete operations (soft delete)
  - Tag support
  - File attachments via S3
  - Share counting

- **Voting System**
  - Upvote/downvote with single vote per user enforcement
  - Real-time vote counting

- **Comments**
  - Nested comments support
  - Comment threading

- **Trending Algorithm**
  - Weighted scoring based on votes, comments, and shares
  - Time decay factor
  - Configurable weights via environment variables

- **Notifications**
  - Real-time notifications via Socket.IO
  - Email notifications via SendGrid

- **Admin Panel**
  - User management
  - Content moderation
  - Platform statistics

- **File Uploads**
  - AWS S3 integration
  - Image validation and optimization

- **Real-time Updates**
  - Socket.IO integration
  - Redis pub/sub for events

- **Security**
  - Helmet for HTTP headers
  - CORS configuration
  - Rate limiting
  - Input validation and sanitization
  - Bcrypt password hashing

## 📋 Prerequisites

- Node.js >= 18.x
- MongoDB Atlas account (or local MongoDB)
- Redis server
- AWS S3 bucket (for file uploads)
- SendGrid account (for emails)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and update with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=IdeaHub

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ideahub?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@ideahub.com
FRONTEND_URL=http://localhost:5173

# Allowed Email Domains (comma-separated)
ALLOWED_EMAIL_DOMAINS=dtu.ac.in

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=ideahub-uploads

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:5173

# Trending Algorithm Weights
VOTE_WEIGHT=1.0
COMMENT_WEIGHT=0.5
SHARE_WEIGHT=0.3
TIME_DECAY_HOURS=72
```

### 4. Start Redis (if running locally)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally
# macOS: brew install redis && brew services start redis
# Linux: sudo apt-get install redis-server && sudo service redis-server start
```

## 🚀 Running the Application

### Development mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api/docs`

### Production mode

```bash
npm run build
npm run start:prod
```

## 🗄️ Database Seeding

Seed the database with sample data:

```bash
npm run seed
```

This creates:
- Admin user: `admin@dtu.ac.in` / `Admin123!`
- 10 sample users: `user1@dtu.ac.in` / `User123!` (through user10)
- 5 sample posts with various tags

## 🐳 Docker

### Build and run with Docker Compose

```bash
docker-compose up -d
```

This starts:
- Backend API (port 3000)
- Redis (port 6379)

### Build Docker image only

```bash
docker build -t ideahub-backend .
```

## 🧪 Testing

### Run unit tests

```bash
npm test
```

### Run e2e tests

```bash
npm run test:e2e
```

### Test coverage

```bash
npm run test:cov
```

## 📚 API Documentation

### Swagger/OpenAPI

Access interactive API documentation at: `http://localhost:3000/api/docs`

### Postman Collection

Import the Postman collection from `postman/IdeaHub-API.postman_collection.json`

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

### Token Flow

1. Register: `POST /api/v1/auth/register`
2. Verify email using token from email
3. Login: `POST /api/v1/auth/login` (returns access and refresh tokens)
4. Use access token for authenticated requests
5. Refresh token when expired: `POST /api/v1/auth/refresh`

## 📊 Trending Algorithm

The trending score is calculated using a weighted formula:

```
score = (upvotes * VOTE_WEIGHT + comments * COMMENT_WEIGHT + shares * SHARE_WEIGHT)
        / (1 + hours_since_creation / TIME_DECAY_HOURS)
```

### Default Weights (configurable in .env)

- `VOTE_WEIGHT`: 1.0
- `COMMENT_WEIGHT`: 0.5
- `SHARE_WEIGHT`: 0.3
- `TIME_DECAY_HOURS`: 72

### How to Compute Scores

Trending scores are automatically recalculated when:
- A user votes on a post
- A comment is added
- A post is shared

To manually recalculate all scores (useful after changing weights):

```typescript
// Via API endpoint (admin only)
PUT /api/v1/admin/recalculate-scores
```

## 🌍 Adding Allowed Email Domains

Update the `ALLOWED_EMAIL_DOMAINS` environment variable:

```env
# Single domain
ALLOWED_EMAIL_DOMAINS=dtu.ac.in

# Multiple domains (comma-separated)
ALLOWED_EMAIL_DOMAINS=dtu.ac.in,iitd.ac.in,nitd.ac.in
```

Restart the server for changes to take effect.

## 🚀 Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Configure network access (add your IP or allow all)
4. Create a database user
5. Get connection string and update `MONGODB_URI` in `.env`

### AWS S3 Setup

1. Create an S3 bucket in AWS Console
2. Configure bucket policy for public read access (or use signed URLs)
3. Create IAM user with S3 permissions
4. Get access key and secret key
5. Update AWS credentials in `.env`

### SendGrid Setup

1. Create SendGrid account at https://sendgrid.com
2. Create an API key with full access
3. Verify sender email
4. Update `SENDGRID_API_KEY` and `FROM_EMAIL` in `.env`

### Example Deployment (Heroku)

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create ideahub-backend

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-jwt-secret>
# ... set all other env vars

# Deploy
git push heroku main

# Run seed
heroku run npm run seed
```

### Example Deployment (Railway/Render/Vercel)

1. Connect your GitHub repository
2. Configure environment variables in the platform
3. Set build command: `npm run build`
4. Set start command: `npm run start:prod`
5. Deploy

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── posts/             # Post/Idea management
│   ├── comments/          # Comments with nesting
│   ├── votes/             # Voting system
│   ├── notifications/     # Notifications
│   ├── admin/             # Admin functionality
│   ├── uploads/           # File upload handling
│   ├── realtime/          # Socket.IO gateway
│   ├── common/            # Shared utilities
│   │   ├── guards/        # Auth guards
│   │   ├── decorators/    # Custom decorators
│   │   └── redis/         # Redis service
│   ├── database/
│   │   └── seeds/         # Database seeding
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry
├── test/                  # E2E tests
├── .env.example           # Environment template
├── docker-compose.yml     # Docker composition
├── Dockerfile             # Docker image
└── package.json           # Dependencies
```

## 🔧 Development Scripts

```bash
npm run start          # Start in normal mode
npm run start:dev      # Start with watch mode
npm run start:debug    # Start with debug mode
npm run build          # Build for production
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run e2e tests
npm run seed           # Seed database
```

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.
