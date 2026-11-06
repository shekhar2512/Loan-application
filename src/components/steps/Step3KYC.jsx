import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaskedInput, Checkbox, Input } from '../common';
import { createStep3Schema } from '../../schemas/step3Schema';
import { useVerification } from '../../hooks/useVerification';
import { ShieldCheck, Loader2, CheckCircle2, Lock } from 'lucide-react';

const Step3KYC = forwardRef(function Step3KYC(
  { defaultValues = {}, onSave, loanType = 'Personal', loanAmount = 0 },
  ref
) {
  const schema = createStep3Schema(loanType, loanAmount);
  const isHighValueHomeLoan = loanType === 'Home' && Number(loanAmount) > 5000000;

  const {
    register,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      panNumber: defaultValues.panNumber || '',
      aadhaarNumber: defaultValues.aadhaarNumber || '',
      aadhaarConsent: defaultValues.aadhaarConsent || false,
      voterId: defaultValues.voterId || '',
      passport: defaultValues.passport || '',
    },
  });

  // Verification hooks for PAN and Aadhaar
  const panVerification = useVerification('PAN', loanType);
  const aadhaarVerification = useVerification('Aadhaar', loanType);




  // Trigger verification if defaultValues were already provided
  useEffect(() => {
    if (defaultValues.panNumber) panVerification.verify(defaultValues.panNumber);
    if (defaultValues.aadhaarNumber) aadhaarVerification.verify(defaultValues.aadhaarNumber);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    submitForm: () =>
      new Promise((resolve, reject) => {
        handleSubmit(
          (data) => {
            // Verify that async verification passed
            if (!panVerification.isVerified) {
              reject({ panNumber: 'Please wait for PAN verification to complete successfully.' });
              return;
            }
            if (!aadhaarVerification.isVerified) {
              reject({ aadhaarNumber: 'Please wait for Aadhaar verification to complete successfully.' });
              return;
            }

            // Pass data + isPanVerified flag for Cross-Step Rule #9 (Step 7)
            const resultData = {
              ...data,
              isPanVerified: panVerification.isVerified,
              isAadhaarVerified: aadhaarVerification.isVerified,
            };
            onSave(resultData);
            resolve(resultData);
          },
          (validationErrors) => {
            reject(validationErrors);
          }
        )();
      }),
  }));

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Top Regulatory Assurance */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
        <Lock className="w-4 h-4 text-[#27AE60] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm">UIDAI &amp; NSDL Direct Verification Simulation</span>
          <span className="text-emerald-700 leading-relaxed block mt-0.5">
            Your identity details are masked with 256-bit encryption. Physical document upload is waived if verification succeeds.
          </span>
        </div>
      </div>

      {/* 1. PAN Number Input */}
      <div>
        <Controller
          name="panNumber"
          control={control}
          render={({ field }) => (
            <MaskedInput
              id="panNumber"
              name={field.name}
              maskType="pan"
              maxLength={10}
              label="Permanent Account Number (PAN)"
              placeholder="ABCDE1234F"
              value={field.value}
              onChange={field.onChange}
              onBlur={() => {
                field.onBlur();
                panVerification.verify(field.value);
              }}
              helpText="10-character alphanumeric PAN issued by the Income Tax Department."
              error={errors.panNumber?.message || panVerification.error}
              required
            />
          )}
        />

        {/* Verification Status Badge */}
        <div className="mt-2 flex items-center gap-2">
          {panVerification.isVerifying && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying PAN with Income Tax database...</span>
            </div>
          )}
          {panVerification.isVerified && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27AE60]" />
              <span>NSDL Verified: Individual Record Matched</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Aadhaar Number Input */}
      <div>
        <Controller
          name="aadhaarNumber"
          control={control}
          render={({ field }) => (
            <MaskedInput
              id="aadhaarNumber"
              name={field.name}
              maskType="aadhaar"
              maxLength={12}
              label="Aadhaar Number (12 Digits)"
              placeholder="123456789012"
              value={field.value}
              onChange={field.onChange}
              onBlur={() => {
                field.onBlur();
                aadhaarVerification.verify(field.value);
              }}
              helpText="12-digit UIDAI number. Validated via Verhoeff Checksum Algorithm."
              error={errors.aadhaarNumber?.message || aadhaarVerification.error}
              required
            />
          )}
        />

        {/* Aadhaar Verification Status Badge */}
        <div className="mt-2 flex items-center gap-2">
          {aadhaarVerification.isVerifying && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying Aadhaar via UIDAI checksum service...</span>
            </div>
          )}
          {aadhaarVerification.isVerified && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#27AE60]" />
              <span>UIDAI Verhoeff Checksum Passed &amp; Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Mandatory Aadhaar Regulatory Consent */}
      <div className="pt-1">
        <Controller
          name="aadhaarConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="aadhaarConsent"
              name={field.name}
              checked={field.value}
              onChange={field.onChange}
              label="Voluntary Consent for Aadhaar Authentication"
              description="I hereby give my voluntary consent to LendSwift to authenticate my identity via UIDAI Aadhaar e-KYC services in strict compliance with the Aadhaar Act 2016 and RBI Digital Lending Guidelines 2022."
              error={errors.aadhaarConsent?.message}
              required
            />
          )}
        />
      </div>

      {/* 4. Secondary KYC Documents (Optional / Conditional) */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1F4E79]" />
          Additional Identification (OVD)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="voterId"
            label="Voter ID / EPIC Card (Optional)"
            placeholder="e.g. ABC1234567"
            helpText="3 letters followed by 7 digits."
            error={errors.voterId?.message}
            {...register('voterId')}
          />

          <Input
            id="passport"
            label={`Passport Number ${isHighValueHomeLoan ? '(Required)' : '(Optional)'}`}
            placeholder="e.g. A1234567"
            helpText={
              isHighValueHomeLoan
                ? 'Mandatory for Home Loans exceeding ₹50 Lakhs.'
                : '1 letter followed by 7 digits.'
            }
            error={errors.passport?.message}
            required={isHighValueHomeLoan}
            {...register('passport')}
          />
        </div>
      </div>
    </form>
  );
});

export default Step3KYC;