import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ImageResizeOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'jpeg' | 'jpg' | 'png' | 'webp';
}

export class ImageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads/';
  }

  /**
   * Resize profile image to 200x200 pixels
   */
  async resizeProfileImage(filePath: string, userId: string): Promise<string> {
    try {
      const options: ImageResizeOptions = {
        width: 200,
        height: 200,
        quality: 80,
        format: 'jpeg',
      };

      // Generate output path
      const fileName = `profile_${Date.now()}.jpg`;
      const outputDir = path.join(this.uploadDir, 'profiles', userId);
      const outputPath = path.join(outputDir, fileName);

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Process image with Sharp
      await sharp(filePath)
        .resize(options.width, options.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: options.quality,
          progressive: true,
        })
        .toFile(outputPath);

      // Clean up original file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return outputPath;
    } catch (error) {
      console.error('Error resizing profile image:', error);
      throw new Error(`Failed to resize profile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resize task attachment image if needed
   */
  async resizeTaskImage(filePath: string, maxWidth: number = 1200, maxHeight: number = 800): Promise<string> {
    try {
      const imageInfo = await sharp(filePath).metadata();

      // Only resize if image is larger than max dimensions
      if (imageInfo.width && imageInfo.height &&
          imageInfo.width > maxWidth && imageInfo.height > maxHeight) {

        const outputPath = `${filePath}_resized_${Date.now()}.jpg`;

        await sharp(filePath)
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 85,
            progressive: true,
          })
          .toFile(outputPath);

        // Remove original file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return outputPath;
      }

      return filePath;
    } catch (error) {
      console.error('Error resizing task image:', error);
      // Return original path if resizing fails
      return filePath;
    }
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(filePath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(filePath).metadata();
    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw new Error(`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image file
   */
  async validateImage(filePath: string): Promise<boolean> {
    try {
      const metadata = await sharp(filePath).metadata();
      return !!(metadata.width && metadata.height);
    } catch {
      return false;
    }
  }

  /**
   * Delete image file
   */
  deleteImage(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!filePath || !fs.existsSync(filePath)) {
        return resolve();
      }

      fs.unlink(filePath, (error) => {
        if (error) {
          console.error('Error deleting image:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Generate thumbnail for image
   */
  async generateThumbnail(filePath: string, size: number = 150): Promise<string> {
    try {
      const outputPath = `${filePath}_thumb_${Date.now()}.jpg`;

      await sharp(filePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: 70,
          progressive: true,
        })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
