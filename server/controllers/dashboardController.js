import { getDashboardAnalytics } from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await getDashboardAnalytics();
  res.status(200).json({ success: true, data: analytics });
});
