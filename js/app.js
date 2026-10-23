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
  initDynamicPortfolio();
  initCopyButtons();
  initSafeSocialLinks();
  initFounderPhotoLightbox();
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
      `---\nSent from rkdigitaistudio.in website`
    );
    const waUrl = `https://wa.me/919519073791?text=${waText}`;

    const errorBanner = document.getElementById('formErrorBanner');
    const waErrorBtn = document.getElementById('waErrorDirectBtn');

    // UI Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Submitting Enquiry...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';

    try {
      // 1. Anti-spam honeypot verification
      const honeypot = document.getElementById('enquiryHoneypot');
      if (honeypot && honeypot.value.trim().length > 0) {
        console.warn('Spam submission detected and blocked via honeypot.');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      // 2. Dispatch to database (Supabase CRM leads table & durable local queue)
      let savedResult = null;
      if (window.RK_CLIENT && typeof window.RK_CLIENT.submitPublicEnquiry === 'function') {
        savedResult = await window.RK_CLIENT.submitPublicEnquiry(formData);
      } else if (window.RK_DB && typeof window.RK_DB.saveEnquiryRecord === 'function') {
        savedResult = await window.RK_DB.saveEnquiryRecord(formData);
      }

      if (!savedResult || !savedResult.success) {
        throw new Error(savedResult?.message || 'Enquiry record could not be saved.');
      }

      // 3. Dispatch background FormSubmit email notification
      if (window.RK_DB && typeof window.RK_DB.sendEmailNotification === 'function') {
        window.RK_DB.sendEmailNotification({
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          business_name: formData.businessName,
          business_type: formData.businessType,
          service: formData.service,
          budget: formData.budget,
          message: formData.message
        });
      }

      // Hide any previous error banner
      if (errorBanner) errorBanner.style.display = 'none';

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
      showToast('Thank you! Your enquiry has been successfully submitted. Our team will contact you within 30 minutes.');

    } catch (err) {
      console.error('Submission error:', err);

      if (successBanner) {
        successBanner.classList.remove('visible');
      }

      if (errorBanner) {
        errorBanner.style.display = 'block';
        errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (waErrorBtn) {
        waErrorBtn.href = waUrl;
      }

      showToast('Unable to submit your message right now. Please connect with us directly on WhatsApp (+91-9519073791) or phone for immediate assistance.');
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
   5b. Dynamic Database-driven Portfolio & Category Filter
   ========================================================================== */
async function initDynamicPortfolio() {
  const container = document.getElementById('dynamicPortfolioContainer');
  const filterTabs = document.querySelectorAll('[data-portfolio-filter]');

  if (!container || !window.RK_CLIENT) return;

  let allProjects = [];

  try {
    allProjects = await window.RK_CLIENT.getProjects({ status: 'published' });
  } catch (e) {
    console.warn('Failed to load dynamic portfolio from database:', e);
    return;
  }

  if (!allProjects || allProjects.length === 0) return;

  function renderPortfolio(category = 'All') {
    let filtered = allProjects;
    if (category !== 'All') {
      filtered = allProjects.filter(p => p.category === category);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 48px 20px; text-align: center; color: #94a3b8;">
          <div style="font-size: 2.2rem; margin-bottom: 10px;">📁</div>
          <h4 style="color: #ffffff; font-size: 1.15rem; margin-bottom: 6px;">No projects in this category yet</h4>
          <p style="font-size: 0.9rem; max-width: 440px; margin: 0 auto 18px;">We are currently developing modern websites in this category. Contact us to start your project!</p>
          <button type="button" class="btn btn-primary btn-sm" data-select-service="${category}">Inquire About This Service</button>
        </div>
      `;
      initQuickServiceSelectors();
      return;
    }

    // Top featured project
    const featuredProject = filtered.find(p => p.is_featured) || filtered[0];
    const secondaryProjects = filtered.filter(p => p.id !== featuredProject.id);

    const featuredImg = featuredProject.cover_image_url || 'assets/sunbeam-school-preview.jpg';
    const liveLinkHtml = featuredProject.live_url ? `
      <a href="${featuredProject.live_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <span>View Live Website</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    ` : '';

    const featuredHtml = `
      <div class="portfolio-featured-card">
        <div class="portfolio-media-box">
          <img src="${featuredImg}" alt="${featuredProject.title}" class="portfolio-img" width="800" height="500" loading="lazy" onerror="this.src='assets/hero-mockup.jpg'">
        </div>
        <div class="portfolio-content-box">
          <span class="portfolio-badge">✓ ${featuredProject.client_name ? `Verified: ${featuredProject.client_name}` : 'Verified Client Project'}</span>
          <h3 class="portfolio-title">${featuredProject.title}</h3>
          <p class="portfolio-desc">${featuredProject.short_description}</p>
          <div class="portfolio-highlights">
            <div class="portfolio-hl-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>100% Mobile &amp; Tablet Ready</span>
            </div>
            <div class="portfolio-hl-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Custom Brand Architecture</span>
            </div>
            <div class="portfolio-hl-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Fast Loading &amp; Clean UI</span>
            </div>
            <div class="portfolio-hl-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Enquiry Capture System</span>
            </div>
          </div>
          <div class="portfolio-actions">
            ${liveLinkHtml}
            <button type="button" class="btn btn-secondary" data-open-project-modal="${featuredProject.slug}">
              <span>View Project Details</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    const secondaryCardsHtml = secondaryProjects.map(p => {
      const pImg = p.cover_image_url || 'assets/hero-mockup.jpg';
      const isConcept = (p.client_name || '').toLowerCase().includes('concept');
      const badgeText = isConcept ? 'Practice Concept Architecture' : (p.client_name || p.category);
      const liveBtn = p.live_url ? `
        <a href="${p.live_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          <span>View Live ↗</span>
        </a>
      ` : `
        <button type="button" class="btn btn-secondary btn-sm" data-select-service="${p.category}">
          <span>Inquire Website</span>
        </button>
      `;

      return `
        <div class="portfolio-card-item">
          <div class="portfolio-card-thumb">
            <img src="${pImg}" alt="${p.title}" class="portfolio-card-img" width="600" height="340" loading="lazy" onerror="this.src='assets/hero-mockup.jpg'">
          </div>
          <div class="portfolio-card-content">
            <span class="portfolio-badge" style="background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3);">${badgeText}</span>
            <h4 class="portfolio-card-title">${p.title}</h4>
            <p class="portfolio-card-desc">${p.short_description}</p>
            <div class="portfolio-card-tags">
              <span class="portfolio-mini-tag">${p.category}</span>
              <span class="portfolio-mini-tag">Mobile Responsive</span>
              <span class="portfolio-mini-tag">Fast Performance</span>
            </div>
            <div class="portfolio-actions">
              ${liveBtn}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      ${featuredHtml}
      ${secondaryCardsHtml ? `<div class="portfolio-grid-secondary">${secondaryCardsHtml}</div>` : ''}
    `;

    initQuickServiceSelectors();
    initProjectModal();
  }

  // Filter tab click handlers
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-portfolio-filter');
      renderPortfolio(cat);
    });
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
   7. Graceful Social Link Fallback Handlers
   ========================================================================== */
function initSafeSocialLinks() {
  const socialLinks = document.querySelectorAll('a.social-link-btn, a.social-pill');
  socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = (link.getAttribute('href') || '').trim();
      if (!href || href === '#' || href === 'javascript:void(0)') {
        e.preventDefault();
        showToast('Official social channel is active on Instagram (@digita.withr) and YouTube.');
      }
    });
  });
}

/* ==========================================================================
   8. Founder Photo Fullscreen Lightbox
   Allows users and clients to view Rishabh Pal's photo in full resolution.
   ========================================================================== */
function initFounderPhotoLightbox() {
  const photoWrapper = document.querySelector('.founder-photo-wrapper');
  if (!photoWrapper) return;

  photoWrapper.addEventListener('click', () => {
    let modal = document.getElementById('founderPhotoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'founderPhotoModal';
      modal.className = 'founder-photo-modal';
      modal.innerHTML = `
        <div class="founder-modal-backdrop"></div>
        <div class="founder-modal-content">
          <button type="button" class="founder-modal-close" aria-label="Close photo preview">✕</button>
          <img src="assets/founder.jpg?v=2" alt="Rishabh Pal - Founder & Studio Lead" class="founder-modal-img">
          <div class="founder-modal-caption">
            <h4>Rishabh Pal</h4>
            <span>Founder &amp; Studio Lead • RK DIGITAL STUDIO</span>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('.founder-modal-close');
      const backdrop = modal.querySelector('.founder-modal-backdrop');

      const closeModal = () => modal.classList.remove('open');
      closeBtn.addEventListener('click', closeModal);
      backdrop.addEventListener('click', closeModal);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
      });
    }

    modal.classList.add('open');
  });
}

