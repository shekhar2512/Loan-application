import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, CurrencyInput, Select, Input } from '../common';
import {
  LOAN_CONFIG,
  getTenureOptions,
  createStep1Schema,
} from '../../schemas/step1Schema';
import { Percent, Info } from 'lucide-react';

const Step1LoanType = forwardRef(function Step1LoanType(
  { defaultValues = {}, onSave, maxAllowedTenureMonths = null },
  ref
) {
  const schema = createStep1Schema(maxAllowedTenureMonths);

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
      loanType: defaultValues.loanType || 'Personal',
      loanAmount: defaultValues.loanAmount || 300000,
      loanTenure: defaultValues.loanTenure ? String(defaultValues.loanTenure) : '36',
      loanPurpose: defaultValues.loanPurpose || 'debt_consolidation',
      referralCode: defaultValues.referralCode || '',
    },
  });

  const selectedLoanType = watch('loanType') || 'Personal';
  const currentConfig = LOAN_CONFIG[selectedLoanType] || LOAN_CONFIG.Personal;

  // Options for RadioGroup
  const loanTypeOptions = Object.keys(LOAN_CONFIG).map((type) => ({
    value: type,
    label: LOAN_CONFIG[type].label,
    description: LOAN_CONFIG[type].description,
    badge: LOAN_CONFIG[type].badge,
  }));

  // Dynamic dropdown options
  const tenureOptions = getTenureOptions(selectedLoanType, maxAllowedTenureMonths);
  const purposeOptions = currentConfig.purposes;

  // When loan type changes, ensure amount and purpose remain valid
  useEffect(() => {
    // If current amount exceeds new type's max, adjust to new max
    const currentAmt = watch('loanAmount');
    if (currentAmt > currentConfig.maxAmount) {
      setValue('loanAmount', currentConfig.maxAmount, { shouldValidate: true });
    }
    // Default to the first purpose of the newly selected loan type
    setValue('loanPurpose', currentConfig.purposes[0].value, { shouldValidate: true });
  }, [selectedLoanType, currentConfig, setValue, watch]);

  // Expose submit handler to parent Wizard via ref
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
      {/* 1. Loan Product Selection */}
      <div>
        <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
          <span>Select Loan Product</span>
          <span className="text-[#E74C3C]">*</span>
        </label>
        <Controller
          name="loanType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              options={loanTypeOptions}
              layout="horizontal"
              error={errors.loanType?.message}
            />
          )}
        />
      </div>

      {/* Product Highlight Banner */}
      <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 flex items-center justify-between text-xs text-[#1F4E79]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1F4E79] shrink-0" />
          <span>
            Indicative Interest Rate for <b>{currentConfig.label}</b>:
          </span>
        </div>
        <div className="flex items-center gap-1 font-bold text-sm bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
          <Percent className="w-3.5 h-3.5 text-[#27AE60]" />
          <span>{currentConfig.interestRate}% p.a.</span>
        </div>
      </div>

      {/* 2. Loan Amount with Indian formatting */}
      <div>
        <Controller
          name="loanAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="loanAmount"
              name={field.name}
              label="Required Loan Amount"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.loanAmount?.message}
              helpText={`Min ₹50,000 • Max ₹${currentConfig.maxAmount.toLocaleString('en-IN')}`}
              required
            />
          )}
        />
      </div>

      {/* 3. Tenure & Purpose (2 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tenure */}
        <div>
          <Select
            id="loanTenure"
            label="Loan Tenure (Months)"
            options={tenureOptions}
            error={errors.loanTenure?.message}
            helpText={`Tenure range: ${currentConfig.minTenureMonths}–${currentConfig.maxTenureMonths} months`}
            required
            {...register('loanTenure')}
          />
        </div>

        {/* Purpose */}
        <div>
          <Select
            id="loanPurpose"
            label="Loan Purpose"
            options={purposeOptions}
            error={errors.loanPurpose?.message}
            required
            {...register('loanPurpose')}
          />
        </div>
      </div>

      {/* 4. Referral Code (Optional) */}
      <div>
        <Input
          id="referralCode"
          label="Partner / Referral Code (Optional)"
          placeholder="e.g. PARTNER88"
          helpText="Enter a 6–10 character alphanumeric code if you were referred."
          error={errors.referralCode?.message}
          {...register('referralCode')}
        />
      </div>
    </form>
  );
});

export default Step1LoanType;