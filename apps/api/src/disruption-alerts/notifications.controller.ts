import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: "Liste les notifications de l'utilisateur" })
  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.notificationsService.findAllForProfile(profile.id);
  }

  @ApiOperation({ summary: 'Récupère le nombre de notifications non lues' })
  @Get('unread-count')
  async unreadCount(@CurrentProfile() profile: Profile) {
    const count = await this.notificationsService.countUnread(profile.id);
    return { count };
  }

  @ApiOperation({ summary: 'Marque une notification comme lue' })
  @ApiParam({ name: 'id', example: 'c1a9c2c0-6b1d-4b8e-9c1a-3c1f2b3a4d5e' })
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markRead(@CurrentProfile() profile: Profile, @Param('id') id: string) {
    await this.notificationsService.markRead(profile.id, id);
  }

  @ApiOperation({ summary: 'Marque toutes les notifications comme lues' })
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllRead(@CurrentProfile() profile: Profile) {
    await this.notificationsService.markAllRead(profile.id);
  }
}
