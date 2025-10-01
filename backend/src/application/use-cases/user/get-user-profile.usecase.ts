import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';

export interface GetUserProfileDto {
  userId: string;
}

export class GetUserProfileUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepositoryImpl();
  }

  async execute(data: GetUserProfileDto): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      const user = await this.userRepository.findById(data.userId);

      if (!user) {
        throw new Error('User not found');
      }

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
      throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
