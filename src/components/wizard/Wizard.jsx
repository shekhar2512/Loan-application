import React, { useState, useRef } from 'react';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import Step1LoanType from '../steps/Step1LoanType';
import Step2PersonalInfo from '../steps/Step2PersonalInfo';
import { calculateAge } from '../../schemas/step2Schema';
import { 
  CreditCard, 
  User, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Users, 
  FileUp, 
  FileText 
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
  });

  // Ref to trigger current step form validation
  const currentStepRef = useRef(null);

  const totalSteps = STEPS_REGISTRY.length;
  const activeStep = STEPS_REGISTRY[currentStep - 1];
  const StepIcon = activeStep.icon;

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
    // If the step component has validation, trigger it before advancing
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
      // For placeholder steps (Steps 3-8)
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

  const handleSaveDraft = () => {
    const time = new Date().toLocaleTimeString();
    showToast(`Draft saved successfully at ${time}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
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

        {/* Step Header */}
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
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

          {currentStep > 2 && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1F4E79] flex items-center justify-center mb-3 font-bold text-sm">
                {activeStep.number}
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {activeStep.title}
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                This step will be unlocked on subsequent days of the roadmap.
              </p>
            </div>
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