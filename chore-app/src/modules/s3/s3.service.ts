import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Config } from '../../config/s3.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    const config = s3Config();
    
    this.bucket = config.bucket;
    this.region = config.region;

    // Initialize S3 client only if credentials are provided
    if (config.accessKeyId && config.secretAccessKey) {
      this.s3Client = new S3Client({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
    }
  }

  /**
   * Check if S3 is configured
   */
  isConfigured(): boolean {
    return !!this.s3Client && !!this.bucket;
  }

  /**
   * Upload file to S3
   * @param file - The file to upload (from multer)
   * @param folder - Optional folder path in S3 bucket
   * @returns S3 file URL
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'chore-photos',
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException(
        'S3 is not configured. Please set AWS credentials in environment variables.',
      );
    }

    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make file publicly accessible
      });

      await this.s3Client.send(command);

      // Return the public URL
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException(
        `Failed to upload file to S3: ${error.message}`,
      );
    }
  }

  /**
   * Delete file from S3
   * @param fileUrl - The S3 file URL to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException('S3 is not configured');
    }

    try {
      // Extract the key from the URL
      const key = this.extractKeyFromUrl(fileUrl);
      
      if (!key) {
        throw new Error('Invalid S3 URL');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new InternalServerErrorException(
        `Failed to delete file from S3: ${error.message}`,
      );
    }
  }

  /**
   * Extract S3 key from URL
   * @param url - S3 file URL
   * @returns S3 key (file path)
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlPattern = new RegExp(
        `https://${this.bucket}\\.s3\\.${this.region}\\.amazonaws\\.com/(.+)`,
      );
      const match = url.match(urlPattern);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate file type
   * @param file - The file to validate
   * @param allowedTypes - Array of allowed mime types
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Validate file size
   * @param file - The file to validate
   * @param maxSize - Maximum file size in bytes
   */
  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}

