import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '../common';
import { step8Schema } from '../../schemas/step8Schema';
import { calculateEMI } from '../../utils/emiCalculator';
import { LOAN_CONFIG } from '../../schemas/step1Schema';
import { formatIndianCurrency } from '../../utils/formatters';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  CreditCard, 
  User, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Users, 
  FileUp, 
  Printer, 
  Award, 
  Percent, 
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

const Step8Review = forwardRef(function Step8Review(
  {
    formData = {},
    onEditStep,
    onFinalSubmit,
  },
  ref
) {
  const [submissionResult, setSubmissionResult] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step8Schema),
    mode: 'onBlur',
    defaultValues: {
      kfsConsent: false,
      creditBureauConsent: false,
      coolOffPeriodConsent: false,
      dataPrivacyConsent: false,
    },
  });

  // Extract financial data for EMI calculation
  const loanType = formData.step1?.loanType || 'Personal';
  const loanAmount = Number(formData.step1?.loanAmount) || 300000;
  const tenureMonths = Number(formData.step1?.loanTenure) || 36;
  const config = LOAN_CONFIG[loanType] || LOAN_CONFIG.Personal;
  const interestRate = config.interestRate;

  // Household income & rent for Cross-Step Rules #10, #13, #14
  const primaryIncome = Number(formData.step5?.monthlySalary || formData.step5?.monthlyIncome) || 0;
  const coIncome = Number(formData.step6?.monthlyIncome) || 0;
  const monthlyRent = formData.step4?.residenceType === 'Rented' ? Number(formData.step4?.rentAmount) || 0 : 0;

  const financialSummary = calculateEMI(loanAmount, interestRate, tenureMonths, {
    monthlyIncome: primaryIncome,
    coApplicantIncome: coIncome,
    monthlyRent,
  });

  useImperativeHandle(ref, () => ({
    submitForm: () =>
      new Promise((resolve, reject) => {
        handleSubmit(
          (data) => {
            const refId = `LS-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const result = {
              referenceId: refId,
              submittedAt: new Date().toISOString(),
              financialSummary,
              consents: data,
            };
            setSubmissionResult(result);
            if (onFinalSubmit) onFinalSubmit(result);
            resolve(result);
          },
          (validationErrors) => {
            reject(validationErrors);
          }
        )();
      }),
  }));

  return (
    <div className="space-y-6">
      {/* 1. Final Submission Success Dialog Modal */}
      {submissionResult && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1F4E79] via-[#27AE60] to-[#1F4E79]" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#27AE60] flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
              Application Pre-Approved
            </span>

            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Congratulations, {formData.step2?.firstName || 'Applicant'}!
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Your digital loan application has been successfully verified and transmitted to LendSwift NBFC credit underwriting.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 mb-6 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Application Reference ID:</span>
                <span className="font-mono font-bold text-sm text-[#1F4E79]">{submissionResult.referenceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Loan Facility:</span>
                <span className="font-bold text-slate-800">{loanType} Loan</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Sanctioned Principal:</span>
                <span className="font-bold text-slate-800">₹ {formatIndianCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Monthly Installment (EMI):</span>
                <span className="font-bold text-[#27AE60] text-sm">₹ {formatIndianCurrency(financialSummary.monthlyEMI)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Disbursal Amount:</span>
                <span className="font-bold text-slate-800">₹ {formatIndianCurrency(financialSummary.netDisbursal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-1/2 py-3 rounded-xl bg-[#1F4E79] text-xs font-bold text-white hover:bg-blue-900 inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                Close &amp; Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Key Fact Statement (KFS) & EMI Summary Card */}
      <div className="bg-gradient-to-br from-[#1F4E79] to-blue-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-blue-400/30 mb-5">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
              RBI Key Fact Statement (KFS) &amp; Financial Terms
            </span>
          </div>
          <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full text-blue-100 border border-white/20">
            {interestRate}% p.a. Reducing
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-blue-400/30">
          <div>
            <span className="text-xs text-blue-200 block">Monthly EMI</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              ₹ {formatIndianCurrency(financialSummary.monthlyEMI)}
            </span>
            <span className="text-[10px] text-blue-200 block mt-0.5">for {tenureMonths} Months</span>
          </div>

          <div>
            <span className="text-xs text-blue-200 block">Loan Principal</span>
            <span className="text-lg font-bold text-white">
              ₹ {formatIndianCurrency(loanAmount)}
            </span>
            <span className="text-[10px] text-blue-200 block mt-0.5">{loanType} Loan</span>
          </div>

          <div>
            <span className="text-xs text-blue-200 block">Total Interest</span>
            <span className="text-lg font-bold text-white">
              ₹ {formatIndianCurrency(financialSummary.totalInterest)}
            </span>
            <span className="text-[10px] text-blue-200 block mt-0.5">over full tenure</span>
          </div>

          <div>
            <span className="text-xs text-blue-200 block">Net Disbursal</span>
            <span className="text-lg font-bold text-emerald-300">
              ₹ {formatIndianCurrency(financialSummary.netDisbursal)}
            </span>
            <span className="text-[10px] text-blue-200 block mt-0.5">after 2% + GST fee</span>
          </div>
        </div>

        {/* Affordability Debt-to-Income Badge (Rules #10, #13, #14) */}
        <div className="mt-4 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-blue-100">
              Debt-to-Income (DTI) Ratio: <b>{financialSummary.dtiRatio}%</b> of net household income
            </span>
          </div>

          {financialSummary.isAffordable ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Pre-Approved: Healthy DTI (&lt;50%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-500/40">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              High DTI Warning (&gt;50%): Consider longer tenure
            </span>
          )}
        </div>
      </div>

      {/* 3. Review Summary Cards with Step Edit Shortcuts (Steps 1–7) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Verify Application Particulars
        </h3>

        {/* Step 1 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">1. Loan Configuration</span>
              <span className="text-xs text-slate-500">
                {loanType} Loan • ₹ {formatIndianCurrency(loanAmount)} • {tenureMonths} Months
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Step 2 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">2. Primary Applicant Identity</span>
              <span className="text-xs text-slate-500">
                {formData.step2?.firstName} {formData.step2?.lastName} • DOB: {formData.step2?.dateOfBirth} • {formData.step2?.mobileNumber}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Step 3 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">3. Statutory KYC Verification</span>
              <span className="text-xs text-slate-500">
                PAN: ••••••{formData.step3?.panNumber?.slice(-4) || 'XXXX'} • Aadhaar (Verhoeff Verified): ••••••••{formData.step3?.aadhaarNumber?.slice(-4) || 'XXXX'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Step 4 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">4. Residential Address</span>
              <span className="text-xs text-slate-500">
                {formData.step4?.currentCity}, {formData.step4?.currentState} - {formData.step4?.currentPinCode} ({formData.step4?.residenceType})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Step 5 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">5. Employment &amp; Income</span>
              <span className="text-xs text-slate-500">
                {formData.step5?.employmentType} • {formData.step5?.companyName || formData.step5?.businessName} • ₹ {formatIndianCurrency(primaryIncome)}/month
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Step 6 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">6. Co-Applicant / Guarantor</span>
              <span className="text-xs text-slate-500">
                {formData.step6?.hasCoApplicant
                  ? `${formData.step6.fullName} (${formData.step6.relationship}) • Income: ₹ ${formatIndianCurrency(coIncome)}`
                  : 'Single Borrower Application (No Co-Applicant)'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(6)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Step 7 Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileUp className="w-5 h-5 text-[#1F4E79]" />
            <div>
              <span className="font-bold text-xs text-slate-800 block">7. Verification Documents &amp; Signature</span>
              <span className="text-xs text-slate-500">
                Documents Compressed via Canvas • E-Signature Captured &amp; Hashed
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(7)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F4E79] hover:text-blue-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </div>

      {/* 4. Mandatory RBI Digital Lending Consents (4 Checkboxes) */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1F4E79]" />
          Mandatory Statutory Authorizations (RBI DL/2022/01)
        </h3>

        {/* Consent 1: Key Fact Statement */}
        <Controller
          name="kfsConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="kfsConsent"
              name={field.name}
              checked={field.value}
              onChange={field.onChange}
              label="Key Fact Statement (KFS) Acceptance"
              description="I confirm receipt and review of the Key Fact Statement disclosing the Annual Percentage Rate (APR), 2% processing charges, amortized reducing-balance schedule, and designated nodal grievance officer contact."
              error={errors.kfsConsent?.message}
              required
            />
          )}
        />

        {/* Consent 2: Credit Bureau Pull */}
        <Controller
          name="creditBureauConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="creditBureauConsent"
              name={field.name}
              checked={field.value}
              onChange={field.onChange}
              label="Credit Information Bureau Inquiry Authorization"
              description="I grant LendSwift NBFC lawful authorization to query and evaluate my credit profile across TransUnion CIBIL, Experian, Equifax, and CRIF High Mark credit repositories."
              error={errors.creditBureauConsent?.message}
              required
            />
          )}
        />

        {/* Consent 3: Statutory Cooling-Off Period */}
        <Controller
          name="coolOffPeriodConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="coolOffPeriodConsent"
              name={field.name}
              checked={field.value}
              onChange={field.onChange}
              label="Statutory Look-Up / Cooling-Off Period Right"
              description="I acknowledge my statutory entitlement to a 3-business-day cooling-off window following disbursal, during which I can exit the credit agreement by repaying principal without penalty charges."
              error={errors.coolOffPeriodConsent?.message}
              required
            />
          )}
        />

        {/* Consent 4: DPDP Act Data Privacy */}
        <Controller
          name="dataPrivacyConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="dataPrivacyConsent"
              name={field.name}
              checked={field.value}
              onChange={field.onChange}
              label="Digital Personal Data Protection (DPDP) Act 2023 Consent"
              description="I consent to the collection and cryptographic storage of my biometric and financial data solely for credit underwriting, with strict prohibition against disclosure to third-party telemarketers."
              error={errors.dataPrivacyConsent?.message}
              required
            />
          )}
        />
      </div>
    </div>
  );
});

export default Step8Review;