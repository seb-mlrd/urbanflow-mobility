import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Groupe de champs départ/arrivée réutilisé par les DTOs body (journey-history,
// planification) — validation numérique simple, le body JSON est déjà typé.
export class RouteCoordinatesDto {
  @ApiProperty({ example: 50.6292 })
  @IsNumber()
  fromLat!: number;

  @ApiProperty({ example: 3.0573 })
  @IsNumber()
  fromLng!: number;

  @ApiProperty({ example: 50.6365 })
  @IsNumber()
  toLat!: number;

  @ApiProperty({ example: 3.0635 })
  @IsNumber()
  toLng!: number;
}

// Variante pour les query params (toujours des strings bruts côté HTTP),
// avec la coercition en nombre en plus.
export class RouteCoordinatesQueryDto {
  @ApiProperty({ example: 50.6292 })
  @IsNumber()
  @Type(() => Number)
  fromLat!: number;

  @ApiProperty({ example: 3.0573 })
  @IsNumber()
  @Type(() => Number)
  fromLng!: number;

  @ApiProperty({ example: 50.6365 })
  @IsNumber()
  @Type(() => Number)
  toLat!: number;

  @ApiProperty({ example: 3.0635 })
  @IsNumber()
  @Type(() => Number)
  toLng!: number;
}
