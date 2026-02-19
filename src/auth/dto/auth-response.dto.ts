import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @Expose()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  name?: string;
}