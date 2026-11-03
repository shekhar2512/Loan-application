import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressBar({ steps, currentStep, onStepClick }) {
  const totalSteps = steps.length;
  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full mb-8">
      {/* Top Text & Percentage */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Step {currentStep} of {totalSteps}
          </span>
          <h2 className="text-lg font-bold text-[#1F4E79]">
            {steps[currentStep - 1]?.title}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-[#1F4E79]">{progressPercent}%</span>
          <span className="text-xs text-slate-500 block">Completed</span>
        </div>
      </div>

      {/* Visual Progress Bar (WCAG compliant) */}
      <div
        className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Application progress"
      >
        <div
          className="h-full bg-[#1F4E79] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Indicators for Desktop */}
      <nav aria-label="Steps" className="hidden md:flex justify-between mt-4">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center text-center flex-1"
            >
              <button
                type="button"
                onClick={() => isCompleted && onStepClick?.(step.number)}
                disabled={!isCompleted}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-[#27AE60] text-white cursor-pointer hover:bg-[#219653]'
                    : isCurrent
                    ? 'bg-[#1F4E79] text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </button>
              <span
                className={`text-[11px] mt-1.5 max-w-[80px] leading-tight font-medium ${
                  isCurrent ? 'text-[#1F4E79] font-bold' : 'text-slate-500'
                }`}
              >
                {step.shortTitle || step.title}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}