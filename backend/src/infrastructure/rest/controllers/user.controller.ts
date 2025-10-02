import { Request, Response } from 'express';
import { ListUsersUseCase } from '../../../application/use-cases/user/list-users.usecase';
import { ToggleUserStatusUseCase } from '../../../application/use-cases/user/toggle-user-status.usecase';
import { ResponseUtil } from '../../utils/response.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserListResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: "user"
 *         isActive:
 *           type: boolean
 *           example: true
 *         profileImage:
 *           type: string
 *           example: "https://example.com/uploads/profile.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-02T00:00:00.000Z"
 *     UserFilters:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: "user"
 *         isActive:
 *           type: boolean
 *           example: true
 *         search:
 *           type: string
 *           example: "john"
 *     UserListData:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserListResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 25
 *             totalPages:
 *               type: integer
 *               example: 3
 *     ToggleUserStatusResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         isActive:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "User status updated successfully"
 */

export class UserController {
  private listUsersUseCase: ListUsersUseCase;
  private toggleUserStatusUseCase: ToggleUserStatusUseCase;
  constructor() {
    this.listUsersUseCase = new ListUsersUseCase();
    this.toggleUserStatusUseCase = new ToggleUserStatusUseCase();
  }

  /**
   * @swagger
   * /api/v1/users/users:
   *   get:
   *     tags:
   *       - Users
   *     summary: List users (Admin only)
   *     description: Retrieve a paginated list of users with optional filtering (Admin access required)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           example: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           example: 10
   *         description: Number of items per page
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *           enum: [admin, user]
   *           example: "user"
   *         description: Filter by user role
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *           example: true
   *         description: Filter by active status
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *           example: "john"
   *         description: Search by name or email
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Users retrieved successfully"
   *                 data:
   *                   $ref: '#/components/schemas/UserListData'
   *       401:
   *         description: Unauthorized - user not authenticated or not admin
   *       403:
   *         description: Forbidden - admin access required
   */
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

      ResponseUtil.paginated(res, result.users, result.pagination, 'Users retrieved successfully');
    } catch (error: any) {
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * @swagger
   * /api/v1/users/users/{id}/status:
   *   put:
   *     tags:
   *       - Users
   *     summary: Toggle user status (Admin only)
   *     description: Toggle the active/inactive status of a user (Admin access required)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: User status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "User status updated successfully"
   *                 data:
   *                   $ref: '#/components/schemas/ToggleUserStatusResponse'
   *       401:
   *         description: Unauthorized - user not authenticated or not admin
   *       403:
   *         description: Forbidden - admin access required
   *       404:
   *         description: User not found
   */
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const result = await this.toggleUserStatusUseCase.execute(id, user.role, user.id);

      ResponseUtil.success(res, result, 'User status updated successfully');
    } catch (error: any) {
      ResponseUtil.badRequest(res, error.message);
    }
  }
}
