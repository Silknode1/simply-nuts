import React from 'react';

export interface StepProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
}

export function StepProgress({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
}: StepProgressProps) {
  return (
    <nav aria-label="Progress steps">
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = completedSteps.includes(stepNum) || currentStep > stepNum;
          const isClickable = onStepClick && (isCompleted || isActive);

          return (
            <li
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(stepNum)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${stepNum}: ${label}${isCompleted ? ' (completed)' : ''}${isActive ? ' (current)' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: isClickable ? 'pointer' : 'default',
                  background: isActive
                    ? 'var(--color-burn, #c45e20)'
                    : isCompleted
                    ? 'var(--color-forest-500, #3d8b3d)'
                    : 'var(--color-wood-100, #f5e6d0)',
                  color: isActive || isCompleted ? '#fff' : 'var(--color-wood-400, #c4864e)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span aria-hidden="true">{stepNum}</span>
                )}
                <span>{label}</span>
              </button>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '1.5rem',
                    height: '2px',
                    background: currentStep > stepNum
                      ? 'var(--color-forest-500, #3d8b3d)'
                      : 'var(--color-wood-200, #e8c9a0)',
                    margin: '0 0.25rem',
                    borderRadius: '1px',
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
