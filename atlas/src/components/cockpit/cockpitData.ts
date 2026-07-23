// ── Static data for Cockpit: Companies + Interview Prep ──

// ── Companies ────────────────────────────────────────────────────
export interface Company {
  name: string;
  loc?: string;
  tier: string;
  commute?: string;
  why: string;
  url?: string;
  status: string;
}

export const COMPANIES: Company[] = [
  { name: 'Sword Health', loc: 'Porto', tier: 'A', commute: '54 km / 43 min', why: 'Healthtech unicorn ($2B+). Multi-market content needs. Your AI + localization fit. Warm contact: André Eiras.', url: 'https://jobs.lever.co/swordhealth', status: 'Monitor' },
  { name: 'Salsa Jeans', loc: 'Famalicão', tier: 'A', commute: '29 km / 26 min', why: 'Fashion e-commerce (Sonae Group). FARFETCH creative ops transfers directly. 29 km — inside the 50 km filter.', url: 'https://www.salsajeens.com/careers', status: 'Monitor' },
  { name: 'Parfois', loc: 'Porto HQ', tier: 'A', commute: '54 km / 43 min', why: 'Fast-fashion accessories, 800+ stores globally. Video Content Creator + Head of Buying posted.', url: 'https://www.parfois.com/careers', status: 'Monitor' },
  { name: 'Threads Styling', loc: 'Porto hub', tier: 'A', commute: '54 km / 43 min', why: '⚠️ PIVOTING — acquired by Chalhoub Group (Dubai) 2022, now \'new chapter coming soon,\' no open roles, careers page dead. Not actively hiring. Removed from active outreach.', url: 'https://www.threadsstyling.com', status: 'Inactive' },
  { name: 'Blip', loc: 'Porto', tier: 'A', commute: '54 km / 43 min', why: '⚠️ SOFTWARE HOUSE — betting/gaming tech (Entain). Their \'ops\' = DevOps/platform/sales ops, NOT creative ops. Only 2 roles open (General Interest + Social Specialist), neither creative. Kept for monitoring in case a brand/content role appears, but low priority.', url: 'https://boards.greenhouse.io/blip', status: 'Low priority' },
  { name: 'Unbabel', loc: 'Lisbon', tier: 'A', commute: '366 km / ~4h (remote only)', why: 'AI-powered language ops — DIRECT overlap with your ML translation 12-language work. Acquired by TransPerfect 2025 — careers page broken (redirects to dead staging subdomain). Contact via LinkedIn or unbabel.com directly.', url: 'https://unbabel.com', status: 'Monitor' },
  { name: 'Talkdesk', loc: 'Lisbon / Porto', tier: 'A', commute: 'Porto 54 km · Lisbon 366 km', why: '⚠️ SOFTWARE HOUSE — CX/contact-center SaaS. Their \'ops\' = RevOps/customer success/DevOps, NOT creative ops. Kept for monitoring in case a brand/marketing ops role appears, but low priority.', url: 'https://careers.talkdesk.com/', status: 'Low priority' },
  { name: 'Synthesia', loc: 'London, remote EU', tier: 'A', why: 'AI video — your Virtual Model playbook. No creative ops role right now but cold-message founders.', url: 'https://jobs.ashbyhq.com/synthesia', status: 'No fit now' },
  { name: 'LaLaLand', loc: 'Amsterdam', tier: 'A', why: '⚠️ ACQUIRED by Browzwear (Jul 2025) — no longer independent. Your exact Virtual Model playbook is now inside Browzwear. Consider approaching Browzwear directly instead.', url: 'https://www.browzwear.com', status: 'Acquired' },
  { name: 'Prozis', loc: 'Maia (Porto)', tier: 'A', commute: '48 km / 37 min', why: '⭐ D2C powerhouse — careers page explicitly lists in-house \'photo, video, 3D\' content production. Vertically integrated (concept→manufacturing→content). 23 open positions. ~1,000 employees, ~€190M revenue.', url: 'https://careers.prozis.com/en', status: 'Hiring' },
  { name: 'Sonae MC (Continente)', loc: 'Maia (Porto)', tier: 'A', commute: '48 km / 37 min', why: 'Portugal\'s largest food retailer. Has a \'Digital & Content Marketing Director\' function — established content ops. Massive private-label content needs. ~50,000 employees (Sonae Group).', url: 'https://www.sonae.pt/en/people/opportunities-of-career/', status: 'Monitor' },
  { name: 'Worten', loc: 'Maia (Porto)', tier: 'A', commute: '48 km / 37 min', why: 'Leading PT electronics marketplace (6M+ monthly visits, 3,000+ sellers). Retail media content production: \'studio-quality 360° photography, infographics, A+ content.\' Marketplace content supply chain = direct Farfetch transfer.', url: 'https://www.worten.pt/', status: 'Monitor' },
  { name: 'Sonae SR (MO/Sport Zone/Zippy)', loc: 'Maia (Porto)', tier: 'A', commute: '48 km / 37 min', why: 'Multi-brand fashion portfolio (MO, Zippy, Sport Zone, Dott) — 500+ stores. E-commerce content production across multiple brands. Direct parallel to Farfetch\'s multi-brand model. ~€2B+ turnover.', url: 'https://www.sonae.pt/en/people/opportunities-of-career/', status: 'Monitor' },
  { name: 'Inditex (Zara etc.)', loc: 'Lisbon creative hub', tier: 'A', commute: '366 km / ~4h (remote/Lisbon only)', why: 'World\'s largest fashion retailer. Confirmed Lisbon creative hub — \'photography and digital production\' teams. One of the largest in-house creative content operations globally. 165,000+ employees, €35B+ revenue.', url: 'https://talent.inditexpeople.com/en/creatives/', status: 'Monitor' },
  { name: 'H&M Group', loc: 'Lisbon', tier: 'A', commute: '366 km / ~4h (remote/Lisbon only)', why: 'Documented \'Creative Production Brand team\' with PT hiring. One of the largest in-house creative production operations in fashion. ~120,000 employees, €20B+ revenue.', url: 'https://career.hm.com/search/', status: 'Monitor' },
  { name: 'Vista Alegre Atlantis', loc: 'Ílhavo (Aveiro)', tier: 'A', commute: '128 km / 93 min — beyond 50 km filter', why: '200-year heritage brand, global designer collaborations. Premium product content at scale. Actually near Aveiro (~1.5h south), NOT near Porto despite the \'Porto region\' label.', url: 'https://www.vistaalegre.com/en/careers', status: 'Monitor' },
  { name: 'Chalhoub Group', loc: 'Dubai / London (Porto hub uncertain)', tier: 'A', why: '⭐ WARM CONTACT — you worked with them via Level Shoes at FARFETCH. Largest luxury retail operator in Middle East (~14,000 employees, $3B+ revenue, 750+ stores). Building in-house creative studio \'OneStudio\' + AI campaigns. Threads Styling (acquired 2022) in \'new chapter\' relaunch under new CEO Mo White. No senior creative ops role posted, but warm contact makes direct conversation viable. Key contacts: Patrick Chalhoub (Exec Chairman, led FARFETCH JV), David Vercruysse (President, oversees Level Shoes), Mo White (Threads CEO).', url: 'https://careers.chalhoubgroup.com/jobs', status: 'Warm contact' },
  { name: 'The Fabricant', loc: 'Amsterdam', tier: 'A', why: '3D digital fashion production. Contact founder Kerry Murphy.', url: 'https://www.thefabricant.ai', status: 'Reach out' },
  { name: 'Bigthinx', loc: 'Milan', tier: 'A', why: 'AI fashion tech. Contact founders directly.', url: 'https://www.bigthinx.com', status: 'Reach out' },
  { name: 'Vinted', loc: 'Berlin/Vilnius', tier: 'A', why: 'Marketplace creative ops. Posted \'Creative Ops Mgr\' before.', url: 'https://careers.vinted.com', status: 'Monitor' },
  { name: 'Back Market', loc: 'Paris', tier: 'A', why: 'Refurbished electronics marketplace, Series D.', url: 'https://www.backmarket.com/careers', status: 'Monitor' },
  { name: 'Adobe', loc: 'San Jose / remote', tier: 'B', why: 'Director Content Operations, Content Supply Chain roles.', url: 'https://www.adobe.com/careers.html', status: 'Monitor' },
  { name: 'Netflix', loc: 'EMEA', tier: 'B', why: 'VP Regional Head of Creative Production EMEA.', url: 'https://jobs.netflix.com', status: 'Monitor' },
  { name: 'Nike', loc: 'remote / EU', tier: 'B', why: 'Senior Director Creative Operations.', url: 'https://jobs.nike.com', status: 'Monitor' },
  { name: 'Shopify', loc: 'remote', tier: 'B', why: 'Creative Operations Lead.', url: 'https://www.shopify.com/careers', status: 'Monitor' },
];

// companyGroup: categorize a company into a filter group
export type CompanyGroup = 'all' | 'active' | 'portugal' | 'luxury' | 'ai-content' | 'fashion-retail' | 'marketplace' | 'international' | 'inactive';

const PT_NAMES = new Set([
  'Sword Health', 'Salsa Jeans', 'Parfois', 'Blip', 'Unbabel', 'Talkdesk',
  'Prozis', 'Sonae MC (Continente)', 'Worten', 'Sonae SR (MO/Sport Zone/Zippy)',
  'Vista Alegre Atlantis', 'Threads Styling',
]);

const AI_NAMES = new Set(['Synthesia', 'LaLaLand', 'The Fabricant', 'Bigthinx']);
const FASHION_RETAIL_NAMES = new Set(['Inditex (Zara etc.)', 'H&M Group', 'Nike']);
const MARKETPLACE_NAMES = new Set(['Vinted', 'Back Market', 'Shopify']);
const INTERNATIONAL_NAMES = new Set(['Chalhoub Group', 'Adobe', 'Netflix']);

const INACTIVE_STATUSES = new Set(['Inactive', 'Acquired', 'Low priority']);

export function companyGroup(c: Company): Exclude<CompanyGroup, 'all'> {
  if (INACTIVE_STATUSES.has(c.status)) return 'inactive';
  if (PT_NAMES.has(c.name)) return 'portugal';
  if (AI_NAMES.has(c.name)) return 'ai-content';
  if (FASHION_RETAIL_NAMES.has(c.name)) return 'fashion-retail';
  if (MARKETPLACE_NAMES.has(c.name)) return 'marketplace';
  if (INTERNATIONAL_NAMES.has(c.name)) return 'international';
  return 'portugal';
}

export const FILTER_GROUPS: { key: CompanyGroup; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'portugal', label: 'Portugal' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'ai-content', label: 'AI Content' },
  { key: 'fashion-retail', label: 'Fashion Retail' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'international', label: 'International' },
  { key: 'inactive', label: 'Inactive' },
];

// ── Interview Prep ────────────────────────────────────────────────
export interface InterviewQA {
  q: string;
  a: string;
}

export const INTERVIEW: InterviewQA[] = [
  {
    q: 'Do you know what you want?',
    a: "Yes. I want to lead creative operations at scale — building and running the engine that turns product into content across markets, efficiently, with technology.\n\nFor most of my 15 years at FARFETCH, I built that engine in the analog, non-AI world — scaling production, teams, and processes the hard way. Then in the last 4-5 years, we started the journey of automation and AI, and that changed everything. Virtual Model technology, ML translation across 12 languages, automating 80% of product categorization — we cut operational spend from 10% to 1% of sales. That experience was incredible, and it's what I need to continue. There is so much more to build in this space.\n\nBut I need to be honest about why I left. The last 3 years at FARFETCH became entirely about cutting cost — to the point where the company was fighting for survival. My creative brain was drained. I'm not someone who can operate in pure cost-cutting mode indefinitely; my value is in building, not just stripping. So I took time off to breathe and feed my brain again — through the furniture studio, where I could imagine, design, and build with my own hands. That labor of love restored what the final years had depleted.\n\nWhat I don't want is a purely strategic role disconnected from the operational engine, or a creative-director role focused on aesthetics. My value is at the intersection — where creative quality meets operational discipline, especially now with AI and automation transforming what's possible. I'm open on industry — fashion is my native language, but content supply chains exist everywhere. I'm based in Portugal, open to remote or Porto-area roles, and I'm ready to start.",
  },
  {
    q: 'Why did you leave Farfetch / what have you been doing?',
    a: "For most of my 15 years at FARFETCH, I built creative operations in the analog world — scaling production, teams, and processes the hard way. In the last 4-5 years, we started the AI and automation journey, and that was an incredible experience — Virtual Model tech, ML translation, 80% automation. I feel like I need to continue that work; there's so much more to build.\n\nBut the last 3 years became almost entirely about cutting cost — the company was fighting for survival. My creative brain was drained. I'm a builder, not a cost-cutter, and operating in that mode indefinitely isn't where I create value. So I left, and I took time to breathe and feed my brain again — through Rui Silva Studio, a furniture practice where I could imagine, design, and build with my own hands. That labor of love restored what the final years had depleted.\n\nThe studio is a side venture I keep running when time allows. It confirmed something I already knew: I love the craft, but my real edge is at scale — leading the creative engine that makes craft possible at industrial scale, especially now with AI transforming what's possible. That's what I'm looking to do next.",
  },
  {
    q: 'Tell me about yourself',
    a: "I started in textile and graphic design, then joined FARFETCH early and spent 15 years there, rising from Production Manager to SVP of Creative Operations. For most of those years I built the engine in the analog, non-AI world — scaling production, teams, and processes the hard way. Then in the last 4-5 years we started the AI and automation journey, and that changed everything — Virtual Model tech, ML translation, 80% automation, cutting spend from 10% to 1% of sales. That experience was incredible and it's what I need to continue.\n\nThe last 3 years became almost entirely about cost-cutting — the company was fighting for survival. My creative brain was drained. I'm a builder, not a cost-cutter. So I took time off to breathe and feed my brain again — through a furniture studio where I could imagine, design, and build with my own hands. That labor of love restored what the final years had depleted, and it confirmed what I already knew: I love the craft, but my real edge is at scale, especially now with AI transforming what's possible. That's what I'm looking to do next.",
  },
  {
    q: "What's a weakness / blind spot?",
    a: "My drive for quality and precision is my biggest strength, and I've learned to watch it. Earlier in my career I could over-control under pressure — I've gotten better at distinguishing where precision matters (luxury quality, SLAs) and where 'good and done' beats 'perfect and late.' 360° feedback also showed me I under-claim my work — others consistently rated me higher than I rated myself. I'm learning to claim achievements plainly.",
  },
];
