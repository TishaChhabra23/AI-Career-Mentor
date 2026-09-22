import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendTokenCookie, clearTokenCookie } from '../utils/cookie';
import { asyncHandler } from '../middleware/errorHandler';

export const register = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { fullName, email, mobileNumber, password } = req.body;

  const { user, token } = await authService.registerUser({
    fullName,
    email,
    mobileNumber,
    password,
  });

  // Set HTTP-Only Cookie
  sendTokenCookie(res, token);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser({ email, password });

  // Set HTTP-Only Cookie
  sendTokenCookie(res, token);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      token,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  clearTokenCookie(res);
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const user = await authService.getUserById(userId);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    },
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const { fullName, mobileNumber } = req.body;
  const user = await authService.updateUserById(userId, { fullName, mobileNumber });
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { email } = req.body;

  await authService.requestPasswordReset(email);

  // Secure generic response to prevent account verification checks
  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, a password reset message has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const { token, newPassword } = req.body;

  await authService.resetUserPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  await authService.deleteUserAccount(userId);

  // Clear HTTP cookie session
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: 'User account has been deleted successfully.',
  });
});
