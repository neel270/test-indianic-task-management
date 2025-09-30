import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const createUserRoutes = (
  userController: UserController
): Router => {
  const router = Router();

  router.post('/register', userController.createUser.bind(userController));
  router.post('/login', userController.loginUser.bind(userController));
  router.get('/profile', authMiddleware, userController.getProfile.bind(userController));

  return router;
};
