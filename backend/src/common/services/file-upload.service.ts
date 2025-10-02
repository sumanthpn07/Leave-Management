import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = './uploads';
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX'
      );
    }
  }

  generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = extname(originalName);
    return `${timestamp}_${randomString}${ext}`;
  }

  getFilePath(filename: string): string {
    return `${this.uploadPath}/${filename}`;
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
