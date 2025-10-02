import { UserEntity } from '../../../domain/entities';
import { UserService } from '../../services/user.service';

export class ToggleUserStatusUseCase {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async execute(userId: string, requesterRole: string, requesterId: string): Promise<UserEntity> {
    try {
      // Only admins can toggle user status
      if (requesterRole !== 'admin') {
        throw new Error('Access denied: Admin role required');
      }

      // Admins should not be able to deactivate themselves
      if (userId === requesterId) {
        throw new Error('Cannot deactivate your own account');
      }

      return await this.userService.toggleUserStatus(userId);
    } catch (error) {
      throw new Error(
        `User status toggle failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
