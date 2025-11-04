# Development Checklist

Use this checklist when developing features for IdeaHub.

## Before Starting Development

- [ ] Read the [Quick Start Guide](QUICK_START.md)
- [ ] Set up local development environment
- [ ] Understand the [Integration Guide](INTEGRATION_GUIDE.md)
- [ ] Review the [Security Summary](SECURITY_SUMMARY.md)

## Making Changes

### Backend Changes

- [ ] Create feature branch: `git checkout -b feature/your-feature-name`
- [ ] Make changes in `backend/src/`
- [ ] Update types in models if schema changes
- [ ] Add input validation for new endpoints
- [ ] Check for security implications
- [ ] Test with curl or Postman
- [ ] Build successfully: `cd backend && npm run build`
- [ ] Update API documentation in `backend/README.md`

### Frontend Changes

- [ ] Create feature branch or use existing backend branch
- [ ] Make changes in `src/`
- [ ] Update TypeScript types if needed
- [ ] Update API service if new endpoints added
- [ ] Test in browser
- [ ] Build successfully: `npm run build`
- [ ] Lint code: `npm run lint`

## Security Checklist

- [ ] No secrets in code (use environment variables)
- [ ] Input validation on all user inputs
- [ ] Authentication required for protected routes
- [ ] SQL/NoSQL injection prevented
- [ ] XSS prevented (React does this automatically)
- [ ] Rate limiting considered
- [ ] Error messages don't leak sensitive information
- [ ] Tokens are cryptographically secure
- [ ] Passwords properly hashed
- [ ] CORS properly configured

## Testing Checklist

### Manual Testing

- [ ] Test happy path
- [ ] Test error cases
- [ ] Test with invalid input
- [ ] Test authentication/authorization
- [ ] Test with different user roles
- [ ] Test in different browsers (if frontend)
- [ ] Test API with curl/Postman (if backend)

### Code Quality

- [ ] TypeScript compilation passes
- [ ] ESLint passes with no errors
- [ ] Code follows existing patterns
- [ ] No console.logs in production code
- [ ] Comments added where needed
- [ ] Functions are small and focused

## Documentation Checklist

- [ ] Update README if needed
- [ ] Update API documentation for new endpoints
- [ ] Add comments for complex logic
- [ ] Update integration guide if API changes
- [ ] Update .env.example if new variables added

## Before Committing

- [ ] Review your changes: `git diff`
- [ ] Stage only relevant files
- [ ] Write clear commit message
- [ ] Test one more time
- [ ] Run linter
- [ ] Run build

## Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Example:
```
feat: add user profile avatar upload

- Add multer for file uploads
- Add avatar field to user model
- Add validation for image types
- Update profile endpoint

Closes #123
```

## Pull Request Checklist

- [ ] Branch is up to date with main
- [ ] All tests pass
- [ ] Code is linted
- [ ] Documentation updated
- [ ] Screenshots added (if UI changes)
- [ ] PR description explains what and why
- [ ] Security considerations documented
- [ ] Breaking changes noted

## Deployment Checklist

### Before Deploying Backend

- [ ] Environment variables set in production
- [ ] MongoDB Atlas configured
- [ ] Email service configured
- [ ] JWT_SECRET is strong and unique
- [ ] FRONTEND_URL is correct
- [ ] Build succeeds: `npm run build`
- [ ] Test locally with production build

### Before Deploying Frontend

- [ ] VITE_API_URL points to production backend
- [ ] Build succeeds: `npm run build`
- [ ] Preview build locally: `npm run preview`
- [ ] Test with production backend

### After Deployment

- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test email verification
- [ ] Test password reset
- [ ] Test creating ideas
- [ ] Test voting
- [ ] Test comments
- [ ] Test user search
- [ ] Test follow/unfollow
- [ ] Check error logs
- [ ] Monitor performance

## Common Tasks

### Adding a New API Endpoint

1. [ ] Define route in `backend/src/routes/`
2. [ ] Create controller function in `backend/src/controllers/`
3. [ ] Add validation middleware if needed
4. [ ] Add authentication if needed
5. [ ] Test with curl/Postman
6. [ ] Add method to `src/services/api.ts`
7. [ ] Document in `backend/README.md`
8. [ ] Update integration guide if needed

### Adding a New Database Model

1. [ ] Create model in `backend/src/models/`
2. [ ] Define schema with validation
3. [ ] Add indexes for queries
4. [ ] Export model
5. [ ] Create CRUD controllers
6. [ ] Create routes
7. [ ] Test thoroughly
8. [ ] Document in README

### Adding a New Frontend Page

1. [ ] Create page component in `src/pages/`
2. [ ] Add route in `App.tsx`
3. [ ] Add navigation link if needed
4. [ ] Create necessary API calls
5. [ ] Add loading and error states
6. [ ] Style with CSS
7. [ ] Test navigation
8. [ ] Test with backend

## Debugging Tips

### Backend Issues

```bash
# View logs
cd backend
npm run dev

# Test endpoint
curl -X GET http://localhost:5000/api/ideas

# Check MongoDB connection
mongo
show dbs
use ideahub
db.users.find()
```

### Frontend Issues

```javascript
// Check API calls in browser console
console.log('API response:', response);

// Check localStorage
localStorage.getItem('token');
localStorage.getItem('user');

// Clear data
localStorage.clear();
```

### Database Issues

```javascript
// MongoDB shell commands
use ideahub
db.users.find().pretty()
db.ideas.find().pretty()
db.comments.find().pretty()

// Count documents
db.users.countDocuments()

// Drop collection (careful!)
db.ideas.drop()
```

## Getting Help

1. Check documentation first
2. Search existing issues
3. Ask in team chat
4. Create detailed issue with:
   - What you're trying to do
   - What you expected
   - What actually happened
   - Steps to reproduce
   - Error messages
   - Screenshots

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

**Remember**: Code quality and security are more important than speed. Take time to do things right!
