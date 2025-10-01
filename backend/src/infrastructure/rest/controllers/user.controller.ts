import { Request, Response } from 'express';
import { ListUsersUseCase } from '../../../application/use-cases/user/list-users.usecase';
import { ToggleUserStatusUseCase } from '../../../application/use-cases/user/toggle-user-status.usecase';

export class UserController {
  private listUsersUseCase: ListUsersUseCase = new ListUsersUseCase();
  private toggleUserStatusUseCase: ToggleUserStatusUseCase = new ToggleUserStatusUseCase();
  constructor() {}

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { page, limit, role, isActive, search } = req.query;

      const filters = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        role: role as 'admin' | 'user',
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search as string,
      };

      const result = await this.listUsersUseCase.execute(user.role, filters);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const result = await this.toggleUserStatusUseCase.execute(id, user.role, user.id);

      res.status(200).json({
        success: true,
        data: result,
        message: 'User status updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
