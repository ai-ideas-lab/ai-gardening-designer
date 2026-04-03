import { Router } from 'express';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { AuthRequest, ApiResponse } from '@/types';
import { gardenHealthMonitor } from '@/services/gardenHealthMonitor';

const router = Router();

/**
 * 执行全面系统健康检查
 * GET /api/health/check
 */
router.get('/check', asyncHandler(async (req: AuthRequest, res) => {
  console.log('🏥 Starting health check...');
  
  const result = await gardenHealthMonitor.performHealthCheck();
  
  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Health check completed successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

/**
 * 获取健康检查历史记录
 * GET /api/health/history
 */
router.get('/history', asyncHandler(async (req: AuthRequest, res) => {
  const { limit = 10 } = req.query;
  
  const history = await gardenHealthMonitor.getHealthHistory(parseInt(limit.toString()));
  
  const response: ApiResponse = {
    success: true,
    data: history,
    message: 'Health history retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

/**
 * 获取系统趋势分析
 * GET /api/health/trends
 */
router.get('/trends', asyncHandler(async (req: AuthRequest, res) => {
  const { period = 'week' } = req.query;
  
  const trends = await gardenHealthMonitor.getTrendAnalysis(period as 'week' | 'month' | 'quarter');
  
  const response: ApiResponse = {
    success: true,
    data: trends,
    message: 'Trend analysis completed successfully',
    timestamp: new Date().toISOString()
  };

  res.json(response);
}));

/**
 * 获取系统健康概览（简化版本，用于仪表板）
 * GET /api/health/overview
 */
router.get('/overview', asyncHandler(async (req: AuthRequest, res) => {
  try {
    const latestCheck = await gardenHealthMonitor.getHealthHistory(1);
    
    if (latestCheck.length === 0) {
      throw createError('No health check data available', 404, true);
    }

    const overview = {
      overallScore: latestCheck[0].overallScore,
      status: latestCheck[0].status,
      lastCheck: latestCheck[0].createdAt,
      criticalAlertCount: latestCheck[0].criticalAlertCount,
      alertCount: latestCheck[0].alertCount,
      trend: 'stable' // 可以根据历史数据计算趋势
    };

    const response: ApiResponse = {
      success: true,
      data: overview,
      message: 'Health overview retrieved successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    // 如果没有健康检查数据，返回默认状态
    const defaultOverview = {
      overallScore: 85,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      criticalAlertCount: 0,
      alertCount: 0,
      trend: 'stable'
    };

    const response: ApiResponse = {
      success: true,
      data: defaultOverview,
      message: 'Health overview retrieved (default values)',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  }
}));

/**
 * 手动触发健康检查（管理员功能）
 * POST /api/health/trigger
 */
router.post('/trigger', asyncHandler(async (req: AuthRequest, res) => {
  const { reason } = req.body;
  
  console.log(`🚨 Manual health check triggered by ${req.user?.email || 'unknown user'}${reason ? `: ${reason}` : ''}`);
  
  const result = await gardenHealthMonitor.performHealthCheck();
  
  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Manual health check completed successfully',
    timestamp: new Date().toISOString()
  };

  res.status(201).json(response);
}));

export default router;