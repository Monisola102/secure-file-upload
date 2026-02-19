import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CsrfGuard } from 'src/auth/guards/csrf.guard';
import { RateLimitInterceptor } from '../common/interceptors/rate-limit.interceptor';
import { FileResponseDto } from './dto/file-response.dto';
import { FileUploadDto } from './dto/file-upload.dto';
import { plainToInstance } from 'class-transformer';
import { SUCCESS_MESSAGES } from '../common/constants';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(CsrfGuard)
  @ApiSecurity('csrf-token')
  @UseInterceptors(RateLimitInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Upload a file securely. Requires CSRF token in x-csrf-token header. Max file size: 5MB. Allowed types: jpg, png, gif, webp, pdf',
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - invalid CSRF token' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = await this.filesService.uploadFile(
      file,
      req.user.userId,
    );

    return plainToInstance(FileResponseDto, uploadedFile, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all files uploaded by current user' })
  @ApiResponse({ status: 200, description: 'Success', type: [FileResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserFiles(@Request() req): Promise<FileResponseDto[]> {
    const files = await this.filesService.getUserFiles(req.user.userId);
    return plainToInstance(FileResponseDto, files, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details by ID' })
  @ApiResponse({ status: 200, description: 'Success', type: FileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<FileResponseDto> {
    const file = await this.filesService.getFileById(id, req.user.userId);
    return plainToInstance(FileResponseDto, file, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download file',
    description: 'Download a file. Only the file owner can download it.',
  })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('id') id: string,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, stream } = await this.filesService.downloadFile(
      id,
      req.user.userId,
    );

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your file' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.filesService.deleteFile(id, req.user.userId);
    return { message: SUCCESS_MESSAGES.FILE_DELETED };
  }
}
