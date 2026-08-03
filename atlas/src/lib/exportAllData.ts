import { supabase } from '../lib/supabase';

/**
 * GDPR data portability — export all user data as CSV files.
 * Fetches every table that contains user data and triggers a download
 * for each one. No external dependencies, no server-side processing.
 */

interface ExportTable {
  name: string;
  label: string;
}

const USER_TABLES: ExportTable[] = [
  { name: 'assessments', label: 'assessments' },
  { name: 'career_direction_profiles', label: 'career-profile' },
  { name: 'cockpit_data', label: 'contacts' },
  { name: 'contact_log', label: 'contact-log' },
  { name: 'job_listings', label: 'job-listings' },
  { name: 'feedback_events', label: 'feedback' },
  { name: 'analytics_events', label: 'analytics' },
];

/**
 * Convert an array of objects to CSV.
 * Handles nested objects/arrays by JSON-stringifying them.
 */
function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';

  // Collect all column names across all rows (in insertion order)
  const columns = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columns.add(key);
    }
  }
  const cols = Array.from(columns);

  const header = cols.map(escapeCSV).join(',');
  const body = rows.map(row =>
    cols.map(col => escapeCSV(formatValue(row[col]))).join(',')
  ).join('\n');

  return `${header}\n${body}\n`;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function escapeCSV(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/**
 * Export all user data as separate CSV downloads.
 * Returns a summary of what was exported.
 */
export async function exportAllData(userId: string): Promise<{ exported: string[]; skipped: string[] }> {
  const exported: string[] = [];
  const skipped: string[] = [];
  const date = new Date().toISOString().slice(0, 10);

  for (const table of USER_TABLES) {
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Export error for ${table.name}:`, error.message);
      skipped.push(table.label);
      continue;
    }

    if (!data || data.length === 0) {
      skipped.push(table.label);
      continue;
    }

    const csv = toCSV(data as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlas-${table.label}-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    exported.push(table.label);

    // Small delay between downloads to avoid browser blocking
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return { exported, skipped };
}