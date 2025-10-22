import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }

    return await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'userType',
        'firstName',
        'lastName',
        'active',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }

    return await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'userType',
        'firstName',
        'lastName',
        'active',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async userExists(email: string): Promise<boolean> {
    if (!email) {
      return false;
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email'],
    });

    return !!existingUser;
  }

  async create(registerDto: RegisterDto): Promise<User | null> {
    const exists = await this.userExists(registerDto.email);
    
    if (exists) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      email: registerDto.email,
      password: passwordHash,
      active: true,
    });

    return await this.userRepository.save(user);
  }
}

