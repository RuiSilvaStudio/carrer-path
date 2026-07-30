// atlas/src/data/glossary.ts
//
// Single source of truth for every tooltip / chart-info / in-product
// explainer string in Atlas.
//
// Why this file exists
// --------------------
// Phase 2 of the Atlas UX audit. Phase 1 shipped 30+ hard-coded tooltip
// strings scattered across DashboardPage, DocsPage, ProfilePage and
// BaselineAssessment. Editing a definition required hunting through
// multiple files and risked drift between copies. This module collects
// every tooltip / help blurb / glossary entry in one place so future
// edits happen in exactly one location.
//
// How to add a new entry
// ----------------------
// 1. Copy an existing entry (a facet or trait entry is a good template).
// 2. Pick a stable kebab-case `id` — IDs are the public contract that
//    components import; never rename an id without grep-replacing callers.
// 3. Set `term` to the short visible label.
// 4. Write a `short` blurb. Aim for 100–130 chars; the hard limit is 150
//    (NN/g tooltip guideline). Plain English, no jargon.
// 5. Optionally set `long` (paragraph for the glossary drawer),
//    `docsAnchor` (e.g. "/docs#scoring"), `related` (other entry ids),
//    and `scope` (see GlossaryEntry).
// 6. Append " Source: IPIP-NEO-120." to the `short` when the wording is
//    paraphrased from the IPIP-NEO-120 facet definitions.
//
// How a component consumes it
// ---------------------------
//   import { lookupGlossary } from '../data/glossary';
//   const entry = lookupGlossary('facet-o-imagination');
//   <InfoTooltip text={entry?.short ?? 'Imagination'} />
//
//   lookupGlossary returns `undefined` for unknown ids so callers can
//   render a graceful fallback rather than throwing.

export interface GlossaryEntry {
  id: string;
  term: string;
  short: string;
  long?: string;
  docsAnchor?: string;
  related?: string[];
  scope?: 'trait' | 'facet' | 'emotion' | 'chart' | 'concept' | 'instrument';
}

// ---------------------------------------------------------------------------
// Big-Five traits (IPIP-NEO-120 domains)
// ---------------------------------------------------------------------------

export const openness: GlossaryEntry = {
  id: 'openness',
  term: 'Openness',
  short:
    'Curiosity, imagination, and willingness to try new ideas and experiences. Source: IPIP-NEO-120.',
  long:
    'High scorers tend to seek novelty, enjoy abstract thinking, and appreciate art and aesthetic experience. Low scorers tend to prefer the concrete, familiar, and practical.',
  scope: 'trait',
  related: ['facet-o-adventurousness', 'facet-o-artistic', 'facet-o-imagination'],
};

export const conscientiousness: GlossaryEntry = {
  id: 'conscientiousness',
  term: 'Conscientiousness',
  short:
    'Self-discipline, organisation, and drive to follow through on goals. Source: IPIP-NEO-120.',
  long:
    'High scorers tend to be reliable, planful, and persistent. Low scorers tend to be more spontaneous and less concerned with order.',
  scope: 'trait',
  related: ['facet-c-self-discipline', 'facet-c-orderliness', 'facet-c-dutifulness'],
};

export const extraversion: GlossaryEntry = {
  id: 'extraversion',
  term: 'Extraversion',
  short:
    'Sociability, energy, and positive engagement with the outside world. Source: IPIP-NEO-120.',
  long:
    'High scorers tend to seek out other people and stimulating environments. Low scorers (introverts) tend to prefer quieter, more solitary settings.',
  scope: 'trait',
  related: ['facet-e-gregariousness', 'facet-e-friendliness', 'facet-e-activity'],
};

export const agreeableness: GlossaryEntry = {
  id: 'agreeableness',
  term: 'Agreeableness',
  short:
    'Compassion, cooperation, and consideration for others over self-interest. Source: IPIP-NEO-120.',
  long:
    'High scorers tend to be trusting, helpful, and averse to conflict. Low scorers tend to be more competitive and skeptical.',
  scope: 'trait',
  related: ['facet-a-trust', 'facet-a-altruism', 'facet-a-cooperation'],
};

export const emotional_stability: GlossaryEntry = {
  id: 'emotional_stability',
  term: 'Emotional Stability',
  short:
    'Inverse of Neuroticism. 0–100 scale, higher = calmer and less reactive to stress.',
  long:
    'Displayed as Emotional Stability for readability. The underlying construct is Neuroticism, so a high score here means low Neuroticism — fewer negative emotions and steadier mood.',
  scope: 'trait',
  related: ['facet-n-anxiety', 'facet-n-anger', 'facet-n-vulnerability'],
};

// ---------------------------------------------------------------------------
// Emotions captured by weekly pulse
// Higher number = more frequent or intense in pulses.
// ---------------------------------------------------------------------------

const positiveEmotions: GlossaryEntry[] = [
  {
    id: 'happy',
    term: 'Happy',
    short:
      'Positive mood: cheerfulness, satisfaction, warmth. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
  {
    id: 'content',
    term: 'Content',
    short:
      'Calm, settled, at ease. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
  {
    id: 'excited',
    term: 'Excited',
    short:
      'High-energy positive arousal; anticipation and enthusiasm. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
  {
    id: 'proud',
    term: 'Proud',
    short:
      'Satisfaction with one\'s own effort or accomplishment. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
  {
    id: 'purposeful',
    term: 'Purposeful',
    short:
      'Sense of meaning and direction in what you\'re doing. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
];

const neutralEmotions: GlossaryEntry[] = [
  {
    id: 'attentive',
    term: 'Attentive',
    short:
      'Focused and absorbed; able to concentrate on the task at hand.',
    scope: 'emotion',
  },
  {
    id: 'goaldir',
    term: 'Goal-directed',
    short:
      'Acting deliberately toward a chosen outcome; momentum and intention.',
    scope: 'emotion',
  },
];

const negativeEmotions: GlossaryEntry[] = [
  {
    id: 'guilty',
    term: 'Guilty',
    short:
      'Self-blame or regret after a perceived mistake. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
  {
    id: 'angry',
    term: 'Angry',
    short:
      'Frustration, irritation, or hostility toward a person or situation. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
  {
    id: 'afraid',
    term: 'Afraid',
    short:
      'Fear, worry, or sense of threat. Higher = more frequent/intense in pulses.',
    scope: 'emotion',
  },
];

// ---------------------------------------------------------------------------
// Instruments
// ---------------------------------------------------------------------------

export const ipip_neo_120: GlossaryEntry = {
  id: 'ipip-neo-120',
  term: 'IPIP-NEO-120',
  short:
    '120-item Big-Five personality inventory; yields trait + facet scores on a 0–100 scale.',
  long:
    'The International Personality Item Pool version of the NEO PI-R. Public-domain items, scored against normative samples. Each of the five traits has six facets, giving 30 facets total.',
  scope: 'instrument',
  related: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability'],
};

export const icar_16: GlossaryEntry = {
  id: 'icar-16',
  term: 'ICAR-16',
  short:
    '16-item cognitive style check capturing analytical, creative, practical and empathetic modes.',
  long:
    'ICAR stands for Intellectual Curiosity, Cognitive Adaptability, Reflectivity. Used here as a short cognitive-style complement to the Big-Five.',
  scope: 'instrument',
};

export const sd3_27: GlossaryEntry = {
  id: 'sd3-27',
  term: 'Motivational Drivers (SD3-27)',
  short:
    "27 items measuring Machiavellianism, Narcissism, Psychopathy. Relabeled 'Motivational Drivers' to reduce stigma; underlying constructs unchanged.",
  long:
    'The Short Dark Triad (SD3) measures three socially aversive personality traits. We display the label "Motivational Drivers" so the report focuses on the underlying motivational pull (status-seeking, strategic thinking, emotional detachment) without prejudging the reader.',
  scope: 'instrument',
};

export const diamonds: GlossaryEntry = {
  id: 'diamonds',
  term: 'DIAMONDS',
  short:
    'Situational framework: Dominance, Influence, steadiness, Mischief, Adaptability, Navigation, Decisiveness.',
  long:
    'A situational-style taxonomy used to describe the contexts a person thrives in, derived from the eight-temperament literature.',
  docsAnchor: '/docs#diamonds',
  scope: 'instrument',
};

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

export const trajectory_chart: GlossaryEntry = {
  id: 'trajectory-chart',
  term: 'Trajectory Chart',
  short:
    'Line chart of a score over time. Each point is one assessment; the line shows direction.',
  docsAnchor: '/docs#trajectory',
  scope: 'chart',
  related: ['trait-score'],
};

export const distribution_chart: GlossaryEntry = {
  id: 'distribution-chart',
  term: 'Distribution Chart',
  short:
    'Histogram or radial bars showing how a score is spread across people, weeks or contexts.',
  docsAnchor: '/docs#distribution',
  scope: 'chart',
};

export const context_heatmap: GlossaryEntry = {
  id: 'context-heatmap',
  term: 'Context Heatmap',
  short:
    'Grid heatmap of scores by context (who/what/when) so patterns pop visually.',
  docsAnchor: '/docs#context',
  scope: 'chart',
};

export const rhythm_radial_clock: GlossaryEntry = {
  id: 'rhythm-radial-clock',
  term: 'Rhythm Radial Clock',
  short:
    '24-hour clock wheel showing when a behaviour or emotion tends to peak.',
  docsAnchor: '/docs#rhythm',
  scope: 'chart',
};

export const rhythm_heatmap: GlossaryEntry = {
  id: 'rhythm-heatmap',
  term: 'Rhythm Heatmap',
  short:
    'Day-of-week × hour-of-day grid; brighter cells = more frequent activity or emotion.',
  docsAnchor: '/docs#rhythm',
  scope: 'chart',
};

// ---------------------------------------------------------------------------
// Concepts
// ---------------------------------------------------------------------------

export const trait_score: GlossaryEntry = {
  id: 'trait-score',
  term: 'Trait Score (0–100)',
  short:
    'Normalised 0–100 score: 50 = population average, higher = more of the trait, lower = less.',
  long:
    'Raw questionnaire responses are mapped onto a 0–100 percentile-like scale so different facets and traits can be compared on the same axis. The mapping comes from IPIP-NEO-120 normative samples.',
  scope: 'concept',
};

export const whole_trait_theory: GlossaryEntry = {
  id: 'whole-trait-theory',
  term: 'Whole-Trait Theory',
  short:
    'Traits as density distributions of states, not fixed labels. You are not "an extrovert"; you act extroverted often.',
  long:
    'Whole-Trait Theory (Fleeson) reframes personality as the distribution of states a person typically experiences. A trait score summarises where that distribution sits.',
  docsAnchor: '/docs#whole-trait-theory',
  scope: 'concept',
};

export const experience_sampling: GlossaryEntry = {
  id: 'experience-sampling',
  term: 'Experience Sampling',
  short:
    'Brief in-the-moment check-ins (pulses) that capture what you\'re feeling and doing right now.',
  docsAnchor: '/docs#pulse',
  scope: 'concept',
  related: ['happy', 'content', 'excited'],
};

export const reverse_scoring: GlossaryEntry = {
  id: 'reverse-scoring',
  term: 'Reverse-scoring',
  short:
    'Some items are phrased in the opposite direction of their trait. These are auto-flipped during scoring (response → 6 − response).',
  long:
    'Reverse-scored items catch careless responding and reduce acquiescence bias. The atlas scoring pipeline applies (6 − response) automatically; the user never has to think about it.',
  scope: 'concept',
};

// ---------------------------------------------------------------------------
// IPIP-NEO-120 facets (30 entries)
// IDs follow the pattern facet-{trait}-{kebab-facet}.
// ---------------------------------------------------------------------------

const a_facets: GlossaryEntry[] = [
  {
    id: 'facet-a-altruism',
    term: 'Altruism',
    short: "Concern for others' welfare; willingness to help. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['agreeableness'],
  },
  {
    id: 'facet-a-cooperation',
    term: 'Cooperation',
    short: 'Dislike of conflict; preference for harmony and compromise. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['agreeableness'],
  },
  {
    id: 'facet-a-modesty',
    term: 'Modesty',
    short: "Humility; tendency to downplay one's own achievements. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['agreeableness'],
  },
  {
    id: 'facet-a-morality',
    term: 'Morality',
    short: 'Principledness; concern for fairness and ethical conduct. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['agreeableness'],
  },
  {
    id: 'facet-a-sympathy',
    term: 'Sympathy',
    short: "Tenderness; emotional responsiveness to others' needs. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['agreeableness'],
  },
  {
    id: 'facet-a-trust',
    term: 'Trust',
    short: "Belief in others' sincerity and good intentions. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['agreeableness'],
  },
];

const c_facets: GlossaryEntry[] = [
  {
    id: 'facet-c-achievement-striving',
    term: 'Achievement-striving',
    short: 'Drive to excel; ambition and goal pursuit. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['conscientiousness'],
  },
  {
    id: 'facet-c-cautiousness',
    term: 'Cautiousness',
    short: 'Deliberation; thinking before acting. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['conscientiousness'],
  },
  {
    id: 'facet-c-dutifulness',
    term: 'Dutifulness',
    short: 'Adherence to rules, obligations, and commitments. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['conscientiousness'],
  },
  {
    id: 'facet-c-orderliness',
    term: 'Orderliness',
    short: 'Preference for tidiness, planning, and structure. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['conscientiousness'],
  },
  {
    id: 'facet-c-self-discipline',
    term: 'Self-discipline',
    short: 'Ability to start and persist with tasks despite distractions. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['conscientiousness'],
  },
  {
    id: 'facet-c-self-efficacy',
    term: 'Self-efficacy',
    short: "Confidence in one's own competence and effectiveness. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['conscientiousness'],
  },
];

const e_facets: GlossaryEntry[] = [
  {
    id: 'facet-e-activity',
    term: 'Activity',
    short: 'Pace of living; high energy and busyness. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['extraversion'],
  },
  {
    id: 'facet-e-assertiveness',
    term: 'Assertiveness',
    short: 'Willingness to speak up, lead, and take charge. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['extraversion'],
  },
  {
    id: 'facet-e-cheerfulness',
    term: 'Cheerfulness',
    short: 'Tendency toward positive emotions and humour. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['extraversion'],
  },
  {
    id: 'facet-e-excitement-seeking',
    term: 'Excitement-seeking',
    short: 'Craving for stimulation and novel experiences. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['extraversion'],
  },
  {
    id: 'facet-e-friendliness',
    term: 'Friendliness',
    short: 'Warmth; ease in forming new relationships. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['extraversion'],
  },
  {
    id: 'facet-e-gregariousness',
    term: 'Gregariousness',
    short: "Preference for others' company over solitude. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['extraversion'],
  },
];

const n_facets: GlossaryEntry[] = [
  {
    id: 'facet-n-anger',
    term: 'Anger',
    short: 'Tendency toward frustration, irritability, and hostility. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['emotional_stability'],
  },
  {
    id: 'facet-n-anxiety',
    term: 'Anxiety',
    short: 'Worry, nervousness, and apprehension. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['emotional_stability'],
  },
  {
    id: 'facet-n-depression',
    term: 'Depression',
    short: 'Tendency toward sadness, hopelessness, and withdrawal. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['emotional_stability'],
  },
  {
    id: 'facet-n-immoderation',
    term: 'Immoderation',
    short: 'Difficulty resisting cravings and urges. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['emotional_stability'],
  },
  {
    id: 'facet-n-self-consciousness',
    term: 'Self-consciousness',
    short: 'Sensitivity to social evaluation and shame. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['emotional_stability'],
  },
  {
    id: 'facet-n-vulnerability',
    term: 'Vulnerability',
    short: 'Susceptibility to stress and panic under pressure. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['emotional_stability'],
  },
];

const o_facets: GlossaryEntry[] = [
  {
    id: 'facet-o-adventurousness',
    term: 'Adventurousness',
    short: 'Willingness to try new activities and experiences. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['openness'],
  },
  {
    id: 'facet-o-artistic',
    term: 'Artistic',
    short: 'Appreciation for art, beauty, and aesthetic experience. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['openness'],
  },
  {
    id: 'facet-o-emotionality',
    term: 'Emotionality',
    short: "Receptivity to one's own and others' inner feelings. Source: IPIP-NEO-120.",
    scope: 'facet',
    related: ['openness'],
  },
  {
    id: 'facet-o-imagination',
    term: 'Imagination',
    short: 'Vivid fantasy life and active imaginative thinking. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['openness'],
  },
  {
    id: 'facet-o-intellect',
    term: 'Intellect',
    short: 'Intellectual curiosity; engagement with abstract ideas. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['openness'],
  },
  {
    id: 'facet-o-liberalism',
    term: 'Liberalism',
    short: 'Openness to reconsidering traditional values and authority. Source: IPIP-NEO-120.',
    scope: 'facet',
    related: ['openness'],
  },
];

// ---------------------------------------------------------------------------
// Lookup map
// ---------------------------------------------------------------------------

export const GLOSSARY: Record<string, GlossaryEntry> = Object.freeze({
  // traits
  'trait-openness': openness,
  'trait-conscientiousness': conscientiousness,
  'trait-extraversion': extraversion,
  'trait-agreeableness': agreeableness,
  'trait-emotional-stability': emotional_stability,
  // instruments
  'instrument-ipip-neo-120': ipip_neo_120,
  'instrument-icar-16': icar_16,
  'instrument-sd3-27': sd3_27,
  'instrument-diamonds': diamonds,
  // charts
  'chart-trajectory': trajectory_chart,
  'chart-distribution': distribution_chart,
  'chart-context-heatmap': context_heatmap,
  'chart-rhythm-radial-clock': rhythm_radial_clock,
  'chart-rhythm-heatmap': rhythm_heatmap,
  // concepts
  'concept-trait-score': trait_score,
  'concept-whole-trait-theory': whole_trait_theory,
  'concept-experience-sampling': experience_sampling,
  'concept-reverse-scoring': reverse_scoring,
  // emotions + facets
  ...Object.fromEntries(
    [...positiveEmotions, ...neutralEmotions, ...negativeEmotions].map(e => [`emotion-${e.id}`, e]),
  ),
  ...Object.fromEntries(
    [...a_facets, ...c_facets, ...e_facets, ...n_facets, ...o_facets].map(f => [f.id, f]),
  ),
});

/**
 * Look up a glossary entry by its stable id.
 * Returns `undefined` for unknown ids so callers can render a fallback.
 */
export function lookupGlossary(id: string): GlossaryEntry | undefined {
  return GLOSSARY[id];
}