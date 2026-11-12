import React, { useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, Checkbox, CurrencyInput, MaskedInput } from '../common';
import { 
  createStep6Schema, 
  CO_APPLICANT_RELATIONSHIPS, 
  CO_APPLICANT_EMPLOYMENT 
} from '../../schemas/step6Schema';
import { calculateAge } from '../../schemas/step2Schema';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  TrendingUp, 
  PlusCircle, 
  Calendar 
} from 'lucide-react';

const relationshipOptions = CO_APPLICANT_RELATIONSHIPS.map((r) => ({ value: r, label: r }));
const employmentOptions = CO_APPLICANT_EMPLOYMENT.map((e) => ({ value: e, label: e }));

const Step6CoApplicant = forwardRef(function Step6CoApplicant(
  {
    defaultValues = {},
    onSave,
    loanType = 'Personal',
    loanAmount = 0,
    primaryMaritalStatus = '',
    primaryMobile = '',
  },
  ref
) {
  const isMandatory = loanType === 'Home' && Number(loanAmount) > 3000000;
  const schema = createStep6Schema(loanType, loanAmount, primaryMobile);

  // Cross-Step Rule #8: Default relationship to Spouse if primary applicant is married
  const defaultRelationship =
    defaultValues.relationship || (primaryMaritalStatus === 'Married' ? 'Spouse' : 'Spouse');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      hasCoApplicant: defaultValues.hasCoApplicant ?? isMandatory,
      fullName: defaultValues.fullName || '',
      relationship: defaultRelationship,
      dateOfBirth: defaultValues.dateOfBirth || '',
      panNumber: defaultValues.panNumber || '',
      mobileNumber: defaultValues.mobileNumber || '',
      employmentType: defaultValues.employmentType || CO_APPLICANT_EMPLOYMENT[0],
      monthlyIncome: defaultValues.monthlyIncome || '',
    },
  });

  const watchedHasCoApplicant = watch('hasCoApplicant');
  const watchedDob = watch('dateOfBirth');
  const watchedEmployment = watch('employmentType');

  const calculatedAge = watchedDob ? calculateAge(watchedDob) : null;
  const isEmployed = ['Salaried', 'Self-Employed Professional', 'Business Owner'].includes(
    watchedEmployment
  );

  useImperativeHandle(ref, () => ({
    submitForm: () =>
      new Promise((resolve, reject) => {
        handleSubmit(
          (data) => {
            onSave(data);
            resolve(data);
          },
          (validationErrors) => {
            reject(validationErrors);
          }
        )();
      }),
  }));

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* 1. Policy Notice for High-Value Home Loans */}
      {isMandatory ? (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Co-Applicant Mandatory (Home Loan &gt; ₹30 Lakhs)</span>
            <span className="text-amber-800 leading-relaxed block mt-0.5">
              Under LendSwift NBFC credit risk guidelines, loans exceeding ₹30 Lakhs require a co-borrower / guarantor to proceed.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <Controller
            name="hasCoApplicant"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="hasCoApplicant"
                name={field.name}
                checked={field.value}
                onChange={field.onChange}
                label="Add a Co-Applicant / Guarantor"
                description="Adding a co-applicant allows combining incomes to increase your maximum eligible loan amount and secure better interest rates."
                error={errors.hasCoApplicant?.message}
              />
            )}
          />
        </div>
      )}

      {/* 2. Co-Applicant Form Details */}
      {watchedHasCoApplicant ? (
        <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Users className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
              Co-Applicant Personal &amp; Financial Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <Input
              id="coApplicantFullName"
              label="Full Legal Name (as per PAN)"
              placeholder="e.g. Priya Sharma"
              error={errors.fullName?.message}
              required
              {...register('fullName')}
            />

            {/* Relationship with Primary Applicant */}
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Select
                  id="coApplicantRelationship"
                  label="Relationship to Primary Applicant"
                  options={relationshipOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.relationship?.message}
                  helpText={
                    primaryMaritalStatus === 'Married'
                      ? 'Defaulted to Spouse based on your marital status.'
                      : undefined
                  }
                  required
                />
              )}
            />

            {/* Date of Birth & Live Age Badge */}
            <div>
              <Input
                id="coApplicantDob"
                type="date"
                label="Date of Birth"
                error={errors.dateOfBirth?.message}
                required
                {...register('dateOfBirth')}
              />
              {calculatedAge !== null && (
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span
                    className={`font-semibold ${
                      calculatedAge >= 21 && calculatedAge <= 65
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    Age: {calculatedAge} years {calculatedAge < 21 && '(Must be ≥ 21)'} {calculatedAge > 65 && '(Must be ≤ 65)'}
                  </span>
                </div>
              )}
            </div>

            {/* Masked PAN Input */}
            <Controller
              name="panNumber"
              control={control}
              render={({ field }) => (
                <MaskedInput
                  id="coApplicantPan"
                  name={field.name}
                  maskType="pan"
                  maxLength={10}
                  label="Co-Applicant PAN"
                  placeholder="ABCDE1234F"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.panNumber?.message}
                  required
                />
              )}
            />

            {/* Mobile Number */}
            <Input
              id="coApplicantMobile"
              type="tel"
              label="Mobile Number (10 Digits)"
              placeholder="9876543210"
              maxLength={10}
              helpText="Must be distinct from primary applicant mobile."
              error={errors.mobileNumber?.message}
              required
              {...register('mobileNumber')}
            />

            {/* Employment Type */}
            <Controller
              name="employmentType"
              control={control}
              render={({ field }) => (
                <Select
                  id="coApplicantEmployment"
                  label="Employment Status"
                  options={employmentOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.employmentType?.message}
                  required
                />
              )}
            />

            {/* Monthly Income (if employed) */}
            {isEmployed && (
              <div className="sm:col-span-2 bg-blue-50/60 border border-blue-200/70 rounded-lg p-3.5 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E79]">
                  <TrendingUp className="w-4 h-4" />
                  <span>Cross-Step Rule #14: Additional Household Income</span>
                </div>
                <Controller
                  name="monthlyIncome"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      id="coApplicantMonthlyIncome"
                      label="Co-Applicant Net Monthly Income (₹)"
                      placeholder="e.g. 45,000"
                      helpText="Added to primary applicant's income to reduce debt-to-income ratio."
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.monthlyIncome?.message}
                      required
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State when no Co-Applicant is selected */
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Applying as a Single Borrower
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            No co-applicant is currently attached to this application. You can proceed directly or opt to add one anytime.
          </p>
          <button
            type="button"
            onClick={() => setValue('hasCoApplicant', true, { shouldValidate: true })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4E79] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200"
          >
            <PlusCircle className="w-4 h-4" />
            Add a Co-Applicant
          </button>
        </div>
      )}

      {/* Security Footnote */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Co-applicant details will be validated against CIBIL / Experian credit bureaus.</span>
      </div>
    </form>
  );
});

export default Step6CoApplicant;