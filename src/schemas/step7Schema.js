import { z } from 'zod';

const documentObjectSchema = z
  .object({
    name: z.string().min(1, 'File name is required.'),
    size: z.number().max(5242880, 'File size must not exceed 5MB.'),
    type: z.string().optional(),
    dataUrl: z.string().min(1, 'File content is required.'),
    originalSize: z.number().optional(),
    compressedSize: z.number().optional(),
    compressionRatio: z.number().optional(),
    isPdf: z.boolean().optional(),
  })
  .nullable()
  .optional();

/**
 * Creates dynamic Zod schema for Step 7 based on verification state and employment.
 * @param {Object} options
 * @param {boolean} options.isPanVerified - Whether PAN was verified in Step 3
 * @param {string} options.employmentType - 'Salaried' | 'Self-Employed' | 'Business Owner'
 */
export function createStep7Schema({ isPanVerified = false, employmentType = 'Salaried' } = {}) {
  return z
    .object({
      panDocument: documentObjectSchema,
      addressProofDocument: documentObjectSchema,
      incomeProofDocument: documentObjectSchema,
      signature: z
        .string()
        .min(1, 'Digital signature is mandatory. Please sign in the box provided.'),
      signatureConsent: z.boolean().refine((val) => val === true, {
        message: 'You must provide authorization consent under Section 65B of the Indian Evidence Act.',
      }),
    })
    .superRefine((data, ctx) => {
      // Cross-Step Rule #9: If PAN not verified via NSDL, physical document upload is mandatory
      if (!isPanVerified && (!data.panDocument || !data.panDocument.dataUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['panDocument'],
          message: 'Physical PAN card upload is required because online verification was not completed.',
        });
      }

      // Address Proof is always mandatory
      if (!data.addressProofDocument || !data.addressProofDocument.dataUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressProofDocument'],
          message: 'Valid Address Proof document is mandatory.',
        });
      }

      // Cross-Step Rule #12: Income Proof is mandatory
      if (!data.incomeProofDocument || !data.incomeProofDocument.dataUrl) {
        const docName =
          employmentType === 'Salaried'
            ? 'Salary slips (last 3 months)'
            : 'ITR Returns with computation of income (last 2 years)';
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['incomeProofDocument'],
          message: `${docName} is mandatory for credit underwriting.`,
        });
      }
    });
}