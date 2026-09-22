import { Response } from 'express';
import { env } from '../config/env';

export const COOKIE_NAME = 'token';

export const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  // Expiry matches JWT token expiry (7 days default)
  const maxAge = 7 * 24 * 60 * 60 * 1000; 

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as const,
    maxAge: maxAge,
    path: '/',
  };
};

export const sendTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

export const clearTokenCookie = (res: Response): void => {
  const options = {
    ...getCookieOptions(),
    maxAge: 0, // Clear immediately
  };
  res.cookie(COOKIE_NAME, '', options);
};
