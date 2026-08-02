// ────────────────────────────────────────────────────────────────
// Feedback registry
// One entry per surface. Defines the laddered flow: boolean first,
// dropdown only on negative, ranking/text where appropriate.
// Adding a new surface = adding one entry here, not a new component.
// ────────────────────────────────────────────────────────────────

export type FeedbackSurface =
  | 'insight'
  | 'pulse'
  | 'direction'
  | 'docs'
  | 'baseline'
  | 'nps';

export type FeedbackKind = 'boolean' | 'dropdown' | 'ranking' | 'text' | 'dismiss';

export interface FeedbackConfig {
  /** The one-line question shown above the boolean control. */
  prompt: string;
  /** Shown only after a negative vote. */
  negativePrompt?: string;
  /** Dropdown options offered after a negative vote. */
  negativeOptions?: { value: string; label: string }[];
  /** Whether to offer an optional free-text follow-up (after boolean/dropdown). */
  allowText?: boolean;
  /** Placeholder for the optional free-text box. */
  textPlaceholder?: string;
  /** If set, this surface leads with a ranking control instead of boolean. */
  ranking?: {
    prompt: string;
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export const FEEDBACK_CONFIG: Record<FeedbackSurface, FeedbackConfig> = {
  insight: {
    prompt: 'Was this useful?',
    negativePrompt: 'What missed?',
    negativeOptions: [
      { value: 'not_relevant', label: 'Not relevant to me' },
      { value: 'factually_off', label: 'Factually off' },
      { value: 'too_generic', label: 'Too generic' },
      { value: 'too_long', label: 'Too long' },
      { value: 'tone_wrong', label: 'Tone wrong' },
      { value: 'other', label: 'Other' },
    ],
    allowText: true,
    textPlaceholder: 'Tell us more (optional)…',
  },

  pulse: {
    prompt: 'Was this pulse worth your time?',
    negativePrompt: 'What made it not worth it?',
    negativeOptions: [
      { value: 'too_long', label: 'Too long' },
      { value: 'too_frequent', label: 'Too frequent' },
      { value: 'questions_off', label: 'Questions felt off' },
      { value: 'no_value', label: 'I get nothing from it' },
      { value: 'other', label: 'Other' },
    ],
    allowText: false,
  },

  direction: {
    prompt: 'Did this clarify your direction?',
    negativePrompt: "What's unclear?",
    negativeOptions: [
      { value: 'too_many', label: 'Too many options' },
      { value: 'too_few', label: 'Too few options' },
      { value: 'dont_trust', label: "Don't trust the data" },
      { value: 'missing_field', label: 'Missing my field' },
      { value: 'other', label: 'Other' },
    ],
    allowText: true,
    textPlaceholder: 'What would have helped? (optional)…',
  },

  docs: {
    prompt: 'Is this document usable?',
    negativePrompt: 'What needs fixing?',
    negativeOptions: [
      { value: 'wrong_facts', label: 'Wrong facts' },
      { value: 'wrong_tone', label: 'Wrong tone' },
      { value: 'formatting', label: 'Formatting' },
      { value: 'missing_section', label: 'Missing section' },
      { value: 'other', label: 'Other' },
    ],
    allowText: true,
    textPlaceholder: 'Anything specific? (optional)…',
  },

  baseline: {
    prompt: '',
    ranking: {
      prompt: 'How well does this result reflect you?',
      min: 1,
      max: 5,
      minLabel: 'Not at all',
      maxLabel: 'Exactly me',
    },
    allowText: true,
    textPlaceholder: 'Anything surprise you? (optional)…',
  },

  nps: {
    prompt: '',
    ranking: {
      prompt: 'How likely are you to recommend Atlas Path to a friend or colleague?',
      min: 0,
      max: 10,
      minLabel: 'Not likely',
      maxLabel: 'Extremely likely',
    },
    allowText: true,
    textPlaceholder: "What's the main reason for your score? (optional)…",
  },
};
