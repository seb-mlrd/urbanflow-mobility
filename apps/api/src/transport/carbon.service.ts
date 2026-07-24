import { Injectable } from '@nestjs/common';
import { estimateLegCo2Grams } from '@urbanflow/shared';

interface LegLike {
  mode: string;
  distance: number;
}

@Injectable()
export class CarbonService {
  computeItineraryCo2Grams(legs: LegLike[]): number {
    const total = legs.reduce(
      (sum, leg) => sum + estimateLegCo2Grams(leg.mode, leg.distance),
      0,
    );
    return Math.round(total);
  }
}
