/**
 * Reducing-Balance EMI & Financial Calculation Engine
 * In strict compliance with RBI Digital Lending Guidelines (DL/2022/01).
 */

/**
 * Calculates reducing-balance monthly EMI and total financial breakdown.
 * 
 * @param {number} principal - Loan amount (P)
 * @param {number} annualRate - Annual interest rate percentage (e.g. 10.5 for 10.5%)
 * @param {number} tenureMonths - Loan tenure in months (n)
 * @param {Object} options - Optional affordability parameters
 * @param {number} options.monthlyIncome - Primary net monthly income
 * @param {number} options.coApplicantIncome - Co-applicant net monthly income
 * @param {number} options.monthlyRent - Rent expenditure if rented
 * @returns {Object} Comprehensive financial breakdown
 */
export function calculateEMI(principal, annualRate, tenureMonths, options = {}) {
  const P = Number(principal) || 0;
  const N = Number(tenureMonths) || 12;
  const annual = Number(annualRate) || 10.5;

  if (P <= 0 || N <= 0) {
    return {
      monthlyEMI: 0,
      totalInterest: 0,
      totalPayable: 0,
      processingFee: 0,
      gstOnFee: 0,
      totalDeductions: 0,
      netDisbursal: 0,
      dtiRatio: 0,
      isAffordable: true,
    };
  }

  // Monthly interest rate: r = annualRate / (12 * 100)
  const r = annual / (12 * 100);

  // Reducing Balance EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const factor = Math.pow(1 + r, N);
  const monthlyEMI = Math.round((P * r * factor) / (factor - 1));

  // Total amount and interest payable over loan lifetime
  const totalPayable = monthlyEMI * N;
  const totalInterest = Math.max(0, totalPayable - P);

  // Standard NBFC Origination / Processing Fee: 2% of principal
  const baseProcessingFee = Math.round(P * 0.02);
  // 18% GST on processing fee
  const gstOnFee = Math.round(baseProcessingFee * 0.18);
  const totalDeductions = baseProcessingFee + gstOnFee;
  const netDisbursal = Math.max(0, P - totalDeductions);

  // Affordability & Debt-to-Income (DTI) Analysis
  const primaryIncome = Number(options.monthlyIncome) || 0;
  const coIncome = Number(options.coApplicantIncome) || 0;
  const rent = Number(options.monthlyRent) || 0;

  // Disposable income after rent
  const netHouseholdIncome = Math.max(1, primaryIncome + coIncome - rent);
  const dtiRatio = primaryIncome > 0
    ? Math.round((monthlyEMI / netHouseholdIncome) * 100)
    : 0;

  // RBI standard: EMI must not exceed 50% of net monthly income
  const isAffordable = dtiRatio <= 50;

  return {
    monthlyEMI,
    totalInterest,
    totalPayable,
    processingFee: baseProcessingFee,
    gstOnFee,
    totalDeductions,
    netDisbursal,
    dtiRatio,
    isAffordable,
    netHouseholdIncome,
  };
}