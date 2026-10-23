/**
 * RK DIGITAL STUDIO — Build-time Environment Injection Script
 * Runs during Vercel deployment (`npm run build`).
 * Populates `js/env.js` with public Supabase configuration from Vercel Environment Variables.
 * 
 * ⚠️ SECURITY: NEVER writes service_role key.
 */

const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'js', 'env.js');

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_PROJECT_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim();

const supabaseKey = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const contactEmail = (process.env.CONTACT_EMAIL || 'contact@rkdigitaistudio.in').trim();
const notifEmail = (process.env.NOTIFICATION_EMAIL || 'contact@rkdigitaistudio.in').trim();
const ownerPhone = (process.env.OWNER_PHONE || '9519073791').trim();
const studioName = (process.env.STUDIO_NAME || 'RK DIGITAL STUDIO').trim();

const fileContent = `/**
 * RK DIGITAL STUDIO — Environment Variables Runtime Helper
 * Automatically populated by Vercel deployment build step or runtime fallback.
 * Public frontend configuration only.
 */
(function(window) {
  'use strict';
  window.ENV = window.ENV || {};
  window.ENV.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
  window.ENV.SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
  window.ENV.SUPABASE_PUBLISHABLE_KEY = ${JSON.stringify(supabaseKey)};
  window.ENV.NEXT_PUBLIC_SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
  window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
  window.ENV.CONTACT_EMAIL = ${JSON.stringify(contactEmail)};
  window.ENV.NOTIFICATION_EMAIL = ${JSON.stringify(notifEmail)};
  window.ENV.OWNER_PHONE = ${JSON.stringify(ownerPhone)};
  window.ENV.STUDIO_NAME = ${JSON.stringify(studioName)};

  // Dynamic runtime loader if build-time values were not populated
  window.ENV.loadRuntimeEnv = async function() {
    if (window.ENV.SUPABASE_URL && window.ENV.SUPABASE_ANON_KEY) {
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
      }
    } catch (e) {
      // Runtime endpoint might not be available in purely local offline testing
    }
    return window.ENV;
  };
})(typeof window !== 'undefined' ? window : this);
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log('✅ Generated js/env.js successfully for Vercel deployment.');
if (supabaseUrl) {
  console.log(`🔗 Supabase URL configured: ${supabaseUrl}`);
} else {
  console.log('⚠️ SUPABASE_URL not detected in build environment.');
}
