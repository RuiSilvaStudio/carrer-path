import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePulseReminder } from '../hooks/usePulseReminder';

// Session-level dismissal — resets on each new session (browser tab open)
// Keyed by pulse number so completing a pulse clears the dismiss for the next one
const DISMISS_KEY = 'atlas_pulse_reminder_dismissed';

export function PulseReminder() {
  const navigate = useNavigate();
  const { due, daysOverdue, phase, pulseNumber, loading } = usePulseReminder();
  const [dismissed, setDismissed] = useState(false);

  // Check session dismissal on mount and when pulse number changes
  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISS_KEY);
    if (stored) {
      try {
        const { pulseNum: dismissedPulse, date: dismissedDate } = JSON.parse(stored);
        const today = new Date().toDateString();
        // Only dismiss if it's for the SAME pulse number AND same session day
        if (dismissedPulse === pulseNumber && dismissedDate === today) {
          setDismissed(true);
          return;
        }
      } catch {
        // invalid stored data, ignore
      }
    }
    setDismissed(false);
  }, [pulseNumber]);

  if (loading || !due || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify({
      pulseNum: pulseNumber,
      date: new Date().toDateString(),
    }));
    setDismissed(true);
  };

  const handleTakePulse = () => {
    navigate('/pulse');
  };

  // Build message based on overdue status
  let message: string;
  if (daysOverdue === 0) {
    message = `Pulse ${pulseNumber} is due today`;
  } else if (daysOverdue === 1) {
    message = `Pulse ${pulseNumber} was due yesterday`;
  } else {
    message = `Pulse ${pulseNumber} is ${daysOverdue} days overdue`;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 200,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-accent)',
      borderRadius: '8px',
      padding: '14px 18px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      maxWidth: '340px',
      animation: 'pulseReminderSlideIn 0.3s ease',
    }}>
      {/* Pulse dot */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'var(--color-accent)',
        flexShrink: 0,
        animation: 'pulseReminderDot 2s infinite',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--color-text-dim)', marginBottom: '4px',
        }}>
          {phase} Phase
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: '13px',
          color: 'var(--color-text)', lineHeight: 1.4,
        }}>
          {message}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={handleTakePulse}
          style={{
            padding: '6px 14px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none', borderRadius: '4px',
            fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          }}
        >
          Take Pulse
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '4px 10px',
            background: 'none',
            color: 'var(--color-text-dim)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: '10px', fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
