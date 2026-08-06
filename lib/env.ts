/**
 * Typed access to required environment variables.
 *
 * Fails fast with a clear message instead of letting an undefined value
 * surface as a confusing downstream error.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
