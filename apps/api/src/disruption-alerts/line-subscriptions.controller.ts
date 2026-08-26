import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentProfile } from '../profile/current-profile.decorator.js';
import { CurrentProfileInterceptor } from '../profile/current-profile.interceptor.js';
import type { Profile } from '../profile/profile.entity.js';
import { LineSubscriptionsService } from './line-subscriptions.service.js';
import { CreateLineSubscriptionDto } from './dto/create-line-subscription.dto.js';

@ApiTags('line-subscriptions')
@ApiBearerAuth()
@Controller('line-subscriptions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CurrentProfileInterceptor)
export class LineSubscriptionsController {
  constructor(
    private readonly lineSubscriptionsService: LineSubscriptionsService,
  ) {}

  @ApiOperation({
    summary: "Liste les abonnements aux lignes de l'utilisateur",
  })
  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.lineSubscriptionsService.findAllForProfile(profile.id);
  }

  @ApiOperation({
    summary: "Abonne l'utilisateur aux perturbations d'une ligne",
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreateLineSubscriptionDto,
  ) {
    return this.lineSubscriptionsService.create(profile.id, dto);
  }

  @ApiOperation({ summary: 'Supprime un abonnement à une ligne' })
  @ApiParam({ name: 'id', example: 'c1a9c2c0-6b1d-4b8e-9c1a-3c1f2b3a4d5e' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentProfile() profile: Profile, @Param('id') id: string) {
    await this.lineSubscriptionsService.remove(profile.id, id);
  }
}
