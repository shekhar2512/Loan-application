import { z } from 'zod';

export const RESIDENCE_TYPES = [
  'Owned',
  'Rented',
  'Company Provided',
  'Living with Parents/Family',
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const step4Schema = z
  .object({
    // 1. Current Address
    currentAddressLine1: z
      .string()
      .trim()
      .min(5, 'Address Line 1 must be at least 5 characters.')
      .max(200, 'Address Line 1 cannot exceed 200 characters.'),
    currentAddressLine2: z
      .string()
      .trim()
      .max(200, 'Address Line 2 cannot exceed 200 characters.')
      .optional()
      .or(z.literal('')),
    currentPinCode: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code.'),
    currentCity: z
      .string()
      .trim()
      .min(2, 'City is required.')
      .max(100, 'City name is too long.'),
    currentState: z
      .string()
      .trim()
      .min(2, 'State is required.')
      .max(100, 'State name is too long.'),

    // 2. Residence Classification
    residenceType: z.enum([
      'Owned',
      'Rented',
      'Company Provided',
      'Living with Parents/Family',
    ], {
      errorMap: () => ({ message: 'Please select your residence type.' }),
    }),
    rentAmount: z.coerce
      .number()
      .min(0)
      .optional()
      .or(z.literal('')),

    // 3. Stability Check (Years at Current Address)
    yearsAtCurrentAddress: z.coerce
      .number({ invalid_type_error: 'Please enter years at current address.' })
      .min(0, 'Years cannot be negative.')
      .max(50, 'Years cannot exceed 50.'),

    // 4. Previous Address History (Conditional if years < 1)
    previousAddressLine1: z.string().trim().optional().or(z.literal('')),
    previousAddressLine2: z.string().trim().optional().or(z.literal('')),
    previousPinCode: z.string().trim().optional().or(z.literal('')),
    previousCity: z.string().trim().optional().or(z.literal('')),
    previousState: z.string().trim().optional().or(z.literal('')),

    // 5. Permanent Address (Conditional if sameAsPermanent is false)
    sameAsPermanent: z.boolean().default(true),
    permanentAddressLine1: z.string().trim().optional().or(z.literal('')),
    permanentAddressLine2: z.string().trim().optional().or(z.literal('')),
    permanentPinCode: z.string().trim().optional().or(z.literal('')),
    permanentCity: z.string().trim().optional().or(z.literal('')),
    permanentState: z.string().trim().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // Rule A: Rent Amount is mandatory if Rented
    if (data.residenceType === 'Rented') {
      const rent = Number(data.rentAmount);
      if (!rent || isNaN(rent) || rent < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rentAmount'],
          message: 'Monthly rent is required (minimum ₹1,000) for rented accommodation.',
        });
      }
    }

    // Rule B: Previous Address is mandatory if living at current address for < 1 year
    if (Number(data.yearsAtCurrentAddress) < 1) {
      if (!data.previousAddressLine1 || data.previousAddressLine1.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['previousAddressLine1'],
          message: 'Previous Address Line 1 is required if at current address for less than 1 year.',
        });
      }
      if (!data.previousPinCode || !/^[1-9][0-9]{5}$/.test(data.previousPinCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['previousPinCode'],
          message: 'Valid 6-digit previous PIN code is required.',
        });
      }
      if (!data.previousCity || data.previousCity.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['previousCity'],
          message: 'Previous city is required.',
        });
      }
      if (!data.previousState || data.previousState.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['previousState'],
          message: 'Previous state is required.',
        });
      }
    }

    // Rule C: Full Permanent Address is mandatory if not same as current
    if (!data.sameAsPermanent) {
      if (!data.permanentAddressLine1 || data.permanentAddressLine1.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentAddressLine1'],
          message: 'Permanent Address Line 1 must be at least 5 characters.',
        });
      }
      if (!data.permanentPinCode || !/^[1-9][0-9]{5}$/.test(data.permanentPinCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentPinCode'],
          message: 'Valid 6-digit permanent PIN code is required.',
        });
      }
      if (!data.permanentCity || data.permanentCity.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentCity'],
          message: 'Permanent city is required.',
        });
      }
      if (!data.permanentState || data.permanentState.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['permanentState'],
          message: 'Permanent state is required.',
        });
      }
    }
  });