import { ActivityDefinition } from '@/types';
import { MAX_DAILY_POINTS } from '@/lib/activities';

export function calculatePoints(
  activity: ActivityDefinition,
  totalMinutes: number,
  distanceKm: number
): number {
  if (activity.metric === 'time' && activity.minutesPerPoint) {
    return Math.floor(totalMinutes / activity.minutesPerPoint);
  }
  if (activity.metric === 'distance' && activity.kmPerPoint) {
    return Math.floor(distanceKm / activity.kmPerPoint);
  }
  return 0;
}

export function calculateEarnablePoints(
  activity: ActivityDefinition,
  totalMinutes: number,
  distanceKm: number,
  pointsAlreadyToday: number
): number {
  const raw = calculatePoints(activity, totalMinutes, distanceKm);
  const remaining = MAX_DAILY_POINTS - pointsAlreadyToday;
  return Math.min(Math.max(0, raw), Math.max(0, remaining));
}

export function toTotalMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}
