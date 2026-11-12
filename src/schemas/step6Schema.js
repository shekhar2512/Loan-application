import { z } from 'zod';
import { calculateAge } from './step2Schema';
import { validatePAN } from '../utils/validators';

export const CO_APPLICANT_RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Business Partner',
  'Other',
];

export const CO_APPLICANT_EMPLOYMENT = [
  'Salaried',
  'Self-Employed Professional',
  'Business Owner',
  'Homemaker',
  'Retired',
];

/**
 * Creates dynamic Zod schema for Step 6 based on loan product and amount.
 * @param {string} loanType - 'Personal' | 'Home' | 'Business'
 * @param {number} loanAmount - Requested loan amount in INR
 * @param {string} primaryMobile - Primary applicant's mobile number from Step 2
 */
export function createStep6Schema(loanType = 'Personal', loanAmount = 0, primaryMobile = '') {
  const isMandatory = loanType === 'Home' && Number(loanAmount) > 3000000;

  return z
    .object({
      hasCoApplicant: z.boolean().default(isMandatory),

      // Co-Applicant fields (validated conditionally if hasCoApplicant is true)
      fullName: z.string().trim().optional().or(z.literal('')),
      relationship: z.string().optional().or(z.literal('')),
      dateOfBirth: z.string().optional().or(z.literal('')),
      panNumber: z.string().trim().toUpperCase().optional().or(z.literal('')),
      mobileNumber: z.string().trim().optional().or(z.literal('')),
      employmentType: z.string().optional().or(z.literal('')),
      monthlyIncome: z.coerce.number().min(0).optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      // If Home Loan > 30 Lakhs, Co-Applicant cannot be unchecked
      if (isMandatory && !data.hasCoApplicant) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hasCoApplicant'],
          message: 'A co-applicant is mandatory for Home Loans exceeding ₹30 Lakhs under NBFC credit policy.',
        });
        return;
      }

      // If Co-Applicant is enabled, validate all co-applicant fields strictly
      if (data.hasCoApplicant) {
        // 1. Full Name
        if (!data.fullName || data.fullName.trim().length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['fullName'],
            message: 'Co-applicant full name must be at least 3 characters.',
          });
        }

        // 2. Relationship
        if (!data.relationship || !CO_APPLICANT_RELATIONSHIPS.includes(data.relationship)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['relationship'],
            message: 'Please select relationship with primary applicant.',
          });
        }

        // 3. Date of Birth & Age (21 - 65)
        if (!data.dateOfBirth) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dateOfBirth'],
            message: 'Co-applicant date of birth is required.',
          });
        } else {
          const age = calculateAge(data.dateOfBirth);
          if (age < 21 || age > 65) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['dateOfBirth'],
              message: `Co-applicant must be between 21 and 65 years old (current age: ${age}).`,
            });
          }
        }

        // 4. PAN Number
        if (!data.panNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['panNumber'],
            message: 'Co-applicant PAN is required.',
          });
        } else {
          const panValidation = validatePAN(data.panNumber);
          if (!panValidation.isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['panNumber'],
              message: panValidation.message,
            });
          }
        }

        // 5. Mobile Number (must be valid Indian mobile and not match primary)
        if (!data.mobileNumber || !/^[6-9]\d{9}$/.test(data.mobileNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mobileNumber'],
            message: 'Please enter a valid 10-digit Indian mobile number starting with 6-9.',
          });
        } else if (primaryMobile && data.mobileNumber === primaryMobile) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['mobileNumber'],
            message: 'Co-applicant mobile cannot be identical to primary applicant mobile.',
          });
        }

        // 6. Employment Type
        if (!data.employmentType || !CO_APPLICANT_EMPLOYMENT.includes(data.employmentType)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['employmentType'],
            message: 'Please select co-applicant employment status.',
          });
        }

        // 7. Monthly Income (mandatory if employed)
        const isEmployed = ['Salaried', 'Self-Employed Professional', 'Business Owner'].includes(data.employmentType);
        if (isEmployed) {
          const income = Number(data.monthlyIncome);
          if (!income || isNaN(income) || income < 10000) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['monthlyIncome'],
              message: 'Minimum monthly income of ₹10,000 required for employed co-applicants.',
            });
          }
        }
      }
    });
}