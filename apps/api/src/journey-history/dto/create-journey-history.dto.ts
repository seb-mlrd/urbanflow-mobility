import { IsNumber, IsString, Min } from 'class-validator';
import { RouteCoordinatesDto } from '../../common/dto/route-coordinates.dto.js';

export class CreateJourneyHistoryDto extends RouteCoordinatesDto {
  @IsString()
  dominantMode!: string;

  @IsNumber()
  @Min(0)
  distanceMeters!: number;

  @IsNumber()
  @Min(0)
  durationSeconds!: number;

  @IsNumber()
  @Min(0)
  co2Grams!: number;

  @IsString()
  fromLabel!: string;

  @IsString()
  toLabel!: string;

  @IsNumber()
  departureAt!: number;

  @IsNumber()
  arrivalAt!: number;
}
