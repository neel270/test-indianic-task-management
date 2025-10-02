import { UserFiltersDto } from '../../dtos/user.dto';
import { PaginatedUsersResult, UserService } from '../../services/user.service';

export class ListUsersUseCase {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async execute(
    userRole: string,
    filters?: UserFiltersDto & { page?: number; limit?: number }
  ): Promise<PaginatedUsersResult> {
    try {
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 10;

      const userFilters: Record<string, unknown> = {};

      if (filters?.role) {
        userFilters.role = filters.role;
      }
      if (filters?.isActive !== undefined) {
        userFilters.isActive = filters.isActive;
      }
      if (filters?.search) {
        userFilters.search = filters.search;
      }

      return await this.userService.getAllUsers(page, limit, userFilters);
    } catch (error) {
      throw new Error(
        `User listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
