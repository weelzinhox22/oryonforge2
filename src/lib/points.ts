import { ActivityDefinition } from '@/types';
import { MAX_DAILY_POINTS } from '@/lib/activities';

export function calculatePoints(
  activity: ActivityDefinition,
  value: number
): number {
  if (activity.factor > 0) {
    return value / activity.factor;
  }
  return 0;
}

export function calculateEarnablePoints(
  activity: ActivityDefinition,
  value: number,
  pointsAlreadyToday: number
): number {
  const raw = calculatePoints(activity, value);
  const remaining = MAX_DAILY_POINTS - pointsAlreadyToday;
  return Math.min(Math.max(0, raw), Math.max(0, remaining));
}

export function toTotalMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}
