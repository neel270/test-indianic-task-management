import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { ImageService } from '../../../infrastructure/services/image.service';

export interface UploadProfileImageDto {
  userId: string;
  file: {
    path: string;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export class UploadProfileImageUseCase {
  private userRepository: IUserRepository;
  private imageService: ImageService;

  constructor(userRepository?: IUserRepository, imageService?: ImageService) {
    this.userRepository = userRepository ?? new UserRepositoryImpl();
    this.imageService = imageService ?? new ImageService();
  }

  async execute(data: UploadProfileImageDto): Promise<{
    imageUrl: string;
    originalName: string;
    size: number;
    mimetype: string;
  }> {
    try {
      // Verify user exists
      const user = await this.userRepository.findById(data.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Process and resize the image
      await this.imageService.resizeProfileImage(data.file.path, data.userId);

      // Generate image URL
      const imageUrl = `/uploads/profiles/${data.userId}/${data.file.originalname}`;

      // Update user profile with new image path
      await this.userRepository.updateProfileImage(data.userId, imageUrl);

      return {
        imageUrl,
        originalName: data.file.originalname,
        size: data.file.size,
        mimetype: data.file.mimetype,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload profile image: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
