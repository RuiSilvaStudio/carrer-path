import type { BigFiveScores } from '../types';

export interface IPIPItemMeta {
  id: number;
  trait: 'N' | 'E' | 'O' | 'A' | 'C';
  reverse: boolean;
  facet: string;
}

// All 120 IPIP-NEO items with trait, reverse flag, and facet
export const IPIP_ITEMS: IPIPItemMeta[] = [
  {id:1,trait:'N',reverse:false,facet:'Anxiety'},{id:2,trait:'E',reverse:false,facet:'Friendliness'},
  {id:3,trait:'O',reverse:false,facet:'Imagination'},{id:4,trait:'A',reverse:false,facet:'Trust'},
  {id:5,trait:'C',reverse:false,facet:'Self-efficacy'},{id:6,trait:'N',reverse:false,facet:'Anxiety'},
  {id:7,trait:'E',reverse:false,facet:'Friendliness'},{id:8,trait:'O',reverse:false,facet:'Imagination'},
  {id:9,trait:'A',reverse:true,facet:'Trust'},{id:10,trait:'C',reverse:false,facet:'Self-efficacy'},
  {id:11,trait:'N',reverse:false,facet:'Anger'},{id:12,trait:'E',reverse:false,facet:'Gregariousness'},
  {id:13,trait:'O',reverse:false,facet:'Artistic'},{id:14,trait:'A',reverse:false,facet:'Morality'},
  {id:15,trait:'C',reverse:false,facet:'Orderliness'},{id:16,trait:'N',reverse:false,facet:'Anger'},
  {id:17,trait:'E',reverse:false,facet:'Gregariousness'},{id:18,trait:'O',reverse:false,facet:'Artistic'},
  {id:19,trait:'A',reverse:true,facet:'Morality'},{id:20,trait:'C',reverse:false,facet:'Orderliness'},
  {id:21,trait:'N',reverse:false,facet:'Depression'},{id:22,trait:'E',reverse:false,facet:'Assertiveness'},
  {id:23,trait:'O',reverse:false,facet:'Emotionality'},{id:24,trait:'A',reverse:false,facet:'Altruism'},
  {id:25,trait:'C',reverse:false,facet:'Dutifulness'},{id:26,trait:'N',reverse:false,facet:'Depression'},
  {id:27,trait:'E',reverse:false,facet:'Assertiveness'},{id:28,trait:'O',reverse:false,facet:'Emotionality'},
  {id:29,trait:'A',reverse:false,facet:'Altruism'},{id:30,trait:'C',reverse:true,facet:'Dutifulness'},
  {id:31,trait:'N',reverse:false,facet:'Self-consciousness'},{id:32,trait:'E',reverse:false,facet:'Activity'},
  {id:33,trait:'O',reverse:false,facet:'Adventurousness'},{id:34,trait:'A',reverse:false,facet:'Cooperation'},
  {id:35,trait:'C',reverse:false,facet:'Achievement-striving'},{id:36,trait:'N',reverse:false,facet:'Self-consciousness'},
  {id:37,trait:'E',reverse:false,facet:'Activity'},{id:38,trait:'O',reverse:false,facet:'Adventurousness'},
  {id:39,trait:'A',reverse:true,facet:'Cooperation'},{id:40,trait:'C',reverse:true,facet:'Achievement-striving'},
  {id:41,trait:'N',reverse:false,facet:'Immoderation'},{id:42,trait:'E',reverse:false,facet:'Excitement-seeking'},
  {id:43,trait:'O',reverse:false,facet:'Intellect'},{id:44,trait:'A',reverse:false,facet:'Modesty'},
  {id:45,trait:'C',reverse:false,facet:'Self-discipline'},{id:46,trait:'N',reverse:false,facet:'Immoderation'},
  {id:47,trait:'E',reverse:false,facet:'Excitement-seeking'},{id:48,trait:'O',reverse:true,facet:'Intellect'},
  {id:49,trait:'A',reverse:true,facet:'Modesty'},{id:50,trait:'C',reverse:false,facet:'Self-discipline'},
  {id:51,trait:'N',reverse:true,facet:'Vulnerability'},{id:52,trait:'E',reverse:false,facet:'Cheerfulness'},
  {id:53,trait:'O',reverse:true,facet:'Liberalism'},{id:54,trait:'A',reverse:true,facet:'Sympathy'},
  {id:55,trait:'C',reverse:false,facet:'Cautiousness'},{id:56,trait:'N',reverse:false,facet:'Vulnerability'},
  {id:57,trait:'E',reverse:false,facet:'Cheerfulness'},{id:58,trait:'O',reverse:false,facet:'Liberalism'},
  {id:59,trait:'A',reverse:false,facet:'Sympathy'},{id:60,trait:'C',reverse:true,facet:'Cautiousness'},
  {id:61,trait:'N',reverse:false,facet:'Anxiety'},{id:62,trait:'E',reverse:true,facet:'Friendliness'},
  {id:63,trait:'O',reverse:false,facet:'Imagination'},{id:64,trait:'A',reverse:false,facet:'Trust'},
  {id:65,trait:'C',reverse:false,facet:'Self-efficacy'},{id:66,trait:'N',reverse:false,facet:'Anxiety'},
  {id:67,trait:'E',reverse:true,facet:'Friendliness'},{id:68,trait:'O',reverse:true,facet:'Imagination'},
  {id:69,trait:'A',reverse:true,facet:'Trust'},{id:70,trait:'C',reverse:true,facet:'Self-efficacy'},
  {id:71,trait:'N',reverse:false,facet:'Anger'},{id:72,trait:'E',reverse:false,facet:'Gregariousness'},
  {id:73,trait:'O',reverse:true,facet:'Artistic'},{id:74,trait:'A',reverse:true,facet:'Morality'},
  {id:75,trait:'C',reverse:true,facet:'Orderliness'},{id:76,trait:'N',reverse:false,facet:'Anger'},
  {id:77,trait:'E',reverse:false,facet:'Gregariousness'},{id:78,trait:'O',reverse:true,facet:'Artistic'},
  {id:79,trait:'A',reverse:true,facet:'Morality'},{id:80,trait:'C',reverse:true,facet:'Orderliness'},
  {id:81,trait:'N',reverse:true,facet:'Depression'},{id:82,trait:'E',reverse:false,facet:'Assertiveness'},
  {id:83,trait:'O',reverse:false,facet:'Emotionality'},{id:84,trait:'A',reverse:true,facet:'Altruism'},
  {id:85,trait:'C',reverse:true,facet:'Dutifulness'},{id:86,trait:'N',reverse:false,facet:'Depression'},
  {id:87,trait:'E',reverse:false,facet:'Assertiveness'},{id:88,trait:'O',reverse:true,facet:'Emotionality'},
  {id:89,trait:'A',reverse:true,facet:'Altruism'},{id:90,trait:'C',reverse:true,facet:'Dutifulness'},
  {id:91,trait:'N',reverse:false,facet:'Self-consciousness'},{id:92,trait:'E',reverse:true,facet:'Activity'},
  {id:93,trait:'O',reverse:false,facet:'Adventurousness'},{id:94,trait:'A',reverse:true,facet:'Cooperation'},
  {id:95,trait:'C',reverse:false,facet:'Achievement-striving'},{id:96,trait:'N',reverse:true,facet:'Self-consciousness'},
  {id:97,trait:'E',reverse:true,facet:'Activity'},{id:98,trait:'O',reverse:true,facet:'Adventurousness'},
  {id:99,trait:'A',reverse:true,facet:'Cooperation'},{id:100,trait:'C',reverse:true,facet:'Achievement-striving'},
  {id:101,trait:'N',reverse:true,facet:'Immoderation'},{id:102,trait:'E',reverse:true,facet:'Excitement-seeking'},
  {id:103,trait:'O',reverse:true,facet:'Intellect'},{id:104,trait:'A',reverse:true,facet:'Modesty'},
  {id:105,trait:'C',reverse:false,facet:'Self-discipline'},{id:106,trait:'N',reverse:false,facet:'Immoderation'},
  {id:107,trait:'E',reverse:true,facet:'Excitement-seeking'},{id:108,trait:'O',reverse:true,facet:'Intellect'},
  {id:109,trait:'A',reverse:true,facet:'Modesty'},{id:110,trait:'C',reverse:true,facet:'Self-discipline'},
  {id:111,trait:'N',reverse:true,facet:'Vulnerability'},{id:112,trait:'E',reverse:false,facet:'Cheerfulness'},
  {id:113,trait:'O',reverse:true,facet:'Liberalism'},{id:114,trait:'A',reverse:true,facet:'Sympathy'},
  {id:115,trait:'C',reverse:true,facet:'Cautiousness'},{id:116,trait:'N',reverse:true,facet:'Vulnerability'},
  {id:117,trait:'E',reverse:false,facet:'Cheerfulness'},{id:118,trait:'O',reverse:true,facet:'Liberalism'},
  {id:119,trait:'A',reverse:true,facet:'Sympathy'},{id:120,trait:'C',reverse:true,facet:'Cautiousness'},
];

const TRAIT_MAP: Record<string, keyof BigFiveScores> = {
  N: 'emotional_stability',
  E: 'extraversion',
  O: 'openness',
  A: 'agreeableness',
  C: 'conscientiousness',
};

export function scorePulseResponses(responses: Record<string, number>): BigFiveScores {
  const traitItems: Record<string, number[]> = { N: [], E: [], O: [], A: [], C: [] };

  for (const [key, value] of Object.entries(responses)) {
    if (!key.startsWith('ipip_')) continue;
    const id = parseInt(key.replace('ipip_', ''));
    const meta = IPIP_ITEMS.find(m => m.id === id);
    if (!meta) continue;
    const raw = meta.reverse ? (6 - value) : value;
    traitItems[meta.trait].push(raw);
  }

  const scores: BigFiveScores = {
    openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, emotional_stability: 0,
  };

  for (const [trait, items] of Object.entries(traitItems)) {
    if (items.length === 0) continue;
    const mean = items.reduce((a, b) => a + b, 0) / items.length;
    let score = mean * 20;
    if (trait === 'N') score = 100 - score;
    scores[TRAIT_MAP[trait]] = Math.round(score * 10) / 10;
  }

  return scores;
}
