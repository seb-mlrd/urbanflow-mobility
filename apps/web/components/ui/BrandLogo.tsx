'use client';

import Image from 'next/image';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

const LOGO_ASPECT_RATIO = 1800 / 480;

interface BrandLogoProps {
  height?: number;
}

export function BrandLogo({ height = 22 }: BrandLogoProps) {
  const theme = useAccessibilityStore((s) => s.theme);
  const src = theme === 'light' ? '/logo/logo-horizontal-light-bg.png' : '/logo/logo-horizontal-dark-bg.png';

  return (
    <Image
      src={src}
      alt="UrbanFlow"
      height={height}
      width={Math.round(height * LOGO_ASPECT_RATIO)}
      style={{ height, width: 'auto' }}
      priority
    />
  );
}
