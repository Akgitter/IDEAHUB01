# IdeaHub Backend API

Backend API for IdeaHub - A university startup ideas platform built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **JWT Authentication**: Secure user authentication with JSON Web Tokens
- **Email Verification**: User email verification with token-based system
- **Password Reset**: Secure password reset flow with email notifications
- **RESTful API**: Clean and well-structured REST API endpoints
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **Input Validation**: Request validation and sanitization
- **Security**: Helmet, CORS, rate limiting, and bcrypt password hashing
- **TypeScript**: Full TypeScript support for type safety
- **Email Domain Restriction**: Configurable email domain validation (@dtu.ac.in)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Security**: Helmet, CORS, express-rate-limit
- **Development**: tsx (for hot reload)

## Prerequisites

- Node.js v16 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file with appropriate values (see Configuration section below)

## Configuration

Edit the `.env` file with your configuration:

### Required Configuration

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/ideahub

# JWT secret (use a strong random string in production)
JWT_SECRET=your_secure_random_string_here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### Email Configuration (Optional for Development)

For email verification to work, configure one of these options:

#### Option 1: Gmail (Development)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

Note: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833).

#### Option 2: SendGrid (Recommended for Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

If email is not configured, verification emails will be logged to the console.

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/verify-email` | Verify email with token | No |
| POST | `/api/auth/resend-verification` | Resend verification email | Yes |
| POST | `/api/auth/request-password-reset` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Ideas

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/ideas` | Get all ideas (paginated) | No |
| GET | `/api/ideas/:id` | Get idea by ID | No |
| GET | `/api/ideas/user/:userId` | Get user's ideas | No |
| POST | `/api/ideas` | Create new idea | Yes + Verified |
| PUT | `/api/ideas/:id` | Update idea | Yes + Verified |
| DELETE | `/api/ideas/:id` | Delete idea | Yes + Verified |
| POST | `/api/ideas/:id/upvote` | Upvote idea | Yes + Verified |
| POST | `/api/ideas/:id/downvote` | Downvote idea | Yes + Verified |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments/idea/:ideaId` | Get comments for idea | No |
| POST | `/api/comments/idea/:ideaId` | Create comment | Yes + Verified |
| PUT | `/api/comments/:id` | Update comment | Yes + Verified |
| DELETE | `/api/comments/:id` | Delete comment | Yes + Verified |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/search?query=` | Search users | No |
| GET | `/api/users/:id` | Get user profile | No |
| GET | `/api/users/:id/followers` | Get user followers | No |
| GET | `/api/users/:id/following` | Get user following | No |
| PUT | `/api/users/profile` | Update own profile | Yes + Verified |
| POST | `/api/users/:id/follow` | Follow user | Yes + Verified |
| POST | `/api/users/:id/unfollow` | Unfollow user | Yes + Verified |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login or registration, you'll receive a token.

### Using the Token

Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

### Email Verification Requirement

Some endpoints require email verification. After registering, users must verify their email before accessing these endpoints:
- Creating/updating/deleting ideas
- Voting on ideas
- Creating/updating/deleting comments
- Following/unfollowing users
- Updating profile

## Request/Response Examples

### Register User

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@dtu.ac.in",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "655f9c8e8f1a2b3c4d5e6f7g",
    "name": "John Doe",
    "email": "john@dtu.ac.in",
    "isEmailVerified": false,
    "followers": [],
    "following": []
  }
}
```

### Create Idea

**Request:**
```bash
POST /api/ideas
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI-Powered Study Assistant",
  "description": "An intelligent study assistant that helps students...",
  "tags": ["AI", "Education", "Mobile App"]
}
```

**Response:**
```json
{
  "message": "Idea created successfully",
  "idea": {
    "_id": "655f9c8e8f1a2b3c4d5e6f7g",
    "title": "AI-Powered Study Assistant",
    "description": "An intelligent study assistant that helps students...",
    "author": {
      "_id": "655f9c8e8f1a2b3c4d5e6f7g",
      "name": "John Doe",
      "email": "john@dtu.ac.in"
    },
    "upvotes": [],
    "downvotes": [],
    "tags": ["AI", "Education", "Mobile App"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Database Models

### User
- name: String
- email: String (unique, lowercase)
- password: String (hashed)
- bio: String (optional)
- avatar: String (optional)
- followers: [User IDs]
- following: [User IDs]
- isEmailVerified: Boolean
- emailVerificationToken: String
- emailVerificationExpires: Date

### Idea
- title: String
- description: String
- author: User ID (ref)
- upvotes: [User IDs]
- downvotes: [User IDs]
- tags: [String]
- createdAt: Date
- updatedAt: Date

### Comment
- idea: Idea ID (ref)
- user: User ID (ref)
- text: String
- createdAt: Date
- updatedAt: Date

## Deployment

### Deploying to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the following:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty or set to `/`

5. Add environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `FRONTEND_URL`: Your frontend URL
   - `NODE_ENV`: `production`
   - Email configuration variables (if using email verification)

6. Deploy!

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Add database user with read/write access
4. Whitelist your IP (or 0.0.0.0/0 for all IPs)
5. Get connection string and update `MONGODB_URI` in your environment

## Security Best Practices

- ✅ Passwords are hashed using bcrypt
- ✅ JWT tokens for stateless authentication
- ✅ Email verification required for critical actions
- ✅ Rate limiting to prevent abuse
- ✅ Helmet for security headers
- ✅ CORS configured for specific origin
- ✅ Input validation and sanitization
- ✅ Environment variables for sensitive data

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Support

For issues or questions, please create an issue in the GitHub repository.

## License

MIT License
