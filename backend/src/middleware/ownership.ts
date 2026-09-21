import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import mongoose from 'mongoose';

/**
 * Reusable middleware factory to check if the authenticated user owns the requested resource.
 * @param model Mongoose model to query
 * @param userField Name of the field in the document that references the User ID (default: 'userId')
 */
export const checkOwnership = (model: mongoose.Model<any>, userField = 'userId') => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError('Unauthorized: User identity not found', 401));
      }

      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        return next(new AppError('Invalid resource identifier format', 400));
      }

      const resource = await model.findById(resourceId);

      if (!resource) {
        return next(new AppError('Requested resource not found', 404));
      }

      // Extract owner field reference
      const ownerId = resource[userField]?.toString();

      if (ownerId !== userId) {
        return next(new AppError('Access Forbidden: You do not have permission to view or modify this resource', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
