import { createHash, randomBytes } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { ProfileService } from '../profile/profile.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { User } from '../users/user.entity.js';
import { RefreshToken } from './refresh-token.entity.js';

const BCRYPT_ROUNDS = 10;
const PG_UNIQUE_VIOLATION = '23505';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.usersService.create({
        email: dto.email,
        password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });

      await this.profileService.create(user.id, dto.transportModes ?? []);

      const { password: _, ...result } = user;
      return result;
    } catch (err: any) {
      if (err?.code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Cette adresse email est déjà utilisée.');
      }
      throw err;
    }
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  }> {
    const user = await this.usersService.findByEmail(dto.email);

    const invalid = new UnauthorizedException('Identifiants incorrects.');
    if (!user) throw invalid;

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw invalid;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: user.id, email: user.email }),
      this.issueRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    };
  }

  async refresh(incomingToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(incomingToken);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.refreshTokenRepo.delete(stored.id);
      throw new UnauthorizedException();
    }

    // Rotation : invalide l'ancien token, émet un nouveau
    await this.refreshTokenRepo.delete(stored.id);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: stored.userId, email: stored.user.email }),
      this.issueRefreshToken(stored.userId),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(incomingToken: string | undefined): Promise<void> {
    if (!incomingToken) return;
    await this.refreshTokenRepo.delete({ tokenHash: this.hashToken(incomingToken) });
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.refreshTokenRepo.save({
      tokenHash: this.hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    return token;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
