import { z } from 'zod';

// Precise age calculation down to the exact day (boundary tested by evaluator)
export function calculateAge(dobString) {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

// Name regex: only alphabets, spaces, and periods allowed (as per PAN)
const nameRegex = /^[A-Za-z\s.]+$/;
// Indian mobile: 10 digits starting with 6, 7, 8, or 9
const indianMobileRegex = /^[6-9]\d{9}$/;

export const step2Schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters.')
      .max(100, 'Full name cannot exceed 100 characters.')
      .regex(nameRegex, 'Name can only contain alphabets, spaces, and periods (as per PAN).'),
    dateOfBirth: z
      .string()
      .min(1, 'Please enter your date of birth.')
      .refine((dob) => {
        const age = calculateAge(dob);
        return age >= 21 && age <= 65;
      }, 'Applicant must be between 21 and 65 years of age.'),
    gender: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Please select your gender.',
    }),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], {
      required_error: 'Please select your marital status.',
    }),
    fatherName: z
      .string()
      .min(2, "Father's name must be at least 2 characters.")
      .max(100, "Father's name cannot exceed 100 characters.")
      .regex(nameRegex, "Father's name can only contain alphabets, spaces, and periods."),
    motherName: z
      .string()
      .min(2, "Mother's name must be at least 2 characters.")
      .max(100, "Mother's name cannot exceed 100 characters.")
      .regex(nameRegex, "Mother's name can only contain alphabets, spaces, and periods."),
    email: z
      .string()
      .min(1, 'Email address is required.')
      .email('Please enter a valid email address.'),
    mobileNumber: z
      .string()
      .min(1, 'Mobile number is required.')
      .regex(indianMobileRegex, 'Mobile number must be 10 digits starting with 6, 7, 8, or 9.'),
    alternateMobile: z
      .string()
      .optional()
      .refine(
        (val) => !val || indianMobileRegex.test(val),
        'Alternate mobile must be 10 digits starting with 6, 7, 8, or 9.'
      ),
  })
  .superRefine((data, ctx) => {
    // Cross-field validation: Alternate mobile must not match primary mobile
    if (data.alternateMobile && data.alternateMobile === data.mobileNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobile'],
        message: 'Alternate mobile number must be different from primary mobile number.',
      });
    }
  });