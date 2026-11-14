import { z } from 'zod';

export const step8Schema = z.object({
  kfsConsent: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge and accept the RBI Key Fact Statement (KFS) disclosure.',
  }),
  creditBureauConsent: z.boolean().refine((val) => val === true, {
    message: 'Credit bureau inquiry authorization is legally required under RBI regulations.',
  }),
  coolOffPeriodConsent: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the statutory 3-day cooling-off look-up period.',
  }),
  dataPrivacyConsent: z.boolean().refine((val) => val === true, {
    message: 'Consent under the Digital Personal Data Protection (DPDP) Act 2023 is mandatory.',
  }),
});