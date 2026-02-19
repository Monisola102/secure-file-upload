import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'File to upload (max 5MB, allowed types: jpg, png, gif, webp, pdf)'
  })
  file: Express.Multer.File;
}