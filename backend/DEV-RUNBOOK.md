# IdeaHub Backend - Developer Runbook

## Quick Start Guide

### Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Redis**
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **Seed database**
   ```bash
   npm run seed
   ```

6. **Access Swagger docs**
   ```
   http://localhost:3000/api/docs
   ```

## Common Tasks

### How to Seed the Database

```bash
npm run seed
```

This creates sample users and posts for development and testing.

**Created accounts:**
- Admin: `admin@dtu.ac.in` / `Admin123!`
- Users: `user1@dtu.ac.in` through `user10@dtu.ac.in` / `User123!`

### How to Compute Trending Scores

The trending score algorithm uses the following formula:

```
score = (upvotes * VOTE_WEIGHT + comments * COMMENT_WEIGHT + shares * SHARE_WEIGHT)
        / (1 + hours_since_creation / TIME_DECAY_HOURS)
```

**Automatic Recalculation:**
Scores are automatically recalculated when:
- A vote is cast on a post
- A comment is added to a post
- A post is shared

**Manual Recalculation:**
If you change the weight configuration in `.env`, scores will use the new weights for future calculations. Existing scores are not retroactively updated unless you implement a batch recalculation endpoint.

**Configuration in .env:**
```env
VOTE_WEIGHT=1.0           # Weight for net votes (upvotes - downvotes)
COMMENT_WEIGHT=0.5        # Weight for comment count
SHARE_WEIGHT=0.3          # Weight for share count
TIME_DECAY_HOURS=72       # Hours over which posts decay (3 days default)
```

**Example Calculations:**

Post A (1 hour old):
- 10 upvotes, 2 downvotes (net: 8)
- 5 comments
- 2 shares
- Score = (8 * 1.0 + 5 * 0.5 + 2 * 0.3) / (1 + 1/72) = 10.93

Post B (24 hours old):
- 10 upvotes, 2 downvotes (net: 8)
- 5 comments
- 2 shares
- Score = (8 * 1.0 + 5 * 0.5 + 2 * 0.3) / (1 + 24/72) = 8.42

Post C (72 hours old):
- 10 upvotes, 2 downvotes (net: 8)
- 5 comments
- 2 shares
- Score = (8 * 1.0 + 5 * 0.5 + 2 * 0.3) / (1 + 72/72) = 5.46

### How to Add Allowed Email Domains

**Single Domain:**
```env
ALLOWED_EMAIL_DOMAINS=dtu.ac.in
```

**Multiple Domains:**
```env
ALLOWED_EMAIL_DOMAINS=dtu.ac.in,iitd.ac.in,bits-pilani.ac.in
```

**Notes:**
- Domains should be comma-separated with no spaces
- Changes require server restart
- Domain checking is case-insensitive
- Full domain must match (e.g., `dtu.ac.in` won't match `cs.dtu.ac.in`)

**To allow subdomains:**
You would need to modify the validation logic in `src/auth/auth.service.ts`:

```typescript
// Current logic (exact match)
const emailDomain = email.split('@')[1];
if (!allowedDomains.includes(emailDomain)) {
  throw new BadRequestException('Email domain not allowed');
}

// Modified logic (allows subdomains)
const emailDomain = email.split('@')[1];
const isAllowed = allowedDomains.some(domain => 
  emailDomain === domain || emailDomain.endsWith('.' + domain)
);
if (!isAllowed) {
  throw new BadRequestException('Email domain not allowed');
}
```

## Testing Workflows

### Manual Testing Workflow

1. **Register a new user**
   ```bash
   POST /api/v1/auth/register
   {
     "email": "test@dtu.ac.in",
     "name": "Test User",
     "password": "Test1234!"
   }
   ```

2. **Verify email** (check console logs in development for verification URL)

3. **Login**
   ```bash
   POST /api/v1/auth/login
   {
     "email": "test@dtu.ac.in",
     "password": "Test1234!"
   }
   ```
   Save the `accessToken` from response

4. **Create a post**
   ```bash
   POST /api/v1/posts
   Authorization: Bearer <accessToken>
   {
     "title": "My Startup Idea",
     "description": "An innovative solution...",
     "tags": ["tech", "education"]
   }
   ```

5. **Vote on post**
   ```bash
   POST /api/v1/votes/upvote/<postId>
   Authorization: Bearer <accessToken>
   ```

6. **Add a comment**
   ```bash
   POST /api/v1/comments
   Authorization: Bearer <accessToken>
   {
     "text": "Great idea!",
     "postId": "<postId>"
   }
   ```

### Automated Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.service.spec.ts

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Debugging

### Enable Debug Logging

```bash
npm run start:debug
```

Then attach your debugger to port 9229.

### Common Issues

**MongoDB Connection Failed:**
- Check MONGODB_URI in .env
- Verify network access in MongoDB Atlas
- Ensure database user has correct permissions

**Redis Connection Failed:**
- Verify Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in .env

**SendGrid Emails Not Sending:**
- Verify SENDGRID_API_KEY is correct
- Check sender email is verified in SendGrid
- In development, check console logs for email content

**JWT Token Invalid:**
- Ensure JWT_SECRET matches between requests
- Check token expiration time
- Verify token format: `Bearer <token>`

## Database Management

### MongoDB Indexes

Important indexes are created automatically via schemas:
- Users: email, name, createdAt
- Posts: author+createdAt, trendingScore+createdAt, tags
- Comments: post+createdAt, user+createdAt, parentComment
- Notifications: recipient+isRead+createdAt

### Backup Database

```bash
# Using mongodump
mongodump --uri="<MONGODB_URI>" --out=./backup

# Restore
mongorestore --uri="<MONGODB_URI>" ./backup
```

### Clear All Data

```bash
# Use MongoDB Compass or CLI
use ideahub
db.dropDatabase()
```

Then re-run seed:
```bash
npm run seed
```

## Performance Optimization

### Redis Caching

User data is cached for 5 minutes. To clear cache:

```typescript
// In Redis CLI
redis-cli
> FLUSHDB  # Clear current database
> FLUSHALL # Clear all databases
```

### Query Optimization

- Use cursor pagination for large datasets
- Limit populated fields using select()
- Add indexes for frequently queried fields

## Monitoring

### Health Check

```bash
GET /api/v1/health
```

### Check Redis Connection

```bash
redis-cli ping
# Should return PONG
```

### View Logs

```bash
# Development
npm run start:dev
# Logs appear in console

# Production (if using PM2)
pm2 logs ideahub-backend
```

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN to production URL
- [ ] Set strong JWT secrets
- [ ] Configure MongoDB Atlas with proper network rules
- [ ] Setup AWS S3 bucket with proper permissions
- [ ] Configure SendGrid with verified domain
- [ ] Enable HTTPS
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy
- [ ] Run security audit: `npm audit`
- [ ] Update rate limiting for production traffic
- [ ] Test email delivery
- [ ] Test file uploads
- [ ] Verify WebSocket connections

## API Rate Limits

Default rate limits (configurable in .env):
- General endpoints: 100 requests per minute
- Registration: 5 requests per minute
- Login: 10 requests per minute
- Password reset: 3 requests per minute

To adjust:
```env
RATE_LIMIT_TTL=60    # Time window in seconds
RATE_LIMIT_MAX=100   # Max requests per window
```

## WebSocket Events

### Client Events

- `join-room`: Join a specific room
- `leave-room`: Leave a room

### Server Events

- `post:created`: New post created
- `notification`: New notification for user
- `vote:updated`: Vote count updated

### Testing WebSockets

```javascript
// Using socket.io-client
const io = require('socket.io-client');
const socket = io('http://localhost:3000', {
  query: { userId: '<your-user-id>' }
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('post:created', (data) => {
  console.log('New post:', data);
});
```

## Security Best Practices

1. **Never commit .env file**
2. **Rotate JWT secrets regularly**
3. **Keep dependencies updated**: `npm audit fix`
4. **Use HTTPS in production**
5. **Implement rate limiting**
6. **Validate all inputs**
7. **Sanitize user content**
8. **Use parameterized queries**
9. **Implement CORS properly**
10. **Enable Helmet security headers**

## Maintenance Tasks

### Weekly
- Review error logs
- Check database size and performance
- Monitor Redis memory usage

### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review and clean up test data
- Backup database

### Quarterly
- Review and optimize database indexes
- Analyze API performance
- Update documentation
- Security review
