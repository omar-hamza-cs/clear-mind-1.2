// ─────────────────────────────────────────────────────────────
// ClearMind — Animated Circular Progress Ring
// SVG-based with smooth stroke-dashoffset animation.
// For "Forever" goals, shows a continuously rotating gradient ring.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { typography, spacing, palette } from '@/constants/theme';

interface ProgressRingProps {
  percent: number | null;   // null = forever/continuous
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function ProgressRing({
  percent,
  size = 220,
  strokeWidth = 14,
  children,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const isForever = percent === null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate from 0 to target
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isForever) return;
    const target = Math.min(100, Math.max(0, percent ?? 0));
    const duration = 1200;
    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedPercent(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [percent, isForever]);

  // Continuous rotation for "forever" goals
  useEffect(() => {
    if (!isForever) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      setRotation((elapsed / 50) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isForever]);

  const strokeOffset = circumference - (animatedPercent / 100) * circumference;

  // For the forever ring, draw an arc that rotates continuously
  const foreverArcLength = circumference * 0.72;
  const foreverGapLength = circumference - foreverArcLength;

  const ringColor = isForever ? palette.primary[400] : palette.primary[400];
  const trackColor = colors.border;

  const center = size / 2;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: isForever ? `rotate(${rotation}deg)` : 'rotate(-90deg)',
          transition: isForever ? 'none' : 'transform 0.3s ease',
        }}
      >
        <defs>
          <linearGradient id="cm-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary[300]} />
            <stop offset="50%" stopColor={palette.primary[400]} />
            <stop offset="100%" stopColor={palette.primary[500]} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={0.4}
        />

        {/* Progress arc */}
        {isForever ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#cm-ring-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${foreverArcLength} ${foreverGapLength}`}
          />
        ) : (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#cm-ring-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        )}
      </svg>

      {/* Inner content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
