import { z } from 'zod';
import { validatePAN, validateAadhaarVerhoeff } from '../utils/validators';

export function createStep3Schema(loanType = 'Personal', loanAmount = 0) {
  const isHighValueHomeLoan = loanType === 'Home' && Number(loanAmount) > 5000000;

  return z.object({
    panNumber: z
      .string()
      .min(1, 'PAN number is required.')
      .superRefine((val, ctx) => {
        const result = validatePAN(val, loanType);
        if (!result.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: result.message,
          });
        }
      }),
    aadhaarNumber: z
      .string()
      .min(1, 'Aadhaar number is required.')
      .superRefine((val, ctx) => {
        const result = validateAadhaarVerhoeff(val);
        if (!result.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: result.message,
          });
        }
      }),
    aadhaarConsent: z.literal(true, {
      errorMap: () => ({
        message: 'You must grant explicit consent for Aadhaar identity verification.',
      }),
    }),
    voterId: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[A-Z]{3}[0-9]{7}$/.test(val.toUpperCase()),
        'Voter ID must be 3 letters followed by 7 digits (e.g. ABC1234567).'
      ),
    passport: isHighValueHomeLoan
      ? z
          .string()
          .min(1, 'Passport number is required for Home Loans exceeding ₹50 Lakhs.')
          .refine(
            (val) => /^[A-Z]{1}[0-9]{7}$/.test(val.toUpperCase()),
            'Passport must be 1 uppercase letter followed by 7 digits (e.g. A1234567).'
          )
      : z
          .string()
          .optional()
          .refine(
            (val) => !val || /^[A-Z]{1}[0-9]{7}$/.test(val.toUpperCase()),
            'Passport must be 1 uppercase letter followed by 7 digits (e.g. A1234567).'
          ),
  });
}