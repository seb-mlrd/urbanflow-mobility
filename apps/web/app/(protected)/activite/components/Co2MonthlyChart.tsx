'use client';

import { useId, useState } from 'react';
import type { MonthlyCo2Point } from '../../../../lib/journey-types';

const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;
const PLOT_TOP = 16;
const PLOT_BOTTOM = 40;
const BAR_MAX_WIDTH = 24;

function formatMonthShort(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' });
}

function formatMonthFull(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const label = new Date(year, m - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatKg(grams: number): string {
  return `${(grams / 1000).toFixed(1)} kg`;
}

export function Co2MonthlyChart({ data }: { data: MonthlyCo2Point[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const titleId = useId();

  const maxCo2 = Math.max(...data.map((d) => d.co2Grams), 1);
  const niceMax = Math.ceil(maxCo2 / 1000) * 1000 || 1000;
  const plotHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const slotWidth = CHART_WIDTH / data.length;
  const barWidth = Math.min(BAR_MAX_WIDTH, slotWidth * 0.5);

  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl p-4"
      style={{ background: 'var(--color-surface-container)' }}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 id={titleId} className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>
          Émissions de CO₂ par mois
        </h2>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium shrink-0"
          style={{ color: 'var(--color-primary)' }}
          aria-pressed={showTable}
        >
          {showTable ? 'Voir le graphique' : 'Voir en tableau'}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <caption className="sr-only">Émissions de CO₂ par mois</caption>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <th
                  scope="col"
                  className="text-left py-2 font-medium"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Mois
                </th>
                <th
                  scope="col"
                  className="text-right py-2 font-medium"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  CO₂ émis
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.month} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                  <td className="py-2" style={{ color: 'var(--color-on-surface)' }}>
                    {formatMonthFull(d.month)}
                  </td>
                  <td
                    className="py-2 text-right font-medium"
                    style={{ color: 'var(--color-on-surface)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatKg(d.co2Grams)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-2">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            width="100%"
            height={CHART_HEIGHT}
            role="img"
            aria-label={`Émissions de CO₂ mensuelles, de ${formatMonthFull(data[0]?.month ?? '')} à ${formatMonthFull(data[data.length - 1]?.month ?? '')}`}
          >
            {/* Gridlines */}
            {gridSteps.map((step) => {
              const y = PLOT_TOP + plotHeight * (1 - step);
              return (
                <g key={step}>
                  <line
                    x1={0}
                    x2={CHART_WIDTH}
                    y1={y}
                    y2={y}
                    stroke="var(--color-outline-variant)"
                    strokeWidth={1}
                    opacity={0.6}
                  />
                  <text
                    x={0}
                    y={y - 4}
                    fontSize={10}
                    fill="var(--color-on-surface-variant)"
                  >
                    {formatKg(niceMax * step)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, i) => {
              const slotCenter = slotWidth * i + slotWidth / 2;
              const barHeight = (d.co2Grams / niceMax) * plotHeight;
              const y = PLOT_TOP + plotHeight - barHeight;
              const isHovered = hovered === i;
              const isLast = i === data.length - 1;

              return (
                <g
                  key={d.month}
                  tabIndex={0}
                  role="img"
                  aria-label={`${formatMonthFull(d.month)} : ${formatKg(d.co2Grams)} de CO₂`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {/* Bigger invisible hit area */}
                  <rect
                    x={slotCenter - slotWidth / 2}
                    y={PLOT_TOP}
                    width={slotWidth}
                    height={plotHeight}
                    fill="transparent"
                  />
                  <rect
                    x={slotCenter - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 1)}
                    rx={4}
                    fill="var(--color-primary)"
                    opacity={isHovered ? 1 : 0.85}
                  />
                  {isHovered && (
                    <rect
                      x={slotCenter - barWidth / 2 - 2}
                      y={y - 2}
                      width={barWidth + 4}
                      height={Math.max(barHeight, 1) + 4}
                      rx={5}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth={1.5}
                    />
                  )}
                  {isLast && (
                    <text
                      x={slotCenter}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="var(--color-on-surface)"
                    >
                      {formatKg(d.co2Grams)}
                    </text>
                  )}
                  <text
                    x={slotCenter}
                    y={CHART_HEIGHT - 16}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--color-on-surface-variant)"
                  >
                    {formatMonthShort(d.month)}
                  </text>
                </g>
              );
            })}
          </svg>

          {hovered !== null && (
            <div
              role="status"
              className="absolute pointer-events-none rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                background: 'var(--color-surface-container-highest)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
                left: `${((hovered + 0.5) / data.length) * 100}%`,
                top: 0,
                transform: 'translate(-50%, 0)',
                whiteSpace: 'nowrap',
              }}
            >
              {formatMonthFull(data[hovered].month)} —{' '}
              <span style={{ color: 'var(--color-primary)' }}>{formatKg(data[hovered].co2Grams)}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
