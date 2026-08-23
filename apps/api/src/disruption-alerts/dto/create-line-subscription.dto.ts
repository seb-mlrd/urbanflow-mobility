import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class CreateLineSubscriptionDto {
  @ApiProperty({ example: 'STIF:Line::C01742:' })
  @IsString()
  routeGtfsId!: string;

  @ApiProperty({ example: 'L1' })
  @IsString()
  routeShortName!: string;

  @ApiPropertyOptional({ example: '12 rue de la Paix, 59000 Lille' })
  @IsOptional()
  @IsString()
  fromLabel?: string;

  @ApiPropertyOptional({ example: 50.6292 })
  @IsOptional()
  @IsLatitude()
  fromLat?: number;

  @ApiPropertyOptional({ example: 3.0573 })
  @IsOptional()
  @IsLongitude()
  fromLng?: number;

  @ApiPropertyOptional({ example: 'Gare Lille Flandres' })
  @IsOptional()
  @IsString()
  toLabel?: string;

  @ApiPropertyOptional({ example: 50.6365 })
  @IsOptional()
  @IsLatitude()
  toLat?: number;

  @ApiPropertyOptional({ example: 3.0635 })
  @IsOptional()
  @IsLongitude()
  toLng?: number;
}
