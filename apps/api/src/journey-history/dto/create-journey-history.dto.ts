import { IsNumber, IsString, Min } from 'class-validator';

export class CreateJourneyHistoryDto {
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
  fromLat!: number;

  @IsNumber()
  fromLng!: number;

  @IsNumber()
  toLat!: number;

  @IsNumber()
  toLng!: number;

  @IsNumber()
  departureAt!: number;

  @IsNumber()
  arrivalAt!: number;
}
