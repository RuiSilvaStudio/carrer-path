import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface PulseReminderState {
  due: boolean;           // true if a pulse is currently due
  daysOverdue: number;    // how many days past the due date (0 = due today)
  dueDate: Date | null;   // the calculated due date
  phase: 'Loading' | 'Maintenance';
  pulseNumber: number;    // which pulse is next
}

/**
 * Returns today's date at midnight (local time).
 */
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the next Monday strictly AFTER the given date.
 * If the date is a Monday, the next Monday is 7 days later.
 * If it's a Tuesday, next Monday is 6 days later. Etc.
 */
function nextMondayAfter(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Days until next Monday:
  //  Mon(1) → +7, Tue(2) → +6, Wed(3) → +5, Thu(4) → +4,
  //  Fri(5) → +3, Sat(6) → +2, Sun(0) → +1
  const offset = day === 1 ? 7 : (8 - day) % 7;
  d.setDate(d.getDate() + offset);
  return d;
}

export function usePulseReminder(refreshKey?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<PulseReminderState>({
    due: false, daysOverdue: 0, dueDate: null, phase: 'Loading', pulseNumber: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkReminder() {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('id, type, timestamp, week, phase')
          .eq('user_id', user!.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        const assessments = data || [];
        const baseline = assessments.find((a: any) => a.type === 'baseline');

        if (!baseline) {
          // No baseline — no pulse reminder possible
          if (!cancelled) {
            setState({ due: false, daysOverdue: 0, dueDate: null, phase: 'Loading', pulseNumber: 1 });
            setLoading(false);
          }
          return;
        }

        const pulses = assessments.filter((a: any) => a.type === 'pulse');
        const nextPulseNumber = pulses.length + 1;
        const phase: 'Loading' | 'Maintenance' = nextPulseNumber > 3 ? 'Maintenance' : 'Loading';

        // Calculate due date
        let dueDate: Date;
        if (pulses.length === 0) {
          // First pulse: the Monday following baseline completion
          dueDate = nextMondayAfter(new Date(baseline.timestamp));
        } else {
          // Subsequent pulses: the Monday after the last pulse was completed
          const lastPulse = pulses[pulses.length - 1];
          dueDate = nextMondayAfter(new Date(lastPulse.timestamp));
        }

        const now = today();
        const due = now >= dueDate;
        const diffMs = now.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (!cancelled) {
          setState({
            due,
            daysOverdue: Math.max(0, diffDays),
            dueDate,
            phase,
            pulseNumber: nextPulseNumber,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to check pulse reminder:', err);
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    checkReminder();

    return () => { cancelled = true; };
  }, [user?.id, refreshKey]);

  return { ...state, loading };
}
