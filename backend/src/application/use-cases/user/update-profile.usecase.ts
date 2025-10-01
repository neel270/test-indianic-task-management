import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UpdateProfileUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository ?? new UserRepositoryImpl();
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
  }> {
    try {
      // Validate that at least one field is provided
      if (!updateData.firstName && !updateData.lastName && !updateData.email) {
        throw new Error('At least one field must be provided for update');
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // If email is being updated, check if it's already taken by another user
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.userRepository.findByEmail(updateData.email);
        if (emailExists) {
          throw new Error('Email is already registered to another account');
        }
      }

      // Update the user
      const updatedUser = await this.userRepository.update(userId, updateData);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        updatedAt: new Date(updatedUser.updatedAt),
      };
    } catch (error) {
      throw new Error(
        `Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
