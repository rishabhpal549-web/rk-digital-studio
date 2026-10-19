/**
 * RK DIGITAL STUDIO — Admin Authentication & Session Guard
 * Protects admin dashboard, project management, and CRM.
 * Manages Supabase Auth sessions, login, logout, and access control.
 */

(function (window) {
  'use strict';

  const AUTH_STORAGE_KEY = 'rk_admin_active_session';

  /**
   * Check if current user has an active authenticated session
   * @returns {Promise<{isAuthenticated: boolean, user: Object|null}>}
   */
  async function getSession() {
    // 1. Check Supabase Auth if client exists
    const client = window.RK_CLIENT?.getClient();
    if (client) {
      try {
        const { data: { session }, error } = await client.auth.getSession();
        if (!error && session?.user) {
          return {
            isAuthenticated: true,
            user: {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role || 'Administrator',
              isSupabase: true
            }
          };
        }
      } catch (e) {
        console.warn('Supabase auth check error:', e);
      }
    }

    // 2. Check stored session
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const sessionObj = JSON.parse(stored);
        // Verify expiration (24h)
        if (sessionObj.expiresAt && Date.now() < sessionObj.expiresAt) {
          return {
            isAuthenticated: true,
            user: sessionObj.user
          };
        } else {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (e) {
      // Ignored
    }

    return { isAuthenticated: false, user: null };
  }

  /**
   * Guard route: Redirects to /admin/login if not authenticated.
   * If on /admin/login and already authenticated, redirects to /admin.
   */
  async function guardRoute() {
    const isLoginPage = window.location.pathname.endsWith('/admin/login') ||
                        window.location.pathname.endsWith('/admin/login.html') ||
                        window.location.pathname.includes('/admin/login');

    const { isAuthenticated, user } = await getSession();

    if (!isAuthenticated && !isLoginPage) {
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/admin/login.html?redirect=${currentPath}`;
      return false;
    }

    if (isAuthenticated && isLoginPage) {
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') ? decodeURIComponent(params.get('redirect')) : '/admin/';
      window.location.href = redirectUrl;
      return false;
    }

    // Populate user profile info in admin header if element exists
    if (user) {
      renderUserProfile(user);
    }

    return true;
  }

  function renderUserProfile(user) {
    const emailEls = document.querySelectorAll('.admin-user-email');
    emailEls.forEach(el => {
      el.textContent = user.email || 'Admin';
    });
    const roleEls = document.querySelectorAll('.admin-user-role');
    roleEls.forEach(el => {
      el.textContent = user.role || 'Studio Admin';
    });
    const avatarEls = document.querySelectorAll('.admin-user-avatar');
    avatarEls.forEach(el => {
      el.textContent = (user.email ? user.email.charAt(0) : 'A').toUpperCase();
    });
  }

  /**
   * Perform Admin Login
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe
   * @returns {Promise<{success: boolean, message?: string, user?: Object}>}
   */
  async function login(email, password, rememberMe = true) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const client = window.RK_CLIENT?.getClient();

    // 1. Try Supabase Auth
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (error) {
          return { success: false, message: error.message };
        }

        if (data?.user) {
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            role: 'Administrator',
            isSupabase: true
          };

          const sessionPayload = {
            user: userObj,
            expiresAt: Date.now() + (rememberMe ? 30 * 86400000 : 86400000)
          };

          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));

          return { success: true, user: userObj };
        }
      } catch (err) {
        console.warn('Supabase auth login exception:', err);
        return { success: false, message: 'Network error connecting to Supabase: ' + err.message };
      }
    }

    // 2. Initial Setup / Local Fallback Mode:
    // If Supabase Auth is not yet configured, allow authorized studio owner credentials
    if ((cleanEmail === 'contact@rkdigitalstudio.in' || cleanEmail === 'contact@rkdigitaistudio.in' || cleanEmail === 'rishabhpal549@gmail.com') && cleanPassword === 'rkstudio2026') {
      const userObj = {
        id: 'admin-rishabh',
        email: cleanEmail,
        role: 'Founder & Admin',
        isSupabase: false,
        isDemo: true
      };

      const sessionPayload = {
        user: userObj,
        expiresAt: Date.now() + (rememberMe ? 30 * 86400000 : 86400000)
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));

      return { success: true, user: userObj };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please verify your credentials or check Supabase Auth setup.'
    };
  }

  /**
   * Log out current admin
   */
  async function logout() {
    const client = window.RK_CLIENT?.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }

    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);

    window.location.href = '/admin/login.html';
  }

  // --- UI Alert / Toast System for Admin Panel ---
  function showToast(message, type = 'success') {
    let toast = document.getElementById('adminToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'adminToast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }

    const icon = type === 'success' 
      ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toast.className = `admin-toast show ${type}`;
    toast.innerHTML = `${icon}<span>${message}</span>`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  /**
   * Confirmation Dialog Modal
   */
  function confirmAction(options) {
    const {
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      isDanger = false,
      onConfirm = () => {}
    } = options;

    let modal = document.getElementById('adminConfirmModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'adminConfirmModal';
      modal.className = 'admin-modal-overlay';
      modal.innerHTML = `
        <div class="admin-modal-box confirm-box">
          <div class="confirm-icon-wrap" id="confirmIcon"></div>
          <h3 id="confirmTitle" class="confirm-title"></h3>
          <p id="confirmDesc" class="confirm-desc"></p>
          <div class="confirm-actions">
            <button type="button" class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmOkBtn">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = document.getElementById('confirmTitle');
    const descEl = document.getElementById('confirmDesc');
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const iconWrap = document.getElementById('confirmIcon');

    titleEl.textContent = title;
    descEl.textContent = message;
    okBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    if (isDanger) {
      okBtn.className = 'btn btn-danger';
      iconWrap.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ef4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
      okBtn.className = 'btn btn-primary';
      iconWrap.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    modal.classList.add('open');

    function close() {
      modal.classList.remove('open');
      okBtn.onclick = null;
      cancelBtn.onclick = null;
    }

    cancelBtn.onclick = close;
    okBtn.onclick = () => {
      close();
      onConfirm();
    };

    modal.onclick = (e) => {
      if (e.target === modal) close();
    };
  }

  // Sidebar mobile toggle helper
  function initAdminSidebar() {
    const toggleBtn = document.getElementById('adminSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('adminSidebarOverlay');

    if (!toggleBtn || !sidebar) return;

    function toggle(open) {
      const isOpen = open !== undefined ? open : !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', isOpen);
      if (overlay) overlay.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    toggleBtn.addEventListener('click', () => toggle());
    if (overlay) {
      overlay.addEventListener('click', () => toggle(false));
    }

    const logoutBtns = document.querySelectorAll('[data-admin-logout]');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAction({
          title: 'Sign Out',
          message: 'Are you sure you want to log out of the admin panel?',
          confirmText: 'Log Out',
          isDanger: true,
          onConfirm: logout
        });
      });
    });
  }

  window.RK_AUTH = {
    getSession,
    guardRoute,
    login,
    logout,
    showToast,
    confirmAction,
    initAdminSidebar
  };

  // Run auto-guard when DOM loads
  document.addEventListener('DOMContentLoaded', () => {
    guardRoute();
    initAdminSidebar();
  });

})(window);
