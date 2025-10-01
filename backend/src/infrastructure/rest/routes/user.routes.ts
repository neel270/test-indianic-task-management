import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';

export const createUserRoutes = (): Router => {
  const router = Router();

  // Initialize controller with dependencies
  const userController = new UserController();

  // Admin-only routes for user management (simplified)
  router.get(
    '/users',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    authMiddleware.adminOnly,
    userController.listUsers.bind(userController)
  );

  router.put(
    '/users/:id/status',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    authMiddleware.adminOnly,
    userController.toggleUserStatus.bind(userController)
  );

  return router;
};
