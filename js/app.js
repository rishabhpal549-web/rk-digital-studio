/**
 * RK DIGITAL STUDIO - Master Interactive Application Logic
 * Fast, accessible, and conversion-optimized JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initActiveNavSpy();
  initQuickServiceSelectors();
  initEnquiryForm();
  initProjectModal();
  initCopyButtons();
  initAdminLogs();
});

/* ==========================================================================
   1. Mobile Navigation & Drawer
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

  if (!toggleBtn || !drawer) return;

  function toggleMenu(forceClose = false) {
    const isOpen = forceClose ? false : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    drawer.setAttribute('aria-hidden', (!isOpen).toString());
    toggleBtn.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';

    const iconOpen = toggleBtn.querySelector('.icon-hamburger');
    const iconClose = toggleBtn.querySelector('.icon-close');
    if (iconOpen && iconClose) {
      iconOpen.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';
    }
  }

  toggleBtn.addEventListener('click', () => toggleMenu());

  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(true);
    }
  });
}

/* ==========================================================================
   2. Active Nav Link Scroll Spy
   ========================================================================== */
function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.nav-links .nav-link');

  if (!sections.length || !desktopLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    desktopLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   3. Quick Service & Pricing CTA Selectors
   Clicking any service card CTA auto-scrolls to the form, selects the service
   in the dropdown, and focuses the field for effortless enquiry submission.
   ========================================================================== */
function initQuickServiceSelectors() {
  const serviceCtaButtons = document.querySelectorAll('[data-select-service]');
  const serviceDropdown = document.getElementById('enquiryService');
  const enquirySection = document.getElementById('enquiry');

  serviceCtaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const serviceVal = btn.getAttribute('data-select-service');
      if (!serviceDropdown || !serviceVal) return;

      // Update dropdown selection
      serviceDropdown.value = serviceVal;
      
      // Flash highlight on the dropdown
      serviceDropdown.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.7)';
      setTimeout(() => {
        serviceDropdown.style.boxShadow = '';
      }, 1500);

      // Scroll to enquiry section smoothly
      if (enquirySection) {
        enquirySection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   4. Enquiry Form Handling & Validation
   ========================================================================== */
function initEnquiryForm() {
  const form = document.getElementById('projectEnquiryForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitEnquiryBtn');
  const btnText = document.getElementById('submitBtnText');
  const btnSpinner = document.getElementById('submitBtnSpinner');
  const successBanner = document.getElementById('formSuccessBanner');
  const waDirectBtn = document.getElementById('waDirectFollowupBtn');

  // Input fields
  const fullNameInput = document.getElementById('enquiryFullName');
  const phoneInput = document.getElementById('enquiryPhone');
  const emailInput = document.getElementById('enquiryEmail');
  const businessNameInput = document.getElementById('enquiryBusinessName');
  const businessTypeInput = document.getElementById('enquiryBusinessType');
  const serviceInput = document.getElementById('enquiryService');
  const messageInput = document.getElementById('enquiryMessage');

  // Validation regex
  const indianPhoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input, condition, errorMsgId, defaultError) {
    const formGroup = input.closest('.form-group');
    const errorEl = document.getElementById(errorMsgId);

    if (!condition) {
      if (formGroup) formGroup.classList.add('has-error');
      if (errorEl) errorEl.textContent = defaultError;
      return false;
    } else {
      if (formGroup) formGroup.classList.remove('has-error');
      return true;
    }
  }

  // Real-time clearance of errors on input
  [fullNameInput, phoneInput, serviceInput, messageInput].forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        group.classList.remove('has-error');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    // 1. Full Name
    const nameVal = fullNameInput.value.trim();
    if (!validateField(fullNameInput, nameVal.length >= 2, 'nameError', 'Please enter your full name (at least 2 characters)')) {
      isValid = false;
    }

    // 2. Phone Number (Indian 10-digit starting with 6-9)
    // Strip spaces, dashes or +91 if user added
    let rawPhone = phoneInput.value.trim().replace(/^(\+91|91|0)/, '').replace(/[\s-]/g, '');
    if (!validateField(phoneInput, indianPhoneRegex.test(rawPhone), 'phoneError', 'Please enter a valid 10-digit Indian phone number (e.g. 9519073791)')) {
      isValid = false;
    }

    // 3. Email (optional, but must be valid if entered)
    const emailVal = emailInput.value.trim();
    if (emailVal.length > 0 && !emailRegex.test(emailVal)) {
      validateField(emailInput, false, 'emailError', 'Please enter a valid email address');
      isValid = false;
    } else {
      validateField(emailInput, true, 'emailError', '');
    }

    // 4. Service Selection
    const serviceVal = serviceInput.value;
    if (!validateField(serviceInput, !!serviceVal, 'serviceError', 'Please select a service')) {
      isValid = false;
    }

    // 5. Message / Requirements
    const messageVal = messageInput.value.trim();
    if (!validateField(messageInput, messageVal.length >= 8, 'messageError', 'Please describe your website requirements (at least 8 characters)')) {
      isValid = false;
    }

    if (!isValid) {
      // Focus first error element
      const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    // Selected Budget
    const selectedBudget = form.querySelector('input[name="budget"]:checked')?.value || 'Not Sure';

    const formData = {
      fullName: nameVal,
      phone: rawPhone,
      email: emailVal,
      businessName: businessNameInput ? businessNameInput.value.trim() : '',
      businessType: businessTypeInput ? businessTypeInput.value.trim() : '',
      service: serviceVal,
      budget: selectedBudget,
      message: messageVal
    };

    // 1. Prepare WhatsApp formatted message
    const waText = encodeURIComponent(
      `*🔥 New Website Enquiry — RK DIGITAL STUDIO*\n\n` +
      `👤 *Name:* ${formData.fullName}\n` +
      `📞 *Phone:* ${formData.phone}\n` +
      (formData.email ? `📧 *Email:* ${formData.email}\n` : '') +
      (formData.businessName ? `🏢 *Business:* ${formData.businessName} (${formData.businessType || 'General'})\n` : '') +
      `🛠️ *Service:* ${formData.service}\n` +
      `💰 *Budget:* ${formData.budget}\n\n` +
      `📝 *Requirements:*\n${formData.message}\n\n` +
      `⚡ *Note:* Please reply within 30 minutes as promised on website\n` +
      `---\nSent from rkdigitalstudio.in website`
    );
    const waUrl = `https://wa.me/919519073791?text=${waText}`;

    // 2. Open WhatsApp immediately on user click to avoid popup blocker on mobile & desktop
    try {
      window.open(waUrl, '_blank');
    } catch (popupErr) {
      console.warn('Direct WhatsApp open failed or blocked:', popupErr);
    }

    // UI Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending Enquiry...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';

    try {
      // 3. Dispatch to database & email notification handler (FormSubmit / Supabase / local queue)
      if (window.RK_DB && typeof window.RK_DB.saveEnquiryRecord === 'function') {
        await window.RK_DB.saveEnquiryRecord(formData);
      } else {
        await new Promise(r => setTimeout(r, 600));
      }

      // Update WhatsApp direct buttons in success banner
      if (waDirectBtn) {
        waDirectBtn.href = waUrl;
      }

      // Show success state
      if (successBanner) {
        successBanner.classList.add('visible');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
      showToast('✅ Enquiry received! Hamari team 30 minute me reply karegi.');

    } catch (err) {
      console.error('Submission error:', err);
      if (waDirectBtn) {
        waDirectBtn.href = waUrl;
      }
      if (successBanner) {
        successBanner.classList.add('visible');
      }
      showToast('Enquiry saved! Direct WhatsApp par chat karein.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Enquiry (Get Reply in 30 Min) 🚀';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  });
}

/* ==========================================================================
   5. Sunbeam English School Project Modal
   ========================================================================== */
function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const openButtons = document.querySelectorAll('[data-open-project-modal]');
  const closeBtn = document.getElementById('closeProjectModalBtn');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden', 'true');
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. Copy to Clipboard & Toast Helpers
   ========================================================================== */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('[data-copy-text]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy-text');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied "${textToCopy}" to clipboard!`);
      }).catch(() => {
        showToast('Text copied!');
      });
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('rkToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'rkToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   7. Admin Enquiry Logs Modal & Shortcut (Ctrl+Shift+E)
   ========================================================================== */
function initAdminLogs() {
  const adminBtn = document.getElementById('openAdminLogsBtn');
  const modal = document.getElementById('adminEnquiryModal');
  const listContainer = document.getElementById('adminEnquiryList');
  const clearBtn = document.getElementById('clearAdminLogsBtn');

  if (!modal || !listContainer) return;

  function renderLogs() {
    const enquiries = window.RK_DB?.getLocalEnquiries() || [];
    if (enquiries.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: #94a3b8;">
          <div style="font-size: 2rem; margin-bottom: 8px;">📭</div>
          <p style="font-size: 1.05rem; color: #e2e8f0; font-weight: 600; margin-bottom: 6px;">Abhi koi local enquiry nahi hai</p>
          <p style="font-size: 0.85rem;">Jab koi website par enquiry form bharega, uski puri detail yahan dikhegi.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = enquiries.map((enq) => {
      const dateStr = enq.created_at ? new Date(enq.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Recent';
      const cleanPhone = (enq.phone || '').replace(/\D/g, '');
      const waMsg = encodeURIComponent(`Hello ${enq.full_name}, I saw your website enquiry on RK DIGITAL STUDIO regarding ${enq.service}.`);
      return `
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div>
              <strong style="color: #fff; font-size: 1.1rem; display: block;">${enq.full_name || 'Client'}</strong>
              <span style="font-size: 0.85rem; color: #38bdf8;">${enq.business_name ? `${enq.business_name} (${enq.business_type || 'Business'})` : 'Local Client'}</span>
            </div>
            <span style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.12); color: #38bdf8; padding: 4px 10px; border-radius: 20px; font-weight: 500;">
              ${dateStr}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; font-size: 0.875rem; color: #cbd5e1; margin-bottom: 12px; background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 8px;">
            <div><span style="color:#94a3b8;">Phone:</span> <a href="tel:+91${cleanPhone}" style="color: #38bdf8; font-weight:600;">${enq.phone}</a></div>
            <div><span style="color:#94a3b8;">Service:</span> <span style="color:#fff; font-weight:500;">${enq.service}</span></div>
            <div><span style="color:#94a3b8;">Budget:</span> <span style="color:#34d399; font-weight:600;">${enq.budget}</span></div>
            <div><span style="color:#94a3b8;">Email:</span> <span style="color:#fff;">${enq.email || 'N/A'}</span></div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.6); padding: 12px 14px; border-radius: 8px; font-size: 0.875rem; color: #e2e8f0; margin-bottom: 14px; line-height: 1.6; border-left: 3px solid #38bdf8;">
            <strong style="color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; display: block; margin-bottom: 4px;">Requirements:</strong>
            ${enq.message}
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="https://wa.me/91${cleanPhone}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="padding: 7px 14px; font-size: 0.85rem;">
              <span>WhatsApp Chat 💬</span>
            </a>
            <a href="tel:+91${cleanPhone}" class="btn btn-secondary btn-sm" style="padding: 7px 14px; font-size: 0.85rem;">
              <span>Call Client 📞</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function openModal() {
    renderLogs();
    updateSupabaseStatus();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // --- Supabase Cloud Connection Manager ---
  function updateSupabaseStatus() {
    const status = window.RK_DB?.getSupabaseConfig();
    const dot = document.getElementById('supabaseStatusDot');
    const badge = document.getElementById('supabaseStatusBadge');
    const urlInput = document.getElementById('supabaseUrlInput');
    const keyInput = document.getElementById('supabaseKeyInput');

    if (!status || !dot || !badge) return;

    if (status.isConnected) {
      dot.style.background = '#10b981';
      dot.style.boxShadow = '0 0 8px #10b981';
      badge.textContent = 'Active & Syncing';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#34d399';
    } else {
      dot.style.background = '#f59e0b';
      dot.style.boxShadow = 'none';
      badge.textContent = 'Not Connected';
      badge.style.background = 'rgba(245, 158, 11, 0.15)';
      badge.style.color = '#fbbf24';
    }

    if (urlInput && status.url) urlInput.value = status.url;
    if (keyInput && status.key) keyInput.value = status.key;
  }

  const toggleConfigBtn = document.getElementById('toggleSupabaseConfigBtn');
  const configForm = document.getElementById('supabaseConfigForm');
  if (toggleConfigBtn && configForm) {
    toggleConfigBtn.addEventListener('click', () => {
      const isHidden = configForm.style.display === 'none' || !configForm.style.display;
      configForm.style.display = isHidden ? 'block' : 'none';
      toggleConfigBtn.textContent = isHidden ? 'Close Form ✕' : 'Configure Credentials ⚙️';
    });
  }

  const saveSupabaseBtn = document.getElementById('saveSupabaseConfigBtn');
  if (saveSupabaseBtn) {
    saveSupabaseBtn.addEventListener('click', async () => {
      const urlInput = document.getElementById('supabaseUrlInput');
      const keyInput = document.getElementById('supabaseKeyInput');
      const urlVal = urlInput ? urlInput.value.trim() : '';
      const keyVal = keyInput ? keyInput.value.trim() : '';

      if (!urlVal || !keyVal) {
        alert('Kripya dono Supabase URL aur Anon Public Key enter karein.');
        return;
      }

      saveSupabaseBtn.textContent = 'Testing...';
      saveSupabaseBtn.disabled = true;

      try {
        window.RK_DB?.setSupabaseConfig(urlVal, keyVal);
        updateSupabaseStatus();
        showToast('⚡ Supabase credentials save ho gaye! Enquiries sync shuru.');
        if (configForm) configForm.style.display = 'none';
        if (toggleConfigBtn) toggleConfigBtn.textContent = 'Configure Credentials ⚙️';
      } catch (err) {
        alert('Error saving credentials: ' + err.message);
      } finally {
        saveSupabaseBtn.textContent = 'Save & Connect';
        saveSupabaseBtn.disabled = false;
      }
    });
  }

  const disconnectBtn = document.getElementById('disconnectSupabaseBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      if (confirm('Kya aap Supabase disconnect karna chahte hain?')) {
        window.RK_DB?.disconnectSupabase();
        const urlInput = document.getElementById('supabaseUrlInput');
        const keyInput = document.getElementById('supabaseKeyInput');
        if (urlInput) urlInput.value = '';
        if (keyInput) keyInput.value = '';
        updateSupabaseStatus();
        showToast('Supabase disconnected.');
      }
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  const closeBtn = document.getElementById('closeAdminLogsBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  const backdrop = modal.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  // Secret shortcut: Ctrl + Shift + E or typing #admin in URL
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  if (window.location.hash === '#admin' || window.location.hash === '#admin-logs') {
    openModal();
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Kya aap saare local enquiry logs delete karna chahte hain?')) {
        window.RK_DB?.clearLocalEnquiries();
        renderLogs();
      }
    });
  }
}
