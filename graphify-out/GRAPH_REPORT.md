# Graph Report - .  (2026-07-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 366 nodes · 623 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c80b0ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BaselineAssessment.tsx
- index.ts
- Cockpit.tsx
- react
- DashboardPage.tsx
- compilerOptions
- package.json
- devDependencies
- cockpitData.ts
- compilerOptions
- public/auth.js
- auth.js
- TrajectoryChart.tsx
- plugins
- public/supabase-config.js
- tsconfig.json
- vercel.json
- supabase-config.js
- serve.sh

## God Nodes (most connected - your core abstractions)
1. `react` - 29 edges
2. `compilerOptions` - 18 edges
3. `useAuth()` - 17 edges
4. `useDashboardState()` - 17 edges
5. `compilerOptions` - 15 edges
6. `BigFiveScores` - 12 edges
7. `Assessment` - 11 edges
8. `DemoPulse` - 10 edges
9. `requireAuth()` - 9 edges
10. `CompanyGroup` - 9 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useAuth()`  [EXTRACTED]
  atlas/src/App.tsx → atlas/src/hooks/useAuth.ts
- `BaselineAssessment()` --calls--> `useAuth()`  [EXTRACTED]
  atlas/src/components/baseline/BaselineAssessment.tsx → atlas/src/hooks/useAuth.ts
- `TraitMeta` --references--> `BigFiveScores`  [EXTRACTED]
  atlas/src/components/dashboard/charts/RadarChart.tsx → atlas/src/types/index.ts
- `RadarChartProps` --references--> `BigFiveScores`  [EXTRACTED]
  atlas/src/components/dashboard/charts/RadarChart.tsx → atlas/src/types/index.ts
- `TraitMeta` --references--> `BigFiveScores`  [EXTRACTED]
  atlas/src/components/dashboard/charts/TrajectoryChart.tsx → atlas/src/types/index.ts

## Import Cycles
- None detected.

## Communities (21 total, 5 thin omitted)

### Community 0 - "BaselineAssessment.tsx"
Cohesion: 0.06
Nodes (40): BaselineAssessment(), BaselineAssessmentProps, btnGhostStyle, btnPrimaryStyle, LIKERT_SCALE, Phase, SD3_SCALE, TRAIT_DESCRIPTIONS (+32 more)

### Community 1 - "index.ts"
Cohesion: 0.07
Nodes (33): ICARScore(), ICARScoreProps, SD3Bars(), SD3BarsProps, TRAIT_LABELS, ContextViewProps, TRAIT_CONFIG, buildHistogram() (+25 more)

### Community 2 - "Cockpit.tsx"
Cohesion: 0.08
Nodes (22): Cockpit(), COCKPIT_TABS, CockpitTab, ghostBtnStyle, inputStyle, labelStyle, MESSAGE_TEMPLATES, PIPELINE_STAGES (+14 more)

### Community 3 - "react"
Cohesion: 0.12
Nodes (16): App(), AuthGate(), Nav(), NAV_LINKS, NavProps, useAuth(), Theme, useTheme() (+8 more)

### Community 4 - "DashboardPage.tsx"
Cohesion: 0.15
Nodes (18): DataSourceToggle(), DataSourceToggleProps, ContextView(), DistributionView(), RhythmView(), TRAIT_CONFIG, TABS, ViewTabs() (+10 more)

### Community 5 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 6 - "package.json"
Cohesion: 0.09
Nodes (22): dependencies, d3, gsap, @gsap/react, react, react-dom, @supabase/supabase-js, name (+14 more)

### Community 7 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/d3, @types/node, @types/react, @types/react-dom (+13 more)

### Community 8 - "cockpitData.ts"
Cohesion: 0.17
Nodes (17): AI_NAMES, COMPANIES, Company, CompanyGroup, FASHION_RETAIL_NAMES, FILTER_GROUPS, INACTIVE_STATUSES, INTERNATIONAL_NAMES (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "public/auth.js"
Cohesion: 0.28
Nodes (12): addLogoutLink(), buildOverlay(), doSignIn(), doSignUp(), hideLoading(), hideOverlay(), injectCSS(), _notifyAuthed() (+4 more)

### Community 11 - "auth.js"
Cohesion: 0.28
Nodes (12): addLogoutLink(), buildOverlay(), doSignIn(), doSignUp(), hideLoading(), hideOverlay(), injectCSS(), _notifyAuthed() (+4 more)

### Community 12 - "TrajectoryChart.tsx"
Cohesion: 0.21
Nodes (11): cssVar(), DEMO_PHASES, derivePhases(), EmotionMeta, EMOTIONS, MARGIN, Phase, TRAITS (+3 more)

### Community 13 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

## Knowledge Gaps
- **134 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `BaselineAssessment.tsx`, `index.ts`, `Cockpit.tsx`, `DashboardPage.tsx`, `cockpitData.ts`, `TrajectoryChart.tsx`, `plugins`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `react`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `react` to `BaselineAssessment.tsx`, `Cockpit.tsx`, `DashboardPage.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BaselineAssessment.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0563265306122449 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07183673469387755 - nodes in this community are weakly interconnected._
- **Should `Cockpit.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08143939393939394 - nodes in this community are weakly interconnected._