#!/usr/bin/env python3
"""Build the iteration-3 personality dashboard HTML with enriched data."""
import json

# Read the enriched data
with open('/home/rui/career-kb/enriched-personality-data.json') as f:
    data = json.load(f)

# Convert to JS array literal (compact)
data_js = json.dumps(data, separators=(',', ':'))

html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Personality Atlas — Longitudinal Insight Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #18120e;
    --bg-elevated: #1f1813;
    --bg-surface: #251d17;
    --bg-surface-2: #2c241c;
    --border: #3a2f25;
    --border-light: #4a3d31;
    --ink: #e8dfd3;
    --ink-muted: #a89a87;
    --ink-dim: #756657;
    --ink-faint: #4a3f36;
    --accent: #d4a574;
    --accent-bright: #e8b884;
    --accent-dim: #8a6f4e;
    --signal: #7ba89b;
    --signal-bright: #9ec9b8;
    --danger: #c97757;
    --danger-bright: #d98a6a;
    --warn: #c4a96a;
    --serif: 'Fraunces', Georgia, serif;
    --sans: 'IBM Plex Sans', system-ui, sans-serif;
    --mono: 'IBM Plex Mono', ui-monospace, monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  body {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,165,116,0.04), transparent),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(123,168,155,0.03), transparent),
      var(--bg);
  }
  ::selection { background: rgba(212,165,116,0.25); }
  .dashboard { max-width: 1480px; margin: 0 auto; padding: 32px 40px 80px; }
  /* Header */
  .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 28px; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .header-left { display: flex; flex-direction: column; gap: 6px; }
  .header-label { font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); opacity: 0.8; }
  .header-title { font-family: var(--serif); font-size: 38px; font-weight: 400; line-height: 1.1; color: var(--ink); letter-spacing: -0.01em; font-variation-settings: "opsz" 60; }
  .header-subtitle { font-size: 13px; color: var(--ink-muted); max-width: 540px; line-height: 1.6; margin-top: 4px; }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; text-align: right; }
  .subject-name { font-family: var(--serif); font-size: 17px; font-weight: 500; color: var(--ink); font-variation-settings: "opsz" 30; }
  .subject-meta { font-family: var(--mono); font-size: 11px; color: var(--ink-dim); letter-spacing: 0.05em; }
  .live-indicator { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--signal); margin-top: 4px; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--signal-bright); box-shadow: 0 0 8px var(--signal-bright); animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
  /* View Tabs */
  .view-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 1px solid var(--border); }
  .view-tab { background: none; border: none; color: var(--ink-dim); font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 12px 20px 14px; cursor: pointer; position: relative; transition: color 0.3s ease; }
  .view-tab:hover { color: var(--ink-muted); }
  .view-tab.active { color: var(--accent); }
  .view-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--accent); }
  .view-tab-num { font-size: 10px; opacity: 0.5; margin-right: 6px; }
  .view-panel { display: none; }
  .view-panel.active { display: block; }
  .grid { display: grid; gap: 20px; }
  .grid-trajectory { grid-template-columns: 1fr 340px; grid-template-rows: auto auto; }
  .grid-distribution { grid-template-columns: 1fr 1fr; }
  .grid-context { grid-template-columns: 1fr 1fr; }
  .card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 4px; padding: 24px; position: relative; overflow: hidden; }
  .card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; gap: 12px; }
  .card-title { font-family: var(--serif); font-size: 16px; font-weight: 500; color: var(--ink); font-variation-settings: "opsz" 24; display: flex; align-items: center; gap: 8px; }
  .card-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-dim); }
  .card-subtitle { font-size: 12px; color: var(--ink-muted); margin-top: 2px; margin-bottom: 16px; }
  .trait-legend { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 16px; }
  .legend-item { display: flex; align-items: center; gap: 7px; cursor: pointer; transition: opacity 0.2s; user-select: none; }
  .legend-item:hover { opacity: 0.8; }
  .legend-item.dimmed { opacity: 0.35; }
  .legend-swatch { width: 14px; height: 3px; border-radius: 1px; }
  .legend-label { font-family: var(--mono); font-size: 11px; color: var(--ink-muted); letter-spacing: 0.03em; }
  .chart-container { position: relative; width: 100%; }
  .chart-container svg { display: block; width: 100%; }
  /* Info tooltip system */
  .info-icon { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: var(--bg-surface-2); border: 1px solid var(--border-light); color: var(--ink-dim); font-size: 10px; font-family: var(--sans); cursor: pointer; vertical-align: middle; margin-left: 4px; transition: all 0.2s; flex-shrink: 0; }
  .info-icon:hover { color: var(--accent); border-color: var(--accent-dim); background: rgba(212,165,116,0.1); }
  .info-popover { position: absolute; background: var(--bg-surface-2); border: 1px solid var(--border-light); border-radius: 4px; padding: 12px 16px; font-family: var(--sans); font-size: 12px; color: var(--ink-muted); line-height: 1.6; z-index: 200; min-width: 220px; max-width: 320px; box-shadow: 0 6px 24px rgba(0,0,0,0.5); opacity: 0; pointer-events: none; transition: opacity 0.2s; }
  .info-popover.visible { opacity: 1; pointer-events: auto; }
  .info-popover strong { color: var(--accent); font-weight: 500; display: block; margin-bottom: 4px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
  .info-popover p { margin-bottom: 6px; }
  .info-popover p:last-child { margin-bottom: 0; }
  .info-popover .info-warn { color: var(--warn); font-style: italic; }
  /* Time Scrubber */
  .time-scrubber { margin-top: 16px; padding: 16px 0 4px; border-top: 1px solid var(--border); }
  .scrubber-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .scrubber-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-dim); }
  .scrubber-date { font-family: var(--serif); font-size: 14px; color: var(--accent); font-variation-settings: "opsz" 20; font-weight: 500; }
  .scrubber-track { position: relative; height: 36px; cursor: pointer; }
  .scrubber-rail { position: absolute; top: 50%; left: 0; right: 0; height: 4px; background: var(--bg-surface-2); border-radius: 2px; transform: translateY(-50%); }
  .scrubber-fill { position: absolute; top: 50%; left: 0; height: 4px; background: linear-gradient(90deg, var(--accent-dim), var(--accent)); border-radius: 2px; transform: translateY(-50%); transition: width 0.15s ease; }
  .scrubber-handle { position: absolute; top: 50%; width: 16px; height: 28px; background: var(--accent); border-radius: 3px; transform: translate(-50%, -50%); cursor: grab; box-shadow: 0 0 12px rgba(212,165,116,0.5), 0 2px 8px rgba(0,0,0,0.3); transition: left 0.15s ease, box-shadow 0.2s, transform 0.15s; border: 2px solid var(--accent-bright); z-index: 10; }
  .scrubber-handle::before { content: ''; position: absolute; top: 50%; left: 50%; width: 2px; height: 12px; background: var(--bg); border-radius: 1px; transform: translate(-50%, -50%); }
  .scrubber-track:hover .scrubber-handle { box-shadow: 0 0 16px rgba(212,165,116,0.7), 0 2px 12px rgba(0,0,0,0.4); transform: translate(-50%, -50%) scale(1.1); }
  .scrubber-handle:active { cursor: grabbing; }
  .scrubber-marks { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
  .scrubber-mark { position: absolute; top: 50%; width: 1px; height: 8px; background: var(--ink-faint); transform: translateY(-50%); }
  .scrubber-mark.phase { height: 16px; width: 2px; background: var(--accent-dim); top: 30%; }
  .scrubber-mark-label { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); font-family: var(--mono); font-size: 9px; color: var(--ink-dim); white-space: nowrap; margin-top: 6px; letter-spacing: 0.05em; }
  .scrubber-mark.phase .scrubber-mark-label { color: var(--accent); font-weight: 500; }
  /* Radar Panel */
  .radar-panel { grid-row: span 2; display: flex; flex-direction: column; }
  .radar-container { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 280px; }
  .radar-meta { margin-top: 12px; display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border); }
  .radar-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .radar-meta-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-dim); }
  .radar-meta-value { font-family: var(--serif); font-size: 14px; color: var(--ink); font-variation-settings: "opsz" 20; }
  /* Phase markers on timeline */
  .phase-bar { display: flex; gap: 0; margin-top: 12px; height: 28px; border-radius: 3px; overflow: hidden; border: 1px solid var(--border); }
  .phase-segment { display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; cursor: default; transition: opacity 0.2s; position: relative; }
  .phase-segment:hover { opacity: 0.85; }
  .phase-segment.active { box-shadow: inset 0 0 0 2px var(--accent); z-index: 2; }
  .phase-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: var(--bg-surface-2); border: 1px solid var(--border-light); border-radius: 3px; padding: 6px 10px; font-family: var(--sans); font-size: 11px; color: var(--ink-muted); white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; margin-bottom: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 20; letter-spacing: 0; text-transform: none; }
  .phase-segment:hover .phase-tooltip { opacity: 1; }
  /* Trajectory mode toggle */
  .traj-toggle { display: flex; gap: 0; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
  .traj-toggle-btn { background: var(--bg-surface); border: none; color: var(--ink-dim); font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; cursor: pointer; transition: all 0.2s; }
  .traj-toggle-btn:hover { color: var(--ink-muted); }
  .traj-toggle-btn.active { background: var(--accent-dim); color: var(--ink); }
  /* Insight Strip */
  .insight-strip { margin-top: 20px; padding: 20px 24px; background: linear-gradient(135deg, rgba(212,165,116,0.06), rgba(123,168,155,0.04)); border: 1px solid var(--border); border-left: 2px solid var(--accent); border-radius: 4px; }
  .insight-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
  .insight-text { font-family: var(--serif); font-size: 16px; color: var(--ink); line-height: 1.55; font-variation-settings: "opsz" 28; font-weight: 400; }
  .insight-text .highlight { color: var(--accent-bright); font-weight: 500; }
  .insight-text .signal { color: var(--signal-bright); font-weight: 500; }
  .insight-text .danger { color: var(--danger-bright); font-weight: 500; }
  /* Distribution View */
  .dist-card { display: flex; flex-direction: column; cursor: pointer; }
  .dist-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .dist-name { font-family: var(--serif); font-size: 15px; font-weight: 500; color: var(--ink); font-variation-settings: "opsz" 24; }
  .dist-stats { display: flex; gap: 16px; font-family: var(--mono); font-size: 11px; color: var(--ink-dim); }
  .dist-stat-value { color: var(--ink-muted); }
  .facet-expand { max-height: 0; overflow: hidden; transition: max-height 0.5s ease; }
  .facet-expand.open { max-height: 600px; }
  .facet-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-top: 1px solid var(--border); }
  .facet-label-col { width: 150px; flex-shrink: 0; }
  .facet-name { font-family: var(--sans); font-size: 12px; color: var(--ink-muted); font-weight: 500; }
  .facet-note { font-family: var(--mono); font-size: 9px; color: var(--warn); letter-spacing: 0.05em; margin-top: 2px; }
  .facet-mini-chart { flex: 1; min-width: 0; }
  /* Context View */
  .context-heatmap { display: grid; grid-template-columns: 140px repeat(5, 1fr); gap: 2px; margin-top: 16px; }
  .context-corner { background: transparent; }
  .context-trait-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.05em; color: var(--ink-muted); display: flex; align-items: center; padding: 8px 12px 8px 0; border-bottom: 1px solid var(--border); }
  .context-col-header { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-dim); text-align: center; padding: 8px 4px; border-bottom: 1px solid var(--border); }
  .context-cell { display: flex; align-items: center; justify-content: center; padding: 10px 4px; border-bottom: 1px solid var(--border); position: relative; }
  .context-bar { width: 100%; height: 24px; border-radius: 1px; background: var(--bg-surface); position: relative; overflow: hidden; }
  .context-bar-fill { position: absolute; left: 50%; top: 0; bottom: 0; border-radius: 1px; transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
  .context-cell-value { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--mono); font-size: 10px; color: var(--ink); z-index: 1; }
  /* Raw context tags */
  .raw-tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .raw-tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; font-family: var(--mono); font-size: 11px; color: var(--ink-muted); cursor: pointer; transition: all 0.2s; user-select: none; }
  .raw-tag:hover { border-color: var(--accent-dim); color: var(--ink); }
  .raw-tag.active { background: var(--accent-dim); color: var(--ink); border-color: var(--accent); }
  .raw-tag .tag-count { font-size: 9px; color: var(--ink-dim); opacity: 0.7; }
  .raw-tag.active .tag-count { color: var(--ink); }
  .raw-tag-desc { font-family: var(--mono); font-size: 10px; color: var(--ink-dim); letter-spacing: 0.03em; }
  /* DIAMONDS comparison */
  .diamonds-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
  .diamond-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px; padding: 14px; }
  .diamond-name { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .diamond-compare { display: flex; gap: 8px; align-items: flex-end; height: 80px; }
  .diamond-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .diamond-bar-wrap { width: 100%; height: 60px; display: flex; align-items: flex-end; }
  .diamond-bar { width: 100%; border-radius: 2px 2px 0 0; transition: height 0.6s ease; min-height: 2px; }
  .diamond-bar-label { font-family: var(--mono); font-size: 8px; color: var(--ink-dim); letter-spacing: 0.03em; }
  .diamond-bar-val { font-family: var(--mono); font-size: 9px; color: var(--ink-muted); }
  /* Rhythm View */
  .rhythm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .rhythm-grid-2 { grid-template-columns: 1fr 1fr; }
  .radial-chart-wrap { display: flex; flex-direction: column; align-items: center; }
  .radial-title { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); margin-top: 8px; }
  .emotion-heatmap-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .emotion-heatmap-table th { font-family: var(--mono); font-size: 9px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-dim); padding: 6px 4px; text-align: center; border-bottom: 1px solid var(--border); }
  .emotion-heatmap-table td { padding: 0; }
  .heatmap-cell { height: 32px; display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 10px; color: var(--ink); border: 1px solid var(--bg-elevated); transition: transform 0.15s; }
  .heatmap-cell:hover { transform: scale(1.08); z-index: 5; position: relative; }
  .heatmap-row-label { font-family: var(--mono); font-size: 10px; color: var(--ink-muted); text-align: right; padding: 6px 8px 6px 0; white-space: nowrap; }
  /* Tooltip */
  .tooltip { position: absolute; background: var(--bg-surface-2); border: 1px solid var(--border-light); border-radius: 3px; padding: 10px 14px; font-family: var(--mono); font-size: 11px; color: var(--ink); pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 100; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  .tooltip.visible { opacity: 1; }
  .tooltip-label { color: var(--ink-dim); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
  .tooltip-value { color: var(--accent); font-size: 13px; font-weight: 500; }
  /* Footer */
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-dim); }
  .footer a { color: var(--accent-dim); text-decoration: none; }
  .fade-in { opacity: 0; transform: translateY(8px); }
  @media (max-width: 1100px) {
    .grid-trajectory, .grid-distribution, .grid-context, .rhythm-grid, .rhythm-grid-2 { grid-template-columns: 1fr; }
    .radar-panel { grid-row: auto; }
    .dashboard { padding: 20px 20px 60px; }
    .header { flex-direction: column; gap: 16px; }
    .header-right { align-items: flex-start; text-align: left; }
    .diamonds-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>
</head>
<body>
<div class="dashboard" id="dashboard">
  <header class="header fade-in" id="header">
    <div class="header-left">
      <div class="header-label">Longitudinal Personality Atlas</div>
      <h1 class="header-title">Who You Are Becoming</h1>
      <p class="header-subtitle">
        158 experience pulses across 43 days. This is not a snapshot — it is a trajectory.
        Five personality dimensions, ten emotions, eight situational dimensions, and fifteen facets —
        the full shape of personality expression over time.
      </p>
    </div>
    <div class="header-right">
      <div class="subject-name">Participant 221</div>
      <div class="subject-meta">Big Five State Assessment · 4x daily for 43 days</div>
      <div class="subject-meta">158 pulses · 15 facets · 10 emotions · 8 situational dims</div>
      <div class="live-indicator">
        <span class="live-dot"></span>
        <span>Dec 2019 — Jan 2020</span>
      </div>
    </div>
  </header>

  <nav class="view-tabs fade-in" id="viewTabs">
    <button class="view-tab active" data-view="trajectory"><span class="view-tab-num">01</span>Trajectory</button>
    <button class="view-tab" data-view="distribution"><span class="view-tab-num">02</span>Distribution</button>
    <button class="view-tab" data-view="context"><span class="view-tab-num">03</span>Context</button>
    <button class="view-tab" data-view="rhythm"><span class="view-tab-num">04</span>Rhythm</button>
  </nav>

  <!-- Trajectory View -->
  <div class="view-panel active" id="view-trajectory">
    <div class="grid grid-trajectory">
      <div class="card fade-in" id="trajectoryCard">
        <div class="card-header">
          <div>
            <div class="card-label">View 01 / Trajectory</div>
            <div class="card-title">Trait Evolution Over 43 Days<span class="info-icon" data-info="traj" onclick="toggleInfoPopover(event, 'traj')">&#9432;</span></div>
          </div>
          <div class="traj-toggle">
            <button class="traj-toggle-btn active" data-mode="traits" onclick="setTrajectoryMode('traits')">Traits</button>
            <button class="traj-toggle-btn" data-mode="emotions" onclick="setTrajectoryMode('emotions')">Emotions</button>
          </div>
        </div>
        <div class="trait-legend" id="trajectoryLegend"></div>
        <div class="chart-container" id="trajectoryChart"></div>
        <div class="time-scrubber">
          <div class="scrubber-header">
            <div class="scrubber-label">Timeline · Drag to scrub</div>
            <div class="scrubber-date" id="scrubberDate">&mdash;</div>
          </div>
          <div class="scrubber-track" id="scrubberTrack">
            <div class="scrubber-rail"></div>
            <div class="scrubber-fill" id="scrubberFill"></div>
            <div class="scrubber-marks" id="scrubberMarks"></div>
            <div class="scrubber-handle" id="scrubberHandle"></div>
          </div>
          <div class="phase-bar" id="phaseBar"></div>
        </div>
      </div>

      <div class="card radar-panel fade-in" id="radarCard">
        <div class="card-header">
          <div>
            <div class="card-label">Personality Morphology</div>
            <div class="card-title" id="radarTitle">Shape at Pulse 1</div>
          </div>
        </div>
        <div class="radar-container">
          <div class="chart-container" id="radarChart"></div>
        </div>
        <div class="radar-meta">
          <div class="radar-meta-item">
            <span class="radar-meta-label">&Delta; from Start</span>
            <span class="radar-meta-value" id="radarDelta">&mdash;</span>
          </div>
          <div class="radar-meta-item">
            <span class="radar-meta-label">Phase</span>
            <span class="radar-meta-value" id="radarPhase">&mdash;</span>
          </div>
          <div class="radar-meta-item">
            <span class="radar-meta-label">Contexts</span>
            <span class="radar-meta-value" id="radarContexts">&mdash;</span>
          </div>
        </div>
      </div>
    </div>
    <div class="insight-strip fade-in" id="trajectoryInsight">
      <div class="insight-label">Key Insight &middot; Generated from 158 data points</div>
      <p class="insight-text" id="trajectoryInsightText"></p>
    </div>
  </div>

  <!-- Distribution View -->
  <div class="view-panel" id="view-distribution">
    <div class="card fade-in" style="margin-bottom: 20px;">
      <div class="card-header">
        <div>
          <div class="card-label">View 02 / Distribution</div>
          <div class="card-title">Density Distributions &mdash; The Shape of Personality<span class="info-icon" data-info="dist" onclick="toggleInfoPopover(event, 'dist')">&#9432;</span></div>
        </div>
        <div class="card-label">Whole Trait Theory &middot; Fleeson (2001)</div>
      </div>
      <p class="card-subtitle" style="margin-bottom: 24px; max-width: 700px;">
        A trait is not a point &mdash; it is a distribution of states. Two people with the same average score can have radically different shapes. Width = adaptability (or instability). Skew = tendency. The shape is the signal. <span style="color: var(--accent); font-weight: 500;">Click any chart to reveal its facets.</span>
      </p>
    </div>
    <div class="grid grid-distribution" id="distributionGrid"></div>
    <div class="insight-strip fade-in" style="margin-top: 20px;" id="distributionInsight">
      <div class="insight-label">Distribution Insight</div>
      <p class="insight-text" id="distributionInsightText"></p>
    </div>
  </div>

  <!-- Context View -->
  <div class="view-panel" id="view-context">
    <div class="card fade-in" style="margin-bottom: 20px;">
      <div class="card-header">
        <div>
          <div class="card-label">View 03 / Context</div>
          <div class="card-title">Context Sensitivity &mdash; How Traits Shift Across Environments<span class="info-icon" data-info="ctx-heatmap" onclick="toggleInfoPopover(event, 'ctx-heatmap')">&#9432;</span></div>
        </div>
        <div class="card-label">Contextualized Personality &middot; Holtrop (2025)</div>
      </div>
      <p class="card-subtitle" style="max-width: 700px;">
        The same person, measured across contexts. The variance across contexts is itself a stable individual difference. Large gaps reveal where your personality flexes &mdash; and where it doesn't.
      </p>
      <div class="context-heatmap" id="contextHeatmap"></div>
    </div>

    <!-- Raw Context Tags -->
    <div class="card fade-in" style="margin-bottom: 20px;">
      <div class="card-header">
        <div>
          <div class="card-label">Raw Situation Tags</div>
          <div class="card-title">Where You Were &mdash; Tag Frequency<span class="info-icon" data-info="raw-tags" onclick="toggleInfoPopover(event, 'raw-tags')">&#9432;</span></div>
        </div>
      </div>
      <p class="card-subtitle" style="max-width: 700px;">
        Each pulse was tagged with raw situation markers from the participant. Hover a tag to see how often it appeared. Click to highlight those pulses on the timeline.
      </p>
      <div class="raw-tags-container" id="rawTagsContainer"></div>
      <div class="raw-tag-desc" id="rawTagDesc" style="margin-top: 12px;"></div>
    </div>

    <div class="grid grid-context">
      <div class="card fade-in">
        <div class="card-header">
          <div>
            <div class="card-label">Context Variance</div>
            <div class="card-title">Where You Flex Most<span class="info-icon" data-info="variance" onclick="toggleInfoPopover(event, 'variance')">&#9432;</span></div>
          </div>
        </div>
        <div class="chart-container" id="varianceChart"></div>
      </div>
      <div class="card fade-in">
        <div class="card-header">
          <div>
            <div class="card-label">Stress Response Profile</div>
            <div class="card-title">Under Stress &mdash; Trait Delta<span class="info-icon" data-info="stress" onclick="toggleInfoPopover(event, 'stress')">&#9432;</span></div>
          </div>
        </div>
        <div class="chart-container" id="stressChart"></div>
      </div>
    </div>

    <!-- DIAMONDS Section -->
    <div class="card fade-in" style="margin-top: 20px;">
      <div class="card-header">
        <div>
          <div class="card-label">Situational Dimensions &middot; DIAMONDS</div>
          <div class="card-title">How Your Environment Shapes You<span class="info-icon" data-info="diamonds" onclick="toggleInfoPopover(event, 'diamonds')">&#9432;</span></div>
        </div>
        <div class="card-label">Rauthmann et al. (2014)</div>
      </div>
      <p class="card-subtitle" style="max-width: 700px;">
        The DIAMONDS model captures eight situational dimensions. For each, we compare your average trait scores when that dimension is <strong>high</strong> vs <strong>low</strong> (above/below its median). The gap shows where your environment pulls you.
      </p>
      <div class="diamonds-grid" id="diamondsGrid"></div>
    </div>

    <div class="insight-strip fade-in" style="margin-top: 20px;" id="contextInsight">
      <div class="insight-label">Context Insight</div>
      <p class="insight-text" id="contextInsightText"></p>
    </div>
  </div>

  <!-- Rhythm View (NEW) -->
  <div class="view-panel" id="view-rhythm">
    <div class="card fade-in" style="margin-bottom: 20px;">
      <div class="card-header">
        <div>
          <div class="card-label">View 04 / Rhythm</div>
          <div class="card-title">Time of Day &mdash; Your Circadian Personality Signature<span class="info-icon" data-info="rhythm" onclick="toggleInfoPopover(event, 'rhythm')">&#9432;</span></div>
        </div>
        <div class="card-label">Diurnal Variation &middot; 4 sampling times</div>
      </div>
      <p class="card-subtitle" style="max-width: 700px;">
        Personality is not fixed across the day. Each trait and emotion has its own circadian signature. Knowing when you peak can help you schedule around your natural rhythms.
      </p>
    </div>
    <div class="grid rhythm-grid" id="rhythmRadialGrid"></div>
    <div class="card fade-in" style="margin-top: 20px;">
      <div class="card-header">
        <div>
          <div class="card-label">Emotion Heatmap</div>
          <div class="card-title">Emotional Rhythm Across the Day<span class="info-icon" data-info="rhythm-heatmap" onclick="toggleInfoPopover(event, 'rhythm-heatmap')">&#9432;</span></div>
        </div>
      </div>
      <div id="emotionHeatmapContainer"></div>
    </div>
    <div class="insight-strip fade-in" style="margin-top: 20px;" id="rhythmInsight">
      <div class="insight-label">Rhythm Insight</div>
      <p class="insight-text" id="rhythmInsightText"></p>
    </div>
  </div>

  <footer class="footer fade-in">
    <span>Personality Atlas &middot; Prototype &middot; Real ESM Data</span>
    <span>Data: Beck &amp; Jackson (2022), openESM database &middot; CC BY-NC 4.0 &middot; Participant 221</span>
  </footer>
  <div class="tooltip" id="tooltip"></div>
  <div class="info-popover" id="infoPopover"></div>
</div>

<script>
const ENRICHED_DATA = __ENRICHED_DATA__;

/* ============================================================
   TRAIT CONFIGURATION
   ============================================================ */
const TRAITS = [
  { key: 'openness',          label: 'Openness',            short: 'OPEN',  color: '#d4a574', dataKey: 'openness' },
  { key: 'conscientiousness', label: 'Conscientiousness',   short: 'CONSC', color: '#7ba89b', dataKey: 'conscientiousness' },
  { key: 'extraversion',      label: 'Extraversion',        short: 'EXTRA', color: '#c4a96a', dataKey: 'extraversion' },
  { key: 'agreeableness',     label: 'Agreeableness',       short: 'AGREE', color: '#a07c5c', dataKey: 'agreeableness' },
  { key: 'stability',         label: 'Emotional Stability', short: 'STAB',  color: '#9ec9b8', dataKey: 'emotional_stability' },
];

const EMOTIONS = [
  { key: 'happy',      label: 'Happy',      color: '#e8b884', group: 'positive' },
  { key: 'content',    label: 'Content',    color: '#d4a574', group: 'positive' },
  { key: 'excited',    label: 'Excited',    color: '#f0c896', group: 'positive' },
  { key: 'proud',      label: 'Proud',      color: '#c4a06a', group: 'positive' },
  { key: 'purposeful', label: 'Purposeful', color: '#d4b884', group: 'positive' },
  { key: 'attentive',  label: 'Attentive',  color: '#a89a87', group: 'neutral' },
  { key: 'goaldir',    label: 'Goal-Dir',   color: '#8a8a7a', group: 'neutral' },
  { key: 'guilty',     label: 'Guilty',     color: '#c97757', group: 'negative' },
  { key: 'angry',      label: 'Angry',      color: '#d98a6a', group: 'negative' },
  { key: 'afraid',     label: 'Afraid',     color: '#b86747', group: 'negative' },
];

const DIAMONDS = ['Duty', 'Intellect', 'Adversity', 'pOsitivity', 'Negativity', 'Sociability', 'Mating', 'Deception'];

const DIAMOND_LABELS = {
  'Duty': 'Duty', 'Intellect': 'Intellect', 'Adversity': 'Adversity',
  'pOsitivity': 'Positivity', 'Negativity': 'Negativity',
  'Sociability': 'Sociability', 'Mating': 'Mating', 'Deception': 'Deception'
};

const FACET_MAP = {
  openness: [
    { facet: 'openness_Aesthetic Sensitivity', label: 'Aesthetic Sensitivity', note: '' },
    { facet: 'openness_Creative Imagination',  label: 'Creative Imagination', note: '' },
    { facet: 'openness_Intellectual Curiosity', label: 'Intellectual Curiosity', note: '' },
  ],
  conscientiousness: [
    { facet: 'conscientiousness_Organization', label: 'Organization', note: '' },
    { facet: 'conscientiousness_Productiveness', label: 'Productiveness', note: '' },
    { facet: 'conscientiousness_Responsibility', label: 'Responsibility', note: '' },
  ],
  extraversion: [
    { facet: 'extraversion_Sociability', label: 'Sociability', note: '' },
    { facet: 'extraversion_Assertiveness', label: 'Assertiveness', note: '' },
    { facet: 'extraversion_Energy Level', label: 'Energy Level', note: '' },
  ],
  agreeableness: [
    { facet: 'agreeableness_Compassion', label: 'Compassion', note: '' },
    { facet: 'agreeableness_Respectfulness', label: 'Respectfulness', note: '' },
    { facet: 'agreeableness_Trust', label: 'Trust', note: '' },
  ],
  stability: [
    { facet: 'neuroticism_Anxiety', label: 'Anxiety', note: 'higher = more anxious' },
    { facet: 'neuroticism_Depression', label: 'Depression', note: 'higher = more depressive' },
    { facet: 'neuroticism_Emotional Volatility', label: 'Emotional Volatility', note: 'higher = more volatile' },
  ],
};

const RAW_TAG_DESC = {
  'sleeping': 'Sleeping / just woke up', 'music': 'Listening to music', 'IntFam': 'Interaction with family',
  'IntFrnd': 'Interaction with friends', 'internet': 'Using the internet', 'tired': 'Feeling tired',
  'TV': 'Watching TV', 'class': 'In class', 'study': 'Studying', 'AnxSWk': 'Anxious about work',
  'brdSWk': 'Bored at work', 'sick': 'Feeling sick'
};

const ALL_CONTEXTS = ['work', 'home', 'social', 'stress', 'leisure'];

// Detect missing/placeholder pulses
function isMissingPulse(d) {
  return d.openness === 0 && d.conscientiousness === 0 && d.extraversion === 0 && d.agreeableness === 0 && d.emotional_stability === 100;
}

const REAL_DATA = ENRICHED_DATA; // alias for compatibility
const VALID_DATA = ENRICHED_DATA.filter(d => !isMissingPulse(d));
const NUM_PULSES = ENRICHED_DATA.length;
const NUM_VALID = VALID_DATA.length;
const MAX_DAY = ENRICHED_DATA[ENRICHED_DATA.length - 1].day;

/* ============================================================
   PHASE DETECTION
   ============================================================ */
function detectPhases() {
  return [
    { startDay: 0,  endDay: 11, label: 'Semester',  desc: 'Active daily sampling during lecture period — consistent 4x/day reporting', color: '#7ba89b' },
    { startDay: 12, endDay: 16, label: 'Christmas',  desc: 'Christmas break — data becomes sparse, many missed pulses. Reporting drops to ~50%', color: '#c4a96a' },
    { startDay: 17, endDay: 27, label: 'Holiday',   desc: 'New Year holiday period — irregular reporting, mostly leisure and home contexts', color: '#d4a574' },
    { startDay: 28, endDay: 42, label: 'Exams',     desc: 'Exam period — sharp drop in reporting (80% missing). Possible withdrawal or overwhelm response', color: '#c97757' },
  ];
}
const PHASES = detectPhases();

function getPhaseForDay(day) {
  for (const p of PHASES) { if (day >= p.startDay && day <= p.endDay) return p; }
  return PHASES[0];
}
function getPhaseForPulse(pulseIdx) { return getPhaseForDay(ENRICHED_DATA[pulseIdx].day); }

/* ============================================================
   STATISTICS HELPERS
   ============================================================ */
function mean(arr) { return arr.length === 0 ? 0 : arr.reduce((a,b) => a+b, 0) / arr.length; }
function std(arr) { if (arr.length === 0) return 0; const m = mean(arr); return Math.sqrt(mean(arr.map(x => (x-m)**2))); }
function median(arr) { if (arr.length === 0) return 0; const s = [...arr].sort((a,b)=>a-b); const mid = Math.floor(s.length/2); return s.length % 2 ? s[mid] : (s[mid-1]+s[mid])/2; }

function traitValues(traitKey, data) {
  const dk = TRAITS.find(t => t.key === traitKey).dataKey;
  return data.map(d => d[dk]);
}
function traitStats(traitKey, data) {
  const vals = traitValues(traitKey, data);
  return { mean: mean(vals), std: std(vals), min: Math.min(...vals), max: Math.max(...vals), vals };
}

function contextAverages(data) {
  const result = {};
  for (const trait of TRAITS) {
    result[trait.key] = {};
    for (const ctx of ALL_CONTEXTS) {
      const subset = data.filter(d => d.contexts.includes(ctx));
      result[trait.key][ctx] = subset.length > 0 ? mean(subset.map(d => d[trait.dataKey])) : null;
    }
  }
  return result;
}

function computeDensity(values, minVal, maxVal, numBins) {
  const binSize = (maxVal - minVal) / numBins;
  const bins = [];
  for (let i = 0; i < numBins; i++) bins.push({ x: minVal + i * binSize, count: 0 });
  for (const v of values) {
    const idx = Math.min(Math.floor((v - minVal) / binSize), numBins - 1);
    if (idx >= 0) bins[idx].count++;
  }
  const smoothed = bins.map((b, i) => {
    const prev = bins[i-1] ? bins[i-1].count : 0;
    const next = bins[i+1] ? bins[i+1].count : 0;
    return { x: b.x + binSize/2, density: (prev + b.count * 2 + next) / 4 };
  });
  return { bins, smoothed, mean: mean(values), std: std(values) };
}

/* ============================================================
   D3/GSAP LOADING
   ============================================================ */
const d3Script = document.createElement('script');
d3Script.src = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
d3Script.onload = () => { initDashboard(); };
document.head.appendChild(d3Script);

const gsapScript = document.createElement('script');
gsapScript.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
gsapScript.onload = () => { initGSAP(); };
document.head.appendChild(gsapScript);

let gsapReady = false;
function initGSAP() {
  gsapReady = true;
  if (typeof d3 !== 'undefined') animateEntrance();
}

let currentPulse = 0;
let trajectoryMode = 'traits'; // 'traits' or 'emotions'

function initDashboard() {
  renderTrajectoryChart();
  renderRadarChart(currentPulse);
  renderPhaseBar();
  renderDistributionView();
  renderContextView();
  renderRhythmView();
  initTimeScrubber();
  initTabs();
  generateInsights();
  if (gsapReady) animateEntrance();
}

function animateEntrance() {
  if (!gsapReady) return;
  gsap.to('.fade-in', { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' });
}

/* ============================================================
   TOOLTIP
   ============================================================ */
const tooltip = document.getElementById('tooltip');
function showTooltip(html, x, y) {
  tooltip.innerHTML = html;
  tooltip.classList.add('visible');
  tooltip.style.left = (x + 12) + 'px';
  tooltip.style.top = (y - 10) + 'px';
}
function hideTooltip() { tooltip.classList.remove('visible'); }

/* ============================================================
   INFO POPOVER (ⓘ system)
   ============================================================ */
const infoPopover = document.getElementById('infoPopover');
const INFO_CONTENT = {
  'traj': { title: 'Trajectory Chart', body: '<p>Lines show daily average scores for each Big Five trait across 43 days. Colors map to traits (see legend).</p><p>Phase background bands mark natural periods: Semester, Christmas, Holiday, Exams. The scrubber lets you move through time.</p><p class="info-warn">This is not a norm comparison or a clinical assessment. It shows how this person expressed traits over time.</p>' },
  'dist': { title: 'Distribution Charts', body: '<p>Bars show how often you were at each level. The smooth line shows the overall shape.</p><p>A narrow shape means you are consistent. A wide shape means you vary a lot.</p><p>This is YOUR distribution &mdash; not a comparison to others.</p><p class="info-warn">This is descriptive, not diagnostic. It tells you what happened, not what is wrong.</p>' },
  'ctx-heatmap': { title: 'Context Heatmap', body: '<p>Each cell shows the average trait score when a specific context was present. Bars extend left (below average) or right (above average) from the midpoint.</p><p>Large gaps between contexts reveal where your personality flexes most.</p><p class="info-warn">Based on ' + NUM_VALID + ' valid pulses across 5 context categories. Small context samples make these suggestive, not definitive.</p>' },
  'raw-tags': { title: 'Raw Situation Tags', body: '<p>Each chip shows a raw situation tag from the participant self-reports, with frequency count and percentage.</p><p>Click a tag to highlight the pulses where that tag was active on the timeline.</p><p class="info-warn">Tags are self-reported and may overlap (a single pulse can have multiple tags).</p>' },
  'variance': { title: 'Context Variance (Where You Flex Most)', body: '<p>How much each trait changes across different contexts. High = you adapt to your environment. Low = you are consistent regardless of where you are.</p><p class="info-warn">These are descriptive patterns from 43 days of data, not prescriptions. Small context samples (e.g., stress = 13 pulses) mean these are suggestive, not definitive.</p>' },
  'stress': { title: 'Stress Delta', body: '<p>How much each trait changes during stressful moments compared to your typical state. Negative = the trait drops under pressure.</p><p class="info-warn">Stress context was tagged in only a small number of pulses. Treat these as directional hints, not reliable estimates.</p>' },
  'diamonds': { title: 'DIAMONDS Situational Dimensions', body: '<p>For each of the 8 DIAMONDS dimensions (Duty, Intellect, Adversity, Positivity, Negativity, Sociability, Mating, Deception), we split pulses into "high" (above median) vs "low" (below median) and compare average Big Five trait scores.</p><p>Bars show the gap between high and low conditions for each trait.</p><p class="info-warn">What not to assume: These are descriptive patterns from 43 days of data, not prescriptions. Small context samples mean these are suggestive, not definitive.</p>' },
  'rhythm': { title: 'Time-of-Day Rhythm', body: '<p>Each radial chart shows average trait score by time of day (9am, 1pm, 5pm, 9pm). The shape reveals your circadian personality signature.</p><p class="info-warn">Sampling was 4x daily — these are broad time bands, not continuous. Small samples per time slot make these suggestive.</p>' },
  'rhythm-heatmap': { title: 'Emotion Heatmap', body: '<p>Rows = time of day. Columns = emotions. Cell color intensity = average emotion score at that time.</p><p>Warm = higher, dim = lower. Look for patterns: which emotions rise in the evening? Which are strongest in the morning?</p><p class="info-warn">This is descriptive — it shows when emotions tended to be stronger, not why.</p>' },
};

function toggleInfoPopover(event, key) {
  event.stopPropagation();
  event.preventDefault();
  const info = INFO_CONTENT[key];
  if (!info) return;

  if (infoPopover.classList.contains('visible') && infoPopover.dataset.key === key) {
    infoPopover.classList.remove('visible');
    return;
  }

  infoPopover.innerHTML = '<strong>' + info.title + '</strong>' + info.body;
  infoPopover.dataset.key = key;

  const icon = event.target;
  const rect = icon.getBoundingClientRect();
  const popoverWidth = 280;
  let left = rect.left + rect.width / 2 - popoverWidth / 2;
  left = Math.max(10, Math.min(window.innerWidth - popoverWidth - 10, left));
  let top = rect.bottom + 8;

  infoPopover.style.left = left + 'px';
  infoPopover.style.top = top + 'px';
  infoPopover.style.width = popoverWidth + 'px';
  infoPopover.classList.add('visible');
}

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('info-icon') && !infoPopover.contains(e.target)) {
    infoPopover.classList.remove('visible');
  }
});

/* ============================================================
   DATE HELPERS
   ============================================================ */
function formatPulseDate(pulseIdx) { return ENRICHED_DATA[pulseIdx].date; }
function formatDayLabel(day) {
  const p = ENRICHED_DATA.find(d => d.day === day);
  if (!p) return '';
  const date = new Date(p.date);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[date.getMonth()] + ' ' + date.getDate();
}

/* ============================================================
   TRAJECTORY CHART (with emotion mode toggle)
   ============================================================ */
function setTrajectoryMode(mode) {
  trajectoryMode = mode;
  document.querySelectorAll('.traj-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  renderTrajectoryChart();
}

function renderTrajectoryChart() {
  const container = document.getElementById('trajectoryChart');
  container.innerHTML = '';
  const containerWidth = container.clientWidth || 800;
  const margin = { top: 10, right: 20, bottom: 32, left: 40 };
  const width = containerWidth - margin.left - margin.right;
  const height = 340 - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + containerWidth + ' 340')
    .attr('width', '100%').attr('height', 340);
  const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleLinear().domain([0, MAX_DAY]).range([0, width]);
  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  // Grid lines
  g.selectAll('.grid-line').data([20, 40, 60, 80, 100]).enter().append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0).attr('x2', width)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#2c241c').attr('stroke-width', 1).attr('stroke-dasharray', '2 4');

  g.selectAll('.y-label').data([20, 40, 60, 80, 100]).enter().append('text')
    .attr('class', 'y-label')
    .attr('x', -12).attr('y', d => y(d))
    .attr('text-anchor', 'end').attr('dy', '0.35em')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '12px').style('fill', '#756657').text(d => d);

  const xTicks = [0, 5, 10, 15, 20, 25, 30, 35, 40];
  g.selectAll('.x-label').data(xTicks).enter().append('text')
    .attr('class', 'x-label')
    .attr('x', d => x(d)).attr('y', height + 20)
    .attr('text-anchor', 'middle')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '12px').style('fill', '#756657')
    .text(d => formatDayLabel(d));

  // Phase background bands
  PHASES.forEach(phase => {
    const x1 = x(phase.startDay);
    const x2 = x(phase.endDay);
    g.append('rect')
      .attr('x', x1).attr('y', 0)
      .attr('width', x2 - x1).attr('height', height)
      .attr('fill', phase.color).attr('opacity', 0.04);
    g.append('text')
      .attr('x', (x1 + x2) / 2).attr('y', 8)
      .attr('text-anchor', 'middle')
      .style('font-family', 'IBM Plex Mono')
      .style('font-size', '9px').style('fill', phase.color)
      .style('letter-spacing', '0.1em').style('text-transform', 'uppercase')
      .style('opacity', 0.6).text(phase.label);
  });

  // Daily averages helper
  function dailyAverages(items, dataKey) {
    const byDay = {};
    VALID_DATA.forEach(d => {
      if (!byDay[d.day]) byDay[d.day] = [];
      byDay[d.day].push(d[dataKey]);
    });
    const days = Object.keys(byDay).map(Number).sort((a,b) => a-b);
    return days.map(day => ({ day, value: mean(byDay[day]) }));
  }

  function dailyEmotionAverages(emotionKey) {
    const byDay = {};
    VALID_DATA.forEach(d => {
      if (!byDay[d.day]) byDay[d.day] = [];
      byDay[d.day].push(d.emotions[emotionKey]);
    });
    const days = Object.keys(byDay).map(Number).sort((a,b) => a-b);
    return days.map(day => ({ day, value: mean(byDay[day]) }));
  }

  // Determine which series to plot
  let series;
  if (trajectoryMode === 'traits') {
    series = TRAITS.map(t => ({ ...t, dataKey: t.dataKey }));
  } else {
    series = EMOTIONS.map(e => ({ key: e.key, label: e.label, color: e.color, dataKey: null, emotionKey: e.key }));
  }

  series.forEach((item, idx) => {
    const dailyData = trajectoryMode === 'traits'
      ? dailyAverages(item, item.dataKey)
      : dailyEmotionAverages(item.emotionKey);

    const line = d3.line()
      .x(d => x(d.day)).y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));
    const area = d3.area()
      .x(d => x(d.day)).y0(height).y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path').datum(dailyData)
      .attr('fill', item.color).attr('opacity', 0.03).attr('d', area);

    const path = g.append('path').datum(dailyData)
      .attr('fill', 'none').attr('stroke', item.color)
      .attr('stroke-width', 1.8).attr('opacity', 0.85)
      .attr('d', line).attr('class', 'traj-line traj-' + item.key);

    if (typeof gsap !== 'undefined') {
      const totalLength = path.node().getTotalLength();
      path.attr('stroke-dasharray', totalLength).attr('stroke-dashoffset', totalLength);
      gsap.to(path.node(), { strokeDashoffset: 0, duration: 1.8, delay: 0.3 + idx * 0.1, ease: 'power2.out' });
    }

    g.append('path').datum(dailyData)
      .attr('fill', 'none').attr('stroke', 'transparent').attr('stroke-width', 12)
      .attr('d', line).style('pointer-events', 'stroke')
      .on('mousemove', function(event) {
        const [px] = d3.pointer(event);
        const day = Math.round(x.invert(px));
        const dataPoint = dailyData.find(d => d.day === day) || dailyData.reduce((best, d) => Math.abs(d.day - day) < Math.abs(best.day - day) ? d : best, dailyData[0]);
        if (dataPoint) {
          showTooltip(
            '<div class="tooltip-label">' + item.label + '</div><div class="tooltip-value">' + dataPoint.value.toFixed(1) + '</div><div style="color: #a89a87; font-size: 10px; margin-top: 2px;">Day ' + dataPoint.day + ' &middot; ' + formatDayLabel(dataPoint.day) + '</div>',
            event.pageX, event.pageY
          );
        }
      }).on('mouseout', hideTooltip);
  });

  // Current pulse indicator
  const pulseDay = ENRICHED_DATA[currentPulse].day;
  const weekLine = g.append('line')
    .attr('class', 'pulse-indicator')
    .attr('x1', x(pulseDay)).attr('x2', x(pulseDay))
    .attr('y1', 0).attr('y2', height)
    .attr('stroke', '#d4a574').attr('stroke-width', 1.5).attr('opacity', 0.7);

  // Legend
  const legendContainer = document.getElementById('trajectoryLegend');
  legendContainer.innerHTML = '';
  series.forEach(item => {
    const el = document.createElement('div');
    el.className = 'legend-item';
    el.innerHTML = '<span class="legend-swatch" style="background: ' + item.color + '"></span><span class="legend-label">' + item.label + '</span>';
    el.addEventListener('click', () => {
      const line = document.querySelector('.traj-' + item.key);
      if (line) { const isDimmed = el.classList.toggle('dimmed'); line.style.opacity = isDimmed ? '0.15' : '0.85'; }
    });
    legendContainer.appendChild(el);
  });

  window._trajectory = { x: x, y: y, g: g, width: width, height: height, container: container, weekLine: weekLine };
}

function updateTrajectoryPulse(pulseIdx) {
  if (!window._trajectory) return;
  const { x } = window._trajectory;
  const day = ENRICHED_DATA[pulseIdx].day;
  window._trajectory.weekLine.transition().duration(200)
    .attr('x1', x(day)).attr('x2', x(day));
}

/* ============================================================
   RADAR CHART
   ============================================================ */
function renderRadarChart(pulseIdx) {
  const container = document.getElementById('radarChart');
  container.innerHTML = '';
  const size = 280, cx = size / 2, cy = size / 2 + 10, radius = 95;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + size + ' ' + (size + 10))
    .attr('width', '100%').attr('height', size + 10);

  [0.25, 0.5, 0.75, 1.0].forEach(r => {
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', radius * r)
      .attr('fill', 'none').attr('stroke', '#3a2f25').attr('stroke-width', 0.5);
  });

  const numTraits = TRAITS.length;
  for (let i = 0; i < numTraits; i++) {
    const angle = (i / numTraits) * Math.PI * 2 - Math.PI / 2;
    svg.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', cx + Math.cos(angle) * radius)
      .attr('y2', cy + Math.sin(angle) * radius)
      .attr('stroke', '#3a2f25').attr('stroke-width', 0.5);
  }

  TRAITS.forEach((trait, i) => {
    const angle = (i / numTraits) * Math.PI * 2 - Math.PI / 2;
    const labelR = radius + 18;
    svg.append('text')
      .attr('x', cx + Math.cos(angle) * labelR)
      .attr('y', cy + Math.sin(angle) * labelR)
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .style('font-family', 'IBM Plex Mono')
      .style('font-size', '11px').style('fill', '#a89a87')
      .style('letter-spacing', '0.05em').text(trait.short);
  });

  const scale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
  const pulse = ENRICHED_DATA[pulseIdx];
  const isMissing = isMissingPulse(pulse);

  const currentValues = TRAITS.map((trait, i) => ({
    angle: (i / numTraits) * Math.PI * 2 - Math.PI / 2,
    r: scale(pulse[trait.dataKey]),
    value: pulse[trait.dataKey],
    label: trait.label,
    color: trait.color,
  }));

  const baselineValues = TRAITS.map((trait, i) => {
    const stats = traitStats(trait.key, VALID_DATA);
    return { angle: (i / numTraits) * Math.PI * 2 - Math.PI / 2, r: scale(stats.mean) };
  });

  svg.append('path').datum(baselineValues.concat([baselineValues[0]]))
    .attr('fill', '#4a3f36').attr('opacity', 0.12)
    .attr('d', d3.lineRadial().angle(d => d.angle + Math.PI / 2).radius(d => d.r).curve(d3.curveCatmullRom.alpha(0.5)))
    .attr('transform', 'translate(' + cx + ',' + cy + ')');

  const currentPath = svg.append('path').datum(currentValues.concat([currentValues[0]]))
    .attr('fill', isMissing ? 'rgba(201,119,87,0.08)' : 'rgba(212,165,116,0.12)')
    .attr('stroke', isMissing ? '#c97757' : '#d4a574')
    .attr('stroke-width', 1.5)
    .attr('d', d3.lineRadial().angle(d => d.angle + Math.PI / 2).radius(d => d.r).curve(d3.curveCatmullRom.alpha(0.5)))
    .attr('transform', 'translate(' + cx + ',' + cy + ')');

  svg.selectAll('.radar-point').data(currentValues).enter().append('circle')
    .attr('class', 'radar-point')
    .attr('cx', d => cx + Math.cos(d.angle) * d.r)
    .attr('cy', d => cy + Math.sin(d.angle) * d.r)
    .attr('r', 3).attr('fill', d => d.color)
    .attr('stroke', '#1f1813').attr('stroke-width', 1.5);

  if (typeof gsap !== 'undefined' && currentPath.node()) {
    gsap.from(currentPath.node(), { opacity: 0, duration: 0.4, ease: 'power2.out' });
  }

  const phase = getPhaseForPulse(pulseIdx);
  document.getElementById('radarDelta').textContent = isMissing ? 'Missing' : 'Pulse ' + pulse.pulse;
  document.getElementById('radarPhase').textContent = phase.label;
  document.getElementById('radarContexts').textContent = pulse.contexts.length > 0 ? pulse.contexts.join(', ') : '\u2014';
  document.getElementById('radarTitle').textContent = 'Shape at Pulse ' + pulse.pulse;
}

/* ============================================================
   PHASE BAR
   ============================================================ */
function renderPhaseBar() {
  const bar = document.getElementById('phaseBar');
  bar.innerHTML = '';
  const totalDays = MAX_DAY + 1;
  PHASES.forEach(phase => {
    const widthPct = ((phase.endDay - phase.startDay + 1) / totalDays) * 100;
    const seg = document.createElement('div');
    seg.className = 'phase-segment';
    seg.style.width = widthPct + '%';
    seg.style.background = phase.color + '22';
    seg.style.color = phase.color;
    seg.style.borderRight = '1px solid var(--border)';
    seg.innerHTML = phase.label + '<div class="phase-tooltip">' + phase.desc + '</div>';
    bar.appendChild(seg);
  });
  updatePhaseBarHighlight(currentPulse);
}

function updatePhaseBarHighlight(pulseIdx) {
  const phase = getPhaseForPulse(pulseIdx);
  document.querySelectorAll('.phase-segment').forEach((seg, i) => {
    seg.classList.toggle('active', PHASES[i].label === phase.label);
  });
}

/* ============================================================
   DISTRIBUTION VIEW (with facet expansion)
   ============================================================ */
function renderDistributionView() {
  const grid = document.getElementById('distributionGrid');
  grid.innerHTML = '';
  TRAITS.forEach(trait => {
    const vals = traitValues(trait.key, VALID_DATA);
    const distData = computeDensity(vals, 0, 100, 25);
    const card = document.createElement('div');
    card.className = 'card dist-card fade-in';
    card.dataset.trait = trait.key;

    const isStability = trait.key === 'stability';
    const facetNote = isStability ? '<div style="font-family: var(--mono); font-size: 9px; color: var(--warn); margin-top: 4px; letter-spacing: 0.03em;">Facets measure the negative side &middot; higher = more of this tendency</div>' : '';

    card.innerHTML =
      '<div class="dist-header">' +
        '<div>' +
          '<div class="card-label" style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">' + trait.label + '<span class="info-icon" data-info="dist" onclick="toggleInfoPopover(event, &apos;dist&apos;)">&#9432;</span></div>' +
          '<div class="dist-name">State Distribution</div>' +
          facetNote +
        '</div>' +
        '<div class="dist-stats">' +
          '<div>avg <span class="dist-stat-value">' + distData.mean.toFixed(1) + '</span></div>' +
          '<div>spread <span class="dist-stat-value">' + distData.std.toFixed(1) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="chart-container" id="dist-' + trait.key + '"></div>' +
      '<div class="facet-expand" id="facet-expand-' + trait.key + '"></div>';

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('info-icon')) return;
      const expand = document.getElementById('facet-expand-' + trait.key);
      const isOpen = expand.classList.toggle('open');
      if (isOpen) {
        renderFacetBreakdown(trait, expand);
      }
    });

    grid.appendChild(card);
    setTimeout(() => renderDensityChart('dist-' + trait.key, distData, trait), 100);
  });
}

function renderFacetBreakdown(trait, container) {
  container.innerHTML = '';
  const facets = FACET_MAP[trait.key];
  facets.forEach(f => {
    const row = document.createElement('div');
    row.className = 'facet-row';
    row.innerHTML =
      '<div class="facet-label-col">' +
        '<div class="facet-name">' + f.label + '</div>' +
        (f.note ? '<div class="facet-note">' + f.note + '</div>' : '') +
      '</div>' +
      '<div class="facet-mini-chart" id="facet-' + trait.key + '-' + f.facet.replace(/[^a-zA-Z0-9]/g, '') + '"></div>';
    container.appendChild(row);

    // Get facet values
    const facetVals = VALID_DATA.map(d => d.facets[f.facet]).filter(v => v !== undefined && v !== null);
    if (facetVals.length === 0) return;

    setTimeout(() => {
      const distData = computeDensity(facetVals, 0, 100, 20);
      renderFacetMiniChart('facet-' + trait.key + '-' + f.facet.replace(/[^a-zA-Z0-9]/g, ''), distData, trait.color);
    }, 50);
  });
}

function renderFacetMiniChart(containerId, data, color) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const containerWidth = container.clientWidth || 200;
  const margin = { top: 4, right: 8, bottom: 20, left: 20 };
  const width = containerWidth - margin.left - margin.right;
  const height = 80 - margin.top - margin.bottom;
  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + containerWidth + ' 80')
    .attr('width', '100%').attr('height', 80);
  const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const maxDensity = d3.max(data.smoothed, d => d.density);
  const y = d3.scaleLinear().domain([0, maxDensity * 1.15]).range([height, 0]);

  g.selectAll('.dist-bar').data(data.bins).enter().append('rect')
    .attr('class', 'dist-bar')
    .attr('x', d => x(d.x)).attr('y', d => y(d.count))
    .attr('width', Math.max(2, x(data.bins[0].x + 4) - x(data.bins[0].x) - 1))
    .attr('height', d => height - y(d.count))
    .attr('fill', color).attr('opacity', 0.1);

  const line = d3.line().x(d => x(d.x)).y(d => y(d.density)).curve(d3.curveCatmullRom.alpha(0.5));
  g.append('path').datum(data.smoothed).attr('fill', 'none').attr('stroke', color)
    .attr('stroke-width', 1.2).attr('opacity', 0.7).attr('d', line);

  g.append('line')
    .attr('x1', x(data.mean)).attr('x2', x(data.mean))
    .attr('y1', 0).attr('y2', height)
    .attr('stroke', color).attr('stroke-width', 1)
    .attr('stroke-dasharray', '2 2').attr('opacity', 0.5);
}

function renderDensityChart(containerId, data, trait) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const containerWidth = container.clientWidth || 350;
  const margin = { top: 8, right: 16, bottom: 28, left: 30 };
  const width = containerWidth - margin.left - margin.right;
  const height = 140 - margin.top - margin.bottom;
  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + containerWidth + ' 140')
    .attr('width', '100%').attr('height', 140);
  const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const maxDensity = d3.max(data.smoothed, d => d.density);
  const y = d3.scaleLinear().domain([0, maxDensity * 1.15]).range([height, 0]);

  g.selectAll('.dist-grid').data([25, 50, 75]).enter().append('line')
    .attr('class', 'dist-grid')
    .attr('x1', d => x(d)).attr('x2', d => x(d))
    .attr('y1', 0).attr('y2', height)
    .attr('stroke', '#2c241c').attr('stroke-width', 0.5).attr('stroke-dasharray', '1 3');

  g.selectAll('.dist-x').data([0, 25, 50, 75, 100]).enter().append('text')
    .attr('class', 'dist-x')
    .attr('x', d => x(d)).attr('y', height + 16)
    .attr('text-anchor', 'middle')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '11px').style('fill', '#756657').text(d => d);

  g.selectAll('.dist-bar').data(data.bins).enter().append('rect')
    .attr('class', 'dist-bar')
    .attr('x', d => x(d.x)).attr('y', d => y(d.count))
    .attr('width', x(data.bins[0].x + 4) - x(data.bins[0].x) - 1)
    .attr('height', d => height - y(d.count))
    .attr('fill', trait.color).attr('opacity', 0.12);

  const line = d3.line().x(d => x(d.x)).y(d => y(d.density)).curve(d3.curveCatmullRom.alpha(0.5));
  const area = d3.area().x(d => x(d.x)).y0(height).y1(d => y(d.density)).curve(d3.curveCatmullRom.alpha(0.5));

  g.append('path').datum(data.smoothed).attr('fill', trait.color).attr('opacity', 0.06).attr('d', area);
  g.append('path').datum(data.smoothed).attr('fill', 'none').attr('stroke', trait.color)
    .attr('stroke-width', 1.5).attr('opacity', 0.8).attr('d', line);

  g.append('line')
    .attr('x1', x(data.mean)).attr('x2', x(data.mean))
    .attr('y1', 0).attr('y2', height)
    .attr('stroke', trait.color).attr('stroke-width', 1)
    .attr('stroke-dasharray', '3 3').attr('opacity', 0.6);
  g.append('text')
    .attr('x', x(data.mean)).attr('y', -2)
    .attr('text-anchor', 'middle')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '10px').style('fill', trait.color)
    .text('avg ' + data.mean.toFixed(0));
}

/* ============================================================
   CONTEXT VIEW
   ============================================================ */
function renderContextView() {
  renderContextHeatmap();
  renderRawTags();
  renderVarianceChart();
  renderStressChart();
  renderDiamondsView();
}

function renderContextHeatmap() {
  const container = document.getElementById('contextHeatmap');
  container.innerHTML = '';
  const ctxAvg = contextAverages(VALID_DATA);
  const contexts = ALL_CONTEXTS.map(c => c.charAt(0).toUpperCase() + c.slice(1));

  const corner = document.createElement('div');
  corner.className = 'context-corner';
  container.appendChild(corner);

  contexts.forEach(ctx => {
    const header = document.createElement('div');
    header.className = 'context-col-header';
    header.textContent = ctx;
    container.appendChild(header);
  });

  TRAITS.forEach(trait => {
    const label = document.createElement('div');
    label.className = 'context-trait-label';
    label.textContent = trait.label;
    container.appendChild(label);

    const ctxData = ctxAvg[trait.key];
    const validVals = ALL_CONTEXTS.map(c => ctxData[c]).filter(v => v !== null);
    const minVal = Math.min(...validVals);
    const maxVal = Math.max(...validVals);
    const midVal = (minVal + maxVal) / 2;

    ALL_CONTEXTS.forEach(ctx => {
      const value = ctxData[ctx];
      const cell = document.createElement('div');
      cell.className = 'context-cell';

      if (value === null) {
        cell.innerHTML = '<div class="context-bar"><span class="context-cell-value" style="left: 50%; transform: translate(-50%, -50%); color: #4a3f36;">\u2014</span></div>';
        container.appendChild(cell);
        return;
      }

      const deviation = value - midVal;
      const barWidth = Math.abs(deviation) / 30 * 50;
      const isPositive = deviation >= 0;
      const intensity = Math.min(1, Math.abs(deviation) / 8);
      let color;
      if (ctx === 'stress') color = 'rgba(201,119,87,' + (0.3 + intensity * 0.5) + ')';
      else if (ctx === 'social') color = 'rgba(123,168,155,' + (0.3 + intensity * 0.5) + ')';
      else if (ctx === 'work') color = 'rgba(212,165,116,' + (0.3 + intensity * 0.4) + ')';
      else if (ctx === 'leisure') color = 'rgba(196,169,106,' + (0.3 + intensity * 0.4) + ')';
      else color = 'rgba(168,154,135,' + (0.2 + intensity * 0.3) + ')';

      cell.innerHTML =
        '<div class="context-bar">' +
          '<div class="context-bar-fill" style="' + (isPositive ? 'left' : 'right') + ': 50%; width: ' + barWidth + '%; background: ' + color + ';"></div>' +
          '<span class="context-cell-value" style="' + (isPositive ? 'right' : 'left') + ': 55%;">' + value.toFixed(0) + '</span>' +
        '</div>';
      container.appendChild(cell);
    });
  });
}

function renderRawTags() {
  const container = document.getElementById('rawTagsContainer');
  container.innerHTML = '';
  const descEl = document.getElementById('rawTagDesc');

  // Count frequencies
  const tagCounts = {};
  ENRICHED_DATA.forEach(d => {
    if (d.raw_contexts) {
      d.raw_contexts.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Sort by frequency
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const totalPulses = ENRICHED_DATA.length;

  // Find max for sizing
  const maxCount = sortedTags[0][1];

  sortedTags.forEach(([tag, count]) => {
    const pct = ((count / totalPulses) * 100).toFixed(0);
    const desc = RAW_TAG_DESC[tag] || tag;
    const chip = document.createElement('div');
    chip.className = 'raw-tag';
    chip.dataset.tag = tag;
    chip.innerHTML = tag + ' <span class="tag-count">' + count + ' &middot; ' + pct + '%</span>';
    chip.title = desc;
    chip.addEventListener('mouseenter', () => {
      descEl.textContent = desc + ' (' + count + ' pulses)';
    });
    chip.addEventListener('click', () => {
      document.querySelectorAll('.raw-tag').forEach(t => t.classList.remove('active'));
      chip.classList.add('active');
      highlightPulsesForTag(tag);
      descEl.textContent = desc + ' (' + count + ' pulses) \u2014 highlighted on timeline';
    });
    container.appendChild(chip);
  });

  descEl.textContent = 'Hover a tag for its description. Click to highlight pulses on the timeline.';
}

function highlightPulsesForTag(tag) {
  // Switch to trajectory view
  const tabs = document.querySelectorAll('.view-tab');
  const panels = document.querySelectorAll('.view-panel');
  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  document.querySelector('[data-view="trajectory"]').classList.add('active');
  document.getElementById('view-trajectory').classList.add('active');
  renderTrajectoryChart();

  // Highlight pulses
  if (!window._trajectory) return;
  const { g, x, y, height } = window._trajectory;

  // Remove old highlights
  g.selectAll('.tag-highlight').remove();

  ENRICHED_DATA.forEach((d, i) => {
    if (d.raw_contexts && d.raw_contexts.includes(tag)) {
      g.append('circle')
        .attr('class', 'tag-highlight')
        .attr('cx', x(d.day))
        .attr('cy', y(d[d.conscientiousness > 0 ? 'conscientiousness' : 'emotional_stability']))
        .attr('r', 5)
        .attr('fill', '#d4a574')
        .attr('opacity', 0.6)
        .attr('stroke', '#e8b884')
        .attr('stroke-width', 1);
    }
  });
}

function renderVarianceChart() {
  const container = document.getElementById('varianceChart');
  if (!container) return;
  container.innerHTML = '';
  const ctxAvg = contextAverages(VALID_DATA);
  const containerWidth = container.clientWidth || 400;
  const margin = { top: 20, right: 16, bottom: 30, left: 120 };
  const width = containerWidth - margin.left - margin.right;
  const height = 160 - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + containerWidth + ' 160').attr('width', '100%').attr('height', 160);
  const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const varianceData = TRAITS.map(trait => {
    const vals = ALL_CONTEXTS.map(c => ctxAvg[trait.key][c]).filter(v => v !== null);
    const min = Math.min(...vals), max = Math.max(...vals);
    return { label: trait.label, range: max - min, color: trait.color, min, max };
  }).sort((a, b) => b.range - a.range);

  const x = d3.scaleLinear().domain([0, d3.max(varianceData, d => d.range) * 1.1]).range([0, width]);
  const y = d3.scaleBand().domain(varianceData.map(d => d.label)).range([0, height]).padding(0.3);

  g.selectAll('.var-bar').data(varianceData).enter().append('rect')
    .attr('class', 'var-bar').attr('x', 0).attr('y', d => y(d.label))
    .attr('width', 0).attr('height', y.bandwidth())
    .attr('fill', d => d.color).attr('opacity', 0.6).attr('rx', 1)
    .transition().duration(800).delay((d, i) => i * 100)
    .attr('width', d => x(d.range));

  g.selectAll('.var-label').data(varianceData).enter().append('text')
    .attr('class', 'var-label').attr('x', -10)
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('text-anchor', 'end').attr('dy', '0.35em')
    .style('font-family', 'IBM Plex Sans')
    .style('font-size', '11px').style('fill', '#a89a87').text(d => d.label);

  g.selectAll('.var-value').data(varianceData).enter().append('text')
    .attr('class', 'var-value')
    .attr('x', d => x(d.range) + 6)
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '10px').style('fill', d => d.color)
    .text(d => d.range.toFixed(1) + ' pts');

  g.append('text')
    .attr('x', width / 2).attr('y', height + 22)
    .attr('text-anchor', 'middle')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '10px').style('fill', '#756657')
    .style('text-transform', 'uppercase').style('letter-spacing', '0.1em')
    .text('Context Range (points)');
}

function renderStressChart() {
  const container = document.getElementById('stressChart');
  if (!container) return;
  container.innerHTML = '';
  const ctxAvg = contextAverages(VALID_DATA);
  const containerWidth = container.clientWidth || 400;
  const margin = { top: 20, right: 16, bottom: 30, left: 120 };
  const width = containerWidth - margin.left - margin.right;
  const height = 160 - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + containerWidth + ' 160').attr('width', '100%').attr('height', 160);
  const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const stressData = TRAITS.map(trait => {
    const vals = ALL_CONTEXTS.map(c => ctxAvg[trait.key][c]).filter(v => v !== null);
    const avg = mean(vals);
    const stressVal = ctxAvg[trait.key].stress;
    return { label: trait.label, delta: stressVal !== null ? stressVal - avg : 0, color: trait.color };
  }).sort((a, b) => a.delta - b.delta);

  const xExtent = Math.max(Math.abs(d3.min(stressData, d => d.delta)), Math.abs(d3.max(stressData, d => d.delta)), 1);
  const x = d3.scaleLinear().domain([-xExtent * 1.2, xExtent * 1.2]).range([0, width]);
  const y = d3.scaleBand().domain(stressData.map(d => d.label)).range([0, height]).padding(0.3);

  g.append('line')
    .attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', height)
    .attr('stroke', '#4a3d31').attr('stroke-width', 1);

  g.selectAll('.stress-bar').data(stressData).enter().append('rect')
    .attr('class', 'stress-bar')
    .attr('x', d => d.delta >= 0 ? x(0) : x(d.delta))
    .attr('y', d => y(d.label)).attr('width', 0).attr('height', y.bandwidth())
    .attr('fill', d => d.delta < 0 ? '#c97757' : '#7ba89b').attr('opacity', 0.65).attr('rx', 1)
    .transition().duration(800).delay((d, i) => i * 100)
    .attr('width', d => Math.abs(x(d.delta) - x(0)));

  g.selectAll('.stress-label').data(stressData).enter().append('text')
    .attr('class', 'stress-label').attr('x', -10)
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('text-anchor', 'end').attr('dy', '0.35em')
    .style('font-family', 'IBM Plex Sans')
    .style('font-size', '11px').style('fill', '#a89a87').text(d => d.label);

  g.selectAll('.stress-value').data(stressData).enter().append('text')
    .attr('class', 'stress-value')
    .attr('x', d => d.delta >= 0 ? x(d.delta) + 6 : x(d.delta) - 6)
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('text-anchor', d => d.delta >= 0 ? 'start' : 'end')
    .attr('dy', '0.35em')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '10px').style('fill', d => d.delta < 0 ? '#c97757' : '#7ba89b')
    .text(d => (d.delta > 0 ? '+' : '') + d.delta.toFixed(1));

  g.append('text')
    .attr('x', width / 2).attr('y', height + 22)
    .attr('text-anchor', 'middle')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '10px').style('fill', '#756657')
    .style('text-transform', 'uppercase').style('letter-spacing', '0.1em')
    .text('Stress Delta (points from average)');
}

/* ============================================================
   DIAMONDS VIEW
   ============================================================ */
function renderDiamondsView() {
  const container = document.getElementById('diamondsGrid');
  if (!container) return;
  container.innerHTML = '';

  DIAMONDS.forEach(dim => {
    // Compute median for this dimension
    const allVals = ENRICHED_DATA.map(d => d.diamonds[dim]);
    const dimMedian = median(allVals);

    // Split into high and low
    const highPulses = ENRICHED_DATA.filter(d => d.diamonds[dim] > dimMedian);
    const lowPulses = ENRICHED_DATA.filter(d => d.diamonds[dim] <= dimMedian);

    const card = document.createElement('div');
    card.className = 'diamond-card';

    const displayName = DIAMOND_LABELS[dim] || dim;
    let innerHTML = '<div class="diamond-name">' + displayName + '</div>';
    innerHTML += '<div class="diamond-compare">';

    TRAITS.forEach(trait => {
      const highAvg = highPulses.length > 0 ? mean(highPulses.map(d => d[trait.dataKey])) : 0;
      const lowAvg = lowPulses.length > 0 ? mean(lowPulses.map(d => d[trait.dataKey])) : 0;
      const gap = highAvg - lowAvg;
      const maxBar = 60; // max bar height in px

      innerHTML +=
        '<div class="diamond-bar-col">' +
          '<div class="diamond-bar-val" style="color: ' + trait.color + ';" title="' + trait.label + ': high ' + highAvg.toFixed(0) + ' / low ' + lowAvg.toFixed(0) + ' (' + (gap > 0 ? '+' : '') + gap.toFixed(1) + ')">' +
            (gap > 0 ? '+' : '') + gap.toFixed(0) +
          '</div>' +
          '<div class="diamond-bar-wrap">' +
            '<div class="diamond-bar" style="height: ' + Math.max(2, Math.abs(gap) / 20 * maxBar) + 'px; background: ' + (gap >= 0 ? trait.color : '#c97757') + '; opacity: 0.6;" title="' + trait.label + ' gap: ' + gap.toFixed(1) + '"></div>' +
          '</div>' +
          '<div class="diamond-bar-label">' + trait.short + '</div>' +
        '</div>';
    });

    innerHTML += '</div>';
    card.innerHTML = innerHTML;
    container.appendChild(card);
  });
}

/* ============================================================
   RHYTHM VIEW (Time of Day)
   ============================================================ */
function renderRhythmView() {
  renderRadialCharts();
  renderEmotionHeatmap();
}

function getTimeBucket(hour) {
  if (hour >= 7 && hour < 12) return '9am';
  if (hour >= 12 && hour < 15) return '1pm';
  if (hour >= 15 && hour < 19) return '5pm';
  if (hour >= 19 || hour < 7) return '9pm';
  return '9am';
}

const TIME_BUCKETS = ['9am', '1pm', '5pm', '9pm'];
const TIME_HOURS = { '9am': 9, '1pm': 13, '5pm': 17, '9pm': 21 };

function renderRadialCharts() {
  const grid = document.getElementById('rhythmRadialGrid');
  if (!grid) return;
  grid.innerHTML = '';

  TRAITS.forEach((trait, idx) => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML =
      '<div class="radial-chart-wrap">' +
        '<div class="chart-container" id="radial-' + trait.key + '"></div>' +
        '<div class="radial-title" style="color: ' + trait.color + '">' + trait.label + '</div>' +
      '</div>';
    grid.appendChild(card);

    setTimeout(() => renderSingleRadial('radial-' + trait.key, trait, idx), 100 + idx * 50);
  });
}

function renderSingleRadial(containerId, trait, animIdx) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const size = 200, cx = size / 2, cy = size / 2, radius = 70;
  const svg = d3.select(container).append('svg')
    .attr('viewBox', '0 0 ' + size + ' ' + size)
    .attr('width', '100%').attr('height', size);

  // Grid rings
  [0.25, 0.5, 0.75, 1.0].forEach(r => {
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', radius * r)
      .attr('fill', 'none').attr('stroke', '#3a2f25').attr('stroke-width', 0.5);
  });

  // Compute average trait per time bucket
  const bucketAvgs = {};
  TIME_BUCKETS.forEach(tb => {
    const pulses = VALID_DATA.filter(d => getTimeBucket(d.hour) === tb);
    bucketAvgs[tb] = pulses.length > 0 ? mean(pulses.map(d => d[trait.dataKey])) : 50;
  });

  // Radial line data
  const scale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
  const numPoints = TIME_BUCKETS.length;
  const values = TIME_BUCKETS.map((tb, i) => ({
    angle: (i / numPoints) * Math.PI * 2 - Math.PI / 2,
    r: scale(bucketAvgs[tb]),
    value: bucketAvgs[tb],
    label: tb
  }));

  // Fill area
  const path = svg.append('path').datum(values.concat([values[0]]))
    .attr('fill', trait.color).attr('opacity', 0.1)
    .attr('stroke', trait.color).attr('stroke-width', 1.5)
    .attr('d', d3.lineRadial().angle(d => d.angle + Math.PI / 2).radius(d => d.r).curve(d3.curveCatmullRom.alpha(0.5)))
    .attr('transform', 'translate(' + cx + ',' + cy + ')');

  // Points
  values.forEach(v => {
    svg.append('circle')
      .attr('cx', cx + Math.cos(v.angle) * v.r)
      .attr('cy', cy + Math.sin(v.angle) * v.r)
      .attr('r', 3).attr('fill', trait.color)
      .attr('stroke', '#1f1813').attr('stroke-width', 1.5);
  });

  // Time labels
  TIME_BUCKETS.forEach((tb, i) => {
    const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 2;
    const labelR = radius + 16;
    svg.append('text')
      .attr('x', cx + Math.cos(angle) * labelR)
      .attr('y', cy + Math.sin(angle) * labelR)
      .attr('text-anchor', 'middle').attr('dy', '0.35em')
      .style('font-family', 'IBM Plex Mono')
      .style('font-size', '9px').style('fill', '#756657')
      .text(tb);
  });

  // Center value
  const overallAvg = mean(Object.values(bucketAvgs));
  svg.append('text')
    .attr('x', cx).attr('y', cy)
    .attr('text-anchor', 'middle').attr('dy', '0.35em')
    .style('font-family', 'IBM Plex Mono')
    .style('font-size', '14px').style('fill', trait.color)
    .style('font-weight', '500')
    .text(overallAvg.toFixed(0));

  if (typeof gsap !== 'undefined' && path.node()) {
    gsap.from(path.node(), { opacity: 0, duration: 0.5, delay: 0.1 + animIdx * 0.05, ease: 'power2.out' });
  }
}

function renderEmotionHeatmap() {
  const container = document.getElementById('emotionHeatmapContainer');
  if (!container) return;
  container.innerHTML = '';

  // Build heatmap table
  let html = '<table class="emotion-heatmap-table"><thead><tr><th></th>';
  EMOTIONS.forEach(e => {
    html += '<th style="color: ' + e.color + '">' + e.label + '</th>';
  });
  html += '</tr></thead><tbody>';

  // Compute averages
  const heatmapData = {};
  TIME_BUCKETS.forEach(tb => {
    heatmapData[tb] = {};
    EMOTIONS.forEach(e => {
      const pulses = VALID_DATA.filter(d => getTimeBucket(d.hour) === tb);
      heatmapData[tb][e.key] = pulses.length > 0 ? mean(pulses.map(d => d.emotions[e.key])) : 0;
    });
  });

  // Find global min and max for color scale
  let globalMin = 100, globalMax = 0;
  TIME_BUCKETS.forEach(tb => {
    EMOTIONS.forEach(e => {
      const v = heatmapData[tb][e.key];
      if (v < globalMin) globalMin = v;
      if (v > globalMax) globalMax = v;
    });
  });

  TIME_BUCKETS.forEach(tb => {
    html += '<tr><td class="heatmap-row-label">' + tb + '</td>';
    EMOTIONS.forEach(e => {
      const v = heatmapData[tb][e.key];
      // Color intensity: 0 = dark bg, 100 = bright
      const intensity = (v - globalMin) / (globalMax - globalMin || 1);
      const alpha = 0.15 + intensity * 0.7;
      const bgColor = e.group === 'positive'
        ? 'rgba(212,165,116,' + alpha + ')'
        : e.group === 'negative'
        ? 'rgba(201,119,87,' + alpha + ')'
        : 'rgba(168,154,135,' + alpha + ')';
      const textColor = intensity > 0.5 ? '#1f1813' : '#e8dfd3';
      html += '<td><div class="heatmap-cell" style="background: ' + bgColor + '; color: ' + textColor + ';" title="' + e.label + ' at ' + tb + ': ' + v.toFixed(0) + '">' + v.toFixed(0) + '</div></td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/* ============================================================
   TIME SCRUBBER
   ============================================================ */
function initTimeScrubber() {
  const track = document.getElementById('scrubberTrack');
  const handle = document.getElementById('scrubberHandle');
  const fill = document.getElementById('scrubberFill');
  const marks = document.getElementById('scrubberMarks');
  const dateLabel = document.getElementById('scrubberDate');

  PHASES.forEach(phase => {
    const mark = document.createElement('div');
    mark.className = 'scrubber-mark phase';
    mark.style.left = (phase.startDay / MAX_DAY) * 100 + '%';
    const label = document.createElement('div');
    label.className = 'scrubber-mark-label';
    label.textContent = phase.label;
    mark.appendChild(label);
    marks.appendChild(mark);
  });

  for (let d = 0; d <= MAX_DAY; d += 5) {
    const mark = document.createElement('div');
    mark.className = 'scrubber-mark';
    mark.style.left = (d / MAX_DAY) * 100 + '%';
    marks.appendChild(mark);
  }

  function updateScrubber(pulseIdx) {
    currentPulse = Math.max(0, Math.min(NUM_PULSES - 1, Math.round(pulseIdx)));
    const pulse = ENRICHED_DATA[currentPulse];
    const dayPct = (pulse.day / MAX_DAY) * 100;
    const pulsePct = (currentPulse / (NUM_PULSES - 1)) * 100;

    handle.style.left = pulsePct + '%';
    fill.style.width = pulsePct + '%';
    const phase = getPhaseForPulse(currentPulse);
    dateLabel.textContent = 'Pulse ' + pulse.pulse + ' \u2014 ' + pulse.date + ' \u00b7 ' + phase.label;

    updateTrajectoryPulse(currentPulse);
    renderRadarChart(currentPulse);
    updatePhaseBarHighlight(currentPulse);
  }

  let isDragging = false;
  function getPulseFromX(clientX) {
    const rect = track.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    return pct * (NUM_PULSES - 1);
  }

  track.addEventListener('mousedown', (e) => { isDragging = true; updateScrubber(getPulseFromX(e.clientX)); });
  document.addEventListener('mousemove', (e) => { if (isDragging) updateScrubber(getPulseFromX(e.clientX)); });
  document.addEventListener('mouseup', () => { isDragging = false; });
  track.addEventListener('touchstart', (e) => { isDragging = true; updateScrubber(getPulseFromX(e.touches[0].clientX)); }, { passive: true });
  document.addEventListener('touchmove', (e) => { if (isDragging) updateScrubber(getPulseFromX(e.touches[0].clientX)); }, { passive: true });
  document.addEventListener('touchend', () => { isDragging = false; });

  updateScrubber(currentPulse);

  if (typeof gsap !== 'undefined') {
    setTimeout(() => {
      const obj = { pulse: 0 };
      const semesterEnd = ENRICHED_DATA.findIndex(d => d.day === 12);
      const endIdx = semesterEnd > 0 ? semesterEnd - 1 : 40;
      gsap.to(obj, { pulse: endIdx, duration: 4, ease: 'power1.inOut', onUpdate: () => updateScrubber(obj.pulse) });
    }, 1500);
  }

  window._updateScrubber = updateScrubber;
}

/* ============================================================
   TAB SWITCHING
   ============================================================ */
function initTabs() {
  const tabs = document.querySelectorAll('.view-tab');
  const panels = document.querySelectorAll('.view-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('view-' + view);
      panel.classList.add('active');

      if (view === 'trajectory') { renderTrajectoryChart(); renderRadarChart(currentPulse); }
      else if (view === 'distribution') { renderDistributionView(); }
      else if (view === 'context') { renderContextView(); }
      else if (view === 'rhythm') { renderRhythmView(); }

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(panel.querySelectorAll('.card, .insight-strip'),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
      }
    });
  });
}

/* ============================================================
   DYNAMIC INSIGHT GENERATION
   ============================================================ */
function generateInsights() {
  const stats = {};
  TRAITS.forEach(t => { stats[t.key] = traitStats(t.key, VALID_DATA); });
  const ctxAvg = contextAverages(VALID_DATA);

  // === TRAJECTORY INSIGHT ===
  const cv = TRAITS.map(t => ({ key: t.key, label: t.label, color: t.color, cv: stats[t.key].std / stats[t.key].mean, std: stats[t.key].std, mean: stats[t.key].mean }));
  const mostStable = cv.reduce((min, d) => d.cv < min.cv ? d : min, cv[0]);
  const mostVariable = cv.reduce((max, d) => d.cv > max.cv ? d : max, cv[0]);

  const missingCount = NUM_PULSES - NUM_VALID;
  const examPulses = ENRICHED_DATA.filter(d => d.day >= 28);
  const examValid = examPulses.filter(d => !isMissingPulse(d));
  const examMissingPct = (((examPulses.length - examValid.length) / examPulses.length) * 100).toFixed(0);

  // Emotion insight: find dominant emotion
  const emotionAvgs = {};
  EMOTIONS.forEach(e => {
    emotionAvgs[e.key] = mean(VALID_DATA.map(d => d.emotions[e.key]));
  });
  const topEmotion = EMOTIONS.reduce((max, e) => emotionAvgs[e.key] > emotionAvgs[max.key] ? e : max, EMOTIONS[0]);
  const topNegEmotion = EMOTIONS.filter(e => e.group === 'negative').reduce((max, e) => emotionAvgs[e.key] > emotionAvgs[max.key] ? e : max, EMOTIONS.filter(e => e.group === 'negative')[0]);

  const trajInsight = 'Your <span class="highlight">' + mostStable.label.toLowerCase() + '</span> has been remarkably steady \u2014 this is the kind of consistency that holds things together when everything else moves. Watch <span class="danger">' + mostVariable.label.toLowerCase() + '</span> during high-stress periods \u2014 it dips further than most. Your most frequent emotion is <span class="highlight">' + topEmotion.label.toLowerCase() + '</span>, and your most present negative signal is <span class="danger">' + topNegEmotion.label.toLowerCase() + '</span>. Reporting dropped <span class="highlight">' + examMissingPct + '% during the exam period</span> (days 28\u201342) \u2014 that silence is itself a signal worth paying attention to.';
  document.getElementById('trajectoryInsightText').innerHTML = trajInsight;

  // === DISTRIBUTION INSIGHT ===
  const distSpread = TRAITS.map(t => ({ key: t.key, label: t.label, color: t.color, std: stats[t.key].std, mean: stats[t.key].mean, range: stats[t.key].max - stats[t.key].min }));
  const widest = distSpread.reduce((max, d) => d.range > max.range ? d : max, distSpread[0]);
  const narrowest = distSpread.reduce((min, d) => d.range < min.range ? d : min, distSpread[0]);

  const distInsight = 'Your <span class="highlight">' + widest.label.toLowerCase() + '</span> ranges across ' + widest.range.toFixed(0) + ' points \u2014 you show up very differently depending on the moment. That flexibility is a strength when you can choose the context. Your <span class="signal">' + narrowest.label.toLowerCase() + '</span> is your most consistent trait, staying within a ' + narrowest.range.toFixed(0) + '-point band. This kind of stability is what people rely on in you, even when you do not notice it.';
  document.getElementById('distributionInsightText').innerHTML = distInsight;

  // === CONTEXT INSIGHT ===
  const ctxVariance = TRAITS.map(t => {
    const vals = ALL_CONTEXTS.map(c => ctxAvg[t.key][c]).filter(v => v !== null);
    const min = Math.min(...vals), max = Math.max(...vals);
    return { key: t.key, label: t.label, color: t.color, range: max - min, max, min };
  }).sort((a, b) => b.range - a.range);

  const mostCtxSensitive = ctxVariance[0];
  const leastCtxSensitive = ctxVariance[ctxVariance.length - 1];

  const stressEffects = TRAITS.map(t => {
    const vals = ALL_CONTEXTS.map(c => ctxAvg[t.key][c]).filter(v => v !== null);
    const avg = mean(vals);
    return { key: t.key, label: t.label, delta: ctxAvg[t.key].stress !== null ? ctxAvg[t.key].stress - avg : 0 };
  }).sort((a, b) => a.delta - b.delta);
  const mostStressAffected = stressEffects[0];

  // DIAMONDS insight: find biggest gap
  let biggestDiamondGap = { dim: '', trait: '', gap: 0 };
  DIAMONDS.forEach(dim => {
    const allVals = ENRICHED_DATA.map(d => d.diamonds[dim]);
    const dimMedian = median(allVals);
    const highPulses = ENRICHED_DATA.filter(d => d.diamonds[dim] > dimMedian);
    const lowPulses = ENRICHED_DATA.filter(d => d.diamonds[dim] <= dimMedian);
    TRAITS.forEach(trait => {
      const highAvg = mean(highPulses.map(d => d[trait.dataKey]));
      const lowAvg = mean(lowPulses.map(d => d[trait.dataKey]));
      const gap = Math.abs(highAvg - lowAvg);
      if (gap > biggestDiamondGap.gap) {
        biggestDiamondGap = { dim: DIAMOND_LABELS[dim] || dim, trait: trait.label.toLowerCase(), gap: gap };
      }
    });
  });

  const ctxInsight = 'Your <span class="highlight">' + mostCtxSensitive.label.toLowerCase() + '</span> shifts most across contexts \u2014 a ' + mostCtxSensitive.range.toFixed(0) + '-point swing. Consider whether you\'re getting enough time in the contexts that bring out your best. Under <span class="danger">stress</span>, your ' + mostStressAffected.label.toLowerCase() + ' takes the biggest hit \u2014 plan for that before high-pressure periods. Among situational dimensions, <span class="highlight">' + biggestDiamondGap.dim + '</span> has the strongest pull on your ' + biggestDiamondGap.trait + ' (' + biggestDiamondGap.gap.toFixed(1) + ' pts).';
  document.getElementById('contextInsightText').innerHTML = ctxInsight;

  // === RHYTHM INSIGHT ===
  // Find peak time for each trait
  const traitPeaks = {};
  TRAITS.forEach(trait => {
    let bestTime = '', bestVal = 0;
    TIME_BUCKETS.forEach(tb => {
      const pulses = VALID_DATA.filter(d => getTimeBucket(d.hour) === tb);
      const avg = pulses.length > 0 ? mean(pulses.map(d => d[trait.dataKey])) : 0;
      if (avg > bestVal) { bestVal = avg; bestTime = tb; }
    });
    traitPeaks[trait.key] = { time: bestTime, value: bestVal };
  });

  // Find most consistent trait (lowest std across time buckets)
  const traitConsistency = TRAITS.map(trait => {
    const avgs = TIME_BUCKETS.map(tb => {
      const pulses = VALID_DATA.filter(d => getTimeBucket(d.hour) === tb);
      return pulses.length > 0 ? mean(pulses.map(d => d[trait.dataKey])) : 50;
    });
    return { key: trait.key, label: trait.label, std: std(avgs), peakTime: traitPeaks[trait.key].time };
  });
  const mostConsistentTrait = traitConsistency.reduce((min, d) => d.std < min.std ? d : min, traitConsistency[0]);

  // Find peak emotion time
  let peakEmotionTime = '', peakEmotionVal = 0, peakEmotionName = '';
  TIME_BUCKETS.forEach(tb => {
    EMOTIONS.forEach(e => {
      const pulses = VALID_DATA.filter(d => getTimeBucket(d.hour) === tb);
      const avg = pulses.length > 0 ? mean(pulses.map(d => d.emotions[e.key])) : 0;
      if (avg > peakEmotionVal) { peakEmotionVal = avg; peakEmotionTime = tb; peakEmotionName = e.label; }
    });
  });

  const openPeak = traitPeaks.openness.time;
  const rhythmInsight = 'Your <span class="highlight">openness peaks at ' + openPeak + '</span>. Your ' + mostConsistentTrait.label.toLowerCase() + ' is most consistent across the day. Your strongest emotional signal is <span class="signal">' + peakEmotionName.toLowerCase() + ' at ' + peakEmotionTime + '</span>. Consider scheduling creative work for ' + openPeak + ' and protecting your mornings for tasks requiring focus.';
  document.getElementById('rhythmInsightText').innerHTML = rhythmInsight;
}

/* ============================================================
   RESIZE HANDLER
   ============================================================ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const activeView = document.querySelector('.view-tab.active').dataset.view;
    if (activeView === 'trajectory') { renderTrajectoryChart(); renderRadarChart(currentPulse); }
    else if (activeView === 'distribution') { renderDistributionView(); }
    else if (activeView === 'context') { renderContextView(); }
    else if (activeView === 'rhythm') { renderRhythmView(); }
  }, 250);
});
</script>
</body>
</html>'''

# Replace the placeholder with actual data
html = html.replace('__ENRICHED_DATA__', data_js)

# Write the file
with open('/home/rui/career-kb/personality-dashboard-prototype.html', 'w') as f:
    f.write(html)

print(f"Written {len(html)} bytes to personality-dashboard-prototype.html")
