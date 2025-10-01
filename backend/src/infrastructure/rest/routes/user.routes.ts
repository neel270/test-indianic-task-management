import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { profileImageUpload } from '../../config/multer.config';

export const createUserRoutes = (
  userController: UserController
): Router => {
  const router = Router();

  router.post('/register', userController.createUser.bind(userController));
  router.post('/login', userController.loginUser.bind(userController));
  router.get('/profile', authMiddleware.authenticate, userController.getProfile.bind(userController));
  router.post('/profile/upload-image', authMiddleware.authenticate, profileImageUpload.single('profileImage'), userController.uploadProfileImage.bind(userController));

  return router;
};
