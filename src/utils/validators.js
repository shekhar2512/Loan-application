/**
 * Aadhaar Verhoeff Checksum Algorithm (Section C3.2)
 * Uses the Dihedral Group D5 multiplication, permutation, and inverse tables.
 * A valid 12-digit Aadhaar number must evaluate to checksum === 0.
 */

// Multiplication table d[10][10]
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table p[8][10]
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Inverse table inv[10]
const _inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates a 12-digit Aadhaar number using the Verhoeff algorithm.
 * @param {string} aadhaar - 12-digit numeric string
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validateAadhaarVerhoeff(aadhaar) {
  if (!aadhaar) return { isValid: false, message: 'Aadhaar number is required.' };
  const clean = String(aadhaar).replace(/\s+/g, '');

  if (!/^\d{12}$/.test(clean)) {
    return { isValid: false, message: 'Aadhaar number must be exactly 12 digits.' };
  }

  // Iterate across reversed digits: c = d[c][p[i % 8][digit]]
  let c = 0;
  const digits = clean.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i += 1) {
    c = d[c][p[i % 8][digits[i]]];
  }

  if (c === 0) {
    return { isValid: true };
  }

  return { isValid: false, message: 'Invalid Aadhaar number (failed Verhoeff checksum).' };
}

/**
 * PAN Validation Algorithm (Section C3.1)
 * Format: AAAAA9999A
 * 4th character indicates entity type:
 * P = Individual, C = Company, H = HUF, A = AOP, B = BOI, G = Govt, J = Artificial Juridical,
 * L = Local Authority, F = Firm, T = Trust
 *
 * For Personal/Home loans: only 'P' is allowed.
 * For Business loans: 'P', 'C', or 'F' is allowed.
 */
export function validatePAN(pan, loanType = 'Personal') {
  if (!pan) return { isValid: false, message: 'PAN number is required.' };
  const clean = String(pan).trim().toUpperCase();

  if (clean.length !== 10) {
    return { isValid: false, message: 'PAN number must be exactly 10 characters.' };
  }

  // Format check: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(clean)) {
    return { isValid: false, message: 'PAN format must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).' };
  }

  // 4th Character Entity Type Check (Section E3.4 specific evaluator check)
  const fourthChar = clean[3];
  const validEntityTypes = ['P', 'C', 'H', 'A', 'B', 'G', 'J', 'L', 'F', 'T'];

  if (!validEntityTypes.includes(fourthChar)) {
    return {
      isValid: false,
      message: 'PAN 4th character must indicate entity type (P for Individual, C for Company, etc.).',
    };
  }

  // Business vs Personal/Home entity restrictions
  if (loanType === 'Business') {
    if (!['P', 'C', 'F'].includes(fourthChar)) {
      return {
        isValid: false,
        message: 'Business loans require PAN of an Individual (P), Company (C), or Firm (F).',
      };
    }
  } else {
    // Personal or Home loan requires Individual (P)
    if (fourthChar !== 'P') {
      return {
        isValid: false,
        message: 'Personal and Home loans require an Individual PAN (4th character must be "P").',
      };
    }
  }

  return { isValid: true };
}

/**
 * GST Number Validation (15-character format)
 * 2 digits (state) + 10 chars (PAN) + 1 digit (entity) + 'Z' + 1 checksum char
 */
export function validateGST(gst) {
  if (!gst) return { isValid: false, message: 'GST number is required.' };
  const clean = String(gst).trim().toUpperCase();
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstRegex.test(clean)) {
    return {
      isValid: false,
      message: 'Invalid GST format (15 characters: 2 state digits + 10 PAN chars + 1 entity + "Z" + 1 check digit).',
    };
  }
  return { isValid: true };
}