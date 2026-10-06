// ─────────────────────────────────────────────────────────────
// ClearMind — Craving Mode Screen (Full screen modal)
// app/craving-mode.tsx
//
// Flow: Mode selection → Breathing/Distraction → Post-timer → Result
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { Wind, Brain, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/context/ThemeProvider';
import { useTab } from '@/context/Navigation';
import { typography, spacing, radii, palette } from '@/constants/theme';
import { triggerHaptic } from '@/lib/haptics';
import { BreathingCircle } from '@/components/craving/BreathingCircle';
import { DistractionTimer } from '@/components/craving/DistractionTimer';
import { PostTimer } from '@/components/craving/PostTimer';
import { SuccessScreen, RelapseScreen } from '@/components/craving/ResultScreens';
import type { CravingMode } from '@/types';

type Stage = 'select' | 'breathing' | 'distraction' | 'post-timer' | 'success' | 'relapse';

interface CravingModeScreenProps {
  onClose: () => void;
}

export function CravingModeScreen({ onClose }: CravingModeScreenProps) {
  const { colors } = useTheme();
  const { setActiveTab } = useTab();

  const addCraving = useStore((s) => s.addCraving);
  const recordRelapse = useStore((s) => s.recordRelapse);
  const profile = useStore((s) => s.profile);

  const [stage, setStage] = useState<Stage>('select');
  const [selectedMode, setSelectedMode] = useState<CravingMode>('breathing');
  const [initialIntensity, setInitialIntensity] = useState(5);
  const [relapseCount, setRelapseCount] = useState(0);

  const handleStartMode = (mode: CravingMode) => {
    triggerHaptic('medium');
    setSelectedMode(mode);
    setStage(mode === 'breathing' ? 'breathing' : 'distraction');
  };

  const handleTimerComplete = useCallback(() => {
    setStage('post-timer');
  }, []);

  const handleTimerExit = useCallback(() => {
    // If skipped, still go to post-timer
    setStage('post-timer');
  }, []);

  const handlePostTimerComplete = useCallback(
    (postIntensity: number, resisted: boolean) => {
      const now = Date.now();

      addCraving({
        id: `craving-${now}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: now,
        mode: selectedMode,
        initialIntensity,
        postIntensity,
        resisted,
      });

      if (resisted) {
        setStage('success');
      } else {
        recordRelapse();
        setRelapseCount((profile?.relapseCount ?? 0) + 1);
        setStage('relapse');
      }
    },
    [addCraving, recordRelapse, selectedMode, initialIntensity, profile]
  );

  const handlePostTimerExit = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDone = useCallback(() => {
    setActiveTab('home');
    onClose();
  }, [setActiveTab, onClose]);

  // ── Render based on stage ──

  if (stage === 'breathing') {
    return (
      <BreathingCircle onComplete={handleTimerComplete} onExit={handleTimerExit} />
    );
  }

  if (stage === 'distraction') {
    return (
      <DistractionTimer onComplete={handleTimerComplete} onExit={handleTimerExit} />
    );
  }

  if (stage === 'post-timer') {
    return (
      <PostTimer
        mode={selectedMode}
        initialIntensity={initialIntensity}
        onComplete={handlePostTimerComplete}
        onExit={handlePostTimerExit}
      />
    );
  }

  if (stage === 'success') {
    return <SuccessScreen onDone={handleDone} />;
  }

  if (stage === 'relapse') {
    return <RelapseScreen relapseCount={relapseCount} onDone={handleDone} />;
  }

  // ── Mode selection ──
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        animation: 'cm-fade-in 0.4s ease both',
      }}
    >
      {/* Header with back */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spacing.xl}px ${spacing.xl}px ${spacing.sm}px`,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: spacing.sm,
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${spacing.xl}px ${spacing.xl}px ${spacing.xxl}px`,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Icon + heading */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            backgroundColor: palette.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
            animation: 'cm-scale-in 0.5s ease both',
          }}
        >
          <Wind size={40} color={palette.primary[600]} strokeWidth={1.8} />
        </div>

        <h1
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.display,
            fontWeight: typography.weights.bold,
            color: colors.text,
            margin: 0,
            marginBottom: spacing.sm,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          Feeling a craving?
        </h1>
        <p
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.body,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: spacing.xxl,
            textAlign: 'center',
            lineHeight: typography.lineHeights.body,
            maxWidth: 380,
          }}
        >
          That's okay. Cravings pass. Choose a tool below to ride it out.
        </p>

        {/* Initial intensity selector */}
        <div
          style={{
            width: '100%',
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            border: `1px solid ${colors.border}`,
            marginBottom: spacing.xl,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: spacing.sm,
            }}
          >
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              How strong is it right now?
            </span>
            <span
              style={{
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.title,
                fontWeight: typography.weights.bold,
                color: initialIntensity <= 3 ? palette.primary[400] : initialIntensity <= 6 ? palette.accent[400] : palette.error[500],
              }}
            >
              {initialIntensity}/10
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={initialIntensity}
            onChange={(e) => setInitialIntensity(Number(e.target.value))}
            style={{
              width: '100%',
              height: 28,
              appearance: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Mode selection cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
            width: '100%',
          }}
        >
          {/* Breathing */}
          <button
            onClick={() => handleStartMode('breathing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.lg,
              padding: spacing.xl,
              backgroundColor: colors.surface,
              border: `2px solid ${colors.border}`,
              borderRadius: radii.lg,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s ease, transform 0.1s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = palette.primary[400])}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: radii.md,
                backgroundColor: palette.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Wind size={28} color={palette.primary[600]} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.title,
                  fontWeight: typography.weights.bold,
                  color: colors.text,
                }}
              >
                Breathing
              </div>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                60 seconds of guided breathing to calm your nervous system
              </div>
            </div>
            <div
              style={{
                padding: `${spacing.xs}px ${spacing.md}px`,
                backgroundColor: palette.primary[100],
                borderRadius: radii.full,
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.primary[600],
                flexShrink: 0,
              }}
            >
              60s
            </div>
          </button>

          {/* Distraction */}
          <button
            onClick={() => handleStartMode('distraction')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.lg,
              padding: spacing.xl,
              backgroundColor: colors.surface,
              border: `2px solid ${colors.border}`,
              borderRadius: radii.lg,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s ease, transform 0.1s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = palette.accent[400])}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: radii.md,
                backgroundColor: palette.accent[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Brain size={28} color={palette.accent[600]} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.title,
                  fontWeight: typography.weights.bold,
                  color: colors.text,
                }}
              >
                Distraction
              </div>
              <div
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.sizes.caption,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                10 minutes of rotating grounding activities to reset
              </div>
            </div>
            <div
              style={{
                padding: `${spacing.xs}px ${spacing.md}px`,
                backgroundColor: palette.accent[50],
                borderRadius: radii.full,
                fontFamily: typography.fontFamily,
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.accent[600],
                flexShrink: 0,
              }}
            >
              10 min
            </div>
          </button>
        </div>

        <p
          style={{
            marginTop: spacing.xxl,
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.caption,
            color: colors.textMuted,
            textAlign: 'center',
            maxWidth: 360,
            lineHeight: typography.lineHeights.body,
          }}
        >
          Whatever you choose, you're taking action. That's what matters.
        </p>
      </div>
    </div>
  );
}
