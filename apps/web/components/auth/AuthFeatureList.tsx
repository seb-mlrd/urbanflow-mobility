import { colors, typography } from '../../lib/tokens';

interface Feature {
  title: string;
  desc: string;
}

interface AuthFeatureListProps {
  badge: string;
  title: string;
  description: string;
  features: Feature[];
}

export function AuthFeatureList({ badge, title, description, features }: AuthFeatureListProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p style={{ ...typography.labelMd, color: colors.primary, marginBottom: '16px' }}>
          {badge}
        </p>
        <h2 style={{ ...typography.headlineLgMobile, color: colors.onSurface }}>
          {title}
        </h2>
        <p style={{ ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: '12px', lineHeight: '1.6' }}>
          {description}
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {features.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span
              className="mt-0.5 w-5 h-5 shrink-0 rounded-sm"
              aria-hidden="true"
              style={{ background: colors.secondaryContainer }}
            />
            <div>
              <p style={{ ...typography.bodySm, fontWeight: '600', color: colors.onSurface }}>
                {item.title}
              </p>
              <p style={{ ...typography.labelMd, color: colors.onSurfaceVariant, textTransform: 'none', letterSpacing: 0 }}>
                {item.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
