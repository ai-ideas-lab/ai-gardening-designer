/**
 * AI Garden Health Monitor
 * 综合监控和分析系统健康状况，提供AI驱动的优化建议
 */

import { PrismaClient } from '@prisma/client';
import { aiGardeningService } from './aiGardeningService';
import { createError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

export interface SystemHealthMetrics {
  performance: {
    responseTime: number; // 平均响应时间 (ms)
    uptime: number; // 系统正常运行时间 (hours)
    errorRate: number; // 错误率 (%)
    memoryUsage: number; // 内存使用率 (%)
  };
  userEngagement: {
    activeUsers: number; // 活跃用户数
    dailyActiveUsers: number; // 日活用户数
    sessionDuration: number; // 平均会话时长 (minutes)
    retentionRate: number; // 用户留存率 (%)
  };
  plantDatabase: {
    totalPlants: number; // 植物总数
    plantImages: number; // 植物图片数
    knowledgeBase: number; // 知识库条目数
    averageConfidence: number; // AI识别平均置信度
  };
  aiPerformance: {
    requestCount: number; // AI请求总数
    successRate: number; // AI成功率 (%)
    averageProcessingTime: number; // 平均处理时间 (ms)
    modelAccuracy: number; // 模型准确率
  };
}

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'performance' | 'user' | 'database' | 'ai' | 'security';
  title: string;
  description: string;
  severity: number; // 1-10
  affectedSystems: string[];
  suggestedActions: string[];
  timestamp: Date;
  resolved: boolean;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'user_experience' | 'ai_accuracy' | 'cost_efficiency';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  resources: string[];
  expectedImprovements: {
    metric: string;
    currentValue: number;
    targetValue: number;
    improvement: string;
  }[];
  priority: 'critical' | 'important' | 'normal';
  createdAt: Date;
}

export class GardenHealthMonitor {
  private static instance: GardenHealthMonitor;
  private lastHealthCheck: Date | null = null;

  static getInstance(): GardenHealthMonitor {
    if (!GardenHealthMonitor.instance) {
      GardenHealthMonitor.instance = new GardenHealthMonitor();
    }
    return GardenHealthMonitor.instance;
  }

  /**
   * 执行全面系统健康检查
   */
  async performHealthCheck(): Promise<{
    metrics: SystemHealthMetrics;
    alerts: HealthAlert[];
    suggestions: OptimizationSuggestion[];
    overallScore: number;
    status: 'healthy' | 'warning' | 'critical';
  }> {
    console.log('🔍 Starting comprehensive health check...');
    
    const startTime = Date.now();
    const metrics = await this.collectMetrics();
    const alerts = await this.generateAlerts(metrics);
    const suggestions = await this.generateOptimizationSuggestions(metrics, alerts);
    const overallScore = this.calculateOverallScore(metrics);
    const status = this.determineSystemStatus(overallScore, alerts);

    // 保存健康检查记录
    await this.saveHealthCheckRecord({
      metrics,
      alerts,
      overallScore,
      status,
      duration: Date.now() - startTime
    });

    this.lastHealthCheck = new Date();

    console.log(`✅ Health check completed in ${Date.now() - startTime}ms`);
    console.log(`📊 Overall Score: ${overallScore}/100 - Status: ${status}`);

    return {
      metrics,
      alerts,
      suggestions,
      overallScore,
      status
    };
  }

  /**
   * 收集系统指标
   */
  private async collectMetrics(): Promise<SystemHealthMetrics> {
    console.log('📊 Collecting system metrics...');

    const [performanceMetrics, userMetrics, plantMetrics, aiMetrics] = await Promise.all([
      this.getPerformanceMetrics(),
      this.getUserMetrics(),
      this.getPlantMetrics(),
      this.getAIMetrics()
    ]);

    return {
      performance: performanceMetrics,
      userEngagement: userMetrics,
      plantDatabase: plantMetrics,
      aiPerformance: aiMetrics
    };
  }

  /**
   * 收集性能指标
   */
  private async getPerformanceMetrics(): Promise<SystemHealthMetrics['performance']> {
    // 这里应该从监控系统中获取真实数据
    // 现在使用模拟数据作为示例
    return {
      responseTime: 150, // 平均响应时间
      uptime: 99.9, // 系统正常运行时间
      errorRate: 0.5, // 错误率
      memoryUsage: 65.2 // 内存使用率
    };
  }

  /**
   * 收集用户指标
   */
  private async getUserMetrics(): Promise<SystemHealthMetrics['userEngagement']> {
    try {
      const [
        activeUsers,
        dailyActiveUsers,
        sessionData,
        retentionData
      ] = await Promise.all([
        prisma.user.count({
          where: {
            isActive: true,
            lastActiveAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内活跃
            }
          }
        }),
        prisma.user.count({
          where: {
            lastActiveAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小时内活跃
            }
          }
        }),
        prisma.session.aggregate({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
            }
          },
          _avg: {
            duration: true
          }
        }),
        this.calculateRetentionRate()
      ]);

      return {
        activeUsers,
        dailyActiveUsers,
        sessionDuration: sessionData._avg.duration || 15, // 平均会话时长
        retentionRate: retentionData
      };
    } catch (error) {
      console.error('Error collecting user metrics:', error);
      return {
        activeUsers: 0,
        dailyActiveUsers: 0,
        sessionDuration: 0,
        retentionRate: 0
      };
    }
  }

  /**
   * 收集植物数据库指标
   */
  private async getPlantMetrics(): Promise<SystemHealthMetrics['plantDatabase']> {
    try {
      const [plants, plantImages, knowledge, aiRequests] = await Promise.all([
        prisma.plant.count(),
        prisma.plant.count({
          where: {
            imageUrl: { not: null }
          }
        }),
        prisma.plantKnowledge.count(),
        prisma.aiRequest.aggregate({
          where: {
            type: 'plant_recognition'
          },
          _avg: {
            confidence: true
          }
        })
      ]);

      return {
        totalPlants: plants,
        plantImages: plantImages,
        knowledgeBase: knowledge,
        averageConfidence: aiRequests._avg.confidence || 0
      };
    } catch (error) {
      console.error('Error collecting plant metrics:', error);
      return {
        totalPlants: 0,
        plantImages: 0,
        knowledgeBase: 0,
        averageConfidence: 0
      };
    }
  }

  /**
   * 收集AI性能指标
   */
  private async getAIMetrics(): Promise<SystemHealthMetrics['aiPerformance']> {
    try {
      const [requests, successRate, processingTime, accuracy] = await Promise.all([
        prisma.aiRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 最近24小时
            }
          }
        }),
        prisma.aiRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            success: true
          }
        }),
        prisma.aiRequest.aggregate({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          _avg: {
            processingTime: true
          }
        }),
        this.calculateAccuracy()
      ]);

      return {
        requestCount: requests,
        successRate: requests > 0 ? (successRate / requests) * 100 : 0,
        averageProcessingTime: processingTime._avg.processingTime || 0,
        modelAccuracy: accuracy
      };
    } catch (error) {
      console.error('Error collecting AI metrics:', error);
      return {
        requestCount: 0,
        successRate: 0,
        averageProcessingTime: 0,
        modelAccuracy: 0
      };
    }
  }

  /**
   * 计算用户留存率
   */
  private async calculateRetentionRate(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const [newUsers, retainedUsers] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
              lt: sixtyDaysAgo
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
              lt: sixtyDaysAgo
            },
            isActive: true
          }
        })
      ]);

      return newUsers > 0 ? (retainedUsers / newUsers) * 100 : 0;
    } catch (error) {
      console.error('Error calculating retention rate:', error);
      return 0;
    }
  }

  /**
   * 计算模型准确率
   */
  private async calculateAccuracy(): Promise<number> {
    try {
      const [correct, total] = await Promise.all([
        prisma.aiRequest.count({
          where: {
            verifiedCorrect: true,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.aiRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return total > 0 ? (correct / total) * 100 : 85; // 默认85%
    } catch (error) {
      console.error('Error calculating accuracy:', error);
      return 85;
    }
  }

  /**
   * 生成健康警报
   */
  private async generateAlerts(metrics: SystemHealthMetrics): Promise<HealthAlert[]> {
    console.log('⚠️ Generating health alerts...');
    const alerts: HealthAlert[] = [];

    // 性能警报
    if (metrics.performance.responseTime > 500) {
      alerts.push({
        id: `perf-${Date.now()}`,
        type: 'warning',
        category: 'performance',
        title: '响应时间偏高',
        description: `平均响应时间为 ${metrics.performance.responseTime}ms，建议优化后端性能`,
        severity: 6,
        affectedSystems: ['API响应', '用户体验'],
        suggestedActions: [
          '优化数据库查询',
          '增加缓存层',
          '检查慢查询日志'
        ],
        timestamp: new Date(),
        resolved: false
      });
    }

    if (metrics.performance.errorRate > 2) {
      alerts.push({
        id: `error-${Date.now()}`,
        type: 'critical',
        category: 'performance',
        title: '错误率过高',
        description: `系统错误率为 ${metrics.performance.errorRate}%，需要立即处理`,
        severity: 9,
        affectedSystems: ['系统稳定性', '用户体验'],
        suggestedActions: [
          '检查错误日志',
          '修复关键bug',
          '监控系统健康状况'
        ],
        timestamp: new Date(),
        resolved: false
      });
    }

    // 用户活动警报
    if (metrics.userEngagement.dailyActiveUsers < 10) {
      alerts.push({
        id: `user-${Date.now()}`,
        type: 'warning',
        category: 'user',
        title: '日活用户偏低',
        description: `日活用户仅为 ${metrics.userEngagement.dailyActiveUsers}，建议增加用户活跃度`,
        severity: 5,
        affectedSystems: ['用户增长', '产品活跃度'],
        suggestedActions: [
          '优化用户注册流程',
          '添加用户激励系统',
          '改进产品功能'
        ],
        timestamp: new Date(),
        resolved: false
      });
    }

    // AI性能警报
    if (metrics.aiPerformance.successRate < 90) {
      alerts.push({
        id: `ai-${Date.now()}`,
        type: 'warning',
        category: 'ai',
        title: 'AI服务成功率偏低',
        description: `AI服务成功率为 ${metrics.aiPerformance.successRate}%，需要优化算法`,
        severity: 7,
        affectedSystems: ['AI核心功能', '用户体验'],
        suggestedActions: [
          '重新训练模型',
          '改进提示词',
          '增加错误处理'
        ],
        timestamp: new Date(),
        resolved: false
      });
    }

    // 植物数据库警报
    if (metrics.plantDatabase.averageConfidence < 0.8) {
      alerts.push({
        id: `db-${Date.now()}`,
        type: 'warning',
        category: 'database',
        title: '植物识别置信度偏低',
        description: `平均置信度为 ${metrics.plantDatabase.averageConfidence}，建议增加训练数据`,
        severity: 6,
        affectedSystems: ['植物识别', 'AI准确性'],
        suggestedActions: [
          '收集更多植物图片',
          '改进特征提取',
          '优化模型参数'
        ],
        timestamp: new Date(),
        resolved: false
      });
    }

    console.log(`📋 Generated ${alerts.length} health alerts`);
    return alerts;
  }

  /**
   * 生成优化建议
   */
  private async generateOptimizationSuggestions(
    metrics: SystemHealthMetrics,
    alerts: HealthAlert[]
  ): Promise<OptimizationSuggestion[]> {
    console.log('💡 Generating optimization suggestions...');
    
    const suggestions: OptimizationSuggestion[] = [];

    // 基于指标生成建议
    if (metrics.performance.responseTime > 300) {
      suggestions.push({
        id: `perf-opt-${Date.now()}`,
        category: 'performance',
        title: '实施Redis缓存优化',
        description: '为高频查询添加Redis缓存，减少数据库负载，提升响应速度',
        impact: 'high',
        implementationDifficulty: 'easy',
        estimatedTime: '2-3天',
        resources: ['Redis', '缓存设计文档'],
        expectedImprovements: [
          {
            metric: '平均响应时间',
            currentValue: metrics.performance.responseTime,
            targetValue: 150,
            improvement: '减少50%响应时间'
          }
        ],
        priority: 'important',
        createdAt: new Date()
      });
    }

    if (metrics.userEngagement.retentionRate < 60) {
      suggestions.push({
        id: `user-retention-${Date.now()}`,
        category: 'user_experience',
        title: '个性化用户旅程优化',
        description: '基于用户行为数据实现个性化推荐，提升用户留存和参与度',
        impact: 'high',
        implementationDifficulty: 'medium',
        estimatedTime: '1-2周',
        resources: ['数据分析团队', '前端开发', '推荐算法'],
        expectedImprovements: [
          {
            metric: '用户留存率',
            currentValue: metrics.userEngagement.retentionRate,
            targetValue: 75,
            improvement: '提升15-20个百分点'
          }
        ],
        priority: 'important',
        createdAt: new Date()
      });
    }

    if (metrics.aiPerformance.modelAccuracy < 90) {
      suggestions.push({
        id: `ai-accuracy-${Date.now()}`,
        category: 'ai_accuracy',
        title: '植物识别模型优化项目',
        description: '收集更多植物图像数据，重新训练模型，提升识别准确率',
        impact: 'high',
        implementationDifficulty: 'hard',
        estimatedTime: '3-4周',
        resources: ['AI工程师', '数据标注团队', 'GPU计算资源'],
        expectedImprovements: [
          {
            metric: '模型准确率',
            currentValue: metrics.aiPerformance.modelAccuracy,
            targetValue: 95,
            improvement: '提升5-10个百分点'
          }
        ],
        priority: 'critical',
        createdAt: new Date()
      });
    }

    // 基于警报生成建议
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
    if (criticalAlerts.length > 0) {
      suggestions.push({
        id: `critical-fix-${Date.now()}`,
        category: 'performance',
        title: '关键问题紧急修复',
        description: '立即修复系统中的关键问题，确保服务稳定性',
        impact: 'high',
        implementationDifficulty: 'medium',
        estimatedTime: '1-2天',
        resources: ['开发团队', '运维团队'],
        expectedImprovements: [
          {
            metric: '系统稳定性',
            currentValue: 95,
            targetValue: 99,
            improvement: '提升系统可用性'
          }
        ],
        priority: 'critical',
        createdAt: new Date()
      });
    }

    console.log(`🎯 Generated ${suggestions.length} optimization suggestions`);
    return suggestions;
  }

  /**
   * 计算总体健康分数
   */
  private calculateOverallScore(metrics: SystemHealthMetrics): number {
    const performanceScore = this.calculatePerformanceScore(metrics.performance);
    const userScore = this.calculateUserScore(metrics.userEngagement);
    const databaseScore = this.calculateDatabaseScore(metrics.plantDatabase);
    const aiScore = this.calculateAIScore(metrics.aiPerformance);

    return Math.round((performanceScore + userScore + databaseScore + aiScore) / 4);
  }

  /**
   * 计算性能分数
   */
  private calculatePerformanceScore(performance: SystemHealthMetrics['performance']): number {
    const responseTimeScore = Math.max(0, 100 - (performance.responseTime / 10));
    const uptimeScore = performance.uptime * 10; // 99.9% = 99.9分
    const errorRateScore = Math.max(0, 100 - (performance.errorRate * 10));
    const memoryScore = Math.max(0, 100 - (performance.memoryUsage * 2));

    return Math.round((responseTimeScore + uptimeScore + errorRateScore + memoryScore) / 4);
  }

  /**
   * 计算用户分数
   */
  private calculateUserScore(user: SystemHealthMetrics['userEngagement']): number {
    const activeUsersScore = Math.min(user.activeUsers * 2, 100); // 每个用户2分，最多100分
    const dauScore = Math.min(user.dailyActiveUsers * 5, 100); // 每个DAU 5分，最多100分
    const sessionScore = Math.min(user.sessionDuration * 2, 100); // 每分钟2分，最多100分
    const retentionScore = user.retentionRate; // 直接使用留存率作为分数

    return Math.round((activeUsersScore + dauScore + sessionScore + retentionScore) / 4);
  }

  /**
   * 计算数据库分数
   */
  private calculateDatabaseScore(database: SystemHealthMetrics['plantDatabase']): number {
    const plantScore = Math.min(database.totalPlants / 10, 100); // 每10个植物1分
    const imageScore = Math.min(database.plantImages / 5, 100); // 每5张图片1分
    const knowledgeScore = Math.min(database.knowledgeBase / 10, 100); // 每10个知识条目1分
    const confidenceScore = database.averageConfidence * 100; // 置信度直接转换为分数

    return Math.round((plantScore + imageScore + knowledgeScore + confidenceScore) / 4);
  }

  /**
   * 计算AI分数
   */
  private calculateAIScore(ai: SystemHealthMetrics['aiPerformance']): number {
    const requestScore = Math.min(ai.requestCount / 10, 100); // 每10个请求1分
    const successRateScore = ai.successRate; // 直接使用成功率
    const processingTimeScore = Math.max(0, 100 - (ai.averageProcessingTime / 5)); // 每毫秒扣0.2分
    const accuracyScore = ai.modelAccuracy; // 直接使用准确率

    return Math.round((requestScore + successRateScore + processingTimeScore + accuracyScore) / 4);
  }

  /**
   * 确定系统状态
   */
  private determineSystemStatus(score: number, alerts: HealthAlert[]): 'healthy' | 'warning' | 'critical' {
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
    
    if (criticalAlerts.length > 0 || score < 60) {
      return 'critical';
    } else if (score < 80 || alerts.filter(alert => alert.type === 'warning').length > 0) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  /**
   * 保存健康检查记录
   */
  private async saveHealthCheckRecord(record: {
    metrics: SystemHealthMetrics;
    alerts: HealthAlert[];
    overallScore: number;
    status: string;
    duration: number;
  }): Promise<void> {
    try {
      await prisma.healthCheck.create({
        data: {
          overallScore: record.overallScore,
          status: record.status,
          duration: record.duration,
          metrics: record.metrics,
          alertCount: record.alerts.length,
          criticalAlertCount: record.alerts.filter(a => a.type === 'critical').length
        }
      });

      console.log(`💾 Saved health check record (Score: ${record.overallScore}, Status: ${record.status})`);
    } catch (error) {
      console.error('Error saving health check record:', error);
    }
  }

  /**
   * 获取历史健康检查记录
   */
  async getHealthHistory(limit: number = 10): Promise<any[]> {
    try {
      return await prisma.healthCheck.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error getting health history:', error);
      return [];
    }
  }

  /**
   * 获取趋势分析
   */
  async getTrendAnalysis(period: 'week' | 'month' | 'quarter' = 'week'): Promise<{
    period: string;
    trends: {
      performance: { current: number; previous: number; change: number };
      users: { current: number; previous: number; change: number };
      database: { current: number; previous: number; change: number };
      ai: { current: number; previous: number; change: number };
    };
  }> {
    try {
      const now = new Date();
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      
      const [currentPeriod, previousPeriod] = await Promise.all([
        prisma.healthCheck.findMany({
          where: {
            createdAt: {
              gte: new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.healthCheck.findMany({
          where: {
            createdAt: {
              gte: new Date(now.getTime() - 2 * periodDays * 24 * 60 * 60 * 1000),
              lt: new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const currentAvg = currentPeriod.length > 0 
        ? currentPeriod.reduce((sum, check) => sum + check.overallScore, 0) / currentPeriod.length
        : 0;
      
      const previousAvg = previousPeriod.length > 0 
        ? previousPeriod.reduce((sum, check) => sum + check.overallScore, 0) / previousPeriod.length
        : 0;

      return {
        period: `${period}ly trends`,
        trends: {
          performance: {
            current: currentAvg,
            previous: previousAvg,
            change: previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
          },
          users: {
            current: currentAvg,
            previous: previousAvg,
            change: previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
          },
          database: {
            current: currentAvg,
            previous: previousAvg,
            change: previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
          },
          ai: {
            current: currentAvg,
            previous: previousAvg,
            change: previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
          }
        }
      };
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      return {
        period: `${period}ly trends`,
        trends: {
          performance: { current: 0, previous: 0, change: 0 },
          users: { current: 0, previous: 0, change: 0 },
          database: { current: 0, previous: 0, change: 0 },
          ai: { current: 0, previous: 0, change: 0 }
        }
      };
    }
  }
}

// 导出单例实例
export const gardenHealthMonitor = GardenHealthMonitor.getInstance();