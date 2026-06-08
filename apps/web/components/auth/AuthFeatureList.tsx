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
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {badge}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 leading-snug">{title}</h2>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">{description}</p>
      </div>
      <ul className="flex flex-col gap-4">
        {features.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 w-5 h-5 shrink-0 bg-gray-900 rounded-sm" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
