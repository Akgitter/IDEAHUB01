# IdeaHub Database Schema

## Schema Overview

This document describes the MongoDB database schema for the IdeaHub application.

## Collections

### 1. Users

**Collection Name:** `users`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| _id | ObjectId | Unique identifier | Primary Key, Auto-generated |
| email | String | User email address | Unique, Required, Lowercase |
| name | String | User's full name | Required |
| password | String | Hashed password | Required, Hidden in responses |
| isEmailVerified | Boolean | Email verification status | Default: false |
| emailVerificationToken | String | Token for email verification | Optional |
| emailVerificationExpires | Date | Expiry for verification token | Optional |
| passwordResetToken | String | Token for password reset | Optional |
| passwordResetExpires | Date | Expiry for reset token | Optional |
| bio | String | User biography | Optional |
| avatar | String | URL to user avatar image | Optional |
| followers | Array[String] | List of follower user IDs | Default: [] |
| following | Array[String] | List of following user IDs | Default: [] |
| role | String | User role (user/admin) | Default: 'user' |
| isActive | Boolean | Account active status | Default: true |
| refreshToken | String | Hashed refresh token | Optional, Hidden |
| lastLogin | Date | Last login timestamp | Optional |
| createdAt | Date | Creation timestamp | Auto-generated |
| updatedAt | Date | Update timestamp | Auto-generated |

**Indexes:**
- `{ email: 1 }` - Unique index for fast email lookups
- `{ name: 1 }` - Index for user search
- `{ createdAt: -1 }` - Index for sorting by join date

**Virtuals:**
- `followerCount`: Calculated from followers.length
- `followingCount`: Calculated from following.length

---

### 2. Posts

**Collection Name:** `posts`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| _id | ObjectId | Unique identifier | Primary Key, Auto-generated |
| title | String | Post title | Required |
| description | String | Post content/description | Required |
| author | ObjectId | Reference to User | Required, Ref: 'User' |
| upvotes | Array[ObjectId] | Users who upvoted | Default: [], Ref: 'User' |
| downvotes | Array[ObjectId] | Users who downvoted | Default: [], Ref: 'User' |
| tags | Array[String] | Post tags/categories | Default: [] |
| attachments | Array[String] | URLs to attached files | Default: [] |
| shareCount | Number | Number of times shared | Default: 0 |
| commentCount | Number | Number of comments | Default: 0 |
| isDeleted | Boolean | Soft delete flag | Default: false |
| deletedAt | Date | Deletion timestamp | Optional |
| trendingScore | Number | Calculated trending score | Default: 0 |
| createdAt | Date | Creation timestamp | Auto-generated |
| updatedAt | Date | Update timestamp | Auto-generated |

**Indexes:**
- `{ author: 1, createdAt: -1 }` - Composite index for user posts
- `{ createdAt: -1 }` - Index for recent posts
- `{ trendingScore: -1, createdAt: -1 }` - Composite for trending
- `{ tags: 1 }` - Index for tag-based queries
- `{ isDeleted: 1 }` - Index for filtering deleted posts

**Virtuals:**
- `voteCount`: Calculated as upvotes.length - downvotes.length

**Trending Score Formula:**
```
score = (netVotes * VOTE_WEIGHT + commentCount * COMMENT_WEIGHT + shareCount * SHARE_WEIGHT)
        / (1 + hoursSinceCreation / TIME_DECAY_HOURS)
```

---

### 3. Comments

**Collection Name:** `comments`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| _id | ObjectId | Unique identifier | Primary Key, Auto-generated |
| text | String | Comment content | Required |
| user | ObjectId | Reference to User | Required, Ref: 'User' |
| post | ObjectId | Reference to Post | Required, Ref: 'Post' |
| parentComment | ObjectId | Parent comment for nesting | Optional, Ref: 'Comment' |
| replies | Array[ObjectId] | Child comments | Default: [], Ref: 'Comment' |
| isDeleted | Boolean | Soft delete flag | Default: false |
| deletedAt | Date | Deletion timestamp | Optional |
| createdAt | Date | Creation timestamp | Auto-generated |
| updatedAt | Date | Update timestamp | Auto-generated |

**Indexes:**
- `{ post: 1, createdAt: -1 }` - Composite for post comments
- `{ user: 1, createdAt: -1 }` - Composite for user comments
- `{ parentComment: 1 }` - Index for nested replies
- `{ isDeleted: 1 }` - Index for filtering deleted comments

**Comment Threading:**
- Top-level comments have `parentComment: null`
- Nested comments reference their parent via `parentComment`
- Parent comments maintain `replies` array for quick access

---

### 4. Notifications

**Collection Name:** `notifications`

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| _id | ObjectId | Unique identifier | Primary Key, Auto-generated |
| recipient | ObjectId | User receiving notification | Required, Ref: 'User' |
| sender | ObjectId | User who triggered notification | Required, Ref: 'User' |
| type | String | Notification type | Required, Enum: ['comment', 'vote', 'follow', 'mention', 'post_shared'] |
| relatedId | ObjectId | Related entity ID | Optional |
| relatedModel | String | Related entity type | Optional, Enum: ['Post', 'Comment', 'User'] |
| message | String | Notification message | Required |
| isRead | Boolean | Read status | Default: false |
| readAt | Date | Read timestamp | Optional |
| createdAt | Date | Creation timestamp | Auto-generated |
| updatedAt | Date | Update timestamp | Auto-generated |

**Indexes:**
- `{ recipient: 1, isRead: 1, createdAt: -1 }` - Composite for user notifications
- `{ sender: 1 }` - Index for sender queries
- `{ createdAt: -1 }` - Index for sorting

**Notification Types:**
- `comment`: Someone commented on your post
- `vote`: Someone voted on your post
- `follow`: Someone followed you
- `mention`: Someone mentioned you
- `post_shared`: Someone shared your post

---

## Relationships

### User ↔ Post
- **Type:** One-to-Many
- **Description:** A user can create multiple posts
- **Implementation:** Post.author references User._id

### User ↔ User (Follow)
- **Type:** Many-to-Many (Self-referential)
- **Description:** Users can follow each other
- **Implementation:** User.followers and User.following arrays store user IDs

### Post ↔ Vote
- **Type:** Many-to-Many
- **Description:** Users can vote on posts (single vote per user)
- **Implementation:** Post.upvotes and Post.downvotes arrays store user IDs

### Post ↔ Comment
- **Type:** One-to-Many
- **Description:** A post can have multiple comments
- **Implementation:** Comment.post references Post._id

### Comment ↔ Comment (Nesting)
- **Type:** Self-referential One-to-Many
- **Description:** Comments can have nested replies
- **Implementation:** Comment.parentComment references Comment._id, Comment.replies stores child IDs

### User ↔ Notification
- **Type:** One-to-Many
- **Description:** A user receives multiple notifications
- **Implementation:** Notification.recipient references User._id

---

## Data Flow Examples

### Creating a Post
1. User creates post → Post document created with author reference
2. Post.trendingScore initialized to 0
3. Real-time event published via Redis

### Voting on a Post
1. User votes → Post.upvotes or Post.downvotes updated
2. Previous vote removed if exists (single vote enforcement)
3. Post.trendingScore recalculated
4. Notification created for post author

### Creating a Comment
1. User comments → Comment document created
2. If nested: parentComment.replies updated
3. Post.commentCount incremented
4. Post.trendingScore recalculated
5. Notification created for post author

### Following a User
1. User A follows User B
2. User A.following.push(B's ID)
3. User B.followers.push(A's ID)
4. Notification created for User B

---

## Caching Strategy

### Redis Caching

**User Data:**
- Key: `user:{userId}`
- TTL: 5 minutes
- Invalidation: On profile update, follow/unfollow

**Post Trending Scores:**
- Recalculated on vote, comment, share
- No caching (frequently changing)

---

## Security Considerations

1. **Password Hashing:** Bcrypt with salt rounds = 10
2. **Sensitive Fields:** password, refreshToken excluded from queries by default
3. **Soft Deletes:** isDeleted flag prevents data exposure
4. **Email Verification:** Required before login
5. **Token Expiry:** Verification and reset tokens expire after set time

---

## Performance Optimization

1. **Compound Indexes:** Optimize common query patterns
2. **Select Fields:** Only fetch required fields in queries
3. **Pagination:** Cursor-based for posts, offset for comments
4. **Population:** Selective population of referenced documents
5. **Aggregation:** Use for complex queries (stats, trending)

---

## Migration Considerations

### Adding New Fields
- Add with optional/default values
- Update validation schemas
- Run migration script if needed

### Changing Indexes
- Create new index first
- Remove old index after verification
- Monitor performance impact

### Breaking Changes
- Version API endpoints
- Maintain backward compatibility
- Deprecate old endpoints gradually
