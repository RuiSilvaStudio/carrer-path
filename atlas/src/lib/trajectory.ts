import type { Assessment, TrajectoryPoint, BigFiveScores } from '../types';

export function buildTrajectory(
  baseline: Assessment | null,
  pulses: Assessment[]
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];

  if (baseline) {
    points.push({
      type: 'baseline',
      date: baseline.timestamp.split('T')[0],
      scores: baseline.scores.bigFive,
      contexts: [],
      emotions: [],
    });
  }

  const sortedPulses = [...pulses].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const pulse of sortedPulses) {
    const scores = pulse.scores?.bigFive ?? {} as BigFiveScores;
    if (scores.openness === undefined) continue;
    points.push({
      type: 'pulse',
      date: pulse.timestamp.split('T')[0],
      scores,
      contexts: pulse.contexts ?? [],
      emotions: pulse.emotions ?? [],
    });
  }

  return points;
}
