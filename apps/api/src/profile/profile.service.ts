import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { Profile } from './profile.entity.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly usersService: UsersService,
  ) {}

  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
      select: {
        user: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    });
    if (!profile) throw new NotFoundException('Profil introuvable.');
    return profile;
  }

  async create(userId: string, transportModes: string[]): Promise<Profile> {
    const profile = this.profileRepository.create({
      user: { id: userId },
      transportModes,
    });
    return this.profileRepository.save(profile);
  }

  async updateTransportModes(
    userId: string,
    transportModes: string[],
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    profile.transportModes = transportModes;
    return this.profileRepository.save(profile);
  }

  async setGeolocationConsent(
    userId: string,
    granted: boolean,
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    profile.geolocationConsent = granted;
    profile.geolocationConsentAt = new Date();
    return this.profileRepository.save(profile);
  }

  async updateUserInfo(
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ): Promise<Profile> {
    await this.usersService.update(userId, data);
    return this.findByUserId(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const { transportModes, geolocationConsent, ...userFields } = dto;

    try {
      if (Object.keys(userFields).length > 0) {
        await this.updateUserInfo(userId, userFields);
      }
      if (transportModes !== undefined) {
        await this.updateTransportModes(userId, transportModes);
      }
      if (geolocationConsent !== undefined) {
        await this.setGeolocationConsent(userId, geolocationConsent);
      }
    } catch (err) {
      const code =
        err && typeof err === 'object'
          ? (err as { code?: string }).code
          : undefined;
      if (code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Cette adresse email est déjà utilisée.');
      }
      throw err;
    }

    return this.findByUserId(userId);
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersService.delete(userId);
  }
}
