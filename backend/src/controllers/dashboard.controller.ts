import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { asyncHandler } from '../middleware/errorHandler';

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const summary = await dashboardService.getDashboardSummaryData(userId);

  res.status(200).json({
    success: true,
    data: summary,
  });
});
