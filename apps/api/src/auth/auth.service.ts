import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { User } from '../users/user.entity.js';

const BCRYPT_ROUNDS = 10;
const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.usersService.create({
        email: dto.email,
        password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });

      const { password: _, ...result } = user;
      return result;
    } catch (err: any) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Cette adresse email est déjà utilisée.');
      }
      throw err;
    }
  }
}
