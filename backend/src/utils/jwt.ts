import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return jwt.sign({ userId }, config.jwtSecret, options);
};

export const verifyToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
