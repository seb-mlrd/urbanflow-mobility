import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsISO8601 } from 'class-validator';
import { RouteCoordinatesQueryDto } from '../../common/dto/route-coordinates.dto.js';

export class JourneyQueryDto extends RouteCoordinatesQueryDto {
  @ApiPropertyOptional({ example: '2026-08-25T08:30:00.000Z' })
  @IsISO8601()
  @IsOptional()
  datetime?: string;
}
