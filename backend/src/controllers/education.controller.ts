import { Request, Response, NextFunction } from 'express';
import * as educationService from '../services/education.service';
import { asyncHandler } from '../middleware/errorHandler';

export const getEducation = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const education = await educationService.getEducationByUserId(userId);

  res.status(200).json({
    success: true,
    data: education,
  });
});

export const saveEducation = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const education = await educationService.createOrUpdateEducation(userId, req.body);

  res.status(200).json({
    success: true,
    data: education,
  });
});

export const deleteEducation = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  await educationService.deleteEducationByUserId(userId);

  res.status(200).json({
    success: true,
    message: 'Education details deleted successfully.',
  });
});
