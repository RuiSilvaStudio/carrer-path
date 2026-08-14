import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Nav } from '../components/Nav';

export function PrivacyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {!user && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
          padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--color-text)' }}
          >
            ← Atlas Path
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--color-accent)' }}
          >
            Log in
          </button>
        </div>
      )}
      {user && <Nav />}

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 500,
          color: 'var(--color-text)', marginBottom: '8px',
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '48px',
        }}>
          Last updated: August 3, 2026
        </p>

        <Section title="1. Who we are">
          <p>
            The Atlas Path is operated by Rui Silva, an independent professional based in Portugal.
            Atlas Path is a career-direction tool that helps you understand your traits, track them
            over time, and explore career paths that fit your profile.
          </p>
          <p>
            For any privacy-related questions, contact: <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)' }}>privacy@atlaspath.eu</code>
          </p>
        </Section>

        <Section title="2. Where your data is stored">
          <p>
            <strong style={{ color: 'var(--color-text)' }}>Your data never leaves the European Union.</strong>
          </p>
          <p>Atlas Path runs on a fully sovereign European infrastructure:</p>
          <ul>
            <li><strong style={{ color: 'var(--color-text)' }}>Database & Authentication:</strong> Self-hosted Supabase (PostgreSQL) on a private server in Portugal.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>AI processing:</strong> A self-hosted language model (Qwen 2.5) running on the same private server. No data is sent to OpenAI, Google, or any US-based AI provider.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Frontend hosting:</strong> Vercel serves the static website files. Vercel does not have access to your personal data — it only delivers HTML, CSS, and JavaScript to your browser.</li>
          </ul>
          <p>
            No US company has access to your personal data at any point. There is no US cloud
            provider in the data path.
          </p>
        </Section>

        <Section title="3. What data we collect">
          <p>You provide the following data when you use Atlas Path:</p>
          <ul>
            <li><strong style={{ color: 'var(--color-text)' }}>Account:</strong> Email address and password (stored as a bcrypt hash).</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Assessment data:</strong> Your Big Five personality scores (baseline + weekly pulses), responses, context tags, emotions, and notes.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Career profile:</strong> Work history, skills, preferences, and career direction hypotheses you create.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Job listings:</strong> Job postings you save or that are matched to your profile.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Feedback:</strong> Optional feedback you provide through in-app prompts (thumbs up/down, text, rankings).</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Analytics events:</strong> Privacy-safe event names (e.g., "page_viewed") with no personal identifiers beyond your user ID.</li>
          </ul>
          <p>
            <strong style={{ color: 'var(--color-text)' }}>We do NOT collect:</strong> IP addresses,
            browser fingerprints, third-party tracking cookies, advertising identifiers, or location
            data. We do not use Google Analytics, Facebook Pixel, or any third-party analytics tool.
          </p>
        </Section>

        <Section title="4. How we use your data">
          <p>Your data is used exclusively to:</p>
          <ul>
            <li>Display your assessment results and trajectory over time</li>
            <li>Generate career direction suggestions using the self-hosted AI model</li>
            <li>Store your job listings</li>
            <li>Improve the product based on aggregated, anonymized feedback</li>
          </ul>
          <p>
            <strong style={{ color: 'var(--color-text)' }}>Your data is never sold, shared, or
            transmitted to any third party.</strong> We do not run advertising. We do not share data
            with researchers. We do not use your data to train external AI models.
          </p>
        </Section>

        <Section title="5. Legal basis (GDPR Article 6)">
          <p>We process your personal data on the following legal bases:</p>
          <ul>
            <li><strong style={{ color: 'var(--color-text)' }}>Contract (Art. 6(1)(b)):</strong> Creating an account and providing the assessment service you requested.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Consent (Art. 6(1)(a)):</strong> Optional feedback, analytics events, and career direction AI processing. You can withdraw consent at any time by deleting the relevant data or your account.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Legitimate interest (Art. 6(1)(f)):</strong> Security logging and error monitoring to keep the service running.</li>
          </ul>
        </Section>

        <Section title="6. Your rights under GDPR">
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong style={{ color: 'var(--color-text)' }}>Right of access (Art. 15):</strong> View all your data at any time within the app, or export it as CSV.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Right to rectification (Art. 16):</strong> Edit your profile and assessment notes at any time.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Right to erasure (Art. 17):</strong> Delete individual assessments, job listings, or your entire account permanently. Account deletion wipes all associated data — this is a hard delete, not a soft deactivation.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Right to data portability (Art. 20):</strong> Download all your data as CSV files from the Profile page.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Right to restrict processing (Art. 18):</strong> Stop using specific features (e.g., the AI career direction tool) while keeping your account.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Right to object (Art. 21):</strong> Object to analytics or feedback processing — contact us and we will disable it.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Right to withdraw consent (Art. 7(3)):</strong> Withdraw consent for optional processing at any time by deleting the relevant data.</li>
          </ul>
          <p>
            To exercise any of these rights, use the in-app tools (Profile → Export / Delete) or
            contact <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)' }}>privacy@atlaspath.eu</code>.
            We respond within 30 days.
          </p>
        </Section>

        <Section title="7. Data retention">
          <ul>
            <li><strong style={{ color: 'var(--color-text)' }}>Account data:</strong> Retained until you delete your account. No automatic expiration.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Analytics events:</strong> Automatically deleted after 24 months.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Feedback events:</strong> Automatically deleted after 24 months.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Assessments, job listings:</strong> Retained until you delete them individually or delete your account.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Backups:</strong> Daily database backups are retained for 7 days, then automatically deleted. Backups are stored on the same EU server.</li>
          </ul>
        </Section>

        <Section title="8. Data security">
          <ul>
            <li><strong style={{ color: 'var(--color-text)' }}>Encryption in transit:</strong> All data is transmitted over HTTPS (TLS 1.2+).</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Encryption at rest:</strong> The database encrypts stored data at the file system level.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Row-level security:</strong> PostgreSQL RLS policies enforce that only your authenticated user ID can access your records. No user can read another user's data.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>Network isolation:</strong> The database is not directly exposed to the internet. All access is authenticated and encrypted.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>API key authentication:</strong> The AI model endpoint requires a secret API key. It is not publicly accessible.</li>
            <li><strong style={{ color: 'var(--color-text)' }}>No third-party access:</strong> No external company, service, or contractor has access to the database or server.</li>
          </ul>
        </Section>

        <Section title="9. International transfers">
          <p>
            <strong style={{ color: 'var(--color-text)' }}>There are no international data transfers.</strong>
            All personal data is processed and stored on servers located within the European Union
            (Portugal). No data is transferred to the United States or any other
            non-EU country.
          </p>
          <p>
            Vercel (frontend hosting) and Cloudflare (infrastructure provider) are US-incorporated
            companies that help deliver the website, but they have no access to your personal data.
            Vercel only serves static website files (HTML, CSS, JavaScript). Cloudflare provides
            network infrastructure. Neither has access to the database, authentication system,
            or any user data.
          </p>
        </Section>

        <Section title="10. Cookies">
          <p>
            Atlas Path uses a single essential cookie to maintain your login session. This cookie
            contains an authentication token and is necessary for the service to function. It is
            not used for tracking, advertising, or analytics.
          </p>
          <p>
            We do not use third-party cookies, advertising cookies, or tracking pixels. There is
            no cookie consent banner because there are no non-essential cookies.
          </p>
        </Section>

        <Section title="11. Children's data">
          <p>
            Atlas Path is not directed at children under 16. We do not knowingly collect data from
            children under 16. If you believe a child has provided us with personal data, please
            contact us and we will delete it immediately.
          </p>
        </Section>

        <Section title="12. Changes to this policy">
          <p>
            We may update this policy from time to time. The "Last updated" date at the top of this
            page reflects the most recent revision. If we make material changes, we will notify you
            within the app.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            For any questions about this privacy policy or your personal data, contact:
          </p>
          <p>
            <strong style={{ color: 'var(--color-text)' }}>Rui Silva</strong><br />
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-accent)' }}>privacy@atlaspath.eu</code><br />
            Portugal
          </p>
        </Section>
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3)', fontWeight: 500,
        color: 'var(--color-text)', marginBottom: '12px',
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7,
      }}>
        {children}
      </div>
    </section>
  );
}
