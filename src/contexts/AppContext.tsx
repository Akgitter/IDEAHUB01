import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Idea, User, Comment } from '../types';
import { storageService } from '../services/storage';
import { STORAGE_KEYS } from '../constants';
import { generateId } from '../utils/helpers';

interface AppContextType {
  ideas: Idea[];
  users: User[];
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>) => void;
  upvoteIdea: (ideaId: string, userId: string) => void;
  downvoteIdea: (ideaId: string, userId: string) => void;
  addComment: (ideaId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  followUser: (currentUserId: string, targetUserId: string) => void;
  unfollowUser: (currentUserId: string, targetUserId: string) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    return storageService.get<Idea[]>(STORAGE_KEYS.IDEAS) || [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    return storageService.get<User[]>(STORAGE_KEYS.USERS) || [];
  });

  useEffect(() => {
    storageService.set(STORAGE_KEYS.IDEAS, ideas);
  }, [ideas]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.USERS, users);
  }, [users]);

  const addIdea = (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>) => {
    const newIdea: Idea = {
      ...ideaData,
      id: generateId(),
      createdAt: new Date(),
      upvotes: [],
      downvotes: [],
      comments: [],
    };
    setIdeas((prev) => [newIdea, ...prev]);
  };

  const upvoteIdea = (ideaId: string, userId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          const hasUpvoted = idea.upvotes.includes(userId);
          const hasDownvoted = idea.downvotes.includes(userId);
          
          return {
            ...idea,
            upvotes: hasUpvoted
              ? idea.upvotes.filter((id) => id !== userId)
              : [...idea.upvotes, userId],
            downvotes: hasDownvoted
              ? idea.downvotes.filter((id) => id !== userId)
              : idea.downvotes,
          };
        }
        return idea;
      })
    );
  };

  const downvoteIdea = (ideaId: string, userId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          const hasUpvoted = idea.upvotes.includes(userId);
          const hasDownvoted = idea.downvotes.includes(userId);
          
          return {
            ...idea,
            downvotes: hasDownvoted
              ? idea.downvotes.filter((id) => id !== userId)
              : [...idea.downvotes, userId],
            upvotes: hasUpvoted
              ? idea.upvotes.filter((id) => id !== userId)
              : idea.upvotes,
          };
        }
        return idea;
      })
    );
  };

  const addComment = (ideaId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          const newComment: Comment = {
            ...commentData,
            id: generateId(),
            createdAt: new Date(),
          };
          return {
            ...idea,
            comments: [...idea.comments, newComment],
          };
        }
        return idea;
      })
    );
  };

  const followUser = (currentUserId: string, targetUserId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUserId) {
          return {
            ...user,
            following: [...user.following, targetUserId],
          };
        }
        if (user.id === targetUserId) {
          return {
            ...user,
            followers: [...user.followers, currentUserId],
          };
        }
        return user;
      })
    );
  };

  const unfollowUser = (currentUserId: string, targetUserId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUserId) {
          return {
            ...user,
            following: user.following.filter((id) => id !== targetUserId),
          };
        }
        if (user.id === targetUserId) {
          return {
            ...user,
            followers: user.followers.filter((id) => id !== currentUserId),
          };
        }
        return user;
      })
    );
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, ...updates } : user))
    );
  };

  return (
    <AppContext.Provider
      value={{
        ideas,
        users,
        addIdea,
        upvoteIdea,
        downvoteIdea,
        addComment,
        followUser,
        unfollowUser,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
