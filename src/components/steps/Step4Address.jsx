import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, Checkbox, CurrencyInput } from '../common';
import { step4Schema, RESIDENCE_TYPES, INDIAN_STATES } from '../../schemas/step4Schema';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup';
import { 
  MapPin, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Building, 
  History 
} from 'lucide-react';

const residenceOptions = RESIDENCE_TYPES.map((t) => ({ value: t, label: t }));
const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

const Step4Address = forwardRef(function Step4Address({ defaultValues = {}, onSave }, ref) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step4Schema),
    mode: 'onBlur',
    defaultValues: {
      currentAddressLine1: defaultValues.currentAddressLine1 || '',
      currentAddressLine2: defaultValues.currentAddressLine2 || '',
      currentPinCode: defaultValues.currentPinCode || '',
      currentCity: defaultValues.currentCity || '',
      currentState: defaultValues.currentState || '',
      residenceType: defaultValues.residenceType || 'Owned',
      rentAmount: defaultValues.rentAmount || '',
      yearsAtCurrentAddress: defaultValues.yearsAtCurrentAddress ?? 3,
      previousAddressLine1: defaultValues.previousAddressLine1 || '',
      previousAddressLine2: defaultValues.previousAddressLine2 || '',
      previousPinCode: defaultValues.previousPinCode || '',
      previousCity: defaultValues.previousCity || '',
      previousState: defaultValues.previousState || '',
      sameAsPermanent: defaultValues.sameAsPermanent ?? true,
      permanentAddressLine1: defaultValues.permanentAddressLine1 || '',
      permanentAddressLine2: defaultValues.permanentAddressLine2 || '',
      permanentPinCode: defaultValues.permanentPinCode || '',
      permanentCity: defaultValues.permanentCity || '',
      permanentState: defaultValues.permanentState || '',
    },
  });

  // PIN code lookups for current and permanent addresses
  const currentPinLookup = usePinCodeLookup(setValue, {
    cityField: 'currentCity',
    stateField: 'currentState',
  });

  const permanentPinLookup = usePinCodeLookup(setValue, {
    cityField: 'permanentCity',
    stateField: 'permanentState',
  });

  const watchedResidenceType = watch('residenceType');
  const watchedYears = watch('yearsAtCurrentAddress');
  const watchedSameAsPermanent = watch('sameAsPermanent');

  // Trigger lookup if default PIN code was already present
  useEffect(() => {
    if (defaultValues.currentPinCode && defaultValues.currentPinCode.length === 6) {
      currentPinLookup.lookup(defaultValues.currentPinCode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    submitForm: () =>
      new Promise((resolve, reject) => {
        handleSubmit(
          (data) => {
            const finalData = { ...data };
            // If sameAsPermanent is checked, auto-copy current to permanent
            if (data.sameAsPermanent) {
              finalData.permanentAddressLine1 = data.currentAddressLine1;
              finalData.permanentAddressLine2 = data.currentAddressLine2 || '';
              finalData.permanentPinCode = data.currentPinCode;
              finalData.permanentCity = data.currentCity;
              finalData.permanentState = data.currentState;
            }
            onSave(finalData);
            resolve(finalData);
          },
          (validationErrors) => {
            reject(validationErrors);
          }
        )();
      }),
  }));

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* 1. Current Residential Address Section */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
          <MapPin className="w-4 h-4 text-[#1F4E79]" />
          <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
            Current Residential Address
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              id="currentAddressLine1"
              label="Flat / House No., Building Name, Street"
              placeholder="e.g. Flat 402, Royal Palms, MG Road"
              error={errors.currentAddressLine1?.message}
              required
              {...register('currentAddressLine1')}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              id="currentAddressLine2"
              label="Area, Landmark (Optional)"
              placeholder="e.g. Near Metro Station, Indiranagar"
              error={errors.currentAddressLine2?.message}
              {...register('currentAddressLine2')}
            />
          </div>

          <div>
            <Input
              id="currentPinCode"
              label="PIN Code (6 Digits)"
              placeholder="e.g. 560001"
              maxLength={6}
              error={errors.currentPinCode?.message || currentPinLookup.error}
              required
              {...register('currentPinCode', {
                onChange: (e) => currentPinLookup.lookup(e.target.value),
              })}
            />

            {/* Postal Lookup Status Badges */}
            <div className="mt-1.5 min-h-[20px]">
              {currentPinLookup.isLoading && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Looking up India Post directory...</span>
                </div>
              )}
              {currentPinLookup.isFound && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#27AE60]" />
                  <span>Auto-filled: {currentPinLookup.pinDetails?.district || currentPinLookup.pinDetails?.city}</span>
                </div>
              )}
              {currentPinLookup.isMismatch && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Note: Selected State differs from registered postal state.</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Input
              id="currentCity"
              label="City"
              placeholder="Auto-filled via PIN"
              error={errors.currentCity?.message}
              required
              {...register('currentCity')}
            />
          </div>

          <div className="sm:col-span-2">
            <Controller
              name="currentState"
              control={control}
              render={({ field }) => (
                <Select
                  id="currentState"
                  label="State / Union Territory"
                  options={stateOptions}
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    currentPinLookup.checkStateMismatch(e.target.value);
                  }}
                  error={errors.currentState?.message}
                  required
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* 2. Residence Type & Affordability Details */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
          <Home className="w-4 h-4 text-[#1F4E79]" />
          <h3 className="text-sm font-bold text-[#1F4E79] uppercase tracking-wider">
            Residence Type &amp; Stability
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="residenceType"
            control={control}
            render={({ field }) => (
              <Select
                id="residenceType"
                label="Residence Ownership Type"
                options={residenceOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.residenceType?.message}
                required
              />
            )}
          />

          <Input
            id="yearsAtCurrentAddress"
            type="number"
            label="Years at Current Address"
            placeholder="e.g. 3"
            min="0"
            max="50"
            step="1"
            helpText="Enter 0 if less than 1 full year."
            error={errors.yearsAtCurrentAddress?.message}
            required
            {...register('yearsAtCurrentAddress')}
          />

          {/* Conditional Rent Amount Field (Rule #10) */}
          {watchedResidenceType === 'Rented' && (
            <div className="sm:col-span-2 bg-blue-50/60 border border-blue-200/70 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E79]">
                <Building className="w-4 h-4" />
                <span>Rental Commitment (Cross-Step Rule #10: Feeds Step 8 Affordability)</span>
              </div>
              <Controller
                name="rentAmount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    id="rentAmount"
                    label="Monthly Rent (₹)"
                    placeholder="e.g. 15,000"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.rentAmount?.message}
                    required
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Conditional Previous Address Section (if < 1 year) */}
      {Number(watchedYears) < 1 && watchedYears !== '' && (
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200/60">
            <History className="w-4 h-4 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                Previous Address (Mandatory for &lt; 1 Year at Current Address)
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                NBFC credit policy requires historical address records for stability assessment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                id="previousAddressLine1"
                label="Previous Address Line 1"
                placeholder="House/Street details"
                error={errors.previousAddressLine1?.message}
                required
                {...register('previousAddressLine1')}
              />
            </div>

            <div>
              <Input
                id="previousPinCode"
                label="Previous PIN Code"
                placeholder="e.g. 110001"
                maxLength={6}
                error={errors.previousPinCode?.message}
                required
                {...register('previousPinCode')}
              />
            </div>

            <div>
              <Input
                id="previousCity"
                label="Previous City"
                placeholder="City"
                error={errors.previousCity?.message}
                required
                {...register('previousCity')}
              />
            </div>

            <div className="sm:col-span-2">
              <Controller
                name="previousState"
                control={control}
                render={({ field }) => (
                  <Select
                    id="previousState"
                    label="Previous State"
                    options={stateOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.previousState?.message}
                    required
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Permanent Address Section & Sync Checkbox */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-5 space-y-4">
        <Controller
          name="sameAsPermanent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="sameAsPermanent"
              name={field.name}
              checked={field.value}
              onChange={field.onChange}
              label="Permanent Address is identical to Current Address"
              description="Keep checked if your legal permanent residence is the same as where you currently reside."
            />
          )}
        />

        {/* Unchecked: Display Full Permanent Address Fields */}
        {!watchedSameAsPermanent && (
          <div className="pt-4 border-t border-slate-200/70 space-y-4 animate-fadeIn">
            <h4 className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">
              Legal Permanent Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="permanentAddressLine1"
                  label="Permanent Address Line 1"
                  placeholder="House No, Building, Street"
                  error={errors.permanentAddressLine1?.message}
                  required
                  {...register('permanentAddressLine1')}
                />
              </div>

              <div>
                <Input
                  id="permanentPinCode"
                  label="Permanent PIN Code"
                  placeholder="e.g. 400001"
                  maxLength={6}
                  error={errors.permanentPinCode?.message || permanentPinLookup.error}
                  required
                  {...register('permanentPinCode', {
                    onChange: (e) => permanentPinLookup.lookup(e.target.value),
                  })}
                />
              </div>

              <div>
                <Input
                  id="permanentCity"
                  label="Permanent City"
                  placeholder="City"
                  error={errors.permanentCity?.message}
                  required
                  {...register('permanentCity')}
                />
              </div>

              <div className="sm:col-span-2">
                <Controller
                  name="permanentState"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="permanentState"
                      label="Permanent State"
                      options={stateOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.permanentState?.message}
                      required
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
});

export default Step4Address;