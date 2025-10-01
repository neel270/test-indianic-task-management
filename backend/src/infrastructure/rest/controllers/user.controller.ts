import { Request, Response } from 'express';
import { ImageService } from '../../services/image.service';

export class UserController {
  private imageService: ImageService;

  constructor(
    private createUserUseCase: any,
    private loginUserUseCase: any
  ) {
    this.imageService = new ImageService();
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const result = await this.createUserUseCase.execute(userData);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const credentials = req.body;
      const result = await this.loginUserUseCase.execute(credentials);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      // Implementation for getting user profile
      res.status(200).json({
        success: true,
        data: { id: userId, message: 'Profile retrieved successfully' }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      // Resize the profile image using Sharp
      await this.imageService.resizeProfileImage(file.path, userId);

      // Update user profile with new image path
      const imageUrl = `/uploads/profiles/${userId}/${file.filename}`;

      // Update user in database (assuming there's an update method)
      // For now, we'll just return the image URL
      res.status(200).json({
        success: true,
        message: 'Profile image uploaded and resized successfully',
        data: {
          imageUrl,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload profile image'
      });
    }
  }
}
