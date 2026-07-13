// Facteurs d'émission en grammes de CO2e par kilomètre parcouru.
// Source : ADEME Base Carbone (valeurs moyennes France, transport de voyageurs).
export const CO2_FACTORS_G_PER_KM: Record<string, number> = {
  WALK: 0,
  BICYCLE: 0,
  CAR: 193,
  BUS: 104,
  TRAM: 4,
  SUBWAY: 4,
  RAIL: 29,
};

// Facteur de repli si un mode OTP inconnu apparaît sur un leg.
export const DEFAULT_CO2_FACTOR_G_PER_KM = CO2_FACTORS_G_PER_KM.CAR;

export function estimateLegCo2Grams(mode: string, distanceMeters: number): number {
  const factor = CO2_FACTORS_G_PER_KM[mode] ?? DEFAULT_CO2_FACTOR_G_PER_KM;
  return (distanceMeters / 1000) * factor;
}
