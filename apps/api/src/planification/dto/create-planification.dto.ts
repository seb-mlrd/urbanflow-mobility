import { IsArray, IsISO8601, IsOptional, IsString } from 'class-validator';
import { RouteCoordinatesDto } from '../../common/dto/route-coordinates.dto.js';

export class CreatePlanificationDto extends RouteCoordinatesDto {
  @IsString()
  fromLabel!: string;

  @IsString()
  toLabel!: string;

  @IsISO8601()
  plannedAt!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedModes?: string[];
}
