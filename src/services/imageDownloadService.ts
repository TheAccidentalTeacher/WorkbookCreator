import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export class ImageDownloadService {
  private static readonly IMAGE_DIR = path.join(process.cwd(), 'public', 'generated-images');

  /**
   * Ensure the image directory exists
   */
  private static async ensureImageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.IMAGE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create image directory:', error);
      throw error;
    }
  }

  /**
   * Generate a unique filename for an image
   */
  private static generateImageFilename(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `workbook-image-${timestamp}-${random}.png`;
  }

  /**
   * Download an image from a URL and save it locally
   * @param imageUrl The DALL-E image URL
   * @returns Object with local file path and base64 data
   */
  static async downloadImage(imageUrl: string): Promise<{localPath: string, base64Data: string}> {
    try {
      await this.ensureImageDirectory();
      
      console.log(`🖼️ Downloading image from: ${imageUrl.substring(0, 100)}...`);
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.buffer();
      const filename = this.generateImageFilename();
      const localFilePath = path.join(this.IMAGE_DIR, filename);
      
      await fs.writeFile(localFilePath, buffer);
      
      // Convert to base64 for PDF embedding
      const base64Data = buffer.toString('base64');
      const base64DataUrl = `data:image/png;base64,${base64Data}`;
      
      // Return the path relative to the public directory
      const publicPath = `/generated-images/${filename}`;
      console.log(`✅ Image saved locally: ${publicPath}`);
      
      return {
        localPath: publicPath,
        base64Data: base64DataUrl
      };
    } catch (error) {
      console.error('❌ Failed to download image:', error);
      throw new Error(`Image download failed: ${error}`);
    }
  }

  /**
   * Download multiple images and return their local paths and base64 data
   * @param imageUrls Array of DALL-E image URLs
   * @returns Array of objects with local paths and base64 data
   */
  static async downloadImages(imageUrls: string[]): Promise<Array<{localPath: string, base64Data: string}>> {
    console.log(`🎨 Downloading ${imageUrls.length} images...`);
    
    const downloadPromises = imageUrls.map(url => this.downloadImage(url));
    
    try {
      const imageData = await Promise.all(downloadPromises);
      console.log(`✅ Successfully downloaded ${imageData.length} images`);
      return imageData;
    } catch (error) {
      console.error('❌ Failed to download some images:', error);
      throw error;
    }
  }

  /**
   * Clean up old generated images (optional maintenance function)
   */
  static async cleanupOldImages(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.IMAGE_DIR);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.IMAGE_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️ Cleaned up old image: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old images:', error);
    }
  }

  /**
   * Get the absolute file path for a local image
   * @param publicPath The path relative to the public directory
   * @returns The absolute file path
   */
  static getAbsolutePath(publicPath: string): string {
    const filename = path.basename(publicPath);
    return path.join(this.IMAGE_DIR, filename);
  }
}