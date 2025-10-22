import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { UserPayload } from './types/userPayload.type';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserPayload | null> {
    const user = await this.userService.findByEmail(email);

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      return {
        id: user.id,
        email: user.email,
      };
    }
    return null;
  }

  login(user: UserPayload) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return {
      success: true,
      token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<User | null> {
    return this.userService.create(registerDto);
  }
}

