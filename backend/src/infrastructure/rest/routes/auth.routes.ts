import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { profileImageUpload } from '../../config/multer.config';

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/v1/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - firstName
     *               - lastName
     *               - email
     *               - password
     *             properties:
     *               firstName:
     *                 type: string
     *                 example: "John"
     *               lastName:
     *                 type: string
     *                 example: "Doe"
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john@example.com"
     *               password:
     *                 type: string
     *                 format: password
     *                 example: "password123"
     *               role:
     *                 type: string
     *                 enum: [admin, user]
     *                 default: user
     *     responses:
     *       201:
     *         description: User registered successfully
     *       400:
     *         description: Bad request
     *       409:
     *         description: User already exists
     */
    this.router.post('/register', this.authController.register);

    /**
     * @swagger
     * /api/v1/auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john@example.com"
     *               password:
     *                 type: string
     *                 format: password
     *                 example: "password123"
     *     responses:
     *       200:
     *         description: Login successful
     *       401:
     *         description: Invalid credentials
     */
    this.router.post('/login', this.authController.login);

    /**
     * @swagger
     * /api/v1/auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: "refresh-token-here"
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     *       401:
     *         description: Invalid refresh token
     */
    this.router.post('/refresh', this.authController.refreshToken);

    /**
     * @swagger
     * /api/v1/auth/forgot-password:
     *   post:
     *     summary: Request password reset OTP
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john@example.com"
     *     responses:
     *       200:
     *         description: OTP sent successfully
     *       404:
     *         description: User not found
     */
    this.router.post('/forgot-password', this.authController.forgotPassword);

    /**
     * @swagger
     * /api/v1/auth/verify-otp:
     *   post:
     *     summary: Verify OTP for password reset
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - otp
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john@example.com"
     *               otp:
     *                 type: string
     *                 example: "123456"
     *     responses:
     *       200:
     *         description: OTP verified successfully
     *       400:
     *         description: Invalid OTP
     */
    this.router.post('/verify-otp', this.authController.verifyOTP);

    /**
     * @swagger
     * /api/v1/auth/reset-password:
     *   post:
     *     summary: Reset password with reset token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - resetToken
     *               - newPassword
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: "john@example.com"
     *               resetToken:
     *                 type: string
     *                 example: "reset-token-here"
     *               newPassword:
     *                 type: string
     *                 format: password
     *                 example: "newpassword123"
     *     responses:
     *       200:
     *         description: Password reset successfully
     *       400:
     *         description: Invalid reset token
     */
    this.router.post('/reset-password', this.authController.resetPassword);

    /**
     * @swagger
     * /api/v1/auth/me:
     *   get:
     *     summary: Get current user profile
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    this.router.get('/me', authMiddleware.authenticate, this.authController.me);

    /**
     * @swagger
     * /api/v1/auth/upload-profile-image:
     *   post:
     *     summary: Upload profile image
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               profileImage:
     *                 type: string
     *                 format: binary
     *                 description: Profile image file (JPG, PNG, WebP - max 5MB)
     *     responses:
     *       200:
     *         description: Profile image uploaded successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    this.router.post('/upload-profile-image', authMiddleware.authenticate, profileImageUpload.single('profileImage'), this.authController.uploadProfileImage);
 }
}

export const createAuthRoutes = (): Router => {
 const router = Router();
 const authController = new AuthController();

 router.post('/register', authController.register);
 router.post('/login', authController.login);
 router.post('/refresh', authController.refreshToken);
 router.post('/forgot-password', authController.forgotPassword);
 router.post('/verify-otp', authController.verifyOTP);
 router.post('/reset-password', authController.resetPassword);
 router.get('/me', authMiddleware.authenticate, authController.me);
 router.post('/upload-profile-image', authMiddleware.authenticate, profileImageUpload.single('profileImage'), authController.uploadProfileImage);

 return router;
};
