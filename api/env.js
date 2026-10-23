/**
 * RK DIGITAL STUDIO — Vercel Serverless Function for Runtime Public Environment
 * Safely exposes only public environment variables (Supabase URL & Anon/Publishable Key).
 * 
 * ⚠️ SECURITY GUARANTEE:
 * service_role keys are NEVER exposed. Only public publishable / anon keys are returned.
 */

module.exports = (req, res) => {
  // CORS & Cache Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Resolve Supabase Project URL across all common Vercel naming conventions
  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();

  // Resolve Supabase Publishable / Anon Key across all common Vercel naming conventions
  // Notice: Supabase now calls this "Publishable Key" (sb_pub_...) alongside legacy anon JWT
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

  const isJson = req.query?.format === 'json' || 
                 (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isJson) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseKey,
      SUPABASE_PUBLISHABLE_KEY: supabaseKey,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
      CONTACT_EMAIL: contactEmail,
      NOTIFICATION_EMAIL: notifEmail,
      OWNER_PHONE: ownerPhone,
      STUDIO_NAME: studioName
    });
  }

  // Return executable JavaScript for <script src="/api/env"></script>
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  const jsPayload = `
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
})(typeof window !== 'undefined' ? window : this);
  `.trim();

  return res.status(200).send(jsPayload);
};
