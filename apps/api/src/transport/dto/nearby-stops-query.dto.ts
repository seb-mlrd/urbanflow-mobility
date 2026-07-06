import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyStopsQueryDto {
  @IsNumber()
  @Type(() => Number)
  lat!: number;

  @IsNumber()
  @Type(() => Number)
  lng!: number;

  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(2000)
  @Type(() => Number)
  radius?: number = 500;
}
