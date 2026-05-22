export const VALID_ENVIRONMENTS = ['dev', 'staging', 'prod'] as const;
export type Environment = (typeof VALID_ENVIRONMENTS)[number];

export function validateEnvironment(value: string): asserts value is Environment {
  if (!VALID_ENVIRONMENTS.includes(value as Environment)) {
    throw new Error(`Invalid environment "${value}". Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`);
  }
}
