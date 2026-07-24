import { KB_SECTIONS } from './cockpitKB';

export function KnowledgeBaseView() {
  return (
    <div style={{ maxWidth: '100%' }}>
      {KB_SECTIONS.map((section, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '20px 22px',
            marginBottom: '12px',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {section.title}
          </h3>
          <div style={{ color: 'var(--color-text)' }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
}
