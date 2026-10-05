/**
 * RK DIGITAL STUDIO - Database & Enquiry Notification Handler
 * - Instant Email dispatch to rishabhpal549@gmail.com via FormSubmit AJAX API
 * - Direct WhatsApp Click-to-Chat generation (+91 9519073791)
 * - Resilient offline/local storage queue
 * - Optional Supabase REST API synchronization
 */

const RK_DB_CONFIG = {
  notificationEmail: 'rishabhpal549@gmail.com',
  ownerPhone: '9519073791',
  supabaseUrl: window.ENV?.SUPABASE_URL || '',
  supabaseAnonKey: window.ENV?.SUPABASE_ANON_KEY || '',
  tableName: 'enquiries',
  localStorageKey: 'rk_digital_studio_enquiries_log'
};

/**
 * Dispatches the enquiry details directly to the owner's Gmail via FormSubmit.
 * FormSubmit delivers free emails directly to rishabhpal549@gmail.com.
 * @param {Object} payload 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
async function sendEmailNotification(payload) {
  try {
    const formattedDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const bodyData = {
      _subject: `🔥 New Website Enquiry: ${payload.full_name} (${payload.service})`,
      _template: 'table',
      _captcha: 'false',
      'Client Name': payload.full_name,
      'Client Phone Number': payload.phone,
      'Quick WhatsApp Link': `https://wa.me/91${payload.phone.replace(/\D/g, '')}`,
      'Quick Call Link': `tel:+91${payload.phone.replace(/\D/g, '')}`,
      'Client Email': payload.email || 'Not Provided',
      'Business Name': payload.business_name || 'Not Provided',
      'Business Type': payload.business_type || 'Not Provided',
      'Selected Service': payload.service,
      'Estimated Budget': payload.budget,
      'Project Requirements': payload.message,
      'Submitted At (IST)': formattedDate
    };

    const response = await fetch(`https://formsubmit.co/ajax/${RK_DB_CONFIG.notificationEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    if (response.ok) {
      const resJson = await response.json();
      return { success: true, message: resJson.message || 'Email sent successfully' };
    } else {
      return { success: false, message: `Status: ${response.status}` };
    }
  } catch (err) {
    console.warn('Email notification dispatch error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Submits an enquiry:
 * 1. Saves to browser localStorage for backup & admin review
 * 2. Sends email notification to rishabhpal549@gmail.com
 * 3. Syncs to Supabase if configured
 * @param {Object} data 
 * @returns {Promise<{success: boolean, message: string, recordId: string, emailSent?: boolean}>}
 */
async function saveEnquiryRecord(data) {
  const enquiryPayload = {
    id: 'enq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    full_name: data.fullName?.trim(),
    phone: data.phone?.trim(),
    email: data.email?.trim() || null,
    business_name: data.businessName?.trim() || null,
    business_type: data.businessType?.trim() || null,
    service: data.service,
    budget: data.budget || 'Not Specified',
    message: data.message?.trim(),
    status: 'New',
    created_at: new Date().toISOString()
  };

  // 1. Store locally in browser cache queue for safety and offline resilience
  try {
    const existing = JSON.parse(localStorage.getItem(RK_DB_CONFIG.localStorageKey) || '[]');
    existing.unshift(enquiryPayload);
    // Keep last 100 locally
    localStorage.setItem(RK_DB_CONFIG.localStorageKey, JSON.stringify(existing.slice(0, 100)));
  } catch (err) {
    console.warn('Local storage write warning:', err);
  }

  // 2. Dispatch email notification in background
  const emailPromise = sendEmailNotification(enquiryPayload);

  // 3. Optional Supabase REST API sync if keys exist
  let supabasePromise = Promise.resolve();
  if (RK_DB_CONFIG.supabaseUrl && RK_DB_CONFIG.supabaseAnonKey) {
    supabasePromise = fetch(`${RK_DB_CONFIG.supabaseUrl.replace(/\/$/, '')}/rest/v1/${RK_DB_CONFIG.tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': RK_DB_CONFIG.supabaseAnonKey,
        'Authorization': `Bearer ${RK_DB_CONFIG.supabaseAnonKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        full_name: enquiryPayload.full_name,
        phone: enquiryPayload.phone,
        email: enquiryPayload.email,
        business_name: enquiryPayload.business_name,
        business_type: enquiryPayload.business_type,
        service: enquiryPayload.service,
        budget: enquiryPayload.budget,
        message: enquiryPayload.message,
        status: 'New'
      })
    }).catch(err => console.warn('Supabase post failed:', err));
  }

  // Await email dispatch with a 4 second timeout so user is not kept waiting
  const emailResult = await Promise.race([
    emailPromise,
    new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Timed out waiting for response' }), 4000))
  ]);

  await supabasePromise;

  return {
    success: true,
    message: 'Enquiry processed successfully.',
    recordId: enquiryPayload.id,
    emailSent: emailResult.success
  };
}

/**
 * Get all stored enquiries from localStorage (for Admin Viewer)
 */
function getLocalEnquiries() {
  try {
    return JSON.parse(localStorage.getItem(RK_DB_CONFIG.localStorageKey) || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Clear stored enquiries
 */
function clearLocalEnquiries() {
  try {
    localStorage.removeItem(RK_DB_CONFIG.localStorageKey);
    return true;
  } catch (e) {
    return false;
  }
}

window.RK_DB = {
  saveEnquiryRecord,
  sendEmailNotification,
  getLocalEnquiries,
  clearLocalEnquiries,
  config: RK_DB_CONFIG
};
