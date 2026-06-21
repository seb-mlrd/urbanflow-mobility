import { IsNumber, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class JourneyQueryDto {
  @IsNumber()
  @Type(() => Number)
  fromLat!: number;

  @IsNumber()
  @Type(() => Number)
  fromLng!: number;

  @IsNumber()
  @Type(() => Number)
  toLat!: number;

  @IsNumber()
  @Type(() => Number)
  toLng!: number;

  @IsISO8601()
  @IsOptional()
  datetime?: string;
}
