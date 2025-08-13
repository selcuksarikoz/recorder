export const DURATIONS = {
  SHORT: 1000, // 1s (CTO test)
  MEDIUM: 60_000, // 1 min
  LONG: 14_400_000, // 4 hours
} as const;

export type DurationKey = keyof typeof DURATIONS;
