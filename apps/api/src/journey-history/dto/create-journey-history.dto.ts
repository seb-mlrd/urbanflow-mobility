import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';
import { RouteCoordinatesDto } from '../../common/dto/route-coordinates.dto.js';

export class CreateJourneyHistoryDto extends RouteCoordinatesDto {
  @ApiProperty({ example: 'bike' })
  @IsString()
  dominantMode!: string;

  @ApiProperty({ example: 1500, minimum: 0 })
  @IsNumber()
  @Min(0)
  distanceMeters!: number;

  @ApiProperty({ example: 600, minimum: 0 })
  @IsNumber()
  @Min(0)
  durationSeconds!: number;

  @ApiProperty({ example: 45, minimum: 0 })
  @IsNumber()
  @Min(0)
  co2Grams!: number;

  @ApiProperty({ example: '12 rue de la Paix, 59000 Lille' })
  @IsString()
  fromLabel!: string;

  @ApiProperty({ example: 'Gare Lille Flandres' })
  @IsString()
  toLabel!: string;

  @ApiProperty({ example: 1735689600000, description: 'Timestamp Unix (ms)' })
  @IsNumber()
  departureAt!: number;

  @ApiProperty({ example: 1735690200000, description: 'Timestamp Unix (ms)' })
  @IsNumber()
  arrivalAt!: number;
}
