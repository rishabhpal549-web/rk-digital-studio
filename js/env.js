/**
 * RK DIGITAL STUDIO — Environment Variables Runtime Helper
 * Automatically populated by Vercel deployment build step or runtime fallback.
 * Public frontend configuration only.
 */
(function(window) {
  'use strict';

  window.ENV = window.ENV || {};

  // Default values (if not overwritten by build or Vercel serverless function)
  window.ENV.SUPABASE_URL = window.ENV.SUPABASE_URL || '';
  window.ENV.SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY || '';
  window.ENV.SUPABASE_PUBLISHABLE_KEY = window.ENV.SUPABASE_PUBLISHABLE_KEY || window.ENV.SUPABASE_ANON_KEY || '';
  window.ENV.NEXT_PUBLIC_SUPABASE_URL = window.ENV.NEXT_PUBLIC_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
  window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY = window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
  window.ENV.CONTACT_EMAIL = window.ENV.CONTACT_EMAIL || 'contact@rkdigitaistudio.in';
  window.ENV.NOTIFICATION_EMAIL = window.ENV.NOTIFICATION_EMAIL || 'contact@rkdigitaistudio.in';
  window.ENV.OWNER_PHONE = window.ENV.OWNER_PHONE || '9519073791';
  window.ENV.STUDIO_NAME = window.ENV.STUDIO_NAME || 'RK DIGITAL STUDIO';

  /**
   * Dynamically fetch public environment variables from /api/env if SUPABASE_URL is empty
   * @returns {Promise<Object>}
   */
  window.ENV.loadRuntimeEnv = async function() {
    if (window.ENV.SUPABASE_URL && (window.ENV.SUPABASE_ANON_KEY || window.ENV.SUPABASE_PUBLISHABLE_KEY)) {
      return window.ENV;
    }
    try {
      const res = await fetch('/api/env?format=json');
      if (res.ok) {
        const data = await res.json();
        if (data.SUPABASE_URL) window.ENV.SUPABASE_URL = data.SUPABASE_URL;
        if (data.SUPABASE_ANON_KEY) {
          window.ENV.SUPABASE_ANON_KEY = data.SUPABASE_ANON_KEY;
          window.ENV.SUPABASE_PUBLISHABLE_KEY = data.SUPABASE_ANON_KEY;
        }
        if (data.NEXT_PUBLIC_SUPABASE_URL) window.ENV.NEXT_PUBLIC_SUPABASE_URL = data.NEXT_PUBLIC_SUPABASE_URL;
        if (data.NEXT_PUBLIC_SUPABASE_ANON_KEY) window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY = data.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (data.CONTACT_EMAIL) window.ENV.CONTACT_EMAIL = data.CONTACT_EMAIL;
        if (data.NOTIFICATION_EMAIL) window.ENV.NOTIFICATION_EMAIL = data.NOTIFICATION_EMAIL;
        if (data.OWNER_PHONE) window.ENV.OWNER_PHONE = data.OWNER_PHONE;
        if (data.STUDIO_NAME) window.ENV.STUDIO_NAME = data.STUDIO_NAME;
      }
    } catch (e) {
      // Runtime endpoint might not be available in local static file preview
    }
    return window.ENV;
  };
})(typeof window !== 'undefined' ? window : this);
