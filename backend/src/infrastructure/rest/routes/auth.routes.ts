import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';

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
     * /api/auth/register:
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
     *               - name
     *               - email
     *               - password
     *             properties:
     *               name:
     *                 type: string
     *                 example: "John Doe"
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
     * /api/auth/login:
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
     * /api/auth/refresh:
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
     * /api/auth/forgot-password:
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
     * /api/auth/verify-otp:
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
     * /api/auth/reset-password:
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
     *               - resetToken
     *               - newPassword
     *             properties:
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
     * /api/auth/me:
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
  }
}
