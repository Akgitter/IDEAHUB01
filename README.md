# ideaHub - University Startup Ideas Platform

A modern web application for university students to share, discuss, and rate startup ideas within their community.

## Features

- **Authentication**: Secure login with university email validation (@dtu.ac.in domain)
- **Live Feed**: Browse and discover innovative startup ideas from the community
- **Post Ideas**: Share your startup concepts with detailed descriptions and tags
- **Interactive Voting**: Upvote and downvote ideas to help surface the best concepts
- **Comments**: Engage in discussions about ideas
- **User Profiles**: View your ideas, manage bio, and track followers/following
- **User Discovery**: Search and follow other community members
- **Share**: Easily share ideas with others

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules with modern, minimal design
- **State Management**: React Context API
- **Storage**: LocalStorage (ready for backend integration)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── IdeaCard.tsx
│   ├── Layout.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Feed.tsx
│   ├── PostIdea.tsx
│   └── Profile.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── AppContext.tsx
├── services/           # Service layer
│   └── storage.ts
├── utils/              # Utility functions
│   └── helpers.ts
├── constants/          # Application constants
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── styles/             # CSS stylesheets
│   ├── Login.css
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

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vite-react
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Usage

1. **Login**: Enter your university email (@dtu.ac.in)
2. **Browse Feed**: View all shared ideas from the community
3. **Post Idea**: Click "Post Idea" to share your startup concept
4. **Interact**: Upvote/downvote ideas, add comments, and share
5. **Profile**: Manage your profile, search users, and follow others

## Email Domain Configuration

Currently configured for **@dtu.ac.in** domain. To add support for other organizations:

1. Update `ALLOWED_EMAIL_DOMAIN` in `src/constants/index.ts`
2. Or implement multi-domain support by modifying the validation logic in `src/utils/helpers.ts`

## Backend Integration

This project now includes a complete backend API built with Node.js, Express, TypeScript, and MongoDB.

### Backend Features

- **JWT Authentication**: Secure authentication with JSON Web Tokens
- **Email Verification**: Token-based email verification system
- **Password Reset**: Secure password reset flow
- **MongoDB Database**: Persistent data storage with Mongoose
- **RESTful API**: Clean REST API endpoints
- **Security**: Helmet, CORS, rate limiting, password hashing

### Backend Setup

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

4. Configure your `.env` file (minimum required):
```env
MONGODB_URI=mongodb://localhost:27017/ideahub
JWT_SECRET=your_secure_random_string
FRONTEND_URL=http://localhost:5173
```

5. Start the backend development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

For detailed backend documentation, see [backend/README.md](backend/README.md)

### Full Stack Development

To run both frontend and backend:

1. Terminal 1 - Start backend:
```bash
cd backend
npm run dev
```

2. Terminal 2 - Start frontend:
```bash
npm run dev
```

3. Create a `.env` file in the root directory:
```bash
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Frontend Deployment (Vercel)

Deploy your frontend to Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com/api`)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Akgitter/vite-react)

### Backend Deployment (Render)

Deploy your backend to Render:

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `FRONTEND_URL`: Your frontend URL
     - `NODE_ENV`: `production`
5. Deploy!

For detailed deployment instructions, see [backend/README.md](backend/README.md)

## Future Enhancements

- ✅ Backend API integration (completed)
- ✅ User authentication with JWT (completed)
- ✅ Email verification system (completed)
- Real-time updates with WebSockets
- Advanced search and filtering
- Email notifications for interactions
- Idea categories and tags filtering
- User roles (student, teacher, admin)
- Analytics dashboard
- Mobile app
- File uploads for idea attachments
- Rich text editor for idea descriptions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Deploy Your Own

Deploy your own ideaHub instance with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Akgitter/vite-react)

