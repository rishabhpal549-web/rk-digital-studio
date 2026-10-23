/**
 * RK DIGITAL STUDIO — Visitor & Traffic Analytics Engine
 * Lightweight, privacy-friendly visitor and pageview tracker.
 * Powers the Studio Admin Dashboard "Who is visiting my website" analytics.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_VISITS = 'rk_studio_analytics_visits';
  const STORAGE_KEY_VISITOR_ID = 'rk_studio_visitor_id';
  const STORAGE_KEY_SESSION_ID = 'rk_studio_session_id';

  // 1. Get or create persistent visitor ID
  function getVisitorId() {
    let id = localStorage.getItem(STORAGE_KEY_VISITOR_ID);
    if (!id) {
      id = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem(STORAGE_KEY_VISITOR_ID, id);
    }
    return id;
  }

  // 2. Detect device type
  function getDeviceType() {
    const ua = navigator.userAgent || '';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  // 3. Detect browser
  function getBrowserName() {
    const ua = navigator.userAgent || '';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Trident')) return 'Internet Explorer';
    if (ua.includes('Edge') || ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Browser';
  }

  // 4. Detect traffic source
  function getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('source');
    if (utmSource) {
      if (utmSource.toLowerCase().includes('wa') || utmSource.toLowerCase().includes('whatsapp')) return 'WhatsApp';
      if (utmSource.toLowerCase().includes('app')) return 'Mobile App';
      return utmSource;
    }

    const ref = document.referrer ? document.referrer.toLowerCase() : '';
    if (!ref) return 'Direct Visit';
    if (ref.includes('google.')) return 'Google Search';
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'WhatsApp';
    if (ref.includes('instagram.com')) return 'Instagram';
    if (ref.includes('facebook.com') || ref.includes('fb.me')) return 'Facebook';
    if (ref.includes('youtube.com')) return 'YouTube';
    if (ref.includes('linkedin.com')) return 'LinkedIn';

    try {
      const refHost = new URL(document.referrer).hostname;
      if (refHost === window.location.hostname) return 'Internal Link';
      return refHost;
    } catch (e) {
      return 'Referral';
    }
  }

  // 5. Track current page visit
  function trackPageView() {
    try {
      // Avoid tracking admin page visits as public visitors
      if (window.location.pathname.startsWith('/admin')) {
        return;
      }

      // Check session debounce (don't log duplicate refresh within 15 seconds)
      const lastTrack = sessionStorage.getItem('rk_last_tracked_path');
      const lastTime = parseInt(sessionStorage.getItem('rk_last_tracked_time') || '0', 10);
      const now = Date.now();
      if (lastTrack === window.location.pathname && (now - lastTime < 15000)) {
        return;
      }

      sessionStorage.setItem('rk_last_tracked_path', window.location.pathname);
      sessionStorage.setItem('rk_last_tracked_time', now.toString());

      const visitRecord = {
        id: 'visit_' + now + '_' + Math.random().toString(36).substring(2, 6),
        visitorId: getVisitorId(),
        page: window.location.pathname || '/',
        title: document.title || 'RK DIGITAL STUDIO',
        source: getTrafficSource(),
        device: getDeviceType(),
        browser: getBrowserName(),
        screen: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      };

      // Store in LocalStorage (keep last 300 visits)
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_VISITS) || '[]');
      stored.unshift(visitRecord);
      localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(stored.slice(0, 300)));

      // If Supabase is connected, optionally record in page_views table
      if (window.RK_CLIENT && typeof window.RK_CLIENT.getClient === 'function') {
        const client = window.RK_CLIENT.getClient();
        if (client) {
          client.from('page_views').insert([{
            visitor_id: visitRecord.visitorId,
            page_path: visitRecord.page,
            page_title: visitRecord.title,
            traffic_source: visitRecord.source,
            device_type: visitRecord.device,
            browser: visitRecord.browser,
            created_at: visitRecord.timestamp
          }]).then(() => {}).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[Analytics] Track error:', e);
    }
  }

  // 6. Provide Analytics API for the Admin Dashboard
  function getAnalyticsStats() {
    try {
      const visits = JSON.parse(localStorage.getItem(STORAGE_KEY_VISITS) || '[]');
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      let todayCount = 0;
      const uniqueVisitors = new Set();
      const sourcesCount = {};
      const pagesCount = {};
      const devicesCount = { Mobile: 0, Desktop: 0, Tablet: 0 };

      visits.forEach(v => {
        const vTime = new Date(v.timestamp).getTime();
        if (vTime >= todayStart) {
          todayCount++;
        }

        if (v.visitorId) uniqueVisitors.add(v.visitorId);

        // Sources
        const src = v.source || 'Direct Visit';
        sourcesCount[src] = (sourcesCount[src] || 0) + 1;

        // Pages
        const p = v.page || '/';
        pagesCount[p] = (pagesCount[p] || 0) + 1;

        // Devices
        const dev = v.device || 'Mobile';
        devicesCount[dev] = (devicesCount[dev] || 0) + 1;
      });

      return {
        totalVisits: visits.length,
        todayVisits: todayCount,
        uniqueVisitorsCount: uniqueVisitors.size,
        sources: sourcesCount,
        pages: pagesCount,
        devices: devicesCount,
        recentVisits: visits.slice(0, 20)
      };
    } catch (e) {
      return {
        totalVisits: 0,
        todayVisits: 0,
        uniqueVisitorsCount: 0,
        sources: {},
        pages: {},
        devices: {},
        recentVisits: []
      };
    }
  }

  // Auto initialize tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }

  window.RK_ANALYTICS = {
    trackPageView,
    getAnalyticsStats
  };

})(typeof window !== 'undefined' ? window : this);
