import { useState } from 'react';
import { WorkValuesAssessment } from '../components/career/WorkValuesAssessment';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { WorkValuesResult } from '../lib/work-values-data';

/**
 * Standalone page for the Work Values assessment.
 * The assessment is self-contained (saves to `work_values_assessments` table
 * via the `useWorkValues` hook). On completion we also sync the result into
 * the career direction record so Explorer and Market can use it.
 */
const ui = {
  page: { maxWidth: '840px', margin: '0 auto', padding: '52px var(--space-page) 100px' },
};

async function syncWorkValuesToCareerDirection(userId: string, result: WorkValuesResult): Promise<void> {
  // Fetch the current career direction record (if any)
  const { data: row } = await supabase
    .from('career_direction_profiles')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  const existing = row?.data as Record<string, unknown> | null ?? {};
  const updated = {
    ...existing,
    preferences: {
      ...((existing as any)?.preferences ?? {}),
      workValues: result,
    },
    profileUpdatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await supabase
    .from('career_direction_profiles')
    .upsert({ user_id: userId, data: updated }, { onConflict: 'user_id' });
}

export function WorkValuesPage() {
  const { user } = useAuth();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleComplete = async (result: WorkValuesResult) => {
    setSyncMsg(null);
    if (!user) return;
    try {
      await syncWorkValuesToCareerDirection(user.id, result);
      setSyncMsg('Saved to your career profile.');
    } catch {
      setSyncMsg('Could not sync to career profile.');
    }
  };

  return (
    <main id="atlas-main" className="atlas-page" tabIndex={-1} style={ui.page}>
      <WorkValuesAssessment onComplete={handleComplete} />
      {syncMsg && (
        <p
          role="status"
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: syncMsg.startsWith('Could not') ? 'var(--color-danger)' : 'var(--color-success)',
          }}
        >
          {syncMsg}
        </p>
      )}
    </main>
  );
}
