import { describe, expect, it } from 'vitest';
import {
  getModeLineColor,
  getModeLineStyle,
  DEFAULT_LINE_COLOR,
  OTP_MODE_LINE_COLORS,
} from './transport-colors';

describe('getModeLineColor()', () => {
  it('retourne la couleur définie pour un mode connu', () => {
    expect(getModeLineColor('BICYCLE')).toBe(OTP_MODE_LINE_COLORS.BICYCLE);
    expect(getModeLineColor('CAR')).toBe(OTP_MODE_LINE_COLORS.CAR);
  });

  it('retourne la couleur par défaut pour un mode inconnu', () => {
    expect(getModeLineColor('UNKNOWN_MODE')).toBe(DEFAULT_LINE_COLOR);
  });
});

describe('getModeLineStyle()', () => {
  it('retourne une ligne pointillée pour WALK', () => {
    const style = getModeLineStyle('WALK');
    expect(style.dashArray).toBeDefined();
    expect(style.color).toBe(OTP_MODE_LINE_COLORS.WALK);
  });

  it('retourne une ligne pleine (sans dashArray) pour les autres modes', () => {
    const style = getModeLineStyle('BICYCLE');
    expect(style.dashArray).toBeUndefined();
    expect(style.color).toBe(OTP_MODE_LINE_COLORS.BICYCLE);
  });

  it('donne des couleurs différentes à des modes différents', () => {
    expect(getModeLineStyle('BICYCLE').color).not.toBe(getModeLineStyle('CAR').color);
  });
});
