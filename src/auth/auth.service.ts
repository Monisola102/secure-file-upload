import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ERROR_MESSAGES } from '../common/constants';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
      name,
    });

    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const isPasswordValid = await this.constantTimePasswordCompare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    return this.generateAuthResponse(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH);
    }
    const user = await this.usersService.findById(userId);
    const isPasswordValid = await this.constantTimePasswordCompare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updateUser(userId, { password: hashedPassword });

    return { message: ERROR_MESSAGES.PASSWORD_CHANGED_SUCCESS };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    const { password, ...safeUser } = user;
    return safeUser;
  }
  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  validateCsrfToken(token1: string, token2: string): boolean {
    if (!token1 || !token2) {
      return false;
    }
    if (token1.length !== token2.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(token1), Buffer.from(token2));
  }
  private generateAuthResponse(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
  private async constantTimePasswordCompare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
