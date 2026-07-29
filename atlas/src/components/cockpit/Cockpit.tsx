import { useState, useRef, useEffect } from 'react';
import { useCockpit } from '../../hooks/useCockpit';
import { useJobListings } from '../../hooks/useJobListings';
import type { CockpitContact, PipelineStatus } from '../../types/cockpit';
import type { NewContact, ContactUpdate } from '../../hooks/useCockpit';
import { CompaniesView } from './CompaniesView';
import { InterviewPrepView } from './InterviewPrepView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { ContactLogView } from './ContactLogView';
import { JobListingsView } from './JobListingsView';

// ── Goals helpers (stored as JSON array string in the text column) ──
function parseGoals(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((g) => typeof g === 'string');
  } catch {
    // legacy plain-text — split on newlines, treat each line as a goal
    return raw.split(/\r?\n/).map((g) => g.trim()).filter(Boolean);
  }
  return [];
}

function serializeGoals(goals: string[]): string {
  return JSON.stringify(goals);
}

// ── Cockpit tabs ──────────────────────────────────────────────────
type CockpitTab = 'contacts' | 'companies' | 'interview' | 'kb' | 'jobs';

const COCKPIT_TABS: { id: CockpitTab; num: string; label: string }[] = [
  { id: 'contacts', num: '01', label: 'Contacts' },
  { id: 'companies', num: '02', label: 'Companies' },
  { id: 'interview', num: '03', label: 'Interview Prep' },
  { id: 'kb', num: '04', label: 'Knowledge Base' },
  { id: 'jobs', num: '05', label: 'Job Listings' },
];

// ── Pipeline stages (match Supabase text values) ───────────────
const PIPELINE_STAGES: { key: PipelineStatus; order: number }[] = [
  { key: 'Not contacted', order: 0 },
  { key: 'Aware', order: 1 },
  { key: 'Ready', order: 2 },
  { key: 'Warm contact', order: 3 },
  { key: 'Meeting', order: 4 },
];

const MESSAGE_TEMPLATES: Record<string, string> = {
  'Not contacted': 'Hi {name}, I came across your work at {company} and would love to connect.',
  'Aware': 'Hi {name}, following up on my earlier note. Would you have 20 minutes to chat about {goals}?',
  'Ready': 'Hi {name}, I noticed {company} is expanding. I would love to share how I could contribute to {goals}.',
  'Warm contact': 'Hi {name}, great connecting recently. Let me know if there is a good time to meet.',
  'Meeting': 'Hi {name}, looking forward to our meeting. Here is the agenda I am thinking of.',
};

// ── Cockpit component ────────────────────────────────────────────
export function Cockpit() {
  const { contacts, loading, error, addContact, updateContact, deleteContact } = useCockpit();
  const { jobs, loading: jobsLoading, error: jobsError, addJob, setJobStatus, deleteJob } = useJobListings();
  const [activeTab, setActiveTab] = useState<CockpitTab>('contacts');
  const [view, setView] = useState<'list' | 'pipeline' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CockpitContact>>({});

  const formRef = useRef<HTMLDivElement>(null);

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = !search ||
      c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.relationship.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'all' || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // Add new contact form state
  const [newContact, setNewContact] = useState<Partial<NewContact>>({
    contact_name: '', company: '', relationship: '', tier: 'B',
    status: 'Not contacted', goals: '', message: '', notes: '',
  });

  const handleAddContact = async () => {
    if (!newContact.contact_name?.trim()) return;
    await addContact({
      contact_name: newContact.contact_name || '',
      company: newContact.company || '',
      relationship: newContact.relationship || '',
      tier: (newContact.tier as 'A' | 'B' | 'C') || 'B',
      status: (newContact.status as string) || 'Not contacted',
      goals: newContact.goals || '',
      message: newContact.message || '',
      notes: newContact.notes || '',
    });
    setNewContact({ contact_name: '', company: '', relationship: '', tier: 'B', status: 'Not contacted', goals: '', message: '', notes: '' });
    setView('list');
  };

  // Update contact (inline edit)
  const handleUpdateContact = async (id: number) => {
    const updates: ContactUpdate = {
      contact_name: editForm.contact_name,
      company: editForm.company,
      relationship: editForm.relationship,
      tier: editForm.tier as 'A' | 'B' | 'C' | undefined,
      notes: editForm.notes,
    };
    // Remove undefined keys
    Object.keys(updates).forEach(k => updates[k as keyof ContactUpdate] === undefined && delete updates[k as keyof ContactUpdate]);
    await updateContact(id, updates);
    setEditingId(null);
    setEditForm({});
  };

  // Delete contact
  const handleDeleteContact = async (id: number) => {
    await deleteContact(id);
    setExpandedId(null);
  };

  // Move contact to different pipeline stage
  const handleStageChange = (id: number, newStatus: string) => {
    updateContact(id, { status: newStatus });
  };

  // Generate message template
  const generateMessage = (contact: CockpitContact) => {
    const template = MESSAGE_TEMPLATES[contact.status] || MESSAGE_TEMPLATES['Not contacted'];
    return template
      .replace('{name}', contact.contact_name)
      .replace('{company}', contact.company)
      .replace('{goals}', contact.goals || 'your work');
  };

  // ── Stats ─────────────────────────────────────────────────────
  const totalContacts = contacts.length;
  const tierACount = contacts.filter((c) => c.tier === 'A').length;
  const inPipeline = contacts.filter((c) => c.status !== 'Not contacted').length;
  const meetingsCount = contacts.filter((c) => c.status === 'Meeting').length;

  // ── Render ─────────────────────────────────────────────────────
  // Loading/error only applies to the Contacts tab (Supabase-backed)
  if (activeTab === 'contacts' && loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Loading cockpit…
        </div>
      </div>
    );
  }

  if (activeTab === 'contacts' && error) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--color-danger)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Error loading cockpit
        </div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="atlas-page" style={{ padding: '32px 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)', opacity: 0.8, marginBottom: '12px',
        }}>
          Career Cockpit
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400,
          color: 'var(--color-text)', letterSpacing: '-0.03em',
          marginBottom: '8px', lineHeight: 1.1,
        }}>
          Your network, your move.
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.5,
          maxWidth: '520px',
        }}>
          Track relationships, manage outreach, and move contacts through your pipeline.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="atlas-tabs" style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)', marginBottom: '28px' }}>
        {COCKPIT_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-active={active ? 'true' : 'false'}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                cursor: 'pointer',
                padding: '10px 20px 10px 0',
                marginRight: '24px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
                transition: 'color 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
                {tab.num}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Contacts Tab ──────────────────────────────────────── */}
      {activeTab === 'contacts' && (
      <>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <StatBox num={totalContacts} label="Total Contacts" />
        <StatBox num={tierACount} label="Tier A" />
        <StatBox num={inPipeline} label="In Pipeline" />
        <StatBox num={meetingsCount} label="Meetings" />
      </div>

      {/* View toggle */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center',
      }}>
        <button style={viewBtnStyle(view === 'list')} onClick={() => setView('list')}>List</button>
        <button style={viewBtnStyle(view === 'pipeline')} onClick={() => setView('pipeline')}>Pipeline</button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setView('add')}
          style={viewBtnStyle(view === 'add', true)}
        >
          + Add Contact
        </button>
      </div>

      {/* ── Add Contact Form ──────────────────────────────────── */}
      {view === 'add' && (
        <div ref={formRef} style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: '8px', padding: '24px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500,
            color: 'var(--color-text)', marginBottom: '20px',
          }}>
            New Contact
          </h2>
          <div className="atlas-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormField label="Name" value={newContact.contact_name || ''} onChange={(v) => setNewContact({ ...newContact, contact_name: v })} placeholder="Full name" />
            <FormField label="Company" value={newContact.company || ''} onChange={(v) => setNewContact({ ...newContact, company: v })} placeholder="Company name" />
          </div>
          <div className="atlas-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormField label="Relationship" value={newContact.relationship || ''} onChange={(v) => setNewContact({ ...newContact, relationship: v })} placeholder="e.g. Former colleague" />
            <div>
              <label style={labelStyle}>Tier</label>
              <select
                value={newContact.tier || 'B'}
                onChange={(e) => setNewContact({ ...newContact, tier: e.target.value as 'A' | 'B' | 'C' })}
                style={inputStyle}
              >
                <option value="A">A — High Priority</option>
                <option value="B">B — Standard</option>
                <option value="C">C — Low Priority</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Pipeline Status</label>
            <select
              value={newContact.status || 'Not contacted'}
              onChange={(e) => setNewContact({ ...newContact, status: e.target.value as PipelineStatus })}
              style={inputStyle}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.key}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={newContact.notes || ''}
              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
              placeholder="Background, context, how you met…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAddContact} style={primaryBtnStyle}>Save Contact</button>
            <button onClick={() => setView('list')} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Search + Filter (for list and pipeline views) ─────── */}
      {view !== 'add' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, maxWidth: '300px',
              padding: '10px 14px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: '6px',
              color: 'var(--color-text)', fontSize: '14px',
              fontFamily: 'var(--font-sans)', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'A', 'B', 'C'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTier(t)}
                style={{
                  padding: '8px 14px',
                  background: filterTier === t ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                  border: `1px solid ${filterTier === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '4px',
                  color: filterTier === t ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  fontSize: '11px', fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
                  transition: 'all 0.18s ease',
                }}
              >
                {t === 'all' ? 'All' : `Tier ${t}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── List View ─────────────────────────────────────────── */}
      {view === 'list' && (
        <div>
          {filteredContacts.length === 0 && (
            <div style={{
              padding: '40px', textAlign: 'center',
              color: 'var(--color-text-dim)', fontSize: '14px',
            }}>
              No contacts found. Try adjusting your search or add a new contact.
            </div>
          )}
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              expanded={expandedId === contact.id}
              editing={editingId === contact.id}
              editForm={editForm}
              onToggle={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
              onEdit={() => { setEditingId(contact.id); setEditForm(contact); }}
              onSaveEdit={() => handleUpdateContact(contact.id)}
              onDelete={() => handleDeleteContact(contact.id)}
              onStageChange={(stage) => handleStageChange(contact.id, stage)}
              onGenerateMessage={async () => {
                const msg = generateMessage(contact);
                await updateContact(contact.id, { message: msg });
              }}
              onEditFormChange={setEditForm}
              onSaveGoals={async (goals) => {
                await updateContact(contact.id, { goals: serializeGoals(goals) });
              }}
              onSaveMessage={async (message) => {
                await updateContact(contact.id, { message });
              }}
            />
          ))}
        </div>
      )}

      {/* ── Pipeline View (Kanban) ────────────────────────────── */}
      {view === 'pipeline' && (
        <div className="atlas-pipeline" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          minHeight: '400px',
        }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageContacts = filteredContacts.filter((c) => c.status === stage.key);
            return (
              <div key={stage.key} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px', padding: '12px',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  fontWeight: 500, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--color-accent)',
                  marginBottom: '12px', paddingBottom: '8px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  {stage.key}
                  <span style={{
                    color: 'var(--color-text-dim)', marginLeft: '8px',
                  }}>
                    {stageContacts.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stageContacts.map((contact) => (
                    <PipelineCard
                      key={contact.id}
                      contact={contact}
                      onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                    />
                  ))}
                  {stageContacts.length === 0 && (
                    <div style={{
                      padding: '16px 8px', textAlign: 'center',
                      color: 'var(--color-text-dim)', fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      —
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Expanded Contact Detail (pipeline) ────────────────── */}
      {view === 'pipeline' && expandedId && (() => {
        const contact = contacts.find((c) => c.id === expandedId);
        if (!contact) return null;
        return (
          <div style={{
            marginTop: '24px', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: '16px',
            }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500,
                  color: 'var(--color-text)', marginBottom: '4px',
                }}>
                  {contact.contact_name}
                </h3>
                <div style={{
                  fontSize: '13px', color: 'var(--color-text-muted)',
                }}>
                  {contact.company} · {contact.relationship} · Tier {contact.tier}
                </div>
              </div>
              <button onClick={() => setExpandedId(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-dim)', fontSize: '16px', fontFamily: 'var(--font-sans)',
              }}>
                ✕
              </button>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <GoalsEditor contact={contact} onSave={async (goals) => {
                await updateContact(contact.id, { goals: serializeGoals(goals) });
              }} />
            </div>
            {contact.notes && (
              <div style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Notes</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{contact.notes}</div>
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <MessageEditor contact={contact} onSave={async (message) => {
                await updateContact(contact.id, { message });
              }} onGenerate={async () => {
                const msg = generateMessage(contact);
                await updateContact(contact.id, { message: msg });
              }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <ContactLogView contact={contact} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleStageChange(contact.id, s.key)}
                  style={{
                    padding: '6px 10px',
                    background: contact.status === s.key ? 'var(--color-accent)' : 'var(--color-surface)',
                    border: `1px solid ${contact.status === s.key ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '4px',
                    color: contact.status === s.key ? 'var(--color-bg)' : 'var(--color-text-dim)',
                    fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {s.key}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
      </>)}

      {/* ── Companies Tab ─────────────────────────────────────── */}
      {activeTab === 'companies' && <CompaniesView />}

      {/* ── Interview Prep Tab ────────────────────────────────── */}
      {activeTab === 'interview' && <InterviewPrepView />}

      {/* ── Knowledge Base Tab ────────────────────────────────── */}
      {activeTab === 'kb' && <KnowledgeBaseView />}

      {/* ── Job Listings Tab ──────────────────────────────────── */}
      {activeTab === 'jobs' && (
        jobsLoading ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Loading job listings…
            </div>
          </div>
        ) : jobsError ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--color-danger)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Error loading job listings
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{jobsError}</div>
          </div>
        ) : (
          <JobListingsView jobs={jobs} addJob={addJob} setJobStatus={setJobStatus} deleteJob={deleteJob} />
        )
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function StatBox({ num, label }: { num: number; label: string }) {
  return (
    <div style={{
      padding: '14px 20px', background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: '8px',
      minWidth: '120px',
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 500,
        color: 'var(--color-accent)', marginBottom: '4px',
      }}>
        {num}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--color-text-dim)',
      }}>
        {label}
      </div>
    </div>
  );
}

function ContactCard({
  contact, expanded, editing, editForm, onToggle, onEdit, onSaveEdit, onDelete,
  onGenerateMessage, onEditFormChange, onStageChange, onSaveGoals, onSaveMessage,
}: {
  contact: CockpitContact;
  expanded: boolean;
  editing: boolean;
  editForm: Partial<CockpitContact>;
  onToggle: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onGenerateMessage: () => void;
  onEditFormChange: (f: Partial<CockpitContact>) => void;
  onStageChange: (stage: string) => void;
  onSaveGoals: (goals: string[]) => Promise<void>;
  onSaveMessage: (message: string) => Promise<void>;
}) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `1px solid ${expanded ? 'var(--color-accent)' : 'var(--color-border)'}`,
      borderRadius: '8px', padding: '16px 18px',
      marginBottom: '10px',
      transition: 'border-color 0.2s ease',
    }}>
      <div
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 500,
              color: 'var(--color-text)', marginBottom: '4px',
            }}>
              {contact.contact_name}
            </div>
            <div style={{
              fontSize: '13px', color: 'var(--color-text-muted)',
            }}>
              {contact.company} · {contact.relationship}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <TierBadge tier={contact.tier} />
            <StageBadge status={contact.status} />
          </div>
        </div>
      </div>

      {expanded && !editing && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ marginBottom: '12px' }}>
            <GoalsEditor contact={contact} onSave={onSaveGoals} />
          </div>
          {contact.notes && (
            <div style={{ marginBottom: '12px' }}>
              <div style={labelStyle}>Notes</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{contact.notes}</div>
            </div>
          )}
          <div style={{ marginBottom: '12px' }}>
            <MessageEditor contact={contact} onSave={onSaveMessage} onGenerate={async () => {
              await onGenerateMessage();
            }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <ContactLogView contact={contact} />
          </div>
          {/* Stage selector */}
          <div style={{ marginBottom: '12px' }}>
            <div style={labelStyle}>Move to Stage</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onStageChange(s.key)}
                  style={{
                    padding: '5px 10px',
                    background: contact.status === s.key ? 'var(--color-accent)' : 'var(--color-surface)',
                    border: `1px solid ${contact.status === s.key ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '4px',
                    color: contact.status === s.key ? 'var(--color-bg)' : 'var(--color-text-dim)',
                    fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {s.key}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onEdit} style={ghostBtnStyle}>Edit</button>
            <button onClick={onDelete} style={{
              ...ghostBtnStyle,
              color: 'var(--color-danger)',
              borderColor: 'var(--color-danger)',
            }}>Delete</button>
          </div>
        </div>
      )}

      {expanded && editing && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div className="atlas-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <FormField label="Name" value={editForm.contact_name || ''} onChange={(v) => onEditFormChange({ ...editForm, contact_name: v })} />
            <FormField label="Company" value={editForm.company || ''} onChange={(v) => onEditFormChange({ ...editForm, company: v })} />
          </div>
          <div className="atlas-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <FormField label="Relationship" value={editForm.relationship || ''} onChange={(v) => onEditFormChange({ ...editForm, relationship: v })} />
            <div>
              <label style={labelStyle}>Tier</label>
              <select
                value={editForm.tier || 'B'}
                onChange={(e) => onEditFormChange({ ...editForm, tier: e.target.value as 'A' | 'B' | 'C' })}
                style={inputStyle}
              >
                <option value="A">A — High Priority</option>
                <option value="B">B — Standard</option>
                <option value="C">C — Low Priority</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={editForm.notes || ''}
              onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onSaveEdit} style={primaryBtnStyle}>Save</button>
            <button onClick={() => onToggle()} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PipelineCard({ contact, onClick }: {
  contact: CockpitContact;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px', padding: '10px 12px',
        cursor: 'pointer', transition: 'border-color 0.18s ease',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
        color: 'var(--color-text)', marginBottom: '4px',
      }}>
        {contact.contact_name}
      </div>
      <div style={{
        fontSize: '11px', color: 'var(--color-text-dim)',
        fontFamily: 'var(--font-mono)',
      }}>
        {contact.company}
      </div>
      <div style={{ marginTop: '6px' }}>
        <TierBadge tier={contact.tier} />
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: 'A' | 'B' | 'C' }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
      fontWeight: 600, fontFamily: 'var(--font-mono)',
      background: tier === 'A' ? 'rgba(212, 165, 116, 0.15)' : 'rgba(168, 154, 135, 0.1)',
      color: tier === 'A' ? 'var(--color-accent)' : 'var(--color-text-dim)',
      border: `1px solid ${tier === 'A' ? 'var(--color-accent)' : 'var(--color-border)'}`,
    }}>
      Tier {tier}
    </span>
  );
}

function StageBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
      fontWeight: 500, fontFamily: 'var(--font-mono)',
      background: 'var(--color-surface-elevated)',
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border)',
    }}>
      {status}
    </span>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

// ── GoalsEditor: add / edit / remove individual goals ──────────────
function GoalsEditor({ contact, onSave }: {
  contact: CockpitContact;
  onSave: (goals: string[]) => Promise<void>;
}) {
  const goals = parseGoals(contact.goals);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  const startAdd = () => { setAdding(true); setDraft(''); setEditingIdx(null); };
  const startEdit = (idx: number) => { setEditingIdx(idx); setDraft(goals[idx] || ''); setAdding(false); };
  const cancel = () => { setEditingIdx(null); setAdding(false); setDraft(''); };

  const commitAdd = async () => {
    if (!draft.trim()) { cancel(); return; }
    await onSave([...goals, draft.trim()]);
    cancel();
  };

  const commitEdit = async () => {
    if (editingIdx === null) return;
    const next = [...goals];
    if (draft.trim()) {
      next[editingIdx] = draft.trim();
    } else {
      next.splice(editingIdx, 1); // empty = delete
    }
    await onSave(next);
    cancel();
  };

  const removeGoal = async (idx: number) => {
    const next = goals.filter((_, i) => i !== idx);
    await onSave(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={labelStyle}>Goals</div>
        {!adding && editingIdx === null && (
          <button onClick={startAdd} style={smallAddBtnStyle}>+ Add Goal</button>
        )}
      </div>

      {goals.length === 0 && !adding && (
        <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
          No goals yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {goals.map((goal, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
          }}>
            <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>›</span>
            {editingIdx === idx ? (
              <>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancel(); }}
                  autoFocus
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={commitEdit} style={smallSaveBtnStyle}>Save</button>
                <button onClick={cancel} style={smallGhostBtnStyle}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: '14px', color: 'var(--color-text)', flex: 1 }}>{goal}</span>
                <button onClick={() => startEdit(idx)} style={smallGhostBtnStyle}>Edit</button>
                <button onClick={() => removeGoal(idx)} style={{ ...smallGhostBtnStyle, color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Remove</button>
              </>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 10px',
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-accent)',
          borderRadius: '6px',
          marginTop: '6px',
        }}>
          <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>›</span>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') cancel(); }}
            autoFocus
            placeholder="What do you want from this connection?"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={commitAdd} style={smallSaveBtnStyle}>Add</button>
          <button onClick={cancel} style={smallGhostBtnStyle}>Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── MessageEditor: edit and save message template with Save/Cancel ─
function MessageEditor({ contact, onSave, onGenerate }: {
  contact: CockpitContact;
  onSave: (message: string) => Promise<void>;
  onGenerate?: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!editing) setDraft(contact.message || '');
  }, [contact.message, editing]);

  const startEdit = () => { setDraft(contact.message || ''); setEditing(true); };
  const cancel = () => { setEditing(false); setDraft(''); };
  const save = async () => {
    await onSave(draft);
    setEditing(false);
  };
  const generate = async () => {
    if (onGenerate) {
      await onGenerate();
    }
    setEditing(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={labelStyle}>Message Template</div>
        {!editing && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {onGenerate && (
              <button onClick={generate} style={{
                ...smallGhostBtnStyle,
                color: 'var(--color-accent)',
                borderColor: 'var(--color-accent)',
              }}>
                Generate
              </button>
            )}
            <button onClick={startEdit} style={smallGhostBtnStyle}>Edit</button>
          </div>
        )}
      </div>
      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            autoFocus
            style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={save} style={smallSaveBtnStyle}>Save</button>
            <button onClick={cancel} style={smallGhostBtnStyle}>Cancel</button>
          </div>
        </>
      ) : (
        <div style={{
          padding: '10px 12px', background: 'var(--color-bg)',
          border: '1px solid var(--color-border)', borderRadius: '6px',
          fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5,
          minHeight: '40px', whiteSpace: 'pre-wrap',
        }}>
          {contact.message || <span style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>No message yet. Click Edit to write one.</span>}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ───────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: '10px',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--color-text-dim)', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)', borderRadius: '6px',
  color: 'var(--color-text)', fontSize: '14px',
  fontFamily: 'var(--font-sans)', outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  border: 'none', borderRadius: '4px',
  fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
};

const ghostBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'none',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  fontSize: '13px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
};

const smallSaveBtnStyle: React.CSSProperties = {
  padding: '4px 12px',
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  border: 'none', borderRadius: '4px',
  fontSize: '11px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  whiteSpace: 'nowrap',
};

const smallGhostBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: 'none',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  fontSize: '11px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  whiteSpace: 'nowrap',
};

const smallAddBtnStyle: React.CSSProperties = {
  padding: '3px 10px',
  background: 'none',
  color: 'var(--color-accent)',
  border: `1px solid var(--color-accent)`,
  borderRadius: '4px',
  fontSize: '11px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font-mono)',
  whiteSpace: 'nowrap',
};

function viewBtnStyle(active: boolean, isAdd = false): React.CSSProperties {
  return {
    padding: '8px 16px',
    background: active ? (isAdd ? 'var(--color-accent)' : 'var(--color-surface-elevated)') : 'none',
    color: active ? (isAdd ? 'var(--color-bg)' : 'var(--color-accent)') : 'var(--color-text-dim)',
    border: `1px solid ${active ? (isAdd ? 'var(--color-accent)' : 'var(--color-accent)') : 'var(--color-border)'}`,
    borderRadius: '4px',
    fontSize: '11px', fontFamily: 'var(--font-mono)',
    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
    transition: 'all 0.18s ease',
  };
}
