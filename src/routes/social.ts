import { Router } from 'express';
import { SocialController } from '../controllers/socialController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All social routes require authentication
router.use(authenticate);

// Group management routes
router.post('/groups', SocialController.createGroup);
router.get('/groups', SocialController.getUserGroups);

// Group membership routes
router.post('/groups/:groupId/join', SocialController.joinGroup);
router.post('/groups/:groupId/leave', SocialController.leaveGroup);

// Challenge management routes
router.post('/challenges', SocialController.createChallenge);
router.put('/challenges/:challengeId/progress', SocialController.updateChallengeProgress);

// Social features routes
router.get('/groups/:groupId/leaderboard', SocialController.getLeaderboard);
router.get('/stats', SocialController.getUserSocialStats);

export default router;