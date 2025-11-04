export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers: string[];
  following: string[];
  isEmailVerified?: boolean;
}

export interface Idea {
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

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}
