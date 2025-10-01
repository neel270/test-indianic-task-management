import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { profileImageUpload } from '../../config/multer.config';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateVerifyOTP,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword,
} from '../../middlewares/express-validation.middleware';

export const createAuthRoutes = (): Router => {
  const router = Router();
  const authController = new AuthController();

  router.post('/register', validateRegister, authController.register);
  router.post('/login', validateLogin, authController.login);
  router.post('/refresh', validateRefreshToken, authController.refreshToken);
  router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
  router.post('/verify-otp', validateVerifyOTP, authController.verifyOTP);
  router.post('/reset-password', validateResetPassword, authController.resetPassword);
  router.get('/me', authMiddleware.authenticate, authController.me);
  router.post(
    '/upload-profile-image',
    authMiddleware.authenticate,
    profileImageUpload.single('profileImage'),
    authController.uploadProfileImage
  );

  router.put(
    '/profile',
    authMiddleware.authenticate,
    validateUpdateProfile,
    authController.updateProfile
  );

  router.put(
    '/change-password',
    authMiddleware.authenticate,
    validateChangePassword,
    authController.changePassword
  );

  return router;
};
