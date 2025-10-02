import { env } from '../../../infrastructure/config';
import { UserService } from '../../../application/services/user.service';
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
  private userService: UserService;
  private imageService: ImageService;

  constructor() {
    this.userService = new UserService();
    this.imageService = new ImageService();
  }

  async execute(data: UploadProfileImageDto): Promise<{
    imageUrl: string;
    originalName: string;
    size: number;
    mimetype: string;
  }> {
    try {
      // Process and resize the image first
      const outPut = await this.imageService.resizeProfileImage(data.file.path, data.userId);

      // Use UserService to update user profile with new image path
      await this.userService.updateProfileImage(data.userId, outPut.fileName);

      return {
        imageUrl: `${env.baseUrl}/${outPut.outputPath}`,
        originalName: data.file.originalname,
        size: data.file.size,
        mimetype: data.file.mimetype,
      };
    } catch (error: Error | unknown) {
      throw new Error(
        `Failed to upload profile image: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
