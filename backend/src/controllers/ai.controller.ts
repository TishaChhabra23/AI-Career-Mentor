import { Request, Response, NextFunction } from 'express';
import { Recommendation } from '../models/Recommendation';
import { generateRecommendation, RecommendationType } from '../services/aiRecommendation.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// 1. Get all saved recommendations
export const getAllRecommendations = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const list = await Recommendation.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: list
  });
});

// 2. Get latest recommendation of specific type (Retrieval only)
export const getRecommendationByType = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { type } = req.params;

  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const latest = await Recommendation.findOne({ 
    userId, 
    type: type as RecommendationType 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: latest || null
  });
});

// 3. Generate recommendation (Handles caching internally)
export const generateAIRecommendation = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { type, forceRegenerate } = req.body;

  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  if (!type) {
    throw new AppError('Recommendation type parameter is required.', 400);
  }

  const result = await generateRecommendation(
    userId,
    type as RecommendationType,
    !!forceRegenerate
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// 4. Explicitly regenerate recommendation (Forces cache override)
export const regenerateAIRecommendation = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { type } = req.body;

  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  if (!type) {
    throw new AppError('Recommendation type parameter is required.', 400);
  }

  const result = await generateRecommendation(
    userId,
    type as RecommendationType,
    true // forceRegenerate is true
  );

  res.status(200).json({
    success: true,
    data: result
  });
});
