import { z } from 'zod';

export const LOAN_TYPES = {
  PERSONAL: 'Personal',
  HOME: 'Home',
  BUSINESS: 'Business',
};

// Loan limits & configurations from Section B2.1
export const LOAN_CONFIG = {
  Personal: {
    label: 'Personal Loan',
    description: 'Instant funds for personal, travel, medical or wedding needs.',
    badge: 'Up to ₹10 Lakh',
    minAmount: 50000,
    maxAmount: 1000000,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    interestRate: 10.5, // 10.5% p.a.
    purposes: [
      { value: 'debt_consolidation', label: 'Debt Consolidation' },
      { value: 'medical_emergency', label: 'Medical Emergency' },
      { value: 'home_renovation', label: 'Home Renovation' },
      { value: 'wedding', label: 'Wedding Expenses' },
      { value: 'travel', label: 'Travel & Vacation' },
      { value: 'other', label: 'Other Personal Need' },
    ],
  },
  Home: {
    label: 'Home Loan',
    description: 'Affordable long-term financing to buy or build your dream home.',
    badge: 'Up to ₹1 Crore',
    minAmount: 50000,
    maxAmount: 10000000,
    minTenureMonths: 60,
    maxTenureMonths: 360,
    interestRate: 8.5, // 8.5% p.a.
    purposes: [
      { value: 'purchase_ready', label: 'Purchase of Ready Property' },
      { value: 'purchase_under_construction', label: 'Purchase of Under-Construction Property' },
      { value: 'construction', label: 'Home Construction' },
      { value: 'plot_plus_construction', label: 'Plot Purchase + Construction' },
      { value: 'extension_renovation', label: 'Home Extension / Renovation' },
    ],
  },
  Business: {
    label: 'Business Loan',
    description: 'Working capital and equipment financing for SMEs and enterprises.',
    badge: 'Up to ₹50 Lakh',
    minAmount: 50000,
    maxAmount: 5000000,
    minTenureMonths: 12,
    maxTenureMonths: 120,
    interestRate: 14.0, // 14.0% p.a.
    purposes: [
      { value: 'working_capital', label: 'Working Capital' },
      { value: 'machinery_equipment', label: 'Machinery / Equipment Purchase' },
      { value: 'business_expansion', label: 'Business Expansion' },
      { value: 'inventory_funding', label: 'Inventory Funding' },
      { value: 'commercial_vehicle', label: 'Commercial Vehicle Purchase' },
    ],
  },
};

// Generate tenure options for dropdown (increments of 12 months)
export function getTenureOptions(loanType, maxAllowedMonths = null) {
  const config = LOAN_CONFIG[loanType] || LOAN_CONFIG.Personal;
  const minMonths = config.minTenureMonths;
  let maxMonths = config.maxTenureMonths;

  // Cross-step dependency: age constraint can lower max tenure
  if (maxAllowedMonths && maxAllowedMonths < maxMonths) {
    maxMonths = maxAllowedMonths;
  }

  const options = [];
  for (let m = minMonths; m <= maxMonths; m += 12) {
    const years = m / 12;
    options.push({
      value: String(m),
      label: `${m} Months (${years} ${years === 1 ? 'Year' : 'Years'})`,
    });
  }

  // Ensure exact max months is included if not a multiple of 12
  if (maxMonths % 12 !== 0 && maxMonths >= minMonths) {
    options.push({
      value: String(maxMonths),
      label: `${maxMonths} Months (${(maxMonths / 12).toFixed(1)} Years)`,
    });
  }

  return options;
}

// Dynamic Zod Schema for Step 1
export function createStep1Schema(maxAllowedMonths = null) {
  return z
    .object({
      loanType: z.enum(['Personal', 'Home', 'Business'], {
        required_error: 'Please select a loan type.',
      }),
      loanAmount: z.coerce
        .number({ invalid_type_error: 'Loan amount is required.' })
        .min(50000, 'Minimum loan amount is ₹50,000.'),
      loanTenure: z
        .string()
        .min(1, 'Please select a loan tenure.')
        .refine((val) => Number(val) > 0, 'Tenure must be greater than 0.'),
      loanPurpose: z.string().min(1, 'Please select the loan purpose.'),
      referralCode: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^[A-Za-z0-9]{6,10}$/.test(val),
          'Referral code must be 6 to 10 alphanumeric characters.'
        ),
    })
    .superRefine((data, ctx) => {
      const config = LOAN_CONFIG[data.loanType];
      if (!config) return;

      // Validate dynamic loan amount max limit
      if (data.loanAmount > config.maxAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanAmount'],
          message: `Maximum allowed loan amount for ${config.label} is ₹${config.maxAmount.toLocaleString('en-IN')}.`,
        });
      }

      // Validate dynamic tenure bounds
      const tenureMonths = Number(data.loanTenure);
      let allowedMax = config.maxTenureMonths;
      if (maxAllowedMonths && maxAllowedMonths < allowedMax) {
        allowedMax = maxAllowedMonths;
      }

      if (tenureMonths < config.minTenureMonths || tenureMonths > allowedMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenure'],
          message: `Tenure for ${config.label} must be between ${config.minTenureMonths} and ${allowedMax} months.`,
        });
      }
    });
}