import { IsOptional, IsISO8601 } from 'class-validator';
import { RouteCoordinatesQueryDto } from '../../common/dto/route-coordinates.dto.js';

export class JourneyQueryDto extends RouteCoordinatesQueryDto {
  @IsISO8601()
  @IsOptional()
  datetime?: string;
}
