import type { Assessment, DemoPulse, BigFiveScores } from '../types';

/**
 * Convert user Assessment pulses into the DemoPulse shape that chart
 * components (ContextHeatmap, RadialClock, EmotionHeatmap, VarianceChart,
 * ContextTags) already accept.
 *
 * Derived fields:
 *   hour  — from timestamp
 *   day   — from timestamp (day of week 0–6)
 *   date  — YYYY-MM-DD from timestamp
 *
 * Fields not available in user data:
 *   diamonds — user pulses don't capture DIAMONDS dimensions, so
 *              diamonds is undefined. Charts that depend on it
 *              (StressDeltaChart, DiamondsGrid) gracefully return
 *              null when diamonds is absent — no special handling
 *              needed here.
 *
 * Emotions: user pulses store emotions as string[] (which emotions were
 * felt). Chart components expect emotions as Record<string, number>
 * (emotion → count). We convert each string to a count of 1 per pulse,
 * which is correct for frequency-based heatmaps.
 */
export function pulsesToDemoData(pulses: Assessment[]): DemoPulse[] {
  return pulses.map((p) => {
    const d = new Date(p.timestamp);
    const scores = p.scores?.bigFive ?? {} as BigFiveScores;

    // Convert string[] emotions to Record<string, number>
    const emotionMap: Record<string, number> = {};
    if (p.emotions) {
      for (const e of p.emotions) {
        emotionMap[e] = (emotionMap[e] ?? 0) + 1;
      }
    }

    return {
      pulse: p.week ?? 0,
      date: p.timestamp.split('T')[0],
      hour: d.getHours(),
      day: d.getDay(),
      openness: scores.openness ?? 0,
      conscientiousness: scores.conscientiousness ?? 0,
      extraversion: scores.extraversion ?? 0,
      agreeableness: scores.agreeableness ?? 0,
      emotional_stability: scores.emotional_stability ?? 0,
      emotions: Object.keys(emotionMap).length > 0 ? emotionMap : undefined,
      contexts: p.contexts ?? [],
      raw_contexts: p.contexts ?? [],
    };
  });
}