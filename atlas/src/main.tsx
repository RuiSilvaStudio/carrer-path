import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Skip-to-main link as the first focusable element per WCAG 2.4.1.
// Visible on focus only; jumps to <main id="atlas-main">.
function SkipToMain() {
  return (
    <a
      href="#atlas-main"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999,
      }}
      onFocus={(e) => {
        const el = e.currentTarget;
        el.style.left = '12px';
        el.style.top = '12px';
        el.style.width = 'auto';
        el.style.height = 'auto';
        el.style.padding = '10px 18px';
        el.style.background = 'var(--color-accent)';
        el.style.color = 'var(--color-bg)';
        el.style.borderRadius = 'var(--radius-button)';
        el.style.fontFamily = 'var(--font-mono)';
        el.style.fontSize = '11px';
        el.style.textTransform = 'uppercase';
        el.style.letterSpacing = '0.14em';
        el.style.textDecoration = 'none';
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
      }}
      onBlur={(e) => {
        const el = e.currentTarget;
        el.style.left = '-9999px';
        el.style.top = 'auto';
        el.style.width = '1px';
        el.style.height = '1px';
        el.style.padding = '0';
        el.style.boxShadow = 'none';
      }}
    >
      Skip to main content
    </a>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkipToMain />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
