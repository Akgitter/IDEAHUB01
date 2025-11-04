# Frontend-Backend Integration Guide

This guide explains how to integrate the React frontend with the Node.js backend API.

## Quick Start

### 1. Environment Setup

**Frontend (.env in root directory):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (backend/.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ideahub
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=http://localhost:5173
ALLOWED_EMAIL_DOMAIN=dtu.ac.in
```

### 2. Starting Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

## API Service Usage

The frontend includes a complete API service layer (`src/services/api.ts`) that handles all backend communication.

### Authentication Example

```typescript
import { apiService } from '../services/api';

// Register a new user
const registerUser = async () => {
  try {
    const response = await apiService.register({
      name: 'John Doe',
      email: 'john@dtu.ac.in',
      password: 'SecurePass123'
    });
    
    // Save token
    localStorage.setItem('token', response.token);
    
    // User is registered but needs email verification
    console.log('Check your email for verification');
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};

// Login
const loginUser = async () => {
  try {
    const response = await apiService.login({
      email: 'john@dtu.ac.in',
      password: 'SecurePass123'
    });
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Working with Ideas

```typescript
// Get all ideas
const loadIdeas = async () => {
  try {
    const response = await apiService.getIdeas(1, 20);
    console.log('Ideas:', response.ideas);
  } catch (error) {
    console.error('Error loading ideas:', error.message);
  }
};

// Create a new idea (requires authentication)
const createNewIdea = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await apiService.createIdea({
      title: 'My Startup Idea',
      description: 'A revolutionary app that...',
      tags: ['AI', 'Education']
    }, token);
    
    console.log('Idea created:', response.idea);
  } catch (error) {
    console.error('Error creating idea:', error.message);
  }
};

// Upvote an idea
const upvoteIdea = async (ideaId: string) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await apiService.upvoteIdea(ideaId, token);
    console.log('Idea upvoted:', response.idea);
  } catch (error) {
    console.error('Error upvoting:', error.message);
  }
};
```

### User Profiles

```typescript
// Search for users
const searchUsers = async (query: string) => {
  try {
    const response = await apiService.searchUsers(query);
    console.log('Found users:', response.users);
  } catch (error) {
    console.error('Search failed:', error.message);
  }
};

// Follow a user
const followUser = async (userId: string) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await apiService.followUser(userId, token);
    console.log('User followed:', response.user);
  } catch (error) {
    console.error('Error following user:', error.message);
  }
};

// Update own profile
const updateProfile = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await apiService.updateUserProfile({
      name: 'John Doe',
      bio: 'Passionate about tech startups'
    }, token);
    
    console.log('Profile updated:', response.user);
  } catch (error) {
    console.error('Error updating profile:', error.message);
  }
};
```

### Comments

```typescript
// Get comments for an idea
const loadComments = async (ideaId: string) => {
  try {
    const response = await apiService.getComments(ideaId, 1, 50);
    console.log('Comments:', response.comments);
  } catch (error) {
    console.error('Error loading comments:', error.message);
  }
};

// Add a comment
const addComment = async (ideaId: string) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await apiService.createComment(
      ideaId,
      'Great idea!',
      token
    );
    
    console.log('Comment added:', response.comment);
  } catch (error) {
    console.error('Error adding comment:', error.message);
  }
};
```

## Email Verification Flow

After registration, users must verify their email:

1. **User registers** → Receives verification email
2. **User clicks link** in email → Redirected to `/verify-email?token=xxx`
3. **Frontend calls** `apiService.verifyEmail(token)`
4. **Backend verifies** and updates user status
5. **User can now** access protected features

## Password Reset Flow

1. **User requests reset** → `apiService.requestPasswordReset(email)`
2. **User receives email** with reset link
3. **User clicks link** → Redirected to `/reset-password?token=xxx`
4. **User enters new password** → `apiService.resetPassword({ token, password })`
5. **User can login** with new password

## Error Handling

All API methods throw errors that should be caught:

```typescript
try {
  await apiService.createIdea(data, token);
} catch (error) {
  if (error.message === 'Email not verified') {
    // Show email verification prompt
  } else if (error.message.includes('401')) {
    // Redirect to login
  } else {
    // Show generic error
  }
}
```

## Protected Routes

Some endpoints require:
- **Authentication**: Valid JWT token
- **Email Verification**: User must have verified their email

Protected actions:
- Creating/updating/deleting ideas
- Voting on ideas
- Creating/updating/deleting comments
- Following/unfollowing users
- Updating profile

## Token Management

Store the JWT token securely:

```typescript
// After login/register
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// On app init
const token = localStorage.getItem('token');
if (token) {
  // Verify token is still valid
  const user = await apiService.getCurrentUser(token);
}

// On logout
localStorage.removeItem('token');
localStorage.removeItem('user');
```

## Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "ideas": [ /* array of ideas */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## TypeScript Types

The backend responses match the existing frontend types in `src/types/index.ts`:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers: string[];
  following: string[];
  isEmailVerified: boolean;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  author: User;
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  createdAt: Date;
  tags?: string[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}
```

## CORS Configuration

The backend is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

For development:
```env
FRONTEND_URL=http://localhost:5173
```

For production:
```env
FRONTEND_URL=https://your-frontend-domain.com
```

## Testing the Integration

1. **Start both servers** (frontend and backend)
2. **Register a new user** with @dtu.ac.in email
3. **Check console logs** for verification email (if email not configured)
4. **Manually verify** by calling the verify endpoint with the token
5. **Create an idea** to test authenticated endpoints
6. **Upvote/downvote** ideas
7. **Add comments**
8. **Search and follow** other users

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your frontend URL
- Check browser console for specific CORS error messages

### Authentication Errors
- Verify token is being sent in Authorization header
- Check token hasn't expired (default: 7 days)
- Ensure user email is verified for protected actions

### Connection Errors
- Verify backend is running on the correct port
- Check `VITE_API_URL` matches backend URL
- Ensure MongoDB is running and accessible

### Email Verification Issues
- Check email configuration in backend `.env`
- Look for verification token in backend console logs
- Manually call verify endpoint if email not working

## Next Steps

1. **Update Context Providers**: Modify `AuthContext` and `AppContext` to use the API service
2. **Add Loading States**: Show loading indicators during API calls
3. **Add Error Handling**: Display user-friendly error messages
4. **Implement Retry Logic**: Retry failed requests
5. **Add Request Caching**: Cache frequently accessed data
6. **Add Optimistic Updates**: Update UI before API response for better UX

For more details, see:
- [Backend API Documentation](backend/README.md)
- [Frontend Documentation](README.md)
