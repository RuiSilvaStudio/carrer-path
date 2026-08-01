import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  createEmptyProfile,
  extractionToProfile,
  SITUATION_OPTIONS,
  DRIVER_OPTIONS,
  ARRANGEMENT_OPTIONS,
  MOBILITY_OPTIONS,
  TRAVEL_OPTIONS,
  AVAILABILITY_OPTIONS,
  INCOME_OPTIONS,
  type StructuredProfile,
  type CareerRole,
  type CurrentSituation,
  type ChangeDriver,
  type WorkArrangement,
  type Mobility,
  type TravelTolerance,
  type Availability,
  type IncomeExpectation,
  type ExtractedCV,
} from '../../lib/profile-data';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ── Edge Function config ────────────────────────────────────────
const EDGE_FUNCTION_URL = 'https://ncwtmagvjtpqnwroyuha.supabase.co/functions/v1/bright-worker';
const SUPABASE_ANON_KEY = 'sb_publishable_MtH4laIgqpmwU1a5XpWmPg_-eOrrSxE';

// ── Props ───────────────────────────────────────────────────────
interface ProfileBuilderProps {
  profile: StructuredProfile;
  onChange: (profile: StructuredProfile) => void;
  authToken?: string | null;
}

type IntakeMode = 'choose' | 'upload' | 'paste' | 'manual' | 'review';

// ── Styles ──────────────────────────────────────────────────────
const ui = {
  page: { maxWidth: '840px', margin: '0 auto', padding: '52px 24px 100px' },
  kicker: {
    color: 'var(--color-accent)' as const,
    font: '11px var(--font-mono)' as const,
    letterSpacing: '.12em' as const,
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  h1: {
    font: '400 var(--fs-h3)/1.08 var(--font-serif)' as const,
    letterSpacing: '-.025em' as const,
    margin: '0 0 14px',
  },
  quiet: {
    color: 'var(--color-text-muted)' as const,
    fontSize: '15px' as const,
    lineHeight: 1.6 as const,
    maxWidth: '620px' as const,
    margin: '0 0 28px',
  },
  panel: {
    background: 'var(--color-surface)' as const,
    border: '1px solid var(--color-border)' as const,
    borderRadius: 'var(--radius-card)' as const,
    padding: '20px' as const,
  },
  primary: {
    border: '1px solid var(--color-accent)' as const,
    background: 'var(--color-accent)' as const,
    color: 'var(--color-bg)' as const,
    borderRadius: 'var(--radius-button)' as const,
    padding: '12px 24px' as const,
    font: '600 11px var(--font-mono)' as const,
    letterSpacing: '.08em' as const,
    textTransform: 'uppercase' as const,
    cursor: 'pointer' as const,
  },
  secondary: {
    border: '1px solid var(--color-border)' as const,
    background: 'transparent' as const,
    color: 'var(--color-text-muted)' as const,
    borderRadius: 'var(--radius-button)' as const,
    padding: '12px 20px' as const,
    font: '11px var(--font-mono)' as const,
    letterSpacing: '.08em' as const,
    textTransform: 'uppercase' as const,
    cursor: 'pointer' as const,
  },
  label: {
    display: 'block' as const,
    color: 'var(--color-text-dim)' as const,
    font: '10px var(--font-mono)' as const,
    letterSpacing: '.11em' as const,
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },
  input: {
    width: '100%' as const,
    color: 'var(--color-text)' as const,
    background: 'var(--color-bg)' as const,
    border: '1px solid var(--color-border)' as const,
    borderRadius: 'var(--radius-input)' as const,
    padding: '10px 12px' as const,
    font: '14px/1.5 var(--font-sans)' as const,
  },
  select: {
    width: '100%' as const,
    color: 'var(--color-text)' as const,
    background: 'var(--color-bg)' as const,
    border: '1px solid var(--color-border)' as const,
    borderRadius: 'var(--radius-input)' as const,
    padding: '10px 12px' as const,
    font: '14px/1.5 var(--font-sans)' as const,
    appearance: 'none' as const,
    cursor: 'pointer' as const,
  },
  tag: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '6px' as const,
    padding: '4px 10px' as const,
    background: 'var(--color-surface-elevated)' as const,
    border: '1px solid var(--color-border)' as const,
    font: '12px var(--font-sans)' as const,
    color: 'var(--color-text)' as const,
    cursor: 'default' as const,
  },
  card: {
    background: 'var(--color-surface)' as const,
    border: '1px solid var(--color-border)' as const,
    padding: '16px' as const,
  },
  dropzone: {
    border: '2px dashed var(--color-border)' as const,
    padding: '40px 24px' as const,
    textAlign: 'center' as const,
    cursor: 'pointer' as const,
    transition: 'border-color .15s' as const,
  },
};

// ── Helper: Select dropdown ─────────────────────────────────────
function Select<T extends string>({
  label, value, options, onChange, placeholder,
}: {
  label: string;
  value: T | null;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T | null) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={ui.label}>{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
        style={ui.select}
      >
        <option value="">{placeholder ?? 'Select…'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

// ── Helper: Expandable note ─────────────────────────────────────
function NoteField({
  label, value, onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(!!value);
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{ ...ui.secondary, display: 'inline-block', marginTop: '8px', fontSize: '10px', padding: '6px 12px' }}
      >
        + Add note
      </button>
    );
  }
  return (
    <div style={{ marginTop: '8px' }}>
      <span style={ui.label}>{label}</span>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="Optional note…"
        rows={2}
        style={{ ...ui.input, resize: 'vertical' }}
      />
      <button
        onClick={() => { onChange(null); setExpanded(false); }}
        style={{ ...ui.secondary, display: 'inline-block', marginTop: '4px', fontSize: '10px', padding: '4px 10px' }}
      >
        Remove note
      </button>
    </div>
  );
}

// ── Helper: Role card ───────────────────────────────────────────
function RoleCard({
  role, onUpdate, onRemove,
}: {
  role: CareerRole;
  onUpdate: (role: CareerRole) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const yearRange = role.startYear || role.endYear
    ? `${role.startYear ?? '?'}–${role.endYear ?? 'now'}`
    : '';
  return (
    <div style={ui.card}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            value={role.title}
            onChange={(e) => onUpdate({ ...role, title: e.target.value })}
            placeholder="Title"
            style={ui.input}
          />
          <input
            value={role.organisation}
            onChange={(e) => onUpdate({ ...role, organisation: e.target.value })}
            placeholder="Organisation"
            style={ui.input}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              value={role.startYear ?? ''}
              onChange={(e) => onUpdate({ ...role, startYear: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Start year"
              style={ui.input}
            />
            <input
              type="number"
              value={role.endYear ?? ''}
              onChange={(e) => onUpdate({ ...role, endYear: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="End year (blank = current)"
              style={ui.input}
            />
          </div>
          <input
            value={role.scope}
            onChange={(e) => onUpdate({ ...role, scope: e.target.value })}
            placeholder="Scope (team size, budget, scale)"
            style={ui.input}
          />
          <textarea
            value={role.highlights.join('\n')}
            onChange={(e) => onUpdate({ ...role, highlights: e.target.value.split('\n').filter(Boolean) })}
            placeholder="Highlights (one per line)"
            rows={3}
            style={{ ...ui.input, resize: 'vertical' }}
          />
          <button onClick={() => setEditing(false)} style={{ ...ui.secondary, alignSelf: 'flex-start' }}>Done</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
            <div>
              <span style={{ font: '500 16px var(--font-sans)', color: 'var(--color-text)' }}>{role.title || 'Untitled role'}</span>
              {role.organisation && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginLeft: '8px' }}>{role.organisation}</span>
              )}
            </div>
            <span style={{ color: 'var(--color-text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{yearRange}</span>
          </div>
          {role.scope && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: '6px 0 0' }}>{role.scope}</p>
          )}
          {role.highlights.length > 0 && (
            <ul style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
              {role.highlights.map((h, i) => (
                <li key={i} style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.5, marginBottom: '2px' }}>{h}</li>
              ))}
            </ul>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={() => setEditing(true)} style={{ ...ui.secondary, fontSize: '10px', padding: '4px 10px' }}>Edit</button>
            <button onClick={onRemove} style={{ ...ui.secondary, fontSize: '10px', padding: '4px 10px', color: 'var(--color-danger)' }}>Remove</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper: Skill tags ──────────────────────────────────────────
function SkillTags({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInput('');
    }
  };
  return (
    <div>
      <span style={ui.label}>Skills & competencies</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {skills.map((skill) => (
          <span key={skill} style={ui.tag}>
            {skill}
            <button
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1 }}
            >×</button>
          </span>
        ))}
        {skills.length === 0 && <span style={{ color: 'var(--color-text-dim)', fontSize: '13px' }}>No skills added yet.</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Type a skill and press Enter"
          style={{ ...ui.input, flex: 1 }}
        />
        <button onClick={add} style={ui.secondary}>Add</button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export function ProfileBuilder({ profile, onChange, authToken }: ProfileBuilderProps) {
  const [mode, setMode] = useState<IntakeMode>(
    profile.roles.length > 0 || profile.careerSummary ? 'review' : 'choose',
  );
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const update = useCallback((patch: Partial<StructuredProfile>) => {
    onChange({ ...profile, ...patch });
  }, [profile, onChange]);

  // ── PDF text extraction (client-side) ────────────────────────
  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  // ── Call Edge Function ───────────────────────────────────────
  const callExtractFunction = async (text: string): Promise<ExtractedCV> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken ?? SUPABASE_ANON_KEY}`,
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Extraction failed (${response.status})`);
    }

    return response.json();
  };

  // ── Upload handler ───────────────────────────────────────────
  const handleFile = async (file: File) => {
    setError(null);
    setExtracting(true);
    try {
      let text: string;
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await extractPdfText(file);
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        throw new Error('Please upload a PDF or text file.');
      }

      if (text.trim().length < 50) {
        throw new Error('Could not extract enough text from this file. Try pasting your CV text instead.');
      }

      const extracted = await callExtractFunction(text);
      const newProfile = extractionToProfile(extracted);
      onChange(newProfile);
      setMode('review');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during extraction.');
    } finally {
      setExtracting(false);
    }
  };

  // ── Paste handler ────────────────────────────────────────────
  const handlePaste = async () => {
    setError(null);
    if (pasteText.trim().length < 50) {
      setError('Please paste at least a few sentences of your CV or LinkedIn profile.');
      return;
    }
    setExtracting(true);
    try {
      const extracted = await callExtractFunction(pasteText);
      const newProfile = extractionToProfile(extracted);
      onChange(newProfile);
      setMode('review');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during extraction.');
    } finally {
      setExtracting(false);
    }
  };

  // ── Manual: start with empty profile ────────────────────────
  const handleManual = () => {
    onChange(createEmptyProfile());
    setMode('review');
  };

  // ── Add role ─────────────────────────────────────────────────
  const addRole = () => {
    const newRole: CareerRole = {
      id: `role-${Date.now()}`,
      title: '', organisation: '', startYear: null, endYear: null,
      location: null, scope: '', highlights: [],
    };
    update({ roles: [...profile.roles, newRole] });
  };

  const updateRole = (id: string, role: CareerRole) => {
    update({ roles: profile.roles.map((r) => r.id === id ? role : r) });
  };

  const removeRole = (id: string) => {
    update({ roles: profile.roles.filter((r) => r.id !== id) });
  };

  // ── Render: Choose intake path ───────────────────────────────
  if (mode === 'choose') {
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>01 / Your starting point</p>
        <h1 style={ui.h1}>Build your career profile.</h1>
        <p style={ui.quiet}>
          Atlas needs to know your career history to make direction useful.
          Choose the fastest way to get your information in — you'll review
          and edit everything before it's saved.
        </p>
        {error && <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-danger)', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '14px' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => document.getElementById('cv-file-input')?.click()}
            style={{
              ...ui.dropzone,
              borderColor: dragOver ? 'var(--color-accent)' : 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <input
              id="cv-file-input"
              type="file"
              accept=".pdf,.txt,text/plain"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <p style={{ font: '500 16px var(--font-sans)', color: 'var(--color-text)', margin: '0 0 4px' }}>
              {extracting ? 'Extracting…' : 'Upload your CV (PDF)'}
            </p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', margin: 0 }}>
              {extracting ? 'Atlas is reading your CV and structuring it.' : 'Drag & drop or click to browse. Atlas extracts and structures it for you.'}
            </p>
          </div>
          {/* Paste */}
          <button onClick={() => setMode('paste')} style={{ ...ui.panel, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)' }}>
            <p style={{ font: '500 15px var(--font-sans)', color: 'var(--color-text)', margin: '0 0 4px' }}>Paste from LinkedIn or text</p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', margin: 0 }}>Copy your LinkedIn About or CV text, paste it, and Atlas structures it.</p>
          </button>
          {/* Manual */}
          <button onClick={handleManual} style={{ ...ui.panel, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--color-border)' }}>
            <p style={{ font: '500 15px var(--font-sans)', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>Build from scratch</p>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', margin: 0 }}>Enter your career details manually using structured forms.</p>
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Paste mode ───────────────────────────────────────
  if (mode === 'paste') {
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>Paste your career text</p>
        <h1 style={{ ...ui.h1, fontSize: '32px' }}>Paste your CV or LinkedIn profile.</h1>
        <p style={ui.quiet}>
          Copy the text from your LinkedIn About section, your CV, or any career summary.
          Atlas will extract roles, skills, and education from it.
        </p>
        {error && <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-danger)', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '14px' }}>{error}</div>}
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your career text here…"
          rows={12}
          style={{ ...ui.input, resize: 'vertical', marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setMode('choose')} style={ui.secondary}>← Back</button>
          <button
            onClick={handlePaste}
            disabled={extracting}
            style={{ ...ui.primary, opacity: extracting ? 0.5 : 1 }}
          >
            {extracting ? 'Extracting…' : 'Extract →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Review/Edit mode ─────────────────────────────────
  if (mode === 'review') {
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>01 / Your starting point</p>
        <h1 style={ui.h1}>Review your profile.</h1>
        <p style={ui.quiet}>
          Everything below is editable. Add, remove, or correct anything Atlas
          got wrong. This is the foundation for your career direction work.
        </p>

        {error && <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-danger)', marginBottom: '16px', color: 'var(--color-danger)', fontSize: '14px' }}>{error}</div>}

        {/* ── Current situation ──────────────────────────────── */}
        <div style={{ ...ui.panel, marginBottom: '20px' }}>
          <p style={{ ...ui.kicker, marginBottom: '16px' }}>Current situation</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select<CurrentSituation>
              label="What's happening right now?"
              value={profile.currentSituation}
              options={SITUATION_OPTIONS}
              onChange={(v) => update({ currentSituation: v })}
            />
            <Select<ChangeDriver>
              label="What's driving the change?"
              value={profile.changeDriver}
              options={DRIVER_OPTIONS}
              onChange={(v) => update({ changeDriver: v })}
            />
          </div>
          <NoteField
            label="Situation note"
            value={profile.situationNote}
            onChange={(v) => update({ situationNote: v })}
          />
        </div>

        {/* ── Career evidence ────────────────────────────────── */}
        <div style={{ ...ui.panel, marginBottom: '20px' }}>
          <p style={{ ...ui.kicker, marginBottom: '16px' }}>Demonstrated career evidence</p>

          {profile.careerSummary && (
            <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'var(--color-surface-elevated)', borderLeft: '2px solid var(--color-accent)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{profile.careerSummary}</p>
            </div>
          )}

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {profile.roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onUpdate={(r) => updateRole(role.id, r)}
                onRemove={() => removeRole(role.id)}
              />
            ))}
            {profile.roles.length === 0 && (
              <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', padding: '16px 0' }}>No roles added yet.</p>
            )}
          </div>
          <button onClick={addRole} style={{ ...ui.secondary, marginBottom: '16px' }}>+ Add role</button>

          {/* Skills */}
          <div style={{ marginTop: '16px' }}>
            <SkillTags skills={profile.skills} onChange={(s) => update({ skills: s })} />
          </div>

          {/* Languages */}
          {profile.languages.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <span style={ui.label}>Languages</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.languages.map((lang) => (
                  <span key={lang} style={ui.tag}>{lang}</span>
                ))}
              </div>
            </div>
          )}

          <NoteField
            label="Evidence note"
            value={profile.evidenceNote}
            onChange={(v) => update({ evidenceNote: v })}
          />
        </div>

        {/* ── Practical conditions ───────────────────────────── */}
        <div style={{ ...ui.panel, marginBottom: '20px' }}>
          <p style={{ ...ui.kicker, marginBottom: '16px' }}>Practical conditions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label>
              <span style={ui.label}>Location</span>
              <input
                value={profile.location ?? ''}
                onChange={(e) => update({ location: e.target.value || null })}
                placeholder="City, country"
                style={ui.input}
              />
            </label>
            <Select<WorkArrangement>
              label="Work arrangement"
              value={profile.workArrangement}
              options={ARRANGEMENT_OPTIONS}
              onChange={(v) => update({ workArrangement: v })}
            />
            <Select<Mobility>
              label="Mobility"
              value={profile.mobility}
              options={MOBILITY_OPTIONS}
              onChange={(v) => update({ mobility: v })}
            />
            <Select<TravelTolerance>
              label="Travel tolerance"
              value={profile.travelTolerance}
              options={TRAVEL_OPTIONS}
              onChange={(v) => update({ travelTolerance: v })}
            />
            <Select<Availability>
              label="Availability"
              value={profile.availability}
              options={AVAILABILITY_OPTIONS}
              onChange={(v) => update({ availability: v })}
            />
            <Select<IncomeExpectation>
              label="Income expectation"
              value={profile.incomeExpectation}
              options={INCOME_OPTIONS}
              onChange={(v) => update({ incomeExpectation: v })}
            />
          </div>
          <NoteField
            label="Conditions note (visa, caring responsibilities, etc.)"
            value={profile.conditionsNote}
            onChange={(v) => update({ conditionsNote: v })}
          />
        </div>

        {/* Re-extract option */}
        <button onClick={() => setMode('choose')} style={{ ...ui.secondary, fontSize: '10px' }}>
          ← Start over with a different intake method
        </button>
      </div>
    );
  }

  return null;
}
