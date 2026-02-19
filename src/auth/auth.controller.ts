import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Session,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from 'src/users/dto/ChangePassword.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { SUCCESS_MESSAGES } from '../common/constants';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: SUCCESS_MESSAGES.RESOURCE_CREATED, type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
    const result = await this.authService.signup(signupDto);
    return plainToInstance(AuthResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: SUCCESS_MESSAGES.LOGIN_SUCCESS, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    return plainToInstance(AuthResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
 async changePassword(
  @Request() req,
  @Body() changePasswordDto: ChangePasswordDto,
) {
  return this.authService.changePassword(req.user.userId, changePasswordDto);
}
  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token for file uploads' })
  @ApiResponse({ status: 200, description: 'CSRF token generated successfully' })
  getCsrfToken(@Session() session: Record<string, any>) {
    const csrfToken = this.authService.generateCsrfToken();
    session.csrfToken = csrfToken;
    return { csrfToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    const user = await this.authService.validateUser(req.user.userId);
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}