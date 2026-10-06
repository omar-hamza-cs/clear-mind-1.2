// ─────────────────────────────────────────────────────────────
// ClearMind — SVG Line Chart & Area Chart Components
// Custom lightweight charts for the web (no native chart lib needed).
// ─────────────────────────────────────────────────────────────

import { useId } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing } from '@/constants/theme';

export interface ChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartPoint[];
  color: string;
  min?: number;
  max?: number;
  height?: number;
  yLabels?: string[];
}

export function LineChart({
  data,
  color,
  min = 0,
  max,
  height = 180,
  yLabels,
}: LineChartProps) {
  const { colors } = useTheme();
  const gradientId = useId();

  const width = 500;
  const padding = { top: 20, right: 16, bottom: 32, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const dataMax = max ?? Math.max(...data.map((d) => d.value), min + 1);
  const dataMin = min;
  const range = dataMax - dataMin || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = padding.top + chartH - ((d.value - dataMin) / range) * chartH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y-axis labels (3 ticks)
  const yTicks = yLabels
    ? yLabels
    : [dataMax, Math.round((dataMax + dataMin) / 2), dataMin];

  // X-axis labels (show up to 7)
  const xLabelStep = Math.max(1, Math.ceil(data.length / 7));

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = padding.top + (i / (yTicks.length - 1)) * chartH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontFamily={typography.fontFamily}
              fontSize="10"
              fill={colors.textMuted}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} />
          <circle cx={p.x} cy={p.y} r="7" fill={color} opacity="0.15" />
        </g>
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => {
        if (i % xLabelStep !== 0 && i !== points.length - 1) return null;
        return (
          <text
            key={i}
            x={p.x}
            y={height - 10}
            textAnchor="middle"
            fontFamily={typography.fontFamily}
            fontSize="10"
            fill={colors.textMuted}
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

interface AreaChartProps {
  data: ChartPoint[];
  color: string;
  height?: number;
}

export function AreaChart({ data, color, height = 180 }: AreaChartProps) {
  return <LineChart data={data} color={color} height={height} min={0} />;
}
