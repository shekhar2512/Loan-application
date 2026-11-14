import React, { useState, useRef, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import Step1LoanType from '../steps/Step1LoanType';
import Step2PersonalInfo from '../steps/Step2PersonalInfo';
import Step3KYC from '../steps/Step3KYC';
import Step4Address from '../steps/Step4Address';
import Step5Employment from '../steps/Step5Employment';
import Step6CoApplicant from '../steps/Step6CoApplicant';
import Step7Documents from '../steps/Step7Documents';
import Step8Review from '../steps/Step8Review';
import { calculateAge } from '../../schemas/step2Schema';
import { useAutoSave } from '../../hooks/useAutoSave';
import { 
  CreditCard, 
  User, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Users, 
  FileUp, 
  FileText,
  RotateCcw,
  Shield,
  Loader2
} from 'lucide-react';

const STEPS_REGISTRY = [
  {
    number: 1,
    id: 'loan-type',
    title: 'Loan Type & Basic Details',
    shortTitle: 'Loan Type',
    description: 'Select loan category, requested amount, tenure, and purpose.',
    icon: CreditCard,
  },
  {
    number: 2,
    id: 'personal-info',
    title: 'Personal Information',
    shortTitle: 'Personal',
    description: 'Personal identity details, contact numbers, and age verification.',
    icon: User,
  },
  {
    number: 3,
    id: 'kyc',
    title: 'Identity Verification (KYC)',
    shortTitle: 'KYC',
    description: 'PAN format check and Aadhaar Verhoeff checksum validation.',
    icon: ShieldCheck,
  },
  {
    number: 4,
    id: 'address',
    title: 'Address Information',
    shortTitle: 'Address',
    description: 'PIN code auto-fill, residential status, and permanent address.',
    icon: MapPin,
  },
  {
    number: 5,
    id: 'employment',
    title: 'Employment & Income Details',
    shortTitle: 'Employment',
    description: 'Salaried, Self-Employed, or Business Owner sub-form with GST check.',
    icon: Briefcase,
  },
  {
    number: 6,
    id: 'co-applicant',
    title: 'Co-Applicant & Guarantor',
    shortTitle: 'Co-Applicant',
    description: 'Conditional step based on loan product and requested amount.',
    icon: Users,
  },
  {
    number: 7,
    id: 'documents',
    title: 'Document Upload & E-Signature',
    shortTitle: 'Documents',
    description: 'Client-side compressed document upload and digital signature pad.',
    icon: FileUp,
  },
  {
    number: 8,
    id: 'review',
    title: 'Review & Pre-Approval Summary',
    shortTitle: 'Review',
    description: 'Reducing-balance EMI summary, RBI consents, and final submission.',
    icon: FileText,
  },
];

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeModal, setResumeModal] = useState(null);

  // Global accumulated form state
  const [formData, setFormData] = useState({
    step1: {
      loanType: 'Personal',
      loanAmount: 300000,
      loanTenure: '36',
      loanPurpose: 'debt_consolidation',
      referralCode: '',
    },
    step2: {},
    step3: {},
    step4: {},
    step5: {},
    step6: {},
    step7: {},
    step8: {},
  });

  // Ref to trigger current step form validation
  const currentStepRef = useRef(null);

  const totalSteps = STEPS_REGISTRY.length;
  const activeStep = STEPS_REGISTRY[currentStep - 1];
  const StepIcon = activeStep.icon;

  // Web Crypto AES-256 Auto-Save Hook (30s debounced)
  const { lastSaved, isSaving, saveDraft, clearDraft, loadSavedDraft } = useAutoSave(
    formData,
    currentStep
  );

  // Check for saved draft on initial mount
  useEffect(() => {
    async function checkDraft() {
      const draft = await loadSavedDraft();
      if (draft && draft.formData && Object.keys(draft.formData.step2 || {}).length > 0) {
        setResumeModal(draft);
      }
    }
    checkDraft();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-step dependency #7: Calculate max allowable tenure from applicant age
  const applicantAge = formData.step2?.dateOfBirth
    ? calculateAge(formData.step2.dateOfBirth)
    : null;
  const maxAllowedTenureMonths =
    applicantAge && applicantAge >= 21 ? Math.max(12, (65 - applicantAge) * 12) : null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateStepData = (stepKey, stepData) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], ...stepData },
    }));
  };

  const handleNext = async () => {
    if (currentStepRef.current?.submitForm) {
      try {
        setIsSubmitting(true);
        await currentStepRef.current.submitForm();
        setIsSubmitting(false);

        if (currentStep < totalSteps) {
          setCurrentStep((prev) => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        setIsSubmitting(false);
        showToast('Please correct the highlighted validation errors.');
      }
    } else {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Application submission simulation complete!');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  const handleSaveDraft = async () => {
    await saveDraft(formData, currentStep);
    const time = new Date().toLocaleTimeString();
    showToast(`Draft encrypted with AES-256 & saved locally at ${time}`);
  };

  const handleResumeDraft = () => {
    if (resumeModal) {
      setFormData(resumeModal.formData);
      setCurrentStep(resumeModal.currentStep || 1);
      setResumeModal(null);
      showToast('Encrypted draft restored successfully!');
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setResumeModal(null);
    showToast('Draft discarded. Starting fresh.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Resume Application Dialog Modal */}
      {resumeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1F4E79] flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Resume Incomplete Application?
            </h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We found a 256-bit encrypted draft from your previous session. Would you like to resume where you left off or start fresh?
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Start Fresh
              </button>
              <button
                type="button"
                onClick={handleResumeDraft}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-[#1F4E79] text-xs font-bold text-white hover:bg-blue-900 transition-colors shadow-sm"
              >
                Resume Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 bg-[#1F4E79] text-white text-sm px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 border border-blue-400"
        >
          <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
        {/* Progress Bar */}
        <ProgressBar
          steps={STEPS_REGISTRY}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Step Header with Auto-Save Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1F4E79] flex items-center justify-center">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {activeStep.title}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Encryption & Auto-Save Status Badge */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {isSaving && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Encrypting...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200/80">
                <Shield className="w-3 h-3 text-[#27AE60]" />
                AES-256 Saved ({lastSaved})
              </span>
            )}
          </div>
        </div>

        {/* Step Body Rendering */}
        <div className="min-h-[280px]">
          {currentStep === 1 && (
            <Step1LoanType
              ref={currentStepRef}
              defaultValues={formData.step1}
              onSave={(data) => updateStepData('step1', data)}
              maxAllowedTenureMonths={maxAllowedTenureMonths}
            />
          )}

          {currentStep === 2 && (
            <Step2PersonalInfo
              ref={currentStepRef}
              defaultValues={formData.step2}
              onSave={(data) => updateStepData('step2', data)}
            />
          )}

          {currentStep === 3 && (
            <Step3KYC
              ref={currentStepRef}
              defaultValues={formData.step3}
              onSave={(data) => updateStepData('step3', data)}
              loanType={formData.step1?.loanType}
              loanAmount={formData.step1?.loanAmount}
            />
          )}

          {currentStep === 4 && (
            <Step4Address
              ref={currentStepRef}
              defaultValues={formData.step4}
              onSave={(data) => updateStepData('step4', data)}
            />
          )}

          {currentStep === 5 && (
            <Step5Employment
              ref={currentStepRef}
              defaultValues={formData.step5}
              onSave={(data) => updateStepData('step5', data)}
            />
          )}

          {currentStep === 6 && (
            <Step6CoApplicant
              ref={currentStepRef}
              defaultValues={formData.step6}
              onSave={(data) => updateStepData('step6', data)}
              loanType={formData.step1?.loanType}
              loanAmount={formData.step1?.loanAmount}
              primaryMaritalStatus={formData.step2?.maritalStatus}
              primaryMobile={formData.step2?.mobileNumber}
            />
          )}

          {currentStep === 7 && (
            <Step7Documents
              ref={currentStepRef}
              defaultValues={formData.step7}
              onSave={(data) => updateStepData('step7', data)}
              isPanVerified={formData.step3?.isPanVerified}
              employmentType={formData.step5?.employmentType}
            />
          )}

          {currentStep === 8 && (
            <Step8Review
              ref={currentStepRef}
              formData={formData}
              onEditStep={(stepNum) => {
                setCurrentStep(stepNum);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onFinalSubmit={() => {
                clearDraft();
              }}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
