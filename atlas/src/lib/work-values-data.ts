// ── Atlas Work Values Instrument ─────────────────────────────────
// Based on Minnesota Theory of Work Adjustment (Dawis & Lofquist, 1984).
// 21 vocational needs → 6 work values. Dual scoring: ipsative (rank) + normative (rating).
// See: references/atlas-work-values-instrument.md

export type WorkValue =
  | 'achievement'
  | 'independence'
  | 'recognition'
  | 'relationships'
  | 'support'
  | 'working_conditions';

export interface NeedItem {
  id: number;
  text: string;
  value: WorkValue;
}

export const WORK_VALUES: WorkValue[] = [
  'achievement',
  'independence',
  'recognition',
  'relationships',
  'support',
  'working_conditions',
];

export const VALUE_LABELS: Record<WorkValue, string> = {
  achievement: 'Achievement',
  independence: 'Independence',
  recognition: 'Recognition',
  relationships: 'Relationships',
  support: 'Support',
  working_conditions: 'Working Conditions',
};

export const VALUE_DESCRIPTIONS: Record<WorkValue, string> = {
  achievement: 'Work that lets you use your strongest abilities and delivers outcomes you take pride in.',
  independence: 'Freedom to originate approaches, make consequential decisions, and shape your work.',
  recognition: 'Visibility, advancement, authority, and professional standing in your field.',
  relationships: 'Collaboration with people you respect, ethical alignment, and meaningful impact on others.',
  support: 'Organisational fairness and leadership that invests in, protects, and develops people.',
  working_conditions: 'Intensity, compensation, stability, variety, focus, and a well-resourced environment.',
};

// ── The 21 need statements (Atlas wording, senior audience) ──────
export const NEED_ITEMS: NeedItem[] = [
  { id: 1, text: 'The work lets me fully use my strongest professional abilities', value: 'achievement' },
  { id: 2, text: 'The work delivers tangible outcomes I can take pride in', value: 'achievement' },
  { id: 3, text: 'The role demands sustained intensity and full engagement', value: 'working_conditions' },
  { id: 4, text: 'There is clear room for career progression and greater responsibility', value: 'recognition' },
  { id: 5, text: 'I can set direction and guide how others work', value: 'recognition' },
  { id: 6, text: 'The organisation acts with fairness and integrity in how it treats people', value: 'support' },
  { id: 7, text: 'Compensation reflects the value I bring relative to the market', value: 'working_conditions' },
  { id: 8, text: 'I work alongside people I respect and genuinely collaborate well with', value: 'relationships' },
  { id: 9, text: 'I can originate and test new approaches, not just execute established ones', value: 'independence' },
  { id: 10, text: 'I can work independently when I need to focus deeply', value: 'working_conditions' },
  { id: 11, text: 'The work never requires me to act against my professional ethics or conscience', value: 'relationships' },
  { id: 12, text: 'My contributions are visible and acknowledged by decision-makers', value: 'recognition' },
  { id: 13, text: 'I have authority to make consequential decisions without seeking approval', value: 'independence' },
  { id: 14, text: 'The role offers stability and continuity — not constant restructuring', value: 'working_conditions' },
  { id: 15, text: 'The work creates meaningful impact for others — customers, society, teams', value: 'relationships' },
  { id: 16, text: 'The role carries professional standing and credibility in my field or industry', value: 'recognition' },
  { id: 17, text: 'Leadership backs the team — sponsors, protects, and removes obstacles', value: 'support' },
  { id: 18, text: 'Leadership invests in developing people and builds capability deliberately', value: 'support' },
  { id: 19, text: 'The work varies enough to stay intellectually stimulating across time', value: 'working_conditions' },
  { id: 20, text: 'The working environment — physical, digital, operational — is well-resourced', value: 'working_conditions' },
  { id: 21, text: 'I can shape how my work is planned and executed with minimal oversight', value: 'independence' },
];

// ── Needs grouped by value ──────────────────────────────────────
export const NEEDS_BY_VALUE: Record<WorkValue, number[]> = {
  achievement: [1, 2],
  independence: [9, 13, 21],
  recognition: [4, 5, 12, 16],
  relationships: [8, 11, 15],
  support: [6, 17, 18],
  working_conditions: [3, 7, 10, 14, 19, 20],
};

// ── Phase 2 rating scale ────────────────────────────────────────
export const INTENSITY_SCALE = [
  { value: 5, label: 'Essential', hint: 'Non-negotiable in my next role' },
  { value: 4, label: 'Important', hint: 'Strongly prefer this' },
  { value: 3, label: 'Desirable', hint: 'Nice to have but I can flex' },
  { value: 2, label: 'Neutral', hint: "Doesn't significantly affect me" },
  { value: 1, label: 'Unimportant', hint: "I'd actively prefer the opposite" },
] as const;

// ── Block design generator ──────────────────────────────────────
// (21, 5, 1)-balanced incomplete block design.
// Each of 21 items appears in exactly 5 blocks; every pair co-occurs in exactly 1 block.
// Uses cyclic development from a difference set.
// The base block {0,1,4,14,16} is a (21,5,1) difference set: every non-zero element
// of Z_21 appears exactly once as a pairwise difference. Verified by construction.

const BASE_BLOCK = [0, 1, 4, 14, 16]; // (21,5,1) difference set

export function generateBlocks(): number[][] {
  const blocks: number[][] = [];
  for (let i = 0; i < 21; i++) {
    const block = BASE_BLOCK.map((offset) => (i + offset) % 21);
    blocks.push(block);
  }
  return blocks;
}

// Shuffle a blocks array (for per-respondent randomization)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateShuffledBlocks(): number[][] {
  const blockOrder = shuffle(Array.from({ length: 21 }, (_, i) => i));
  return blockOrder.map((blockIdx) => {
    const base = BASE_BLOCK.map((offset) => (blockIdx + offset) % 21);
    return shuffle(base);
  });
}

// ── Scoring ─────────────────────────────────────────────────────

export interface NeedScore {
  id: number;
  rankScore: number;   // 0-1 (ipsative, from Phase 1)
  intensityScore: number; // 1-5 (normative, from Phase 2)
  combined: number;    // -5 to +5
}

export interface ValueScore {
  value: WorkValue;
  score: number;       // 0-100 (normalized)
  needs: NeedScore[];
}

export interface WorkValuesResult {
  needs: NeedScore[];
  values: ValueScore[];
  consistency: number;  // 0-1 (coefficient of consistency)
  completedAt: string;
}

// Compute rank score (0-1) from block rankings.
// Each item appears in 5 blocks. Within each block, rank 1 = most important (score 5), rank 5 = least (score 1).
// rankScore = average position score / 5 → normalized to 0-1.
export function computeRankScores(
  // blockRankings: array of { blockIdx, itemIndex, rank (1-5) }
  rankings: Record<number, number[]>, // blockIdx → array of itemIndices in rank order (index 0 = most important)
): Record<number, number> {
  const itemScores: Record<number, number[]> = {};
  const blockSize = 5;

  for (const [, orderedItems] of Object.entries(rankings)) {
    orderedItems.forEach((itemIdx, rankPos) => {
      // rankPos 0 = most important → score = blockSize (5)
      // rankPos 4 = least important → score = 1
      const score = blockSize - rankPos;
      if (!itemScores[itemIdx]) itemScores[itemIdx] = [];
      itemScores[itemIdx].push(score);
    });
  }

  const rankScores: Record<number, number> = {};
  for (const itemIdx of Object.keys(itemScores).map(Number)) {
    const scores = itemScores[itemIdx];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    rankScores[itemIdx] = avg / blockSize; // 0-1
  }
  return rankScores;
}

// Circular triad detection.
// For 21 items, there are C(21,3) = 1330 triads.
// A circular triad: A > B, B > C, C > A in the pairwise preference matrix.
// We build a preference matrix from the rankings, then count circular triads.
export function computeConsistency(
  rankings: Record<number, number[]>,
): number {
  const numItems = 21;
  // Build preference matrix: pref[i][j] = 1 if i ranked above j in any block where both appear
  const pref: number[][] = Array.from({ length: numItems }, () =>
    new Array(numItems).fill(0),
  );

  for (const orderedItems of Object.values(rankings)) {
    for (let i = 0; i < orderedItems.length; i++) {
      for (let j = i + 1; j < orderedItems.length; j++) {
        const a = orderedItems[i];
        const b = orderedItems[j];
        pref[a][b] += 1; // a ranked above b
      }
    }
  }

  // For each triad (i, j, k), check if circular: pref[i][j] > pref[j][i] AND pref[j][k] > pref[k][j] AND pref[k][i] > pref[i][k]
  let circular = 0;
  let total = 0;
  for (let i = 0; i < numItems; i++) {
    for (let j = i + 1; j < numItems; j++) {
      for (let k = j + 1; k < numItems; k++) {
        total++;
        const ij = pref[i][j] > pref[j][i];
        const ji = pref[j][i] > pref[i][j];
        const jk = pref[j][k] > pref[k][j];
        const kj = pref[k][j] > pref[j][k];
        const ki = pref[k][i] > pref[i][k];
        const ik = pref[i][k] > pref[k][i];

        // Circular: ij && jk && ki (A>B, B>C, C>A)
        // Or: ji && kj && ik (B>A, C>B, A>C)
        if ((ij && jk && ki) || (ji && kj && ik)) {
          circular++;
        }
      }
    }
  }

  if (total === 0) return 0;
  return 1 - circular / total;
}

// Full scoring
export function scoreWorkValues(
  rankings: Record<number, number[]>, // Phase 1: blockIdx → ordered item indices
  intensityRatings: Record<number, number>, // Phase 2: itemIdx → 1-5
): WorkValuesResult {
  const rankScores = computeRankScores(rankings);
  const consistency = computeConsistency(rankings);

  const needScores: NeedScore[] = NEED_ITEMS.map((item, idx) => {
    const rankScore = rankScores[idx] ?? 0;
    const intensityScore = intensityRatings[idx] ?? 3;
    const combined = (rankScore * 2 - 1) * intensityScore;
    return {
      id: item.id,
      rankScore: Math.round(rankScore * 1000) / 1000,
      intensityScore,
      combined: Math.round(combined * 1000) / 1000,
    };
  });

  const valueScores: ValueScore[] = WORK_VALUES.map((v) => {
    const needIds = NEEDS_BY_VALUE[v];
    const needs = needScores.filter((n) => needIds.includes(n.id));
    const avgCombined = needs.length > 0
      ? needs.reduce((sum, n) => sum + n.combined, 0) / needs.length
      : 0;
    // Normalize: combined ranges from -5 to +5 → map to 0-100
    const score = Math.round(((avgCombined + 5) / 10) * 100);
    return { value: v, score, needs };
  });

  return {
    needs: needScores,
    values: valueScores.sort((a, b) => b.score - a.score),
    consistency: Math.round(consistency * 1000) / 1000,
    completedAt: new Date().toISOString(),
  };
}
