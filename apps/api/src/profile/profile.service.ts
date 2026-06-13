import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { Profile } from './profile.entity.js';

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

  async updateTransportModes(userId: string, transportModes: string[]): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    profile.transportModes = transportModes;
    return this.profileRepository.save(profile);
  }

  async updateUserInfo(
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string },
  ): Promise<Profile> {
    await this.usersService.update(userId, data);
    return this.findByUserId(userId);
  }
}
