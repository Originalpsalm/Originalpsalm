import { z } from "zod";

/**
 * Auth validation schemas.
 *
 * Pure Zod — no Prisma, service, or repository imports — so login forms can
 * reuse these schemas on the client without pulling server code into the
 * browser bundle (decision register: validator purity).
 */

/** Password policy per the Security specification. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[0-9]/, "Password must contain a number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character.");

export const loginSchema = z.object({
  email: z
    .string()
    // Trim before validating: a pasted address often carries trailing space,
    // and rejecting that as "invalid" would be a confusing dead end.
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  // Deliberately not password-policy validated: an existing account may predate
  // a policy change, and rejecting at the form would leak the rule to attackers.
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
