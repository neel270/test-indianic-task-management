import { UpdateUserDto } from '../../dtos/user.dto';
import { UserService } from '../../services/user.service';

export class UpdateUserUseCase {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async execute(
    userId: string,
    updateData: UpdateUserDto,
    requesterRole: string,
    requesterId: string
  ): Promise<any> {
    try {
      // Only admins can update users
      if (requesterRole !== 'admin') {
        throw new Error('Access denied: Admin role required');
      }

      // Admins should not be able to deactivate themselves
      if (userId === requesterId && updateData.isActive === false) {
        throw new Error('Cannot deactivate your own account');
      }

      return await this.userService.updateUser(userId, updateData);
    } catch (error) {
      throw new Error(
        `User update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
