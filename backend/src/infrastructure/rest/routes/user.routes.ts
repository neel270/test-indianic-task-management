import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints (Admin only)
 */

export const createUserRoutes = (): Router => {
  const router = Router();

  // Initialize controller with dependencies
  const userController = new UserController();
  router.put(
    '/:id/status',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    authMiddleware.adminOnly,
    (req, res, next) => void userController.toggleUserStatus(req, res).catch(next)
  );
  // Admin-only routes for user management (simplified)
  router.get(
    '/',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    authMiddleware.adminOnly,
    (req, res, next) => void userController.listUsers(req, res).catch(next)
  );

  return router;
};
