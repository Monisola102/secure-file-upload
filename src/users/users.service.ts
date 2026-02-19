import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ERROR_MESSAGES } from '../common/constants';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }
    return user;
  }

  async updateUser(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    const updatedUser = { ...user, ...attrs };
    return this.userRepo.save(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }
  }
}
