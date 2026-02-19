import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileResponseDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'document.pdf' })
  originalName: string;

  @Expose()
  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @Expose()
  @ApiProperty({ example: 1024000 })
  size: number;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}