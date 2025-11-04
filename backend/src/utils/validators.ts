import crypto from 'crypto';
import { config } from '../config/index.js';

export const validateEmail = (email: string): boolean => {
  // Simple email validation regex without potential ReDoS issues
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  const domain = email.split('@')[1];
  return domain === config.allowedEmailDomain;
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

export const generateVerificationToken = (): string => {
  // Use cryptographically secure random bytes
  return crypto.randomBytes(32).toString('hex');
};

export const validateToken = (token: string): boolean => {
  // Verify token is a valid hex string of expected length (64 characters for 32 bytes)
  return /^[a-f0-9]{64}$/.test(token);
};
