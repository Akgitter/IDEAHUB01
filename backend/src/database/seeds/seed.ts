import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ideahub';

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  isEmailVerified: Boolean,
  role: String,
  isActive: Boolean,
  followers: [String],
  following: [String],
  bio: String,
});

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: mongoose.Schema.Types.ObjectId,
  upvotes: [mongoose.Schema.Types.ObjectId],
  downvotes: [mongoose.Schema.Types.ObjectId],
  tags: [String],
  shareCount: Number,
  commentCount: Number,
  isDeleted: Boolean,
  trendingScore: Number,
  createdAt: Date,
});

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', userSchema);
    const Post = mongoose.model('Post', postSchema);

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      email: 'admin@dtu.ac.in',
      name: 'Admin User',
      password: adminPassword,
      isEmailVerified: true,
      role: 'admin',
      isActive: true,
      bio: 'Platform administrator',
      followers: [],
      following: [],
    });

    console.log('Created admin user');

    // Create sample users
    const sampleUsers = [];
    for (let i = 1; i <= 10; i++) {
      const password = await bcrypt.hash('User123!', 10);
      const user = await User.create({
        email: `user${i}@dtu.ac.in`,
        name: `User ${i}`,
        password,
        isEmailVerified: true,
        role: 'user',
        isActive: true,
        bio: `Sample user ${i} bio`,
        followers: [],
        following: [],
      });
      sampleUsers.push(user);
    }

    console.log('Created sample users');

    // Create sample posts
    const samplePosts = [
      {
        title: 'AI-Powered Student Assistant',
        description: 'An AI chatbot to help students with course selection and study planning',
        tags: ['AI', 'Education', 'Machine Learning'],
      },
      {
        title: 'Campus Food Delivery Platform',
        description: 'A platform to order food from campus canteens with real-time tracking',
        tags: ['Food', 'Delivery', 'Mobile App'],
      },
      {
        title: 'Collaborative Study Rooms',
        description: 'Virtual study rooms where students can collaborate in real-time',
        tags: ['Education', 'Collaboration', 'Video Chat'],
      },
      {
        title: 'Green Campus Initiative',
        description: 'A sustainability tracker for reducing campus carbon footprint',
        tags: ['Sustainability', 'Environment', 'IoT'],
      },
      {
        title: 'Peer Tutoring Marketplace',
        description: 'Connect students who need help with those who can teach',
        tags: ['Education', 'Marketplace', 'Peer Learning'],
      },
    ];

    for (let i = 0; i < samplePosts.length; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      await Post.create({
        ...samplePosts[i],
        author: randomUser._id,
        upvotes: [],
        downvotes: [],
        shareCount: 0,
        commentCount: 0,
        isDeleted: false,
        trendingScore: 0,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    console.log('Created sample posts');

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nSample credentials:');
    console.log('Admin: admin@dtu.ac.in / Admin123!');
    console.log('User: user1@dtu.ac.in / User123!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
