import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsOptional, IsString } from 'class-validator';
import { RouteCoordinatesDto } from '../../common/dto/route-coordinates.dto.js';

export class CreatePlanificationDto extends RouteCoordinatesDto {
  @ApiProperty({ example: '12 rue de la Paix, 59000 Lille' })
  @IsString()
  fromLabel!: string;

  @ApiProperty({ example: 'Gare Lille Flandres' })
  @IsString()
  toLabel!: string;

  @ApiProperty({ example: '2026-08-25T08:30:00.000Z' })
  @IsISO8601()
  plannedAt!: string;

  @ApiPropertyOptional({ example: ['bike', 'bus'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedModes?: string[];
}
