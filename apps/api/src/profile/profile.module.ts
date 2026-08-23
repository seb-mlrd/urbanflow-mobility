import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module.js';
import { Profile } from './profile.entity.js';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { CurrentProfileInterceptor } from './current-profile.interceptor.js';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), UsersModule],
  controllers: [ProfileController],
  providers: [ProfileService, CurrentProfileInterceptor],
  exports: [ProfileService, CurrentProfileInterceptor],
})
export class ProfileModule {}
