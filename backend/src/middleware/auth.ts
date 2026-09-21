import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'student' | 'admin';
      };
    }
  }
}

interface DecodedToken {
  id: string;
  email: string;
  role: 'student' | 'admin';
  iat: number;
  exp: number;
}

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Retrieve token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
      // Basic cookie parsing helper
      const cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookieStr) => {
        const [key, value] = cookieStr.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies['token'];
    }

    if (!token) {
      return next(new AppError('Authentication token is required. Please log in.', 401));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: Array<'student' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
