import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  company: string;
  relationship: string;
  tier: 'A' | 'B';
  status: PipelineStatus;
  goals: string;
  message: string;
  notes: string;
  lastContact: string | null;
}

type PipelineStatus = 'not_contacted' | 'aware' | 'ready' | 'warm_contact' | 'meeting';

const PIPELINE_STAGES: { key: PipelineStatus; label: string; order: number }[] = [
  { key: 'not_contacted', label: 'Not Contacted', order: 0 },
  { key: 'aware', label: 'Aware', order: 1 },
  { key: 'ready', label: 'Ready', order: 2 },
  { key: 'warm_contact', label: 'Warm Contact', order: 3 },
  { key: 'meeting', label: 'Meeting', order: 4 },
];

const STORAGE_KEY = 'atlas_cockpit_contacts';

const MESSAGE_TEMPLATES: Record<string, string> = {
  not_contacted: 'Hi {name}, I came across your work at {company} and would love to connect.',
  aware: 'Hi {name}, following up on my earlier note. Would you have 20 minutes to chat about {goals}?',
  ready: 'Hi {name}, I noticed {company} is expanding. I would love to share how I could contribute to {goals}.',
  warm_contact: 'Hi {name}, great connecting recently. Let me know if there is a good time to meet.',
  meeting: 'Hi {name}, looking forward to our meeting. Here is the agenda I am thinking of.',
};

// ── Sample contacts for first run ───────────────────────────────
const SAMPLE_CONTACTS: Contact[] = [
  {
    id: '1', name: 'Sarah Chen', company: 'Helix Labs', relationship: 'Former colleague',
    tier: 'A', status: 'warm_contact', goals: 'AI product leadership', message: '',
    notes: 'Met at Web Summit 2024. Interested in our analytics work.',
    lastContact: '2025-03-15',
  },
  {
    id: '2', name: 'Marcus Webb', company: 'North Star Ventures', relationship: 'Investor',
    tier: 'A', status: 'meeting', goals: 'Series A intro', message: '',
    notes: 'Warm intro from David Kim. Focus on data infrastructure thesis.',
    lastContact: '2025-04-02',
  },
  {
    id: '3', name: 'Priya Sharma', company: 'Atlas Consulting', relationship: 'Industry contact',
    tier: 'B', status: 'aware', goals: 'Partnership exploration', message: '',
    notes: 'Connected on LinkedIn. Interested in B2B analytics partnerships.',
    lastContact: null,
  },
  {
    id: '4', name: 'James OConnor', company: 'Meridian Health', relationship: 'Conference contact',
    tier: 'B', status: 'not_contacted', goals: 'Healthcare data role', message: '',
    notes: 'Met at HIMSS. Discussed clinical data challenges.',
    lastContact: null,
  },
];

// ── Cockpit component ────────────────────────────────────────────
export function Cockpit() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [view, setView] = useState<'list' | 'pipeline' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'A' | 'B'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});

  const formRef = useRef<HTMLDivElement>(null);

  // Load contacts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setContacts(JSON.parse(saved));
      } else {
        setContacts(SAMPLE_CONTACTS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CONTACTS));
      }
    } catch {
      setContacts(SAMPLE_CONTACTS);
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = useCallback((updated: Contact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.relationship.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'all' || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // Add new contact
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '', company: '', relationship: '', tier: 'B',
    status: 'not_contacted', goals: '', message: '', notes: '',
  });

  const handleAddContact = () => {
    if (!newContact.name?.trim()) return;
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name || '',
      company: newContact.company || '',
      relationship: newContact.relationship || '',
      tier: (newContact.tier as 'A' | 'B') || 'B',
      status: (newContact.status as PipelineStatus) || 'not_contacted',
      goals: newContact.goals || '',
      message: newContact.message || '',
      notes: newContact.notes || '',
      lastContact: null,
    };
    saveContacts([...contacts, contact]);
    setNewContact({ name: '', company: '', relationship: '', tier: 'B', status: 'not_contacted', goals: '', message: '', notes: '' });
    setView('list');
  };

  // Update contact
  const handleUpdateContact = (id: string) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, ...editForm } as Contact : c,
    );
    saveContacts(updated);
    setEditingId(null);
    setEditForm({});
  };

  // Delete contact
  const handleDeleteContact = (id: string) => {
    saveContacts(contacts.filter((c) => c.id !== id));
    setExpandedId(null);
  };

  // Move contact to different pipeline stage
  const handleStageChange = (id: string, newStatus: PipelineStatus) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, status: newStatus, lastContact: new Date().toISOString().split('T')[0] } : c,
    );
    saveContacts(updated);
  };

  // Generate message template
  const generateMessage = (contact: Contact) => {
    const template = MESSAGE_TEMPLATES[contact.status] || MESSAGE_TEMPLATES.not_contacted;
    return template
      .replace('{name}', contact.name)
      .replace('{company}', contact.company)
      .replace('{goals}', contact.goals || 'your work');
  };

  // ── Stats ─────────────────────────────────────────────────────
  const totalContacts = contacts.length;
  const tierACount = contacts.filter((c) => c.tier === 'A').length;
  const inPipeline = contacts.filter((c) => c.status !== 'not_contacted').length;
  const meetingsCount = contacts.filter((c) => c.status === 'meeting').length;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: '1100px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormField label="Name" value={newContact.name || ''} onChange={(v) => setNewContact({ ...newContact, name: v })} placeholder="Full name" />
            <FormField label="Company" value={newContact.company || ''} onChange={(v) => setNewContact({ ...newContact, company: v })} placeholder="Company name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormField label="Relationship" value={newContact.relationship || ''} onChange={(v) => setNewContact({ ...newContact, relationship: v })} placeholder="e.g. Former colleague" />
            <div>
              <label style={labelStyle}>Tier</label>
              <select
                value={newContact.tier || 'B'}
                onChange={(e) => setNewContact({ ...newContact, tier: e.target.value as 'A' | 'B' })}
                style={inputStyle}
              >
                <option value="A">A — High Priority</option>
                <option value="B">B — Standard</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Pipeline Status</label>
            <select
              value={newContact.status || 'not_contacted'}
              onChange={(e) => setNewContact({ ...newContact, status: e.target.value as PipelineStatus })}
              style={inputStyle}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <FormField label="Goals" value={newContact.goals || ''} onChange={(v) => setNewContact({ ...newContact, goals: v })} placeholder="What do you want from this connection?" />
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
            {(['all', 'A', 'B'] as const).map((t) => (
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
              onGenerateMessage={() => {
                const msg = generateMessage(contact);
                const updated = contacts.map((c) =>
                  c.id === contact.id ? { ...c, message: msg } : c,
                );
                saveContacts(updated);
              }}
              onEditFormChange={setEditForm}
            />
          ))}
        </div>
      )}

      {/* ── Pipeline View (Kanban) ────────────────────────────── */}
      {view === 'pipeline' && (
        <div style={{
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
                  {stage.label}
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
                  {contact.name}
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
            {contact.goals && (
              <div style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Goals</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{contact.goals}</div>
              </div>
            )}
            {contact.notes && (
              <div style={{ marginBottom: '12px' }}>
                <div style={labelStyle}>Notes</div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{contact.notes}</div>
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={labelStyle}>Message Template</div>
                <button
                  onClick={() => {
                    const msg = generateMessage(contact);
                    const updated = contacts.map((c) =>
                      c.id === contact.id ? { ...c, message: msg } : c,
                    );
                    saveContacts(updated);
                  }}
                  style={{
                    background: 'none', border: '1px solid var(--color-border)',
                    borderRadius: '4px', padding: '4px 10px',
                    fontSize: '11px', fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)', cursor: 'pointer',
                  }}
                >
                  Generate
                </button>
              </div>
              <textarea
                value={contact.message}
                onChange={(e) => {
                  const updated = contacts.map((c) =>
                    c.id === contact.id ? { ...c, message: e.target.value } : c,
                  );
                  saveContacts(updated);
                }}
                rows={3}
                placeholder="Click Generate or write your own…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
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
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
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
   onGenerateMessage, onEditFormChange,
}: {
  contact: Contact;
  expanded: boolean;
  editing: boolean;
  editForm: Partial<Contact>;
  onToggle: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  
  onGenerateMessage: () => void;
  onEditFormChange: (f: Partial<Contact>) => void;
}) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
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
              {contact.name}
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
          {contact.goals && (
            <div style={{ marginBottom: '12px' }}>
              <div style={labelStyle}>Goals</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{contact.goals}</div>
            </div>
          )}
          {contact.notes && (
            <div style={{ marginBottom: '12px' }}>
              <div style={labelStyle}>Notes</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{contact.notes}</div>
            </div>
          )}
          {contact.lastContact && (
            <div style={{ marginBottom: '12px' }}>
              <div style={labelStyle}>Last Contact</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {contact.lastContact}
              </div>
            </div>
          )}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={labelStyle}>Message Template</div>
              <button onClick={onGenerateMessage} style={{
                background: 'none', border: '1px solid var(--color-border)',
                borderRadius: '4px', padding: '4px 10px',
                fontSize: '11px', fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)', cursor: 'pointer',
              }}>
                Generate
              </button>
            </div>
            <div style={{
              padding: '10px 12px', background: 'var(--color-bg)',
              border: '1px solid var(--color-border)', borderRadius: '6px',
              fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5,
              minHeight: '40px', whiteSpace: 'pre-wrap',
            }}>
              {contact.message || 'Click Generate to create a message template.'}
            </div>
          </div>
          {/* Stage selector */}
          <div style={{ marginBottom: '12px' }}>
            <div style={labelStyle}>Move to Stage</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => /* onStageChange */(s.key)}
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
                  {s.label}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <FormField label="Name" value={editForm.name || ''} onChange={(v) => onEditFormChange({ ...editForm, name: v })} />
            <FormField label="Company" value={editForm.company || ''} onChange={(v) => onEditFormChange({ ...editForm, company: v })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <FormField label="Relationship" value={editForm.relationship || ''} onChange={(v) => onEditFormChange({ ...editForm, relationship: v })} />
            <div>
              <label style={labelStyle}>Tier</label>
              <select
                value={editForm.tier || 'B'}
                onChange={(e) => onEditFormChange({ ...editForm, tier: e.target.value as 'A' | 'B' })}
                style={inputStyle}
              >
                <option value="A">A — High Priority</option>
                <option value="B">B — Standard</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <FormField label="Goals" value={editForm.goals || ''} onChange={(v) => onEditFormChange({ ...editForm, goals: v })} />
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
  contact: Contact;
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
        {contact.name}
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

function TierBadge({ tier }: { tier: 'A' | 'B' }) {
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

function StageBadge({ status }: { status: PipelineStatus }) {
  const stage = PIPELINE_STAGES.find((s) => s.key === status);
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
      fontWeight: 500, fontFamily: 'var(--font-mono)',
      background: 'var(--color-surface-elevated)',
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border)',
    }}>
      {stage?.label || status}
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
