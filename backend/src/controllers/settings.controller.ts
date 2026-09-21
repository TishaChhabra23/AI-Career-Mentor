import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { UserAICredential } from '../models/UserAICredential';
import { encryptKey, decryptKey, maskApiKey } from '../utils/crypto';
import { validateGeminiKey } from '../services/gemini.service';
import { env } from '../config/env';

// GET /api/v1/settings/ai — Return AI credential status (never returns actual key)
export const getAISettings = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const credential = await UserAICredential.findOne({ userId, provider: 'google_gemini' }).lean();

  if (!credential) {
    if (env.GEMINI_API_KEY) {
      res.status(200).json({
        success: true,
        data: {
          provider: 'google_gemini',
          status: 'connected',
          maskedKey: maskApiKey(env.GEMINI_API_KEY),
          validatedAt: new Date()
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        provider: 'google_gemini',
        status: 'not_configured',
        maskedKey: null,
        validatedAt: null
      }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      provider: credential.provider,
      status: credential.status,
      maskedKey: credential.maskedKey,
      validatedAt: credential.validatedAt
    }
  });
});

// POST /api/v1/settings/ai/gemini — Save & verify a Gemini API key
export const saveGeminiKey = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const { apiKey } = req.body;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new AppError('API key is required.', 400);
  }

  const trimmedKey = apiKey.trim();

  // Validate the key by making a lightweight test request to Gemini
  const isValid = await validateGeminiKey(trimmedKey);
  if (!isValid) {
    throw new AppError('The provided API key is invalid or could not be verified with Google Gemini. Please check the key and try again.', 400);
  }

  // Encrypt the validated key
  const encryptedApiKey = encryptKey(trimmedKey);
  const maskedKey = maskApiKey(trimmedKey);
  const validatedAt = new Date();

  // Upsert: create or replace the credential for this user+provider
  await UserAICredential.findOneAndUpdate(
    { userId, provider: 'google_gemini' },
    {
      userId,
      provider: 'google_gemini',
      encryptedApiKey,
      maskedKey,
      status: 'connected',
      validatedAt
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    success: true,
    data: {
      provider: 'google_gemini',
      status: 'connected',
      maskedKey,
      validatedAt
    }
  });
});

// DELETE /api/v1/settings/ai/gemini — Remove Gemini API key
export const removeGeminiKey = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const result = await UserAICredential.deleteOne({ userId, provider: 'google_gemini' });

  if (result.deletedCount === 0) {
    throw new AppError('No Gemini API key is currently configured.', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      provider: 'google_gemini',
      status: 'not_configured',
      maskedKey: null,
      validatedAt: null
    }
  });
});
