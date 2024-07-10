import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middleware/Authentication.js';
import UserController from '../controllers/UserController.js';
import NewsController from '../controllers/NewsController.js';
import redisCache from '../db/redis.config.js';

const router = Router();

// Auth Route
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/send-email', AuthController.sendingEmail);

// Private Route
router.get('/profile', authMiddleware, UserController.getUser);
router.put(
  `/profile/:id`,
  authMiddleware,
  UserController.updateUserProfileById
);

// News Route
router.get('/news', redisCache.route(), NewsController.getNews);
router.post('/news', authMiddleware, NewsController.addNews);
router.get(`/news/:id`, NewsController.getNewsById);
router.put(`/news/:id`, authMiddleware, NewsController.updateNewsById);
router.delete(`/news/:id`, authMiddleware, NewsController.deleteNewsById);

export default router;
