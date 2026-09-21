import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'student' | 'admin';
}

export const createToken = (payload: TokenPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: '7d', // Explicitly typed as standard expiration duration format
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
