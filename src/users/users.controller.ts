import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UserResponseDto } from './dto/UserResponse.dto';
import { plainToInstance } from 'class-transformer';
import { SUCCESS_MESSAGES } from '../common/constants';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Success', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Success', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateUser(id, updateDto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.deleteUser(id);
    return { message: SUCCESS_MESSAGES.RESOURCE_DELETED };
  }
}
