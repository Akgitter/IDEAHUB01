import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { validateEmail } from '../utils/helpers';
import { getUserFromStorage, saveUserToStorage, removeUserFromStorage } from '../services/storage';
import { generateId } from '../utils/helpers';

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = getUserFromStorage();
    return savedUser as User | null;
  });

  const login = (email: string): boolean => {
    if (!validateEmail(email)) {
      return false;
    }

    const newUser: User = {
      id: generateId(),
      name: email.split('@')[0],
      email,
      bio: '',
      followers: [],
      following: [],
    };

    setUser(newUser);
    saveUserToStorage(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    removeUserFromStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
