import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { BadRequestException } from '@nestjs/common';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  describe('validateFile', () => {
    it('should validate file successfully', () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile)).not.toThrow();
    });

    it('should throw BadRequestException when no file provided', () => {
      expect(() => service.validateFile(null)).toThrow(BadRequestException);
      expect(() => service.validateFile(undefined)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when file is too large', () => {
      const largeFile = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 6 * 1024 * 1024, // 6MB
        buffer: Buffer.from('large content'),
      } as Express.Multer.File;

      expect(() => service.validateFile(largeFile)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid file type', () => {
      const invalidFile = {
        originalname: 'test.exe',
        mimetype: 'application/x-executable',
        size: 1024,
        buffer: Buffer.from('executable content'),
      } as Express.Multer.File;

      expect(() => service.validateFile(invalidFile)).toThrow(BadRequestException);
    });

    it('should accept valid file types', () => {
      const validTypes = [
        { mimetype: 'application/pdf', originalname: 'document.pdf' },
        { mimetype: 'image/jpeg', originalname: 'image.jpg' },
        { mimetype: 'image/png', originalname: 'image.png' },
        { mimetype: 'application/msword', originalname: 'document.doc' },
        { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', originalname: 'document.docx' },
      ];

      validTypes.forEach(({ mimetype, originalname }) => {
        const file = {
          originalname,
          mimetype,
          size: 1024,
          buffer: Buffer.from('content'),
        } as Express.Multer.File;

        expect(() => service.validateFile(file)).not.toThrow();
      });
    });
  });

  describe('generateFileName', () => {
    it('should generate unique filename with timestamp', () => {
      const originalName = 'test-document.pdf';
      const filename = service.generateFileName(originalName);

      expect(filename).toMatch(/^\d+_[a-z0-9]+\.pdf$/);
      expect(filename).not.toBe(originalName);
    });

    it('should preserve file extension', () => {
      const originalName = 'document.docx';
      const filename = service.generateFileName(originalName);

      expect(filename).toMatch(/\.docx$/);
    });

    it('should handle files without extension', () => {
      const originalName = 'README';
      const filename = service.generateFileName(originalName);

      expect(filename).toMatch(/^\d+_[a-z0-9]+$/);
    });
  });

  describe('getFilePath', () => {
    it('should return correct file path', () => {
      const filename = '1234567890_abc123.pdf';
      const filePath = service.getFilePath(filename);

      expect(filePath).toBe('./uploads/1234567890_abc123.pdf');
    });
  });

  describe('getFileUrl', () => {
    it('should return correct file URL', () => {
      const filename = '1234567890_abc123.pdf';
      const fileUrl = service.getFileUrl(filename);

      expect(fileUrl).toBe('/uploads/1234567890_abc123.pdf');
    });
  });
});
