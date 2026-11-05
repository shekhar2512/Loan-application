import React, { useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, RadioGroup } from '../common';
import { step2Schema, calculateAge } from '../../schemas/step2Schema';
import { UserCheck, Shield } from 'lucide-react';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single / Unmarried' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
];

const Step2PersonalInfo = forwardRef(function Step2PersonalInfo(
  { defaultValues = {}, onSave },
  ref
) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: {
      fullName: defaultValues.fullName || '',
      dateOfBirth: defaultValues.dateOfBirth || '',
      gender: defaultValues.gender || 'Male',
      maritalStatus: defaultValues.maritalStatus || 'Single',
      fatherName: defaultValues.fatherName || '',
      motherName: defaultValues.motherName || '',
      email: defaultValues.email || '',
      mobileNumber: defaultValues.mobileNumber || '',
      alternateMobile: defaultValues.alternateMobile || '',
    },
  });

  const selectedDob = watch('dateOfBirth');
  const currentAge = selectedDob ? calculateAge(selectedDob) : null;

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
      {/* 1. Full Name */}
      <div>
        <Input
          id="fullName"
          label="Full Name (as per PAN Card)"
          placeholder="e.g. RAHUL SHARMA"
          helpText="Ensure this exactly matches the name on your PAN card."
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />
      </div>

      {/* 2. Date of Birth & Age Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id="dateOfBirth"
            type="date"
            label="Date of Birth"
            helpText="Must be between 21 and 65 years old."
            error={errors.dateOfBirth?.message}
            required
            {...register('dateOfBirth')}
          />
        </div>

        <div className="flex flex-col justify-end">
          {currentAge !== null && currentAge > 0 && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              currentAge >= 21 && currentAge <= 65
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <Shield className="w-4 h-4" />
              <span>Calculated Age: <b>{currentAge} Years</b></span>
              <span className="text-[10px] ml-auto uppercase font-bold">
                {currentAge >= 21 && currentAge <= 65 ? 'Eligible' : 'Ineligible'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Gender (RadioGroup) */}
      <div>
        <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
          <span>Gender</span>
          <span className="text-[#E74C3C]">*</span>
        </label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              options={GENDER_OPTIONS}
              layout="horizontal"
              error={errors.gender?.message}
            />
          )}
        />
      </div>

      {/* 4. Marital Status (Dropdown) */}
      <div>
        <Select
          id="maritalStatus"
          label="Marital Status"
          options={MARITAL_STATUS_OPTIONS}
          helpText="If Married, spouse details will default in Step 6 (Co-Applicant)."
          error={errors.maritalStatus?.message}
          required
          {...register('maritalStatus')}
        />
      </div>

      {/* 5. Parents' Names (2-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id="fatherName"
            label="Father's Full Name"
            placeholder="e.g. SURESH SHARMA"
            error={errors.fatherName?.message}
            required
            {...register('fatherName')}
          />
        </div>

        <div>
          <Input
            id="motherName"
            label="Mother's Full Name"
            placeholder="e.g. SUNITA SHARMA"
            error={errors.motherName?.message}
            required
            {...register('motherName')}
          />
        </div>
      </div>

      {/* 6. Contact Information */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#27AE60]" />
          Verified Contact Details
        </h4>

        <div className="space-y-4">
          {/* Email */}
          <Input
            id="email"
            type="email"
            label="Personal Email Address"
            placeholder="e.g. rahul.sharma@example.com"
            helpText="Loan sanction letter and Key Fact Statement (KFS) will be sent here."
            error={errors.email?.message}
            required
            {...register('email')}
          />

          {/* Primary Mobile & Alternate Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="mobileNumber"
              type="tel"
              maxLength={10}
              label="Primary Mobile Number"
              placeholder="e.g. 9876543210"
              helpText="10-digit number for SMS alerts & simulated OTP."
              error={errors.mobileNumber?.message}
              required
              {...register('mobileNumber')}
            />

            <Input
              id="alternateMobile"
              type="tel"
              maxLength={10}
              label="Alternate Mobile Number (Optional)"
              placeholder="e.g. 9123456789"
              helpText="Must be different from your primary number."
              error={errors.alternateMobile?.message}
              {...register('alternateMobile')}
            />
          </div>
        </div>
      </div>
    </form>
  );
});

export default Step2PersonalInfo;