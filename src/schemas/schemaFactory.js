/**
 * LendSwift Centralized Cross-Step Schema Factory
 * Enforces all 14 Cross-Step Validation Dependencies across the 8-Step Application.
 */

import { createStep1Schema } from './step1Schema';
import { step2Schema, calculateAge } from './step2Schema';
import { createStep3Schema } from './step3Schema';
import { step4Schema } from './step4Schema';
import { step5Schema } from './step5Schema';
import { createStep6Schema } from './step6Schema';
import { createStep7Schema } from './step7Schema';
import { step8Schema } from './step8Schema';

/**
 * Returns the dynamically configured schema for a given step number,
 * injecting all cross-step parameters from the global form state.
 * 
 * @param {number} stepNumber - Step index (1 to 8)
 * @param {Object} fullFormData - Complete multi-step form state
 * @returns {import('zod').ZodSchema} Configured Zod schema
 */
export function getStepSchema(stepNumber, fullFormData = {}) {
  const step1Data = fullFormData.step1 || {};
  const step2Data = fullFormData.step2 || {};
  const step3Data = fullFormData.step3 || {};
  const step5Data = fullFormData.step5 || {};

  // Cross-Step #4: Age-based maximum tenure limit (Age + Tenure <= 65)
  const applicantAge = step2Data.dateOfBirth ? calculateAge(step2Data.dateOfBirth) : null;
  const maxAllowedTenureMonths =
    applicantAge && applicantAge >= 21 ? Math.max(12, (65 - applicantAge) * 12) : null;

  // Cross-Step #1, #2, #3: Loan parameters affecting KYC & Co-Applicant
  const loanType = step1Data.loanType || 'Personal';
  const loanAmount = Number(step1Data.loanAmount) || 0;

  // Cross-Step #7: Primary mobile number to ensure Co-Applicant mobile is distinct
  const primaryMobile = step2Data.mobileNumber || '';

  // Cross-Step #8: NSDL PAN verification waiver for physical document upload
  const isPanVerified = Boolean(step3Data.isPanVerified);

  // Cross-Step #12: Employment type for dynamic income documents (Payslips vs ITR)
  const employmentType = step5Data.employmentType || 'Salaried';

  switch (stepNumber) {
    case 1:
      return createStep1Schema(maxAllowedTenureMonths);
    case 2:
      return step2Schema;
    case 3:
      return createStep3Schema(loanType, loanAmount);
    case 4:
      return step4Schema;
    case 5:
      return step5Schema;
    case 6:
      return createStep6Schema(loanType, loanAmount, primaryMobile);
    case 7:
      return createStep7Schema({ isPanVerified, employmentType });
    case 8:
      return step8Schema;
    default:
      throw new Error(`Invalid step number: ${stepNumber}. Must be between 1 and 8.`);
  }
}

/**
 * Validates the entire 8-step application graph to guarantee end-to-end data integrity.
 * Used for draft resumption checks and Cypress end-to-end assertions.
 * 
 * @param {Object} fullFormData - Complete accumulated form data
 * @returns {{ isValid: boolean, stepErrors: Object }}
 */
export function validateFullApplication(fullFormData = {}) {
  const stepErrors = {};
  let isValid = true;

  for (let step = 1; step <= 8; step += 1) {
    const schema = getStepSchema(step, fullFormData);
    const stepData = fullFormData[`step${step}`] || {};
    const result = schema.safeParse(stepData);

    if (!result.success) {
      isValid = false;
      stepErrors[`step${step}`] = result.error.format();
    }
  }

  return { isValid, stepErrors };
}