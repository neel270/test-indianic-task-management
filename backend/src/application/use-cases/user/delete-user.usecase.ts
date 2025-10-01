import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { UserService } from '../../services/user.service';

export class DeleteUserUseCase {
  private userService: UserService;

  constructor(userRepository?: IUserRepository) {
    const userRepo = userRepository ?? new UserRepositoryImpl();
    this.userService = new UserService(userRepo);
  }

  async execute(
    userId: string,
    requesterRole: string,
    requesterId: string
  ): Promise<{ message: string }> {
    try {
      // Only admins can delete users
      if (requesterRole !== 'admin') {
        throw new Error('Access denied: Admin role required');
      }

      // Admins should not be able to delete themselves
      if (userId === requesterId) {
        throw new Error('Cannot delete your own account');
      }

      // Check if user exists
      const user = await this.userService.getUserById(userId);

      // Delete the user
      await this.userService.deleteUser(userId);

      return { message: `User ${user.name} has been deleted successfully` };
    } catch (error) {
      throw new Error(
        `User deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
