import { Request, Response } from 'express';

export class UserController {
  constructor(
    private createUserUseCase: any,
    private loginUserUseCase: any
  ) {}

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
}
