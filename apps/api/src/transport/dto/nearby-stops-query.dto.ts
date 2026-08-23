import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyStopsQueryDto {
  @ApiProperty({ example: 50.6292 })
  @IsNumber()
  @Type(() => Number)
  lat!: number;

  @ApiProperty({ example: 3.0573 })
  @IsNumber()
  @Type(() => Number)
  lng!: number;

  @ApiPropertyOptional({ example: 500, minimum: 50, maximum: 2000, default: 500 })
  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(2000)
  @Type(() => Number)
  radius?: number = 500;
}
