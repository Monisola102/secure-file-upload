import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { ERROR_MESSAGES, FILE_CONFIG } from '../common/constants';
import { FileValidator } from './utils/file-validator.util';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(File)
    private readonly fileRepo: Repository<File>,
  ) {
    this.uploadDir = path.join(process.cwd(), FILE_CONFIG.UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<File> {
    FileValidator.validateExtension(file.originalname);
    FileValidator.validateMimeType(file.mimetype);
    FileValidator.validateSize(file.size);

    const sanitizedOriginalName = FileValidator.sanitizeFilename(
      file.originalname,
    );
    const uniqueFilename = FileValidator.generateUniqueFilename(
      sanitizedOriginalName,
    );
    const filePath = path.join(this.uploadDir, uniqueFilename);

    try {
      await fsPromises.writeFile(filePath, file.buffer);
      await FileValidator.validateFileSignature(filePath, file.mimetype);

      const fileEntity = this.fileRepo.create({
        originalName: sanitizedOriginalName,
        storedName: uniqueFilename,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        userId,
      });

      return await this.fileRepo.save(fileEntity);
    } catch (error) {
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
      }
      throw error;
    }
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return this.fileRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getFileById(fileId: string, userId: string): Promise<File> {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });

    if (!file) {
      throw new NotFoundException(ERROR_MESSAGES.FILE_NOT_FOUND);
    }

    if (file.userId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    return file;
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFileById(fileId, userId);

    try {
      if (fs.existsSync(file.path)) {
        await fsPromises.unlink(file.path);
      }
      await this.fileRepo.delete(fileId);
    } catch (error) {
      throw new BadRequestException(
        `${ERROR_MESSAGES.OPERATION_FAILED}: ${error.message}`,
      );
    }
  }

  async downloadFile(
    fileId: string,
    userId: string,
  ): Promise<{ file: File; stream: fs.ReadStream }> {
    const file = await this.getFileById(fileId, userId);

    if (!fs.existsSync(file.path)) {
      throw new NotFoundException(ERROR_MESSAGES.FILE_NOT_FOUND);
    }

    const stream = fs.createReadStream(file.path);
    return { file, stream };
  }
}
