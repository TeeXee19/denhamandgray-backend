import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.logger.log('Cloudinary configured successfully');
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'whistleblowing-reports',
          resource_type: 'auto',
          // Generate a unique filename
          public_id: `evidence-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload failed:', error);
            return reject(error);
          }
          this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract public_id from the URL
      const publicId = this.extractPublicId(fileUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        this.logger.log(`File deleted from Cloudinary: ${publicId}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete file from Cloudinary:', error);
      throw error;
    }
  }

  private extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      this.logger.error('Failed to extract public ID from URL:', error);
      return null;
    }
  }
}
