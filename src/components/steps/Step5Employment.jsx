import React, { useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, CurrencyInput } from '../common';
import { 
  step5Schema, 
  EMPLOYMENT_TYPES, 
  PROFESSION_TYPES, 
  BUSINESS_TYPES, 
  SALARY_MODES 
} from '../../schemas/step5Schema';
import { INDIAN_STATES } from '../../schemas/step4Schema';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup';
import { 
  Briefcase, 
  UserCheck, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

const professionOptions = PROFESSION_TYPES.map((p) => ({ value: p, label: p }));
const businessStructureOptions = BUSINESS_TYPES.map((b) => ({ value: b, label: b }));
const salaryModeOptions = SALARY_MODES.map((m) => ({ value: m, label: m }));
const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

const Step5Employment = forwardRef(function Step5Employment({ defaultValues = {}, onSave }, ref) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step5Schema),
    mode: 'onBlur',
    defaultValues: {
      employmentType: defaultValues.employmentType || 'Salaried',
      // Salaried fields
      companyName: defaultValues.companyName || '',
      designation: defaultValues.designation || '',
      monthlySalary: defaultValues.monthlySalary || '',
      salaryMode: defaultValues.salaryMode || SALARY_MODES[0],
      totalExperienceYears: defaultValues.totalExperienceYears ?? 4,
      currentJobExperienceYears: defaultValues.currentJobExperienceYears ?? 2,
      // Self-Employed fields
      businessName: defaultValues.businessName || '',
      professionType: defaultValues.professionType || PROFESSION_TYPES[0],
      annualTurnover: defaultValues.annualTurnover || '',
      monthlyIncome: defaultValues.monthlyIncome || '',
      yearsInBusiness: defaultValues.yearsInBusiness ?? 3,
      // Business Owner fields
      businessType: defaultValues.businessType || BUSINESS_TYPES[0],
      gstNumber: defaultValues.gstNumber || '',
      businessAddressLine1: defaultValues.businessAddressLine1 || '',
      businessCity: defaultValues.businessCity || '',
      businessState: defaultValues.businessState || '',
      businessPinCode: defaultValues.businessPinCode || '',
    },
  });

  const watchedType = watch('employmentType');

  // PIN lookup for business owner office address
  const businessPinLookup = usePinCodeLookup(setValue, {
    cityField: 'businessCity',
    stateField: 'businessState',
  });

  const handleTypeChange = (newType) => {
    setValue('employmentType', newType, { shouldValidate: true });
  };

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
      {/* 1. Employment Type Selector Cards */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Employment Classification <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EMPLOYMENT_TYPES.map((type) => {
            const isSelected = watchedType === type;
            let Icon = Briefcase;
            if (type === 'Self-Employed') Icon = UserCheck;
            if (type === 'Business Owner') Icon = Building2;

            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1F4E79] bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#1F4E79] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F4E79]" />
                  )}
                </div>
                <div>
                  <span className={`block font-bold text-sm ${isSelected ? 'text-[#1F4E79]' : 'text-slate-800'}`}>
                    {type}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    {type === 'Salaried' && 'Fixed monthly income from company'}
                    {type === 'Self-Employed' && 'Doctor, CA, Lawyer, Consultant'}
                    {type === 'Business Owner' && 'Trader, Manufacturer, Enterprise'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2A. Salaried Sub-Form */}
      {watchedType === 'Salaried' && (
        <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Briefcase className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
              Salaried Employment Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="companyName"
              label="Employer / Company Name"
              placeholder="e.g. Tata Consultancy Services"
              error={errors.companyName?.message}
              required
              {...register('companyName')}
            />

            <Input
              id="designation"
              label="Designation / Job Role"
              placeholder="e.g. Senior Software Engineer"
              error={errors.designation?.message}
              required
              {...register('designation')}
            />

            <Controller
              name="monthlySalary"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="monthlySalary"
                  label="Net In-Hand Monthly Salary (₹)"
                  placeholder="e.g. 65,000"
                  helpText="Minimum ₹15,000 net monthly salary required."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.monthlySalary?.message}
                  required
                />
              )}
            />

            <Controller
              name="salaryMode"
              control={control}
              render={({ field }) => (
                <Select
                  id="salaryMode"
                  label="Salary Credit Mode"
                  options={salaryModeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.salaryMode?.message}
                  required
                />
              )}
            />

            <Input
              id="totalExperienceYears"
              type="number"
              label="Total Work Experience (Years)"
              placeholder="e.g. 5"
              min="0"
              max="50"
              error={errors.totalExperienceYears?.message}
              required
              {...register('totalExperienceYears')}
            />

            <Input
              id="currentJobExperienceYears"
              type="number"
              label="Experience at Current Company (Years)"
              placeholder="e.g. 2"
              min="0"
              max="50"
              error={errors.currentJobExperienceYears?.message}
              required
              {...register('currentJobExperienceYears')}
            />
          </div>
        </div>
      )}

      {/* 2B. Self-Employed Sub-Form */}
      {watchedType === 'Self-Employed' && (
        <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <UserCheck className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
              Professional Practice Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="businessName"
              label="Clinic / Firm / Practice Name"
              placeholder="e.g. Apex Health Clinic"
              error={errors.businessName?.message}
              required
              {...register('businessName')}
            />

            <Controller
              name="professionType"
              control={control}
              render={({ field }) => (
                <Select
                  id="professionType"
                  label="Profession Discipline"
                  options={professionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.professionType?.message}
                  required
                />
              )}
            />

            <Controller
              name="annualTurnover"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="annualTurnover"
                  label="Annual Gross Receipts / Turnover (₹)"
                  placeholder="e.g. 12,00,000"
                  helpText="Minimum ₹3,00,000 per annum."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.annualTurnover?.message}
                  required
                />
              )}
            />

            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="monthlyIncome"
                  label="Average Monthly Net Income (₹)"
                  placeholder="e.g. 80,000"
                  helpText="Minimum ₹20,000/month."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.monthlyIncome?.message}
                  required
                />
              )}
            />

            <div className="sm:col-span-2">
              <Input
                id="yearsInBusiness"
                type="number"
                label="Years in Continuous Practice"
                placeholder="e.g. 4"
                min="2"
                max="50"
                helpText="Minimum 2 years of documented practice required."
                error={errors.yearsInBusiness?.message}
                required
                {...register('yearsInBusiness')}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2C. Business Owner Sub-Form */}
      {watchedType === 'Business Owner' && (
        <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Building2 className="w-4 h-4 text-[#1F4E79]" />
            <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
              Business Entity &amp; Statutory Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="businessName"
              label="Registered Business / Enterprise Name"
              placeholder="e.g. Deccan Logistics Pvt Ltd"
              error={errors.businessName?.message}
              required
              {...register('businessName')}
            />

            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select
                  id="businessType"
                  label="Business Entity Structure"
                  options={businessStructureOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.businessType?.message}
                  required
                />
              )}
            />

            <Controller
              name="annualTurnover"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="annualTurnover"
                  label="Annual Business Turnover (₹)"
                  placeholder="e.g. 45,00,000"
                  helpText="Minimum ₹5,00,000 per annum."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.annualTurnover?.message}
                  required
                />
              )}
            />

            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="monthlyIncome"
                  label="Average Monthly Net Profit / Drawings (₹)"
                  placeholder="e.g. 1,50,000"
                  helpText="Minimum ₹25,000/month."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.monthlyIncome?.message}
                  required
                />
              )}
            />

            <Input
              id="yearsInBusiness"
              type="number"
              label="Years in Registered Business"
              placeholder="e.g. 5"
              min="2"
              max="50"
              helpText="Minimum 2 years of active business required."
              error={errors.yearsInBusiness?.message}
              required
              {...register('yearsInBusiness')}
            />

            {/* Strict 15-character GSTIN */}
            <Input
              id="gstNumber"
              label="15-Character GST Identification Number (GSTIN)"
              placeholder="e.g. 29ABCDE1234F1Z5"
              maxLength={15}
              helpText="2 state digits + 10 PAN chars + entity number + Z + checksum."
              error={errors.gstNumber?.message}
              required
              {...register('gstNumber', {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />

            {/* Office Address Section */}
            <div className="sm:col-span-2 pt-3 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4E79] uppercase tracking-wider mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>Registered Office / Business Premises</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    id="businessAddressLine1"
                    label="Office Address (Plot/Building, Street)"
                    placeholder="e.g. Suite 301, Phoenix Tech Park"
                    error={errors.businessAddressLine1?.message}
                    required
                    {...register('businessAddressLine1')}
                  />
                </div>

                <div>
                  <Input
                    id="businessPinCode"
                    label="Office PIN Code"
                    placeholder="e.g. 560066"
                    maxLength={6}
                    error={errors.businessPinCode?.message || businessPinLookup.error}
                    required
                    {...register('businessPinCode', {
                      onChange: (e) => businessPinLookup.lookup(e.target.value),
                    })}
                  />
                  <div className="mt-1 min-h-[18px]">
                    {businessPinLookup.isLoading && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Searching postal directory...</span>
                      </div>
                    )}
                    {businessPinLookup.isFound && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-[#27AE60]" />
                        <span>Auto-filled: {businessPinLookup.pinDetails?.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    id="businessCity"
                    label="Office City"
                    placeholder="City"
                    error={errors.businessCity?.message}
                    required
                    {...register('businessCity')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Controller
                    name="businessState"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="businessState"
                        label="Office State / UT"
                        options={stateOptions}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.businessState?.message}
                        required
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regulatory Underwriting Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <TrendingUp className="w-4 h-4 text-[#1F4E79] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 block">Cross-Step Rule #13: Debt-to-Income (DTI) Guideline</span>
          <span className="leading-relaxed block mt-0.5">
            Under RBI Digital Lending Guidelines, your estimated monthly loan installment must not exceed 50% of your declared net monthly income. Income documents will be cross-verified in Step 7.
          </span>
        </div>
      </div>
    </form>
  );
});

export default Step5Employment;