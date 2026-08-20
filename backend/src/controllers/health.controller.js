import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthCheck = asyncHandler((req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  ApiResponse.ok(res, 'PlaceX Server is healthy & operational', {
    status: 'healthy',
    uptime: `${days}d ${hours}h ${minutes}m ${uptimeSeconds % 60}s`,
    uptimeSeconds,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});
