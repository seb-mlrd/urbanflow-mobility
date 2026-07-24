import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class CreateLineSubscriptionDto {
  @IsString()
  routeGtfsId!: string;

  @IsString()
  routeShortName!: string;

  @IsOptional()
  @IsString()
  fromLabel?: string;

  @IsOptional()
  @IsLatitude()
  fromLat?: number;

  @IsOptional()
  @IsLongitude()
  fromLng?: number;

  @IsOptional()
  @IsString()
  toLabel?: string;

  @IsOptional()
  @IsLatitude()
  toLat?: number;

  @IsOptional()
  @IsLongitude()
  toLng?: number;
}
