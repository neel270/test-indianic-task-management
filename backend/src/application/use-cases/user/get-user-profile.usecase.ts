import { UserService } from '../../../application/services/user.service';

export interface GetUserProfileDto {
  userId: string;
}

export class GetUserProfileUseCase {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async execute(data: GetUserProfileDto): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      // Use UserService to get user by ID
      const user = await this.userService.getUserById(data.userId);

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
