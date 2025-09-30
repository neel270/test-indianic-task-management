import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'jpg' | 'png' | 'webp';
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  path: string;
}

export class ImageUtil {
  /**
   * Resize an image and save it to the specified path
   */
  static async resizeImage(
    inputPath: string,
    outputPath: string,
    options: ImageResizeOptions = {}
  ): Promise<ImageInfo> {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let sharpInstance = sharp(inputPath);

      // Resize image
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert format if needed
      if (format === 'jpeg' || format === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      }

      // Save the processed image
      await sharpInstance.toFile(outputPath);

      // Get image info
      const metadata = await sharp(outputPath).metadata();
      const stats = fs.statSync(outputPath);

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || format,
        size: stats.size,
        path: outputPath
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create thumbnail from image
   */
  static async createThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = 150
  ): Promise<ImageInfo> {
    return this.resizeImage(inputPath, outputPath, {
      width: size,
      height: size,
      quality: 80,
      format: 'jpeg'
    });
  }

  /**
   * Get image information without processing
   */
  static async getImageInfo(imagePath: string): Promise<ImageInfo> {
    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = fs.statSync(imagePath);

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: stats.size,
        path: imagePath
      };
    } catch (error) {
      throw new Error(`Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate if file is a valid image
   */
  static async validateImage(filePath: string): Promise<boolean> {
    try {
      await sharp(filePath).metadata();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compress image for web optimization
   */
  static async compressForWeb(
    inputPath: string,
    outputPath: string,
    maxWidth: number = 1200,
    quality: number = 85
  ): Promise<ImageInfo> {
    return this.resizeImage(inputPath, outputPath, {
      width: maxWidth,
      quality,
      format: 'webp'
    });
  }

  /**
   * Convert image to different format
   */
  static async convertFormat(
    inputPath: string,
    outputPath: string,
    targetFormat: 'jpeg' | 'jpg' | 'png' | 'webp',
    quality: number = 80
  ): Promise<ImageInfo> {
    try {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      let sharpInstance = sharp(inputPath);

      // Convert to target format
      if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (targetFormat === 'png') {
        sharpInstance = sharpInstance.png({ quality });
      } else if (targetFormat === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      }

      await sharpInstance.toFile(outputPath);

      const metadata = await sharp(outputPath).metadata();
      const stats = fs.statSync(outputPath);

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || targetFormat,
        size: stats.size,
        path: outputPath
      };
    } catch (error) {
      throw new Error(`Format conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete image file
   */
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
