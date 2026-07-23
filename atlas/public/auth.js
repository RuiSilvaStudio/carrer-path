/* ============================================================
   Auth Gate — Personality Atlas
   Shared across all pages. Requires supabase-config.js.
   - Checks session; shows login/registration overlay if not logged in.
   - Adds a logout link to the nav bar.
   - Exposes a global `requireAuth()` that pages call to gate access.
   ============================================================ */

(function() {
  'use strict';

  let _authGateReady = null;
  let _currentUser = null;

  /* ---- CSS for the auth overlay (injected once) ---- */
  const AUTH_CSS = `
    .auth-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: #18120e;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      color: #e8dfd3;
      --accent: #d4a574;
      --accent-bright: #e8b884;
      --accent-dim: #8a6f4e;
      --danger: #c97757;
      --signal: #7ba89b;
      --border: #3a2f25;
      --bg-surface: #251d17;
      --bg-elevated: #1f1813;
      --ink-muted: #a89a87;
      --ink-dim: #756657;
      --serif: 'Fraunces', Georgia, serif;
      --mono: 'IBM Plex Mono', ui-monospace, monospace;
    }
    .auth-card {
      max-width: 380px; width: 100%;
      background: #1f1813;
      border: 1px solid #3a2f25;
      border-radius: 6px;
      padding: 40px 36px 36px;
    }
    .auth-label {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 11px; font-weight: 500;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: #d4a574; opacity: 0.8; margin-bottom: 12px;
    }
    .auth-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 36px; font-weight: 400;
      color: #e8dfd3; line-height: 1.1;
      letter-spacing: -0.01em;
      font-variation-settings: "opsz" 60;
      margin-bottom: 28px;
    }
    .auth-field { margin-bottom: 16px; }
    .auth-field label {
      display: block; font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
      color: #756657; margin-bottom: 6px;
    }
    .auth-field input {
      width: 100%; padding: 12px 14px;
      background: #251d17; border: 1px solid #3a2f25; border-radius: 4px;
      color: #e8dfd3; font-family: 'IBM Plex Sans', system-ui, sans-serif;
      font-size: 14px; outline: none; transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .auth-field input:focus { border-color: #8a6f4e; }
    .auth-field input::placeholder { color: #4a3f36; }
    .auth-btn {
      width: 100%; padding: 13px 0;
      background: #d4a574; color: #18120e;
      border: none; border-radius: 4px;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; transition: background 0.2s, box-shadow 0.2s;
      margin-top: 4px;
    }
    .auth-btn:hover { background: #e8b884; box-shadow: 0 0 16px rgba(212,165,116,0.25); }
    .auth-btn:disabled { background: #251d17; color: #756657; cursor: not-allowed; box-shadow: none; }
    .auth-toggle {
      text-align: center; margin-top: 20px;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 11px; color: #756657; letter-spacing: 0.05em;
    }
    .auth-toggle a {
      color: #d4a574; text-decoration: none; cursor: pointer; font-weight: 500;
    }
    .auth-toggle a:hover { color: #e8b884; }
    .auth-error {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 11px; color: #c97757;
      margin-top: 14px; min-height: 16px;
      letter-spacing: 0.03em; line-height: 1.4;
    }
    .auth-loading {
      text-align: center; font-family: 'Fraunces', Georgia, serif;
      font-size: 18px; color: #d4a574; padding: 60px 0;
      font-variation-settings: "opsz" 40;
    }
    /* Logout link */
    .auth-logout {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 10px; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: #756657; text-decoration: none;
      padding: 8px 14px; cursor: pointer;
      transition: color 0.2s ease;
      line-height: 36px;
      margin-left: auto;
    }
    .auth-logout:hover { color: #c97757; }
  `;

  function injectCSS() {
    if (document.getElementById('auth-gate-css')) return;
    const style = document.createElement('style');
    style.id = 'auth-gate-css';
    style.textContent = AUTH_CSS;
    document.head.appendChild(style);
  }

  /* ---- Build the overlay DOM ---- */
  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.id = 'authOverlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="auth-card">
        <div class="auth-label">Personality Atlas</div>
        <h1 class="auth-title" id="authTitle">Sign In</h1>
        <div id="authFormWrap">
          <div id="authLoginForm">
            <div class="auth-field">
              <label>Email</label>
              <input type="email" id="authEmail" placeholder="you@example.com" autocomplete="email" />
            </div>
            <div class="auth-field">
              <label>Password</label>
              <input type="password" id="authPassword" placeholder="••••••••" autocomplete="current-password" />
            </div>
            <button class="auth-btn" id="authSignInBtn">Sign In</button>
            <div class="auth-error" id="authError"></div>
            <div class="auth-toggle">
              Don't have an account? <a id="authShowRegister">Sign up</a>
            </div>
          </div>
          <div id="authRegisterForm" style="display:none;">
            <div class="auth-field">
              <label>Display Name</label>
              <input type="text" id="authDisplayName" placeholder="Your name" autocomplete="name" />
            </div>
            <div class="auth-field">
              <label>Email</label>
              <input type="email" id="authRegEmail" placeholder="you@example.com" autocomplete="email" />
            </div>
            <div class="auth-field">
              <label>Password</label>
              <input type="password" id="authRegPassword" placeholder="At least 6 characters" autocomplete="new-password" />
            </div>
            <button class="auth-btn" id="authSignUpBtn">Create Account</button>
            <div class="auth-error" id="authRegError"></div>
            <div class="auth-toggle">
              Already have an account? <a id="authShowLogin">Sign in</a>
            </div>
          </div>
        </div>
        <div class="auth-loading" id="authLoading" style="display:none;">Loading...</div>
      </div>
    `;
    document.body.appendChild(overlay);
    wireOverlayEvents();
  }

  function wireOverlayEvents() {
    const showRegister = document.getElementById('authShowRegister');
    const showLogin = document.getElementById('authShowLogin');

    showRegister.addEventListener('click', function() {
      document.getElementById('authLoginForm').style.display = 'none';
      document.getElementById('authRegisterForm').style.display = 'block';
      document.getElementById('authTitle').textContent = 'Create Account';
      document.getElementById('authRegEmail').focus();
    });

    showLogin.addEventListener('click', function() {
      document.getElementById('authRegisterForm').style.display = 'none';
      document.getElementById('authLoginForm').style.display = 'block';
      document.getElementById('authTitle').textContent = 'Sign In';
      document.getElementById('authEmail').focus();
    });

    // Sign in on Enter
    document.getElementById('authPassword').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doSignIn();
    });
    document.getElementById('authEmail').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('authPassword').focus();
    });

    // Sign up on Enter
    document.getElementById('authRegPassword').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doSignUp();
    });

    document.getElementById('authSignInBtn').addEventListener('click', doSignIn);
    document.getElementById('authSignUpBtn').addEventListener('click', doSignUp);
  }

  async function doSignIn() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const errEl = document.getElementById('authError');
    const btn = document.getElementById('authSignInBtn');
    if (!email || !password) {
      errEl.textContent = 'Please enter your email and password.';
      return;
    }
    btn.disabled = true;
    errEl.textContent = '';
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        errEl.textContent = error.message;
        btn.disabled = false;
        return;
      }
      _currentUser = data.user;
      hideOverlay();
      _notifyAuthed(data.user);
    } catch (e) {
      errEl.textContent = 'Connection error. Please try again.';
      btn.disabled = false;
    }
  }

  async function doSignUp() {
    const email = document.getElementById('authRegEmail').value.trim();
    const password = document.getElementById('authRegPassword').value;
    const displayName = document.getElementById('authDisplayName').value.trim();
    const errEl = document.getElementById('authRegError');
    const btn = document.getElementById('authSignUpBtn');
    if (!email || !password) {
      errEl.textContent = 'Please enter your email and password.';
      return;
    }
    if (password.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      return;
    }
    btn.disabled = true;
    errEl.textContent = '';
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || email.split('@')[0] } }
      });
      if (error) {
        errEl.textContent = error.message;
        btn.disabled = false;
        return;
      }
      // If email confirmation is disabled in Supabase, we get a session immediately.
      // If confirmation is required, data.session is null and we show a message.
      if (data.session) {
        _currentUser = data.user;
        hideOverlay();
        _notifyAuthed(data.user);
      } else {
        errEl.textContent = 'Account created. Check your email to confirm, then sign in.';
        btn.disabled = false;
        // Switch to login view
        document.getElementById('authRegisterForm').style.display = 'none';
        document.getElementById('authLoginForm').style.display = 'block';
        document.getElementById('authTitle').textContent = 'Sign In';
        document.getElementById('authEmail').value = email;
        document.getElementById('authPassword').focus();
      }
    } catch (e) {
      errEl.textContent = 'Connection error. Please try again.';
      btn.disabled = false;
    }
  }

  function showOverlay() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function hideOverlay() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function showLoading() {
    const formWrap = document.getElementById('authFormWrap');
    const loading = document.getElementById('authLoading');
    if (formWrap) formWrap.style.display = 'none';
    if (loading) loading.style.display = 'block';
  }

  function hideLoading() {
    const formWrap = document.getElementById('authFormWrap');
    const loading = document.getElementById('authLoading');
    if (loading) loading.style.display = 'none';
    if (formWrap) formWrap.style.display = 'block';
  }

  /* ---- Logout link in nav ---- */
  function addLogoutLink() {
    const nav = document.querySelector('.atlas-nav');
    if (!nav) return;
    // Don't add duplicate
    if (nav.querySelector('.auth-logout')) return;
    const link = document.createElement('a');
    link.className = 'auth-logout';
    link.textContent = 'Sign Out';
    link.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        const sb = await getSupabase();
        await sb.auth.signOut();
      } catch (err) { /* ignore */ }
      _currentUser = null;
      // Reload to reset page state
      window.location.reload();
    });
    nav.appendChild(link);
  }

  /* ---- Auth callback registry ---- */
  const _authCallbacks = [];
  function onAuthed(cb) { _authCallbacks.push(cb); }
  function _notifyAuthed(user) {
    _authCallbacks.forEach(function(cb) { try { cb(user); } catch(e){ console.error(e); } });
  }

  /* ---- Public API ---- */
  /**
   * Call this on each page (ideally early). It:
   * 1. Injects CSS + builds the overlay
   * 2. Checks the Supabase session
   * 3. If session exists: hides overlay, fires callbacks, returns user
   * 4. If no session: shows the overlay, waits for auth
   *
   * Returns a Promise<User> that resolves when the user is authenticated.
   */
  function requireAuth() {
    if (_authGateReady) return _authGateReady;
    _authGateReady = new Promise(async (resolve) => {
      injectCSS();
      buildOverlay();
      addLogoutLink();

      // Register the resolve as a one-shot callback
      onAuthed(function(user) { resolve(user); });

      try {
        const sb = await getSupabase();
        const { data, error } = await sb.auth.getSession();
        if (data.session && data.session.user) {
          _currentUser = data.session.user;
          hideOverlay();
          _notifyAuthed(data.session.user);
        } else {
          // Show login form
          hideLoading();
          showOverlay();
          document.getElementById('authEmail').focus();
        }
      } catch (e) {
        console.error('Auth gate error:', e);
        hideLoading();
        showOverlay();
      }
    });
    return _authGateReady;
  }

  /** Returns the current authenticated user, or null. */
  function currentUser() { return _currentUser; }

  // Expose globally
  window.AuthGate = {
    requireAuth: requireAuth,
    currentUser: currentUser,
    onAuthed: onAuthed
  };
})();
