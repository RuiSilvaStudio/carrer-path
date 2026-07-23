import assessmentItemsData from '../data/assessment-items.json';

// ── IPIP-NEO-120 item with text ─────────────────────────────────
export interface IPIPItem {
  id: number;
  text: string;
  trait: 'N' | 'E' | 'O' | 'A' | 'C';
  facet: string;
  reverse: boolean;
}

// ── ICAR-16 item ────────────────────────────────────────────────
export interface ICARItem {
  id: number;
  type: string;
  text: string;
  options: string[];
  correct: number;
}

// ── SD3-27 item ──────────────────────────────────────────────────
export interface SD3Item {
  id: number;
  text: string;
  trait: 'M' | 'N' | 'P';
  facet: string;
  reverse?: boolean;
}

// ── Context question ─────────────────────────────────────────────
export interface ContextQuestion {
  id: string;
  text: string;
  type: 'select' | 'scale';
  options?: string[];
  min?: number;
  max?: number;
  labels?: Record<string, string>;
}

const data = assessmentItemsData as {
  ipip_neo_120: {
    title: string;
    description: string;
    items: IPIPItem[];
  };
  icar_16: {
    title: string;
    description: string;
    items: ICARItem[];
  };
  sd3: {
    title: string;
    description: string;
    items: SD3Item[];
  };
  context: {
    title: string;
    description: string;
    items: ContextQuestion[];
  };
};

export const IPIP_TEXTS = data.ipip_neo_120.items;
export const ICAR_ITEMS = data.icar_16.items;
export const SD3_ITEMS = data.sd3.items;
export const CONTEXT_QUESTIONS = data.context.items;
export const IPIP_TITLE = data.ipip_neo_120.title;
export const IPIP_DESCRIPTION = data.ipip_neo_120.description;
export const ICAR_TITLE = data.icar_16.title;
export const ICAR_DESCRIPTION = data.icar_16.description;
export const SD3_TITLE = data.sd3.title;
export const SD3_DESCRIPTION = data.sd3.description;
export const CONTEXT_TITLE = data.context.title;
export const CONTEXT_DESCRIPTION = data.context.description;

// IPIP section definitions — 6 sections of 20 items each
export interface IPIPSection {
  title: string;
  description: string;
  items: IPIPItem[];
}

export const IPIP_SECTIONS: IPIPSection[] = [
  {
    title: 'Neuroticism (N)',
    description: 'How you experience negative emotions and handle stress.',
    items: IPIP_TEXTS.filter((_, i) => i < 20),
  },
  {
    title: 'Extraversion (E)',
    description: 'Your engagement with the external world and social interactions.',
    items: IPIP_TEXTS.filter((_, i) => i >= 20 && i < 40),
  },
  {
    title: 'Openness (O)',
    description: 'Your openness to new experiences, ideas, and creativity.',
    items: IPIP_TEXTS.filter((_, i) => i >= 40 && i < 60),
  },
  {
    title: 'Agreeableness (A)',
    description: 'How you orient toward and interact with others.',
    items: IPIP_TEXTS.filter((_, i) => i >= 60 && i < 80),
  },
  {
    title: 'Conscientiousness (C)',
    description: 'How you organize, control, and direct your behavior.',
    items: IPIP_TEXTS.filter((_, i) => i >= 80 && i < 100),
  },
  {
    title: 'Cross-Trait Items',
    description: 'Final set covering all five traits in mixed order.',
    items: IPIP_TEXTS.filter((_, i) => i >= 100),
  },
];
