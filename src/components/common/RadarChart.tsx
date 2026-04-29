import type { SeedType } from '@shared/protocol';

const AXIS_LABEL: Record<SeedType, string> = {
  challenge: 'チャレンジ',
  analysis: '分析',
  support: 'サポート',
  leader: 'リーダー',
  continuity: '継続',
  balance: 'バランス',
};

const AXIS_ORDER: SeedType[] = [
  'challenge',
  'analysis',
  'continuity',
  'balance',
  'support',
  'leader',
];

interface RadarChartProps {
  scores: Record<SeedType, number>;
  size?: number;
  max?: number;
  color?: string; // tailwind色名（例: emerald, teal, indigo）
  label?: string;
}

export const RadarChart = ({
  scores,
  size = 280,
  max = 12,
  color = 'emerald',
  label,
}: RadarChartProps) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const axes = AXIS_ORDER;
  const n = axes.length;

  const point = (i: number, value: number): [number, number] => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
    const r = (Math.max(0, Math.min(value, max)) / max) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const polyPoints = axes
    .map((k, i) => point(i, scores[k] ?? 0))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  // グリッド（同心多角形）
  const grids = [0.25, 0.5, 0.75, 1].map((ratio) => {
    return axes
      .map((_, i) => {
        const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
        const r = ratio * radius;
        return `${(cx + r * Math.cos(angle)).toFixed(1)},${(
          cy + r * Math.sin(angle)
        ).toFixed(1)}`;
      })
      .join(' ');
  });

  // tailwindの動的クラス避けるため stroke/fill は固定マップで
  const colorMap: Record<string, { stroke: string; fill: string }> = {
    emerald: { stroke: '#059669', fill: 'rgba(16,185,129,0.25)' },
    teal: { stroke: '#0d9488', fill: 'rgba(20,184,166,0.25)' },
    indigo: { stroke: '#4f46e5', fill: 'rgba(99,102,241,0.25)' },
    amber: { stroke: '#d97706', fill: 'rgba(245,158,11,0.25)' },
    rose: { stroke: '#e11d48', fill: 'rgba(244,63,94,0.25)' },
  };
  const c = colorMap[color] ?? colorMap.emerald;

  return (
    <div className="inline-block">
      {label && (
        <div className="text-center text-xs text-slate-600 font-medium mb-1">{label}</div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* グリッド */}
        {grids.map((g, i) => (
          <polygon
            key={i}
            points={g}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}
        {/* 軸線 */}
        {axes.map((_, i) => {
          const [x, y] = point(i, max);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          );
        })}
        {/* スコア多角形 */}
        <polygon
          points={polyPoints}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth={2}
        />
        {/* 頂点 */}
        {axes.map((k, i) => {
          const [x, y] = point(i, scores[k] ?? 0);
          return <circle key={i} cx={x} cy={y} r={3} fill={c.stroke} />;
        })}
        {/* ラベル */}
        {axes.map((k, i) => {
          const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
          const lx = cx + (radius + 18) * Math.cos(angle);
          const ly = cy + (radius + 18) * Math.sin(angle);
          return (
            <text
              key={k}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="#475569"
              className="font-medium"
            >
              {AXIS_LABEL[k]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
