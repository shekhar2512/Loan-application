import React from 'react';
import { ChevronLeft, ChevronRight, BookmarkCheck } from 'lucide-react';

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  isSaving = false,
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-slate-200">
      {/* Previous Button */}
      <div className="w-full sm:w-auto">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Go to previous step"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        )}
      </div>

      {/* Save Draft & Next Buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Save Draft Button */}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Save draft"
        >
          <BookmarkCheck className="w-4 h-4 text-[#27AE60]" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>

        {/* Next / Submit Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="min-h-[44px] px-6 py-2.5 rounded-lg bg-[#1F4E79] text-white font-semibold hover:bg-[#163857] focus:outline-none focus:ring-2 focus:ring-[#1F4E79] focus:ring-offset-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          aria-label={isLastStep ? 'Submit application' : 'Continue to next step'}
        >
          {isLastStep ? (
            isSubmitting ? 'Submitting...' : 'Submit Application'
          ) : (
            <>
              Next Step
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}