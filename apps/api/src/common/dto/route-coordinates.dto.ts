import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Groupe de champs départ/arrivée réutilisé par les DTOs body (journey-history,
// planification) — validation numérique simple, le body JSON est déjà typé.
export class RouteCoordinatesDto {
  @IsNumber()
  fromLat!: number;

  @IsNumber()
  fromLng!: number;

  @IsNumber()
  toLat!: number;

  @IsNumber()
  toLng!: number;
}

// Variante pour les query params (toujours des strings bruts côté HTTP),
// avec la coercition en nombre en plus.
export class RouteCoordinatesQueryDto {
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
}
