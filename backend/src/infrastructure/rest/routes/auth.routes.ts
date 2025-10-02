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

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and profile management endpoints
 */

export const createAuthRoutes = (): Router => {
  const router = Router();
  const authController = new AuthController();

  router.post('/register', validateRegister, authController.register);
  router.post('/login', validateLogin, authController.login);
  router.post('/refresh', validateRefreshToken, authController.refreshToken);
  router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
  router.post('/verify-otp', validateVerifyOTP, authController.verifyOTP);
  router.post('/reset-password', validateResetPassword, authController.resetPassword);
  router.get(
    '/me',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    authController.me
  );
  router.post(
    '/upload-profile-image',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    profileImageUpload.single('profileImage'),
    authController.uploadProfileImage
  );

  router.put(
    '/profile',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateUpdateProfile,
    authController.updateProfile
  );

  router.put(
    '/change-password',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateChangePassword,
    authController.changePassword
  );

  return router;
};
