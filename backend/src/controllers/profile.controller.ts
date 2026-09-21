import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';
import { asyncHandler } from '../middleware/errorHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { profile, metrics } = await profileService.getProfileByUserId(userId);

  res.status(200).json({
    success: true,
    data: {
      profile,
      metrics,
    },
  });
});

export const saveProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { profile, metrics } = await profileService.createOrUpdateProfile(userId, req.body);

  res.status(200).json({
    success: true,
    data: {
      profile,
      metrics,
    },
  });
});

export const deleteProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  await profileService.deleteProfileByUserId(userId);

  res.status(200).json({
    success: true,
    message: 'Student profile deleted successfully.',
  });
});
