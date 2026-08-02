import type { Assessment } from '../types';

/**
 * Export a single assessment row as a CSV file download.
 * Columns: date, time, week, phase, context, emotions, note, 5 big-five scores.
 * For baseline rows, week/phase are blank and context/emotions/note come from
 * the structured scores.context field instead of the loose contexts/emotions arrays.
 */
export function exportAssessmentCSV(a: Assessment) {
  const d = new Date(a.timestamp);
  const dateStr = d.toLocaleDateString();
  const timeStr = d.toLocaleTimeString();

  // Baseline context lives in scores.context, pulse context lives in contexts[]
  const ctx = a.type === 'baseline'
    ? (a.scores?.context?.primary_context ?? '')
    : (a.contexts?.[0] ?? '');

  const scores = a.scores?.bigFive;

  const header = [
    'type', 'date', 'time', 'week', 'phase', 'context', 'emotions', 'note',
    'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability',
  ].join(',');

  const row = [
    a.type,
    escapeCSV(dateStr),
    escapeCSV(timeStr),
    a.week ?? '',
    escapeCSV(a.phase ?? ''),
    escapeCSV(ctx),
    escapeCSV((a.emotions ?? []).join('; ')),
    escapeCSV(a.note ?? ''),
    scores?.openness ?? '',
    scores?.conscientiousness ?? '',
    scores?.extraversion ?? '',
    scores?.agreeableness ?? '',
    scores?.emotional_stability ?? '',
  ].join(',');

  const csv = `${header}\n${row}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${a.type}-${d.toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
