import { IsArray, IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanificationDto {
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

  @IsISO8601()
  plannedAt!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedModes?: string[];
}
