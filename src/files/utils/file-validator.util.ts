import { BadRequestException } from '@nestjs/common';
import {
  ERROR_MESSAGES,
  FILE_CONFIG,
  FILE_SIGNATURES,
  isAllowedExtension,
  isAllowedMimeType,
} from '../../common/constants';
import * as path from 'path';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';

export class FileValidator {
  // Sanitize filename to prevent path traversal attacks
  static sanitizeFilename(filename: string): string {
    const sanitized = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '_')
      .replace(/^\./, '_');

    if (!sanitized || sanitized.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.SUSPICIOUS_FILENAME);
    }

    return sanitized;
  }

  // Validate file extension
  static validateExtension(filename: string): void {
    const ext = path.extname(filename).toLowerCase();

    if (!isAllowedExtension(ext)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
  }

  // Validate MIME type, file size, file signature (magic bytes to revent file type spoofing)
  static validateMimeType(mimeType: string): void {
    if (!isAllowedMimeType(mimeType)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
  }
  static validateSize(size: number): void {
    if (size > FILE_CONFIG.MAX_SIZE) {
      throw new BadRequestException(ERROR_MESSAGES.FILE_TOO_LARGE);
    }
  }
  static async validateFileSignature(
    filePath: string,
    mimeType: string,
  ): Promise<void> {
    const expectedSignature = FILE_SIGNATURES[mimeType];

    if (!expectedSignature) {
      return;
    }

    try {
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(expectedSignature.length);
      await fileHandle.read(buffer, 0, expectedSignature.length, 0);
      await fileHandle.close();

      const isValid = expectedSignature.every(
        (byte, index) => buffer[index] === byte,
      );

      if (!isValid) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_FILE_SIGNATURE);
      }
    } catch (error) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_FILE_SIGNATURE);
    }
  }
  // Generate unique filename
  static generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    return `${timestamp}-${randomString}${ext}`;
  }
  // Constant-time string comparison for tokens
  static constantTimeCompare(a: string, b: string): boolean {
    if (!a || !b || a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  }
}
