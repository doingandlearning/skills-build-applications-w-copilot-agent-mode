export const activityWeights = {
  run: 1,
  cycle: 1,
  walk: 1,
  swim: 1.5,
  strength: 1.25,
} as const satisfies Record<string, number>;

export type ActivityType = keyof typeof activityWeights;

export function isActivityType(value: string): value is ActivityType {
  return Object.hasOwn(activityWeights, value);
}
