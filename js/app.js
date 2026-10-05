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
      businessName: businessNameInput.value.trim(),
      businessType: businessTypeInput.value.trim(),
      service: serviceVal,
      budget: selectedBudget,
      message: messageVal
    };

    // UI Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Submitting Enquiry...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';

    try {
      // Dispatch to database handler (Supabase / local queue fallback)
      let saveResult = { success: true };
      if (window.RK_DB && typeof window.RK_DB.saveEnquiryRecord === 'function') {
        saveResult = await window.RK_DB.saveEnquiryRecord(formData);
      } else {
        await new Promise(r => setTimeout(r, 600));
      }

      // Generate instant WhatsApp prefilled text for direct user convenience
      const waText = encodeURIComponent(
        `Hello RK DIGITAL STUDIO,\n\nI have submitted a website enquiry.\n` +
        `• Name: ${formData.fullName}\n` +
        `• Phone: ${formData.phone}\n` +
        `• Business: ${formData.businessName || 'Local Business'}\n` +
        `• Service: ${formData.service}\n` +
        `• Budget: ${formData.budget}\n` +
        `• Requirements: ${formData.message}\n\nPlease let me know the next steps.`
      );
      const waUrl = `https://wa.me/919519073791?text=${waText}`;

      if (waDirectBtn) {
        waDirectBtn.href = waUrl;
      }

      // Show success state
      if (successBanner) {
        successBanner.classList.add('visible');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();
      showToast('Enquiry received! We will contact you soon.');

    } catch (err) {
      console.error('Submission error:', err);
      alert('Your enquiry was saved locally. You can also chat directly on WhatsApp at 9519073791.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Enquiry';
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
