// ─────────────────────────────────────────────────────────────
// Onboarding Flow — Layout / Controller
// Mirrors app/(onboarding)/_layout.tsx
// Manages step state, persists draft on every step transition,
// and resumes from saved position on reload.
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo, useCallback } from 'react';
import { useStore } from '@/store';
import type { OnboardingDraft } from '@/types';
import { OnboardingProgress } from './OnboardingUI';
import { StepWelcome } from './StepWelcome';
import { StepLastUse } from './StepLastUse';
import { StepSpending } from './StepSpending';
import { StepReasons } from './StepReasons';
import { StepGoal } from './StepGoal';
import { StepReminders } from './StepReminders';
import { StepSummary } from './StepSummary';

const TOTAL_STEPS = 7;

function defaultDraft(): OnboardingDraft {
  const now = Date.now();
  return {
    step: 0,
    lastUseAt: now,
    spendingAmount: null,
    spendingPeriod: null,
    spendingCurrency: 'EUR',
    reasons: [],
    customReason: '',
    goal: '',
    notificationsEnabled: true,
    checkInHour: 9,
    checkInMinute: 0,
  };
}

export function OnboardingFlow() {
  const draft = useStore((s) => s.onboardingDraft);
  const setOnboardingDraft = useStore((s) => s.setOnboardingDraft);
  const updateOnboardingDraft = useStore((s) => s.updateOnboardingDraft);

  // Initialize draft if none exists
  useEffect(() => {
    if (!draft) {
      setOnboardingDraft(defaultDraft());
    }
  }, [draft, setOnboardingDraft]);

  // Persist the current step into the draft whenever it changes
  const currentStep = draft?.step ?? 0;

  const goToStep = useCallback(
    (step: number) => {
      updateOnboardingDraft({ step });
    },
    [updateOnboardingDraft]
  );

  const handleNext = useCallback(
    (patch?: Partial<OnboardingDraft>) => {
      if (patch) updateOnboardingDraft(patch);
      const nextStep = Math.min(currentStep + 1, TOTAL_STEPS - 1);
      goToStep(nextStep);
    },
    [currentStep, updateOnboardingDraft, goToStep]
  );

  const handleBack = useCallback(() => {
    const prevStep = Math.max(currentStep - 1, 0);
    goToStep(prevStep);
  }, [currentStep, goToStep]);

  const handlePatch = useCallback(
    (patch: Partial<OnboardingDraft>) => {
      updateOnboardingDraft(patch);
    },
    [updateOnboardingDraft]
  );

  // Show nothing until draft is loaded
  const safeDraft = useMemo<OnboardingDraft>(() => draft ?? defaultDraft(), [draft]);

  if (!draft) return null;

  return (
    <>
      <OnboardingProgress current={currentStep} total={TOTAL_STEPS} />
      {currentStep === 0 && <StepWelcome onNext={() => handleNext({ step: 1 })} />}
      {currentStep === 1 && (
        <StepLastUse
          draft={safeDraft}
          onBack={handleBack}
          onNext={(patch: Partial<OnboardingDraft>) => handleNext(patch)}
        />
      )}
      {currentStep === 2 && (
        <StepSpending
          draft={safeDraft}
          onBack={handleBack}
          onNext={(patch: Partial<OnboardingDraft>) => handleNext(patch)}
        />
      )}
      {currentStep === 3 && (
        <StepReasons
          draft={safeDraft}
          onBack={handleBack}
          onNext={(patch: Partial<OnboardingDraft>) => handleNext(patch)}
        />
      )}
      {currentStep === 4 && (
        <StepGoal
          draft={safeDraft}
          onBack={handleBack}
          onNext={(patch: Partial<OnboardingDraft>) => handleNext(patch)}
        />
      )}
      {currentStep === 5 && (
        <StepReminders
          draft={safeDraft}
          onBack={handleBack}
          onNext={(patch: Partial<OnboardingDraft>) => handleNext(patch)}
        />
      )}
      {currentStep === 6 && <StepSummary draft={safeDraft} onBack={handleBack} />}
    </>
  );
}
