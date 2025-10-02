import { UserService } from '../../../application/services/user.service';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UpdateProfileUseCase {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async execute(
    userId: string,
    updateData: UpdateProfileDto
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
    updatedAt: Date;
    createdAt: Date;
  }> {
    try {
      // Validate that at least one field is provided
      if (!updateData.firstName && !updateData.lastName && !updateData.email) {
        throw new Error('At least one field must be provided for update');
      }

      // Prepare data for UserService (combine firstName and lastName into name if needed)
      const serviceUpdateData: any = {};

      if (updateData.firstName !== undefined) {
        serviceUpdateData.name = updateData.firstName;
      }
      if (updateData.lastName !== undefined) {
        const currentName = updateData.firstName ?? '';
        serviceUpdateData.name = `${currentName} ${updateData.lastName}`.trim();
      }
      if (updateData.email !== undefined) {
        serviceUpdateData.email = updateData.email;
      }

      // Use UserService to update user
      const updatedUser = await this.userService.updateUser(userId, serviceUpdateData);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        updatedAt: new Date(updatedUser.updatedAt),
        createdAt: new Date(updatedUser.createdAt),
      };
    } catch (error) {
      throw new Error(
        `Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
