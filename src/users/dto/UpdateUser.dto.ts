import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'newemail@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}


import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'test@gmail.com', description: 'User email address' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name?: string;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Account creation date' })
  createdAt?: Date;
}