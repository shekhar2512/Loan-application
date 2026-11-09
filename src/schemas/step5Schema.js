import { z } from 'zod';

export const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business Owner'];

export const PROFESSION_TYPES = [
  'Doctor / Healthcare',
  'Chartered Accountant (CA)',
  'Architect / Interior Designer',
  'Lawyer / Legal Practitioner',
  'Management / Financial Consultant',
  'IT / Software Consultant / Freelancer',
  'Other Professional Service',
];

export const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership Firm',
  'Private Limited Company (Pvt Ltd)',
  'Limited Liability Partnership (LLP)',
  'One Person Company (OPC)',
];

export const SALARY_MODES = [
  'Direct Bank Transfer (NEFT / RTGS / IMPS)',
  'Account Payee Cheque',
];

// 1. Salaried Branch
const salariedSchema = z.object({
  employmentType: z.literal('Salaried'),
  companyName: z
    .string()
    .trim()
    .min(2, 'Company / Employer name must be at least 2 characters.')
    .max(100, 'Company name is too long.'),
  designation: z
    .string()
    .trim()
    .min(2, 'Designation must be at least 2 characters.')
    .max(100, 'Designation is too long.'),
  monthlySalary: z.coerce
    .number({ invalid_type_error: 'Please enter a valid monthly salary.' })
    .min(15000, 'Net monthly salary must be at least ₹15,000 for NBFC eligibility.')
    .max(10000000, 'Monthly salary exceeds maximum limit.'),
  salaryMode: z.enum(SALARY_MODES, {
    errorMap: () => ({ message: 'Please select your salary credit mode.' }),
  }),
  totalExperienceYears: z.coerce
    .number({ invalid_type_error: 'Please enter total work experience.' })
    .min(0, 'Experience cannot be negative.')
    .max(50, 'Experience cannot exceed 50 years.'),
  currentJobExperienceYears: z.coerce
    .number({ invalid_type_error: 'Please enter experience at current company.' })
    .min(0, 'Experience cannot be negative.')
    .max(50, 'Experience cannot exceed 50 years.'),
}).refine(
  (data) => data.currentJobExperienceYears <= data.totalExperienceYears,
  {
    path: ['currentJobExperienceYears'],
    message: 'Current job experience cannot exceed total work experience.',
  }
);

// 2. Self-Employed Branch
const selfEmployedSchema = z.object({
  employmentType: z.literal('Self-Employed'),
  businessName: z
    .string()
    .trim()
    .min(2, 'Profession / Practice name must be at least 2 characters.')
    .max(100, 'Practice name is too long.'),
  professionType: z.enum(PROFESSION_TYPES, {
    errorMap: () => ({ message: 'Please select your profession type.' }),
  }),
  annualTurnover: z.coerce
    .number({ invalid_type_error: 'Please enter annual gross receipts / turnover.' })
    .min(300000, 'Annual gross turnover must be at least ₹3,00,000.')
    .max(500000000, 'Turnover exceeds limit.'),
  monthlyIncome: z.coerce
    .number({ invalid_type_error: 'Please enter average monthly net income.' })
    .min(20000, 'Average monthly net income must be at least ₹20,000.')
    .max(10000000, 'Monthly income exceeds limit.'),
  yearsInBusiness: z.coerce
    .number({ invalid_type_error: 'Please enter years in practice.' })
    .min(2, 'Minimum 2 years in continuous practice is required for loan eligibility.')
    .max(50, 'Years cannot exceed 50.'),
});

// 3. Business Owner Branch
const businessOwnerSchema = z.object({
  employmentType: z.literal('Business Owner'),
  businessName: z
    .string()
    .trim()
    .min(2, 'Registered business entity name must be at least 2 characters.')
    .max(100, 'Business name is too long.'),
  businessType: z.enum(BUSINESS_TYPES, {
    errorMap: () => ({ message: 'Please select your business entity structure.' }),
  }),
  annualTurnover: z.coerce
    .number({ invalid_type_error: 'Please enter annual business turnover.' })
    .min(500000, 'Annual turnover must be at least ₹5,00,000.')
    .max(1000000000, 'Turnover exceeds limit.'),
  monthlyIncome: z.coerce
    .number({ invalid_type_error: 'Please enter average monthly net profit / drawings.' })
    .min(25000, 'Monthly drawings / profit must be at least ₹25,000.')
    .max(20000000, 'Monthly income exceeds limit.'),
  yearsInBusiness: z.coerce
    .number({ invalid_type_error: 'Please enter years in business.' })
    .min(2, 'Minimum 2 years in registered business is required for loan eligibility.')
    .max(50, 'Years cannot exceed 50.'),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Please enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5).'
    ),
  businessAddressLine1: z
    .string()
    .trim()
    .min(5, 'Business / Office address must be at least 5 characters.')
    .max(200, 'Address is too long.'),
  businessCity: z
    .string()
    .trim()
    .min(2, 'City is required.')
    .max(100, 'City is too long.'),
  businessState: z
    .string()
    .trim()
    .min(2, 'State is required.')
    .max(100, 'State is too long.'),
  businessPinCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit business PIN code.'),
});

// Master Discriminated Union
export const step5Schema = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);