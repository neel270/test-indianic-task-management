import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
        return;
      }

      // Verify the token
      const decoded = await this.authService.verifyAccessToken(token);

      // Add user info to request object
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  };

  authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
        });
        return;
      }

      next();
    };
  };

  // Convenience middleware for admin-only routes
  adminOnly = (req: Request, res: Response, next: NextFunction): void => {
    this.authorize(['admin'])(req, res, next);
  };

  // Convenience middleware for user and admin routes
  userOnly = (req: Request, res: Response, next: NextFunction): void => {
    this.authorize(['user', 'admin'])(req, res, next);
  };
}

// Export a default instance
export const authMiddleware = new AuthMiddleware();
