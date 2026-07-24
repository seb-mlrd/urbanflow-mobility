import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.type.js';
import { ProfileService } from '../profile/profile.service.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    return this.notificationsService.findAllForProfile(profile.id);
  }

  @Get('unread-count')
  async unreadCount(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    const count = await this.notificationsService.countUnread(profile.id);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markRead(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    await this.notificationsService.markRead(profile.id, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllRead(@Request() req: AuthenticatedRequest) {
    const profile = await this.profileService.findByUserId(req.user.sub);
    await this.notificationsService.markAllRead(profile.id);
  }
}
