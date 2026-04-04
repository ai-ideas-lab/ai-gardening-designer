import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export class SocialController {
  
  /**
   * Create a new social group
   */
  static async createGroup(req: AuthRequest, res: Response) {
    try {
      const { name, description, isPrivate = false } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Group name is required' }
        });
      }

      const group = await prisma.socialGroup.create({
        data: {
          name: name.trim(),
          description: description?.trim() || '',
          isPrivate,
          members: {
            connect: {
              id: req.user.id
            }
          }
        },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          challenges: true
        }
      });

      res.status(201).json({
        success: true,
        data: group
      });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create group' }
      });
    }
  }

  /**
   * Get user's groups
   */
  static async getUserGroups(req: AuthRequest, res: Response) {
    try {
      const groups = await prisma.socialGroup.findMany({
        where: {
          OR: [
            { isPublic: false },
            {
              members: {
                some: {
                  id: req.user.id
                }
              }
            }
          ]
        },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          challenges: {
            select: {
              id: true,
              title: true,
              isActive: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      console.error('Error getting user groups:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get groups' }
      });
    }
  }

  /**
   * Join a social group
   */
  static async joinGroup(req: AuthRequest, res: Response) {
    try {
      const { groupId } = req.params;

      const group = await prisma.socialGroup.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          error: { message: 'Group not found' }
        });
      }

      if (group.isPrivate) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot join private group' }
        });
      }

      await prisma.socialGroup.update({
        where: { id: groupId },
        data: {
          members: {
            connect: {
              id: req.user.id
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Successfully joined group'
      });
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to join group' }
      });
    }
  }

  /**
   * Leave a social group
   */
  static async leaveGroup(req: AuthRequest, res: Response) {
    try {
      const { groupId } = req.params;

      await prisma.socialGroup.update({
        where: { id: groupId },
        data: {
          members: {
            disconnect: {
              id: req.user.id
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Successfully left group'
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to leave group' }
      });
    }
  }

  /**
   * Create a group challenge
   */
  static async createChallenge(req: AuthRequest, res: Response) {
    try {
      const { 
        groupId, 
        title, 
        description, 
        targetValue, 
        unit, 
        startDate, 
        endDate 
      } = req.body;

      // Verify user is a member of the group
      const group = await prisma.socialGroup.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              id: req.user.id
            }
          }
        }
      });

      if (!group) {
        return res.status(403).json({
          success: false,
          error: { message: 'You are not a member of this group' }
        });
      }

      const challenge = await prisma.socialGroup.create({
        data: {
          groupId,
          title,
          description,
          targetValue,
          unit,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: true
        },
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Create user challenges for all group members
      const groupMembers = await prisma.socialGroup.findUnique({
        where: { id: groupId },
        select: { members: { select: { id: true } } }
      });

      if (groupMembers?.members.length) {
        await prisma.userChallenge.createMany({
          data: groupMembers.members.map(member => ({
            userId: member.id,
            challengeId: challenge.id,
            progress: 0,
            completed: false
          }))
        });
      }

      res.status(201).json({
        success: true,
        data: challenge
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create challenge' }
      });
    }
  }

  /**
   * Update challenge progress
   */
  static async updateChallengeProgress(req: AuthRequest, res: Response) {
    try {
      const { challengeId } = req.params;
      const { progress } = req.body;

      const userChallenge = await prisma.userChallenge.findFirst({
        where: {
          challengeId,
          userId: req.user.id
        },
        include: {
          challenge: true
        }
      });

      if (!userChallenge) {
        return res.status(404).json({
          success: false,
          error: { message: 'Challenge not found or not enrolled' }
        });
      }

      const isCompleted = progress >= userChallenge.challenge.targetValue;
      const completedAt = isCompleted ? new Date() : null;

      const updatedChallenge = await prisma.userChallenge.update({
        where: { id: userChallenge.id },
        data: {
          progress,
          completed: isCompleted,
          completedAt
        }
      });

      // Create achievement if challenge is completed
      if (isCompleted) {
        await prisma.achievement.create({
          data: {
            userId: req.user.id,
            title: '挑战完成',
            description: `完成了碳减排挑战: ${userChallenge.challenge.title}`,
            icon: '🏆',
            points: 100
          }
        });
      }

      res.json({
        success: true,
        data: updatedChallenge
      });
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update challenge progress' }
      });
    }
  }

  /**
   * Calculate user's carbon impact
   */
  private static async calculateCarbonImpact(userId: string) {
    const records = await prisma.carbonRecord.findMany({
      where: { userId }
    });

    const totalEmissions = records.reduce((sum, record) => {
      return sum + (record.carbonEmission || 0);
    }, 0);

    const reductionsCount = records.filter(r => r.type === 'REDUCTION').length;
    const impactScore = reductionsCount * 10; // Simple scoring system

    return {
      totalEmissions,
      reductionsCount,
      impactScore
    };
  }

  /**
   * Get group leaderboard
   */
  static async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const { groupId } = req.params;
      const { period = 'week' } = req.query;

      const group = await prisma.socialGroup.findUnique({
        where: { id: groupId },
        select: { members: { select: { id: true } } }
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          error: { message: 'Group not found' }
        });
      }

      const memberIds = group.members.map(m => m.id);

      // Get achievements and carbon records for all members
      const [achievements, carbonRecords] = await Promise.all([
        prisma.achievement.findMany({
          where: { userId: { in: memberIds } }
        }),
        prisma.carbonRecord.findMany({
          where: { userId: { in: memberIds } }
        })
      ]);

      // Calculate stats for each member
      const leaderboard = await Promise.all(
        memberIds.map(async (userId) => {
          const userAchievements = achievements.filter(a => a.userId === userId);
          const userCarbonRecords = carbonRecords.filter(r => r.userId === userId);
          
          const carbonImpact = await this.calculateCarbonImpact(userId);

          return {
            user: {
              id: userId,
              name: userId === req.user.id ? req.user.name : 'Unknown User',
              avatar: null
            },
            totalPoints: userAchievements.reduce((sum, a) => sum + (a.points || 0), 0),
            totalReduction: carbonImpact.totalEmissions,
            achievementsCount: userAchievements.length,
            recordsCount: userCarbonRecords.length,
            impactScore: carbonImpact.impactScore
          };
        })
      );

      // Sort by total points (descending)
      leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

      res.json({
        success: true,
        data: {
          leaderboard,
          period,
          totalMembers: memberIds.length
        }
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get leaderboard' }
      });
    }
  }

  /**
   * Get user social statistics
   */
  static async getUserSocialStats(req: AuthRequest, res: Response) {
    try {
      const [groupsCount, activeChallengesCount, totalAchievementsCount] = await Promise.all([
        prisma.socialGroup.count({
          where: {
            members: {
              some: { id: req.user.id }
            }
          }
        }),
        prisma.userChallenge.count({
          where: {
            userId: req.user.id,
            completed: false
          }
        }),
        prisma.achievement.count({
          where: { userId: req.user.id }
        })
      ]);

      const recentAchievementsCount = await prisma.achievement.count({
        where: {
          userId: req.user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      const carbonImpact = await this.calculateCarbonImpact(req.user.id);

      res.json({
        success: true,
        data: {
          groups: groupsCount,
          activeChallenges: activeChallengesCount,
          totalAchievements: totalAchievementsCount,
          recentAchievements: recentAchievementsCount,
          carbonImpact
        }
      });
    } catch (error) {
      console.error('Error getting user social stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get social stats' }
      });
    }
  }
}