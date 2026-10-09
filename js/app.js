/* ============================================
   B&S Special – Main Application Logic
   ============================================ */

// ============ STATE ============
let currentScreen = 'screen-splash';
let currentPage = 'page-home';
let selectedPharmacy = PHARMACIES[0];
let cart = [];
let latestOrderId = '';
let rxUploaded = false;
let currentOrderTab = 'active';
let prevTimeframeFilter = 'all';
let customStartDate = '';
let customEndDate = '';
let pendingTimeframeFilter = 'all';
let pendingStartDate = '';
let pendingEndDate = '';
let isReorderFlow = false;
let prevYearFilter = '2026';
let otpTimerInterval = null;
let isFilterPanelExpanded = false;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  updateTime();
  setInterval(updateTime, 60000);

  // Splash screen auto-transition
  setTimeout(() => {
    navigateTo('screen-login');
  }, 3000);

  // Setup forms
  setupLoginForm();
  setupRegisterForm();
  setupForgotForm();
  setupOTPInputs();

  // Render initial data
  renderPharmacyList();
  updateSelectedPharmacyName();
  renderPharmacySmartMenu();
  renderNotifications();
  updateGreeting();
}

// ============ NAVIGATION ============
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    currentScreen = screenId;
  }

  // Initialize content when navigating to main
  if (screenId === 'screen-main') {
    renderDashboard();
    renderProductsGrid();
    updateCartBadge();
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    currentPage = pageId;
  }

  const globalHeader = document.querySelector('.page-header-dashboard');
  if (globalHeader) {
    globalHeader.style.display = pageId === 'page-account' ? 'none' : '';
  }

  if (pageId === 'page-cart') renderCart();
  if (pageId === 'page-orders') {
    const tabContainer = document.getElementById('order-tabs');
    if (tabContainer && tabContainer.style.display === 'none') {
      tabContainer.style.display = 'flex';
    }
    isReorderFlow = false;
    pendingTimeframeFilter = prevTimeframeFilter;
    renderOrders();
  }
  if (pageId === 'page-help') setSupportTab('order-support');
  if (pageId === 'page-notifications') renderNotifications();
  if (pageId === 'page-search') renderProductsGrid();
}

function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const btn = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  if (btn) btn.classList.add('active');

  const pageMap = {
    home: 'page-home',
    search: 'page-search',
    cart: 'page-cart',
    orders: 'page-orders',
    inbox: 'page-notifications',
    help: 'page-help',
    account: 'page-account'
  };
  if (pageMap[tabName]) showPage(pageMap[tabName]);
}

// ============ TIME & GREETING ============
function updateTime() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const el = document.getElementById('status-time');
  if (el) el.textContent = `${h}:${m}`;
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Greetings From B&S';
  if (hour >= 12 && hour < 17) greeting = 'Greetings from B&S';
  else if (hour >= 17) greeting = 'Greetings from B&S';
  const el = document.getElementById('greeting-text');
  if (el) el.textContent = greeting;
}

// ============ LOGIN ============
function setupLoginForm() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    emailError.textContent = '';
    passwordError.textContent = '';
    email.closest('.input-wrapper').classList.remove('error');
    password.closest('.input-wrapper').classList.remove('error');

    if (!email.value.trim()) {
      emailError.textContent = 'Email address is required';
      email.closest('.input-wrapper').classList.add('error');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      emailError.textContent = 'Please enter a valid email address';
      email.closest('.input-wrapper').classList.add('error');
      valid = false;
    }

    if (!password.value.trim()) {
      passwordError.textContent = 'Password is required';
      password.closest('.input-wrapper').classList.add('error');
      valid = false;
    } else if (password.value.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      password.closest('.input-wrapper').classList.add('error');
      valid = false;
    }

    if (valid) {
      showLoading('Signing in...');
      setTimeout(() => {
        hideLoading();
        navigateTo('screen-select-pharmacy');
      }, 1500);
    }
  });
}

function biometricLogin() {
  const modal = document.getElementById('biometric-modal-overlay');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
  }
}

function closeBiometricModal() {
  const modal = document.getElementById('biometric-modal-overlay');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => {
      modal.style.display = '';
    }, 300);
  }
}

function closeBiometricModalAndProceed() {
  closeBiometricModal();
  setTimeout(() => navigateTo('screen-select-pharmacy'), 300);
}

function sendLoginOTP() {
  showLoading('Sending OTP...');
  setTimeout(() => {
    hideLoading();
    document.getElementById('login-otp-entry').classList.remove('hidden');
    showToast('OTP sent to your mobile', 'success');
  }, 1200);
}

function switchAltTab(type) {
  const otpTab = document.getElementById('tab-otp');
  const biometricTab = document.getElementById('tab-biometric');
  const otpSection = document.getElementById('alt-otp-section');
  const biometricSection = document.getElementById('alt-biometric-section');
  const emailFields = document.getElementById('login-email-fields');
  const formOptions = document.querySelector('.form-options');
  const loginBtn = document.getElementById('login-btn');
  const loginForm = document.getElementById('login-form');
  const altContainer = document.querySelector('.alt-login-container');
  const altContent = document.querySelector('.alt-login-content');

  if (!otpTab || !otpSection || !biometricTab || !biometricSection) return;

  const resetToEmail = () => {
    otpTab.classList.remove('active');
    biometricTab.classList.remove('active');
    otpSection.classList.add('hidden');
    biometricSection.classList.add('hidden');

    if (emailFields) emailFields.classList.remove('hidden');
    if (formOptions) formOptions.classList.remove('hidden');
    if (loginBtn) loginBtn.classList.remove('hidden');

    if (altContent) {
      altContent.appendChild(otpSection);
      altContent.appendChild(biometricSection);
    }

    otpTab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  OTP`;
    biometricTab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6a6 6 0 00-6 6c0 4.5 6 9 6 9s6-4.5 6-9a6 6 0 00-6-6z" />
                  </svg>
                  Biometric`;
  };

  const isOtpActive = otpTab.classList.contains('active');
  const isBiometricActive = biometricTab.classList.contains('active');

  const showEmailLabel = (tab) => {
    tab.classList.add('active');
    tab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email`;
  };

  if (type === 'otp') {
    if (isOtpActive) {
      resetToEmail();
    } else {
      resetToEmail();
      otpSection.classList.remove('hidden');
      if (emailFields) emailFields.classList.add('hidden');
      if (formOptions) formOptions.classList.add('hidden');
      if (loginBtn) loginBtn.classList.add('hidden');
      if (loginForm && altContainer) loginForm.insertBefore(otpSection, altContainer);
      showEmailLabel(otpTab);
    }
  } else if (type === 'biometric') {
    if (isBiometricActive) {
      resetToEmail();
    } else {
      resetToEmail();
      biometricSection.classList.remove('hidden');
      if (emailFields) emailFields.classList.add('hidden');
      if (formOptions) formOptions.classList.add('hidden');
      if (loginBtn) loginBtn.classList.add('hidden');
      if (loginForm && altContainer) loginForm.insertBefore(biometricSection, altContainer);
      showEmailLabel(biometricTab);

      // Auto-navigate after a short delay since there's no button
      setTimeout(() => {
        if (document.getElementById('tab-biometric').classList.contains('active')) {
          navigateTo('screen-select-pharmacy');
        }
      }, 1500);
    }
  }
}


function verifyLoginOTP() {
  const boxes = document.querySelectorAll('#alt-otp-section .otp-box');
  let otp = '';
  boxes.forEach(b => otp += b.value);

  if (otp.length < 6) {
    showToast('Please enter the complete 6-digit OTP', 'error');
    return;
  }

  showLoading('Verifying OTP...');
  setTimeout(() => {
    hideLoading();
    showToast('OTP verified successfully', 'success');
    setTimeout(() => navigateTo('screen-select-pharmacy'), 600);
  }, 1500);
}


function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
}

// ============ REGISTRATION ============
function setupRegisterForm() {
  const form = document.getElementById('register-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const fields = [
      // Fields in form order
      { id: 'reg-pharmacy-name', errorId: 'reg-pharmacy-name-error', msg: 'Pharmacy Name is required', validate: v => v.trim().length > 0 },
      { id: 'reg-pharmacy-address', errorId: 'reg-pharmacy-address-error', msg: 'Pharmacy Address is required', validate: v => v.trim().length > 0 },
      { id: 'reg-postcode', errorId: 'reg-postcode-error', msg: 'Postcode is required', validate: v => v.trim().length > 0 },
      { id: 'reg-pharmacy-email', errorId: 'reg-pharmacy-email-error', msg: 'Valid pharmacy email address required', validate: v => isValidEmail(v) },
      { id: 'reg-contact', errorId: 'reg-contact-error', msg: 'Contact Number is required', validate: v => v.trim().length > 0 },
      { id: 'reg-director-name', errorId: 'reg-director-name-error', msg: 'Director Name is required', validate: v => v.trim().length > 0 },
      { id: 'reg-pharmacy-gphc', errorId: 'reg-pharmacy-gphc-error', msg: 'GPhC Number is required', validate: v => v.trim().length > 0 },
      { id: 'reg-org-code', errorId: 'reg-org-code-error', msg: 'Organization Code is required', validate: v => v.trim().length > 0 },
      { id: 'reg-company-reg', errorId: 'reg-company-reg-error', msg: 'Company Registration Number is required', validate: v => v.trim().length > 0 }
    ];

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const err = document.getElementById(f.errorId);
      err.textContent = '';
      const wrapper = el.closest('.input-wrapper') || el.closest('.textarea-wrapper');
      if (wrapper) wrapper.classList.remove('error');
      if (!f.validate(el.value)) {
        err.textContent = f.msg;
        if (wrapper) wrapper.classList.add('error');
        valid = false;
      }
    });

    // Terms
    const terms = document.getElementById('reg-terms');
    const termsErr = document.getElementById('reg-terms-error');
    termsErr.textContent = '';
    if (!terms.checked) {
      termsErr.textContent = 'You must accept the Terms & Conditions';
      valid = false;
    }

    if (valid) {
      showLoading('Submitting your request...');
      setTimeout(() => {
        hideLoading();

        // Reset the form fields
        form.reset();
        document.querySelectorAll('.input-wrapper').forEach(w => w.classList.remove('error'));
        document.querySelectorAll('.field-error').forEach(e => e.textContent = '');

        const modalContent = `
          <div class="registration-success-modal" style="text-align: center; padding: 24px 16px;">
            <div style="width: 56px; height: 56px; background: var(--success-bg); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">Request Sent Successfully</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">Your request has been submitted successfully and sent for review. We will get back to you shortly.</p>
            <button class="btn btn-primary btn-full" onclick="closeModal(); navigateTo('screen-login');" style="margin-top: 10px;">Back to Login</button>
          </div>
        `;
        openModal(modalContent);
      }, 1800);
    }
  });
}

function updatePasswordStrength(password) {
  const bars = document.querySelectorAll('.strength-bar');
  const text = document.querySelector('.strength-text');
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  bars.forEach((bar, i) => {
    bar.className = 'strength-bar';
    if (i < strength) {
      if (strength <= 1) bar.classList.add('weak');
      else if (strength <= 2) bar.classList.add('medium');
      else bar.classList.add('strong');
    }
  });

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  text.textContent = labels[strength] || 'Password Strength';
}

// ============ OTP ============
function setupOTPInputs() {
  document.querySelectorAll('.otp-box').forEach(box => {
    box.addEventListener('input', (e) => {
      if (e.target.value.length === 1) {
        const next = e.target.nextElementSibling;
        if (next && next.classList.contains('otp-box')) next.focus();
      }
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value) {
        const prev = e.target.previousElementSibling;
        if (prev && prev.classList.contains('otp-box')) prev.focus();
      }
    });
  });
}

function startOTPTimer() {
  let seconds = 30;
  const countdown = document.getElementById('otp-countdown');
  const timerText = document.getElementById('otp-timer-text');
  const resendBtn = document.getElementById('resend-otp-btn');

  timerText.classList.remove('hidden');
  resendBtn.classList.add('hidden');

  if (otpTimerInterval) clearInterval(otpTimerInterval);
  otpTimerInterval = setInterval(() => {
    seconds--;
    countdown.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(otpTimerInterval);
      timerText.classList.add('hidden');
      resendBtn.classList.remove('hidden');
    }
  }, 1000);
}

function resendOTP() {
  showToast('OTP resent to your mobile', 'success');
  startOTPTimer();
}

function verifyOTP() {
  const boxes = document.querySelectorAll('[data-otp-reg]');
  let otp = '';
  boxes.forEach(b => otp += b.value);

  if (otp.length < 6) {
    showToast('Please enter the complete 6-digit OTP', 'error');
    return;
  }

  showLoading('Verifying...');
  setTimeout(() => {
    hideLoading();
    showToast('Account verified successfully!', 'success');
    setTimeout(() => navigateTo('screen-login'), 800);
  }, 1500);
}

// ============ FORGOT PASSWORD ============
function setupForgotForm() {
  const form = document.getElementById('forgot-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showLoading('Sending reset link...');
    setTimeout(() => {
      hideLoading();
      form.classList.add('hidden');
      document.getElementById('forgot-success').classList.remove('hidden');
    }, 1500);
  });
}

function renderPharmacyList() {
  const container = document.getElementById('pharmacy-list');
  if (!container) return;
  container.innerHTML = PHARMACIES.map(ph => {
    const postcode = ph.address.match(/[A-Z0-9]+\s+[A-Z0-9]+$/i)?.[0] || '';
    const addressWithoutPostcode = ph.address.replace(postcode, '').replace(/,\s*$/, '').trim();
    const isSelected = selectedPharmacy && selectedPharmacy.id === ph.id;
    return `
      <div class="pharmacy-card fade-in ${isSelected ? 'selected' : ''}" onclick="selectPharmacy('${ph.id}')">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="pc-name" style="font-size: 14px; flex: 1; margin-right: 8px;">${ph.name}</span>
          ${ph.accountNo ? `<span style="font-size: 12px; font-weight: 700; color: #D97706; text-align: right; min-width: 60px; white-space: nowrap;">${ph.accountNo}</span>` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="pc-address-row" style="flex: 1; margin-right: 8px; overflow: hidden;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="address-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="pc-address-text" title="${ph.address}" style="font-size: 11px;">${addressWithoutPostcode}</span>
          </div>
          ${postcode ? `<span style="font-size: 11px; font-weight: 600; color: #059669; text-align: right; min-width: 60px; white-space: nowrap;">${postcode}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function filterPharmacies(query) {
  const cards = document.querySelectorAll('.pharmacy-card');
  const q = query.toLowerCase().trim();
  cards.forEach((card, i) => {
    const ph = PHARMACIES[i];
    const name = ph.name.toLowerCase();
    const postcode = (ph.address.match(/[A-Z0-9]+\s+[A-Z0-9]+$/i)?.[0] || '').toLowerCase();
    const accountNo = (ph.accountNo || '').toLowerCase();

    card.style.display = (name.includes(q) || postcode.includes(q) || accountNo.includes(q)) ? '' : 'none';
  });
}

function updateSelectedPharmacyName() {
  const selectedPharmacyName = document.getElementById('selected-pharmacy-name');
  if (selectedPharmacyName && selectedPharmacy) {
    const postcode = (selectedPharmacy.address.match(/[A-Z0-9]+\s+[A-Z0-9]+$/i)?.[0] || '');
    const accountStr = selectedPharmacy.accountNo ? `<span style="background: rgba(255,255,255,0.2); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; margin: 0 4px; letter-spacing: 0.5px;">${selectedPharmacy.accountNo}</span>` : '';
    const postcodeStr = postcode ? `<span style="color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">${postcode}</span>` : '';
    selectedPharmacyName.innerHTML = `<span style="font-weight: 700; font-size: 14px;">${selectedPharmacy.name}</span>${accountStr}${postcodeStr}`;

    const accName = document.getElementById('account-name');
    if (accName) accName.innerHTML = `<span style="font-weight: 700; font-size: 14px;">${selectedPharmacy.name}</span>${accountStr}${postcodeStr}`;
  }
}

function selectPharmacy(id) {
  selectedPharmacy = PHARMACIES.find(p => p.id === id);

  // Update select screen list selection class
  document.querySelectorAll('.pharmacy-card').forEach((c, idx) => {
    if (PHARMACIES[idx] && PHARMACIES[idx].id === id) {
      c.classList.add('selected');
    } else {
      c.classList.remove('selected');
    }
  });

  showLoading('Loading dashboard...');
  setTimeout(() => {
    hideLoading();

    updateSelectedPharmacyName();
    renderPharmacySmartMenu();

    const pharmacyPillName = document.getElementById('pharmacy-pill-name');
    if (pharmacyPillName) pharmacyPillName.textContent = selectedPharmacy.name;

    const avatar = document.querySelector('.account-avatar span');
    if (avatar) avatar.textContent = selectedPharmacy.initials;
    const navAvatar = document.querySelector('.avatar span');
    if (navAvatar) navAvatar.textContent = selectedPharmacy.initials;

    navigateTo('screen-main');
    showPage('page-home');
    switchTab('home');
  }, 1200);
}

// ============ PHARMACY SMART DROPDOWN ============
function togglePharmacyDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('pharmacy-smart-dropdown');
  if (dropdown) {
    const isOpen = dropdown.classList.toggle('open');
    if (isOpen) {
      const searchInput = document.getElementById('pharmacy-menu-search');
      if (searchInput) {
        searchInput.value = '';
        setTimeout(() => searchInput.focus(), 50);
      }
      renderPharmacySmartMenu('');
    }
  }
}

function renderPharmacySmartMenu(query = '') {
  const list = document.getElementById('pharmacy-menu-list');
  if (!list) return;

  let filtered = PHARMACIES;
  const q = query.toLowerCase().trim();
  if (q) {
    filtered = PHARMACIES.filter(ph => {
      const postcode = (ph.address.match(/[A-Z0-9]+\s+[A-Z0-9]+$/i)?.[0] || '').toLowerCase();
      const acNo = (ph.accountNo || '').toLowerCase();
      return ph.name.toLowerCase().includes(q) || acNo.includes(q) || postcode.includes(q);
    });
  }

  if (filtered.length === 0) {
    list.innerHTML = `<div style="padding: 10px; text-align: center; font-size: 13px; color: var(--text-muted);">No pharmacies found</div>`;
    return;
  }

  list.innerHTML = filtered.map(ph => {
    const isActive = selectedPharmacy.id === ph.id;
    const postcode = ph.address.match(/[A-Z0-9]+\s+[A-Z0-9]+$/i)?.[0] || '';
    return `
      <button class="pharmacy-menu-item ${isActive ? 'active' : ''}" onclick="selectPharmacyFromDropdown(event, '${ph.id}')">
        <span class="pm-name">${ph.name}</span>
        <span class="pm-gphc">Ac no: ${ph.accountNo || ''}${postcode ? `, ${postcode}` : ''}</span>
      </button>
    `;
  }).join('');
}

function filterPharmacySmartMenu(query) {
  renderPharmacySmartMenu(query);
}

function selectPharmacyFromDropdown(event, id) {
  event.stopPropagation();

  const dropdown = document.getElementById('pharmacy-smart-dropdown');
  if (dropdown) dropdown.classList.remove('open');

  if (selectedPharmacy.id === id) return;

  selectPharmacy(id);
}

// ============ DASHBOARD ============
function renderDashboard() {
  updateGreeting();
  renderRecentOrders();
}

function renderRecentOrders() {
  const container = document.getElementById('recent-orders-list');
  if (!container) return;
  const recentOrders = ORDERS.slice(0, 5);
  container.innerHTML = recentOrders.map(order => createOrderCard(order, 'home-recent', false)).join('');
}

function searchHomeOrders(query) {
  const container = document.getElementById('recent-orders-list');
  if (!container) return;
  const q = query.toLowerCase().trim();
  if (!q) {
    renderRecentOrders();
    return;
  }
  const filtered = ORDERS.filter(order => {
    const shortId = 'SR-' + order.id.split('-')[1].substring(0, 6);
    return order.id.toLowerCase().includes(q) ||
      shortId.toLowerCase().includes(q) ||
      order.date.toLowerCase().includes(q) ||
      (order.dateShort && order.dateShort.includes(q));
  });
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 30px 0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3 style="font-size:14px; margin-top:12px;">No orders found</h3>
        <p style="font-size:12px; color:var(--text-muted);">Try a different order number or date</p>
      </div>`;
    return;
  }
  container.innerHTML = filtered.map(order => createOrderCard(order, 'home-search', false)).join('');
}

// ============ PRODUCT SEARCH & LISTING ============
function getCartItem(medId) {
  return cart.find(c => c.id === medId);
}

function renderProductsGrid(medicines) {
  const container = document.getElementById('products-grid');
  if (!container) return;
  const data = medicines || MEDICINES;
  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3>No medicines found</h3>
        <p>Try adjusting your search or filters</p>
      </div>`;
    return;
  }
  container.innerHTML = data.map(med => {
    const cartItem = getCartItem(med.id);
    const inCart = !!cartItem;
    const qty = inCart ? cartItem.qty : 0;

    let displayName = med.name;
    if (med.packSize.toLowerCase().includes('tablets')) {
      displayName = displayName.replace(/\bTablets\b/gi, '').replace(/\s+/g, ' ').trim();
    } else if (med.packSize.toLowerCase().includes('capsules')) {
      displayName = displayName.replace(/\bCapsules\b/gi, '').replace(/\s+/g, ' ').trim();
    }

    return `
    <div class="product-card fade-in ${inCart ? 'in-cart' : ''}">
      <div class="product-card-row" style="align-items: flex-start;">
        <div class="product-info">
          <div class="p-name" style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
            <span>${displayName} (${med.packSize})</span>
          </div>
        </div>
        <div class="product-card-actions" onclick="event.stopPropagation();" style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
          <span class="p-category" style="margin-top:0; margin-bottom:0;">${med.categoryLabel}</span>
          <div style="display:flex; align-items:center; gap:6px;">
          ${inCart ? `
            <button class="pc-remove-btn" onclick="removeFromSearch('${med.id}')" title="Remove from cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          ` : ''}
            <div class="pc-qty-control">
              <button class="pc-qty-btn" onclick="changeSearchQty('${med.id}', -1)">−</button>
              <span class="pc-qty-value">${qty}</span>
              <button class="pc-qty-btn" onclick="changeSearchQty('${med.id}', 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

// Search-page cart actions (re-render product grid to reflect changes)
function addFromSearch(medId) {
  const med = MEDICINES.find(m => m.id === medId);
  if (!med) return;

  const existing = cart.find(c => c.id === medId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      ...med,
      qty: 1,
      notes: '',
      flavorFree: false,
      sugarFree: false,
      alcoholFree: false,
      rxUploaded: false,
      rxFileName: null
    });
  }

  updateCartBadge();
  showToast(`${med.name.substring(0, 30)}... added to cart`, 'success');
  refreshProductsGrid();
}

function changeSearchQty(medId, delta) {
  const item = cart.find(c => c.id === medId);
  if (!item) {
    if (delta > 0) {
      addFromSearch(medId);
    }
    return;
  }

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromSearch(medId);
    return;
  }
  item.qty = newQty;
  updateCartBadge();
  refreshProductsGrid();
}

function removeFromSearch(medId) {
  const med = cart.find(c => c.id === medId);
  cart = cart.filter(c => c.id !== medId);
  updateCartBadge();
  if (med) showToast(`${med.name.substring(0, 30)}... removed from cart`, 'info');
  refreshProductsGrid();
}

// Re-renders the product grid while preserving current search/filter state
function refreshProductsGrid() {
  const searchVal = document.getElementById('medicine-search')?.value?.toLowerCase() || '';
  const activeCat = document.querySelector('.cat-tab.active')?.dataset?.cat || 'all';

  let filtered = MEDICINES;
  if (activeCat !== 'all') filtered = filtered.filter(m => m.category === activeCat);
  if (searchVal) filtered = filtered.filter(m =>
    m.name.toLowerCase().includes(searchVal) ||
    m.code.toLowerCase().includes(searchVal) ||
    m.categoryLabel.toLowerCase().includes(searchVal)
  );
  renderProductsGrid(filtered);
}

function searchMedicines(query) {
  const q = query.toLowerCase();
  const filtered = MEDICINES.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.code.toLowerCase().includes(q) ||
    m.categoryLabel.toLowerCase().includes(q)
  );
  renderProductsGrid(filtered);
}

function filterByCategory(cat, btn) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const searchVal = document.getElementById('medicine-search').value.toLowerCase();
  let filtered = MEDICINES;
  if (cat !== 'all') filtered = MEDICINES.filter(m => m.category === cat);
  if (searchVal) filtered = filtered.filter(m =>
    m.name.toLowerCase().includes(searchVal) ||
    m.code.toLowerCase().includes(searchVal)
  );
  renderProductsGrid(filtered);
}

function toggleFilterPanel() {
  document.getElementById('filter-panel').classList.toggle('hidden');
}

function toggleChip(btn) {
  const parent = btn.closest('.filter-chips');
  parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}


function showQueryModal(medId) {
  const med = MEDICINES.find(m => m.id === medId);
  const content = `
    <h3>Product Inquiry</h3>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">Submit a query about <strong>${med.name}</strong></p>
    <div class="form-group">
      <label>Your Query</label>
      <div class="input-wrapper textarea-wrapper">
        <textarea id="query-text" placeholder="Type your question or inquiry..." rows="4"></textarea>
      </div>
    </div>
    <button class="btn btn-primary btn-full" onclick="submitQuery()">Submit Query</button>
  `;
  openModal(content);
}

function submitQuery() {
  const text = document.getElementById('query-text').value;
  if (!text.trim()) {
    showToast('Please enter your query', 'error');
    return;
  }
  closeModal();
  showToast('Query submitted successfully', 'success');
}

// ============ CART ============
function addToCart(medId) {
  const med = MEDICINES.find(m => m.id === medId);
  if (!med) return;

  const existing = cart.find(c => c.id === medId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      ...med,
      qty: 1,
      notes: '',
      flavorFree: false,
      sugarFree: false,
      alcoholFree: false,
      rxUploaded: false,
      rxFileName: null
    });
  }

  updateCartBadge();
  showToast(`${med.name.substring(0, 30)}... added to cart`, 'success');
}

function removeFromCart(medId) {
  cart = cart.filter(c => c.id !== medId);
  updateCartBadge();
  renderCart();
}

function updateCartQty(medId, delta) {
  const item = cart.find(c => c.id === medId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  renderCart();
}

function updateCartBadge() {
  const count = cart.length;
  const badge = document.getElementById('cart-badge');
  const headerCount = document.getElementById('cart-header-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  if (headerCount) headerCount.textContent = count;
}

function renderCart() {
  const container = document.getElementById('cart-content');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <h3>Your cart is empty</h3>
        <p>Browse medicines and add items to your cart</p>
        <button class="btn btn-primary" onclick="switchTab('search')">Browse Medicines</button>
      </div>`;
    return;
  }

  let html = '<div class="cart-content">';

  // Cart Items
  cart.forEach(item => {
    let displayName = item.name;
    if (item.packSize.toLowerCase().includes('tablets')) {
      displayName = displayName.replace(/\bTablets\b/gi, '').replace(/\s+/g, ' ').trim();
    } else if (item.packSize.toLowerCase().includes('capsules')) {
      displayName = displayName.replace(/\bCapsules\b/gi, '').replace(/\s+/g, ' ').trim();
    }

    html += `
      <div class="product-card in-cart fade-in" style="margin-bottom: 8px; cursor: default; padding: 8px 12px; border: 2px solid var(--accent); border-radius: var(--radius-md); background: white;">
        <!-- Top Row: Product Info & Qty Control -->
        <div class="product-card-row" style="display:flex; justify-content:space-between; align-items: flex-start; gap: 8px;">
          <div class="product-info" style="flex:1;">
            <div class="p-name" style="font-size:13px; font-weight:700; color:var(--text-primary); line-height:1.3;">
              <span>${displayName} (${item.packSize})</span>
            </div>
            <div style="margin-top: 2px; display: flex; gap: 6px; align-items: center;">
              <span class="p-category" style="margin: 0; padding: 1px 5px; font-size: 10px; font-weight: 600; border-radius: 4px; background: var(--accent-bg); color: var(--accent);">${item.categoryLabel}</span>
            </div>
          </div>
          <div class="product-card-actions" style="display:flex; align-items:center; gap:6px; flex-shrink: 0;">
            <button class="pc-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove from cart" style="padding: 4px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <div class="pc-qty-control" style="display:flex; align-items:center; background:var(--bg); border-radius:6px; padding:1px;">
              <button class="pc-qty-btn" onclick="updateCartQty('${item.id}', -1)" style="width:22px; height:22px; font-weight:bold; font-size:12px;">−</button>
              <span class="pc-qty-value" style="padding:0 6px; font-weight:600; font-size:12px;">${item.qty}</span>
              <button class="pc-qty-btn" onclick="updateCartQty('${item.id}', 1)" style="width:22px; height:22px; font-weight:bold; font-size:12px;">+</button>
            </div>
          </div>
        </div>

        <!-- Options Container -->
        <div class="product-cart-options" style="display: flex; flex-direction: column; gap: 4px; border-top: 1px solid var(--border-light); margin-top: 6px; padding-top: 6px;">
          <div style="font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;">Product Specifications (If Required)</div>
          <!-- Other Specs Checkboxes -->
          <div style="display: flex; gap: 14px; margin-top: 0;">
            <label class="checkbox-label" style="margin: 0; font-size: 11px; display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" onchange="updateProductSpec('${item.id}', 'flavorFree', this.checked)" ${item.flavorFree ? 'checked' : ''} style="width: 14px; height: 14px; accent-color: var(--accent);" />
              <span style="font-size: 11px; color: var(--text-secondary);">Flavor Free</span>
            </label>
            <label class="checkbox-label" style="margin: 0; font-size: 11px; display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" onchange="updateProductSpec('${item.id}', 'sugarFree', this.checked)" ${item.sugarFree ? 'checked' : ''} style="width: 14px; height: 14px; accent-color: var(--accent);" />
              <span style="font-size: 11px; color: var(--text-secondary);">Sugar Free</span>
            </label>
            <label class="checkbox-label" style="margin: 0; font-size: 11px; display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" onchange="updateProductSpec('${item.id}', 'alcoholFree', this.checked)" ${item.alcoholFree ? 'checked' : ''} style="width: 14px; height: 14px; accent-color: var(--accent);" />
              <span style="font-size: 11px; color: var(--text-secondary);">Alcohol Free</span>
            </label>
          </div>

          <!-- Prescription Upload (if Rx Required) -->
          ${item.rxRequired ? `
            <div style="height: 1px; background: var(--border-light); margin: 4px 0 2px 0;"></div>
            <div class="product-rx-section" style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="color: var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Prescription Upload (Optional)
                </span>
                <input type="file" id="rx-file-input-${item.id}" style="display:none" onchange="handleProductFileSelect('${item.id}', this)" accept=".pdf,.png,.jpg,.jpeg" />
                <button class="btn btn-outline" onclick="document.getElementById('rx-file-input-${item.id}').click()" style="padding: 3px 8px; font-size: 11px; font-weight: 700; border-radius: 6px; border: ${item.rxUploaded ? '1px solid var(--success)' : '1px solid var(--primary)'}; color: ${item.rxUploaded ? 'var(--success)' : 'var(--primary)'}; background: transparent; transition: var(--transition); height: auto; min-height: 0; line-height: 1;">
                  ${item.rxUploaded ? 'Uploaded' : 'Upload'}
                </button>
              </div>
              ${item.rxUploaded ? `
                <div class="upload-success" style="margin-top: 0; padding: 4px 8px; font-size: 11px; display: flex; align-items: center; gap: 4px; background: var(--success-bg); border-radius: 4px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="color: var(--success); flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style="color: var(--success); font-weight: 600; font-size: 11px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.rxFileName}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  // Delivery Address & GPhC Verification Merged
  html += `
    <div class="cart-section fade-in">
      <h4 style="margin-bottom: 8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Delivery Address
      </h4>
      <div style="background:var(--primary-bg);padding:10px 12px;border-radius:var(--radius-md);border:1px solid var(--border-light);margin-bottom:12px;">
        <strong style="display:block;font-size:14px;color:var(--text-primary);margin-bottom:4px;">${selectedPharmacy.name}</strong>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.4;margin:0;">${selectedPharmacy.address}</p>
      </div>
      
      <h4 style="margin-bottom: 8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Pharmacist Verification
      </h4>
      <div class="form-group">
        <label>GPhC Registration Number <span class="required">*</span></label>
        <div class="input-wrapper">
          <input type="text" id="cart-gphc" placeholder="Enter GPhC number" value="2087654" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 0;">
        <label>Pharmacist Name <span class="required">*</span></label>
        <div class="input-wrapper">
          <input type="text" id="cart-pharmacist" placeholder="Enter pharmacist name" value="Dr. Sarah Mitchell" />
        </div>
      </div>
    </div>
  `;

  // Declarations
  html += `
    <div class="cart-section">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Mandatory Declarations
      </h4>
      <div class="declaration-checkbox">
        <input type="checkbox" id="declaration-1" />
        <label for="declaration-1">I confirm that the above item(s) are required by the pharmacy detailed above.</label>
      </div>
      <div class="declaration-checkbox">
        <input type="checkbox" id="declaration-2" />
        <label for="declaration-2">I confirm this is a bona fide request for this unlicensed medicine and there is a special clinical need for this item.</label>
      </div>
    </div>
  `;

  // Place Order Button
  html += `
    <div style="padding:12px 0;">
      <button class="btn btn-accent btn-full" onclick="placeOrder()" style="padding:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Place Order
      </button>
    </div>
  `;

  html += '</div>';
  container.innerHTML = html;
  updateCartBadge();
}

function updateCartNote(medId, note) {
  const item = cart.find(c => c.id === medId);
  if (item) item.notes = note;
}


function updateProductSpec(medId, specName, value) {
  const item = cart.find(c => c.id === medId);
  if (item) {
    item[specName] = value;
  }
}

function simulateProductUpload(medId) {
  const item = cart.find(c => c.id === medId);
  if (!item) return;

  showLoading('Uploading prescription...');
  setTimeout(() => {
    hideLoading();
    item.rxUploaded = true;

    // Create a formatted file name based on the medicine's name
    const sanitizedName = item.name.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    item.rxFileName = `prescription_${sanitizedName}.pdf`;

    renderCart();
    showToast(`Prescription for ${item.name.substring(0, 20)}... uploaded successfully`, 'success');
  }, 1500);
}

function handleProductFileSelect(medId, input) {
  const file = input.files[0];
  if (!file) return;

  const item = cart.find(c => c.id === medId);
  if (!item) return;

  showLoading('Uploading prescription...');
  setTimeout(() => {
    hideLoading();
    item.rxUploaded = true;
    item.rxFileName = file.name;

    renderCart();
    showToast(`Prescription for ${item.name.substring(0, 20)}... uploaded successfully`, 'success');
  }, 1200);
}

function simulateUpload() {
  showLoading('Uploading prescription...');
  setTimeout(() => {
    hideLoading();
    rxUploaded = true;
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) uploadArea.style.display = 'none';
    const successArea = document.getElementById('upload-success-area');
    if (successArea) successArea.classList.remove('hidden');
    const uploadBtn = document.getElementById('cart-upload-btn');
    if (uploadBtn) {
      uploadBtn.textContent = 'Uploaded';
      uploadBtn.style.borderColor = 'var(--success)';
      uploadBtn.style.color = 'var(--success)';
    }
    showToast('Prescription uploaded successfully', 'success');
  }, 1800);
}

function placeOrder() {
  // Validate
  const gphc = document.getElementById('cart-gphc')?.value?.trim();
  const pharmacist = document.getElementById('cart-pharmacist')?.value?.trim();
  const dec1 = document.getElementById('declaration-1')?.checked;
  const dec2 = document.getElementById('declaration-2')?.checked;

  if (!gphc) {
    showToast('GPhC Registration Number is required', 'error');
    return;
  }
  if (!/^\d{7}$/.test(gphc)) {
    showToast('Invalid GPhC number. Must be 7 digits.', 'error');
    return;
  }
  if (!pharmacist) {
    showToast('Pharmacist name is required', 'error');
    return;
  }


  if (!dec1 || !dec2) {
    showToast('Please accept all mandatory declarations', 'error');
    return;
  }

  showLoading('Submitting your order...');
  setTimeout(() => {
    hideLoading();

    // Generate order ID
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 100)).padStart(4, '0');
    latestOrderId = `SRX-${dateStr}-${seq}`;
    const successIdEl = document.getElementById('success-order-id');
    if (successIdEl) successIdEl.textContent = latestOrderId;

    // Add to orders list
    const newOrder = {
      id: latestOrderId,
      date: formatDate(now),
      dateShort: formatDateShort(now),
      pharmacy: selectedPharmacy.name,
      items: cart.map(c => ({
        name: c.name,
        qty: c.qty,
        packSize: c.packSize,
        flavorFree: c.flavorFree,
        sugarFree: c.sugarFree,
        alcoholFree: c.alcoholFree,
        rxUploaded: c.rxUploaded,
        rxFileName: c.rxFileName
      })),
      status: 'pending',
      statusLabel: 'Order Received',
      statusClass: 'status-received',
      trackingStep: 0,
      estimatedDelivery: formatDate(new Date(now.getTime() + 3 * 86400000))
    };
    ORDERS.unshift(newOrder);

    // Clear cart
    cart = [];
    rxUploaded = false;
    updateCartBadge();

    showPage('page-order-success');
  }, 2500);
}

// ============ ORDERS ============
function renderOrders() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  let filtered = [];

  if (currentOrderTab === 'active') {
    // Active orders: transit, dispatched, processing, approved, pending, hold
    const activeStatuses = ['transit', 'dispatched', 'processing', 'approved', 'pending', 'hold'];
    filtered = ORDERS.filter(o => activeStatuses.includes(o.status));
  } else {
    // Previous orders: delivered, cancelled
    const previousStatuses = ['delivered', 'cancelled'];
    filtered = ORDERS.filter(o => previousStatuses.includes(o.status));

    // Apply Timeframe Filter
    const currentDate = new Date('2026-05-28T10:05:57'); // current time in 2026
    if (prevTimeframeFilter === '7') {
      const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.date) >= sevenDaysAgo);
    } else if (prevTimeframeFilter === '15') {
      const fifteenDaysAgo = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.date) >= fifteenDaysAgo);
    } else if (prevTimeframeFilter === '30') {
      const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.date) >= thirtyDaysAgo);
    } else if (prevTimeframeFilter === '90') {
      const ninetyDaysAgo = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.date) >= ninetyDaysAgo);
    } else if (['2025', '2024'].includes(prevTimeframeFilter)) {
      filtered = filtered.filter(o => {
        const year = new Date(o.date).getFullYear().toString();
        return year === prevTimeframeFilter;
      });
    }

    // Apply Year Filter (defaults to 2026 if no explicit timeframe or year chip is active)
    if (prevYearFilter !== 'all' && !['7', '15', '30', '90', '2025', '2024'].includes(prevTimeframeFilter)) {
      filtered = filtered.filter(o => {
        const year = new Date(o.date).getFullYear().toString();
        return year === prevYearFilter;
      });
    }
  }

  // Prepend the filter panel if we are in Previous Orders tab and NOT in reorder flow
  let filterPanelHtml = '';
  if (currentOrderTab === 'previous' && !isReorderFlow) {
    const activeLabel = getActiveFilterLabel();
    const activeBadgeHtml = activeLabel ? `<span class="hist-filter-badge">${activeLabel}</span>` : '';

    filterPanelHtml = `
      <div class="hist-filter-panel ${isFilterPanelExpanded ? 'expanded' : ''}">
        <div class="hist-filter-header" onclick="toggleHistFilterPanel()">
          <h4 class="hist-filter-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter Historical Orders
          </h4>
          <div style="display:flex; align-items:center; gap:6px;">
            ${activeBadgeHtml}
            <svg class="chevron-icon" style="transition: transform 0.3s ease; transform: rotate(${isFilterPanelExpanded ? '180deg' : '0deg'}); color: var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        
        <div class="hist-filter-content">
          <!-- Chips Container -->
          <div class="hist-filter-chips">
            ${[
        { key: '7', label: 'Last 7 Days' },
        { key: '15', label: 'Last 15 Days' },
        { key: '30', label: 'Last 30 Days' },
        { key: '90', label: 'Last 3 Months' },
        { key: '2025', label: '2025' },
        { key: '2024', label: '2024' }
      ].map(f => {
        const isActive = pendingTimeframeFilter === f.key;
        return `
                <button class="hist-chip ${isActive ? 'active' : ''}" data-filter-key="${f.key}" onclick="selectPendingTimeframe('${f.key}')">
                  ${f.label}
                </button>
              `;
      }).join('')}
          </div>
          
          <!-- Action Buttons -->
          <div class="hist-filter-actions">
            <button onclick="clearHistoricalFilter()" class="btn btn-outline" style="flex:1; font-size:13px; padding:10px 12px; height:auto; border: 1px solid var(--border); color: var(--text-secondary);">
              Clear
            </button>
            <button onclick="applyHistoricalFilter()" class="btn btn-primary" style="flex:1; font-size:13px; padding:10px 12px; height:auto;">
              Apply
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (filtered.length === 0) {
    container.innerHTML = filterPanelHtml + `
      <div class="empty-state" style="text-align:center; padding: 24px; background:white; border-radius:var(--radius-md); border:1px solid var(--border);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="color:var(--text-muted); opacity:0.6; margin-bottom:10px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <h3 style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">No orders found</h3>
        <p style="font-size:11px; color:var(--text-muted); margin:0;">Orders matching the current filters will appear here</p>
      </div>`;
    return;
  }

  container.innerHTML = filterPanelHtml + filtered.map(order => createOrderCard(order, currentOrderTab === 'active' ? 'orders-active' : 'orders-previous', true)).join('');
}

function selectPendingTimeframe(timeframe) {
  pendingTimeframeFilter = timeframe;

  // Update chips active state directly in DOM
  const chips = document.querySelectorAll('.hist-chip');
  chips.forEach(chip => {
    const key = chip.getAttribute('data-filter-key');
    if (key === timeframe) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function applyHistoricalFilter() {
  prevTimeframeFilter = pendingTimeframeFilter;
  isFilterPanelExpanded = false; // Collapse panel on Apply
  renderOrders();
}

function clearHistoricalFilter() {
  pendingTimeframeFilter = 'all';
  prevTimeframeFilter = 'all';
  isFilterPanelExpanded = false; // Collapse panel on Clear
  renderOrders();
}

function toggleHistFilterPanel() {
  isFilterPanelExpanded = !isFilterPanelExpanded;
  const panel = document.querySelector('.hist-filter-panel');
  const chevron = document.querySelector('.hist-filter-header .chevron-icon');
  if (panel && chevron) {
    panel.classList.toggle('expanded', isFilterPanelExpanded);
    chevron.style.transform = `rotate(${isFilterPanelExpanded ? '180deg' : '0deg'})`;
  }
}

function getActiveFilterLabel() {
  if (prevTimeframeFilter === '7') return 'Last 7 Days';
  if (prevTimeframeFilter === '15') return 'Last 15 Days';
  if (prevTimeframeFilter === '30') return 'Last 30 Days';
  if (prevTimeframeFilter === '90') return 'Last 3 Months';
  if (['2025', '2024'].includes(prevTimeframeFilter)) return prevTimeframeFilter;
  return '';
}

function formatShortDateStr(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function setOrderTab(tab, hideTabs) {
  currentOrderTab = tab;
  isReorderFlow = !!hideTabs;
  isFilterPanelExpanded = false; // Reset to collapsed when switching tabs
  const tabContainer = document.getElementById('order-tabs');
  if (tabContainer) {
    if (hideTabs) {
      tabContainer.style.display = 'none';
    } else {
      tabContainer.style.display = 'flex';
    }
  }
  document.querySelectorAll('#order-tabs .order-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.otab === tab);
  });
  pendingTimeframeFilter = prevTimeframeFilter;
  renderOrders();
}

function createOrderCard(order, context, showReorder) {
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    const item = order.items[0];
    let displayName = item.name;
    if (item.packSize && item.packSize.toLowerCase().includes('tablets')) {
      displayName = displayName.replace(/\bTablets\b/gi, '').replace(/\s+/g, ' ').trim();
    } else if (item.packSize && item.packSize.toLowerCase().includes('capsules')) {
      displayName = displayName.replace(/\bCapsules\b/gi, '').replace(/\s+/g, ' ').trim();
    }
    const packStr = item.packSize ? ` (${item.packSize})` : '';
    const med = MEDICINES.find(m => m.name === item.name || m.name.includes(item.name.substring(0, 20)));
    const catLabel = med ? med.categoryLabel : '';
    const itemsList = `
      <div class="order-card-item" style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 12px; margin-bottom: 0px; line-height: 1.4;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}${packStr}</div>
          ${catLabel ? `<div style="margin-top: 4px;"><span class="p-category" style="margin: 0; font-size: 9px; padding: 1px 5px;">${catLabel}</span></div>` : ''}
        </div>
        <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; margin-left: 8px; min-width: 75px; text-align: center;">Qty-${item.qty}</div>
      </div>
    `;

    itemsHtml = `
        <div id="order-items-summary-${context}-${order.id}" class="order-card-items" style="margin-top: 6px; margin-bottom: 4px; display: block;">
          ${itemsList}
        </div>
      `;
  }

  const ctx = context;
  const cardClickHtml = isReorderFlow ? '' : `onclick="viewOrderTracking('${order.id}')"`;
  const extraCardClass = isReorderFlow ? 'reorder-flow-card' : '';

  const reorderSectionId = `reorder-section-${ctx}-${order.id}`;
  let reorderHtml = `<div id="${reorderSectionId}" class="reorder-expand-section" style="display: none; margin-top: 6px; margin-bottom: 8px; cursor: default;">`;

  order.items.slice(0, 1).forEach((item, i) => {
    reorderHtml += `
      <div id="reorder-row-${ctx}-${order.id}-${i}" class="reorder-item-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 6px;" onclick="event.stopPropagation();">
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 500; color: var(--text-primary); line-height: 1.3;">${item.name}</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${item.packSize}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <div class="pc-qty-control" style="border: 1px solid var(--border); border-radius: 6px; padding: 2px; display: flex; align-items: center;">
            <button class="pc-qty-btn" type="button" onclick="updateReorderQty('${ctx}', '${order.id}', ${i}, -1)" style="width: 24px; height: 24px; padding: 0; background: var(--bg); border-radius: 4px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text-primary);">−</button>
            <span class="pc-qty-value" id="reorder-qty-${ctx}-${order.id}-${i}" style="width: 24px; text-align: center; font-size: 13px; font-weight: 600; display: inline-block;" data-item-name="${item.name.replace(/"/g, '&quot;')}">${item.qty}</span>
            <button class="pc-qty-btn" type="button" onclick="updateReorderQty('${ctx}', '${order.id}', ${i}, 1)" style="width: 24px; height: 24px; padding: 0; background: var(--bg); border-radius: 4px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text-primary);">+</button>
          </div>
        </div>
      </div>
    `;
  });

  // Removed the duplicate Add to Cart button from here, as the quick action button will transform into it.
  reorderHtml += `</div>`;

  return `
    <div class="order-card fade-in ${extraCardClass}" ${cardClickHtml} style="margin-bottom: 8px; padding: 8px 10px;">
      <div class="order-card-top" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span class="order-id" style="margin: 0;">SR-${order.id.split('-')[1].substring(0, 6)}</span>
            <span class="order-date" style="margin: 0;">${order.date}</span>
            <div style="width: 75px; display: flex; justify-content: center;">
              <span class="status-pill ${order.statusClass}">${order.statusLabel}</span>
            </div>
          </div>
          
          ${itemsHtml}
          ${reorderHtml}
          
          <!-- Reorder, Invoice and Support buttons placed side-by-side directly under the date -->
          <div class="order-card-quick-actions" style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
            ${(order.status === 'delivered' || order.status === 'transit') ? `
            <button class="order-quick-btn invoice" onclick="event.stopPropagation();downloadInvoice('${order.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
              Invoice
            </button>
            ` : ''}
            ${(order.status !== 'cancelled' && order.status !== 'processing') ? `
            <button class="order-quick-btn view" onclick="event.stopPropagation();toggleReorderSection('${ctx}', '${order.id}', this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Re-order
            </button>
            ` : ''}
            ${order.status !== 'cancelled' ? `
            <button class="order-quick-btn support" onclick="event.stopPropagation();showPage('page-help');">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Query
            </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}




// ============ ORDER TRACKING ============
function viewOrderTracking(orderId) {
  if (isReorderFlow) return; // Prevent viewing tracking page in reorder flow
  closeModal(); // Dismiss any open modal overlay
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return;

  const container = document.getElementById('order-tracking-content');
  let html = '<div class="tracking-content fade-in">';

  // Header
  html += `
    <div class="tracking-header">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div class="th-order-id">SR-${order.id.split('-')[1].substring(0, 6)}</div>
          <div class="th-date">Ordered on ${order.date}</div>
        </div>
        ${order.status !== 'cancelled' ? `
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" onclick="viewPrescription('${order.id}')" style="padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; height: auto; border: 1px solid var(--border); color: var(--primary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Prescription
          </button>
          <button class="btn btn-outline" onclick="downloadInvoice('${order.id}')" style="padding: 6px 12px; font-size: 11px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; height: auto; border: 1px solid var(--border);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
            Invoice
          </button>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  // Items
  html += `
    <div class="tracking-header" style="margin-bottom:8px; display: flex; flex-direction: column; gap: 6px;">
      <h4 style="font-size:14px;font-weight:700;margin-bottom:2px;">Order Items</h4>
  `;
  order.items.forEach(item => {
    let specsStr = [];
    if (item.flavorFree) specsStr.push('Flavor Free');
    if (item.sugarFree) specsStr.push('Sugar Free');
    if (item.alcoholFree) specsStr.push('Alcohol Free');
    if (item.rxUploaded) specsStr.push('Rx Uploaded');

    const specsBadge = specsStr.length > 0
      ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${specsStr.join(', ')}</div>`
      : '';

    html += `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;font-size:13px;border-bottom:1px solid var(--border-light);">
        <div style="flex:1; min-width: 0;">
          <span style="color:var(--text-primary);font-weight:500;">${item.name}</span>
          ${specsBadge}
        </div>
        <span style="background: var(--primary-bg); color: var(--primary); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; border: 1px solid rgba(10, 36, 99, 0.08); white-space: nowrap; margin-left:8px;">Qty: ${item.qty}</span>
      </div>
    `;
  });
  html += `</div>`;

  // Timeline
  html += '<div class="tracking-timeline"><h4 style="font-size:14px;font-weight:700;margin-bottom:12px;">Order Timeline</h4>';

  TRACKING_STEPS.forEach((step, i) => {
    let dotClass = 'pending';
    let itemClass = '';
    if (i < order.trackingStep) { dotClass = 'completed'; itemClass = 'completed'; }
    else if (i === order.trackingStep) { dotClass = 'active'; itemClass = 'active'; }

    const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
    const activeIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>';
    const pendingIcon = '<svg viewBox="0 0 24 24" fill="currentColor" opacity="0.3"><circle cx="12" cy="12" r="4"/></svg>';

    let icon = pendingIcon;
    if (dotClass === 'completed') icon = checkIcon;
    if (dotClass === 'active') icon = activeIcon;

    html += `
      <div class="timeline-item ${itemClass}">
        <div class="timeline-dot ${dotClass}">${icon}</div>
        <div class="timeline-info">
          <div class="ti-title">${step.label}</div>
          <div class="ti-desc">${step.desc}</div>
        </div>
      </div>
    `;
  });

  // Handle cancelled or hold
  if (order.status === 'cancelled') {
    html += `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:var(--danger);color:white;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <div class="timeline-info">
          <div class="ti-title" style="color:var(--danger);">Cancelled</div>
          <div class="ti-desc">This order has been cancelled</div>
        </div>
      </div>
    `;
  }

  if (order.status === 'hold') {
    html += `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:var(--hold);color:white;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </div>
        <div class="timeline-info">
          <div class="ti-title" style="color:var(--hold);">On Hold</div>
          <div class="ti-desc">Additional documentation or review required</div>
        </div>
      </div>
    `;
  }

  html += '</div></div>';
  container.innerHTML = html;
  showPage('page-order-tracking');
}

function toggleTrackingItems() {
  const extraDiv = document.getElementById('extra-items');
  const btn = document.getElementById('toggle-items-btn');
  if (!extraDiv || !btn) return;

  const isHidden = extraDiv.style.display === 'none';
  if (isHidden) {
    extraDiv.style.display = 'block';
    btn.innerHTML = `
      View less
      <svg id="toggle-items-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12" style="transition: transform 0.2s; transform: rotate(180deg);"><polyline points="6 9 12 15 18 9"/></svg>
    `;
  } else {
    extraDiv.style.display = 'none';
    btn.innerHTML = `
      View all
      <svg id="toggle-items-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12" style="transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
    `;
  }
}

// ============ RE-ORDER ============
function toggleReorderSection(ctx, orderId, btnElement) {
  const section = document.getElementById(`reorder-section-${ctx}-${orderId}`);
  const summary = document.getElementById(`order-items-summary-${ctx}-${orderId}`);
  if (section) {
    if (section.style.display === 'none') {
      section.style.display = 'block';
      if (summary) summary.style.display = 'none';
      if (btnElement) {
        btnElement.classList.add('active');
        btnElement.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg> Add to Cart
            </div>
            <div onclick="event.stopPropagation(); toggleReorderSection('${ctx}', '${orderId}', this.closest('button'))" style="display: flex; align-items: center; justify-content: center; padding: 2px; border-radius: 50%; background: rgba(255,255,255,0.25);" title="Reset Re-order">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>
        `;
        btnElement.setAttribute('onclick', `event.stopPropagation();addReorderSelectedToCart('${ctx}', '${orderId}', this)`);
      }
    } else {
      section.style.display = 'none';
      if (summary) summary.style.display = 'block';
      if (btnElement) {
        btnElement.classList.remove('active');
        btnElement.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="11" height="11"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Re-order`;
        btnElement.setAttribute('onclick', `event.stopPropagation();toggleReorderSection('${ctx}', '${orderId}', this)`);
      }
    }
  }
}

function updateReorderQty(ctx, orderId, itemIndex, delta) {
  const qtySpan = document.getElementById(`reorder-qty-${ctx}-${orderId}-${itemIndex}`);
  if (qtySpan) {
    let currentQty = parseInt(qtySpan.textContent, 10);
    currentQty += delta;
    if (currentQty < 1) currentQty = 1;
    qtySpan.textContent = currentQty;
  }
}

function removeReorderItem(ctx, orderId, itemIndex) {
  const row = document.getElementById(`reorder-row-${ctx}-${orderId}-${itemIndex}`);
  if (row) {
    row.remove();
  }
}

function addReorderSelectedToCart(ctx, orderId, btnElement) {
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return;

  let itemsAdded = 0;

  order.items.forEach((item, i) => {
    // If the row exists, the item is still in the list and should be added
    const row = document.getElementById(`reorder-row-${ctx}-${orderId}-${i}`);
    if (row) {
      const qtySpan = document.getElementById(`reorder-qty-${ctx}-${orderId}-${i}`);
      const qty = qtySpan ? parseInt(qtySpan.textContent, 10) : item.qty;

      const med = MEDICINES.find(m => m.name === item.name || m.name.includes(item.name.substring(0, 20)));
      if (med) {
        const existing = cart.find(c => c.id === med.id);
        if (existing) {
          existing.qty += qty;
        } else {
          cart.push({
            ...med,
            qty: qty,
            notes: '',
            flavorFree: false,
            sugarFree: false,
            alcoholFree: false,
            rxUploaded: false,
            rxFileName: null
          });
        }
        itemsAdded++;
      }
    }
  });

  if (itemsAdded > 0) {
    updateCartBadge();
    showToast(`${itemsAdded} item(s) added to cart`, 'success');
    if (btnElement) {
      toggleReorderSection(ctx, orderId, btnElement);
    }
  } else {
    showToast('No items to add', 'warning');
  }
}

function downloadInvoice(orderId) {
  showToast('Invoice sent to registered email ID', 'success');
}

function viewPrescription(orderId) {
  showToast('Prescription viewed', 'success');
}

// ============ NOTIFICATIONS ============
function renderNotifications() {
  const container = document.getElementById('notifications-content');
  if (!container) return;

  // Update badge count
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
  }
  const inboxBadge = document.getElementById('inbox-badge');
  if (inboxBadge) {
    inboxBadge.textContent = unreadCount;
    inboxBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }

  if (NOTIFICATIONS.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 48px 24px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color:var(--text-muted); opacity:0.4; margin-bottom:12px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <h3 style="font-size:15px;">No notifications</h3>
        <p style="font-size:13px; color:var(--text-muted);">You're all caught up!</p>
      </div>`;
    return;
  }

  let html = '<div class="notifications-list" style="padding: 10px;">';

  NOTIFICATIONS.forEach(n => {
    if (n.type === 'repeat-reminder' && n.previousOrder) {
      // Clean modern card layout for Prescription Reminders
      html += `
        <div class="notif-reminder-card ${n.unread ? 'unread' : ''} fade-in" onclick="markAsRead('${n.id}')">
          <div class="notif-reminder-header">
            <div class="notif-reminder-title-row">
              <div class="notif-reminder-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div class="notif-reminder-title-text">
                <span class="notif-reminder-title">${n.title || 'Prescription Reminder'}</span>
                ${n.unread ? '<span class="notif-reminder-badge-dot"></span>' : ''}
              </div>
            </div>
            <span class="notif-reminder-time">${n.time}</span>
          </div>
          
          <div class="notif-reminder-body">
            <p class="notif-reminder-message">${n.text}</p>
            
            <div class="notif-reminder-med-box">
              <div class="notif-reminder-med-details">
                <div class="notif-reminder-med-name">${n.previousOrder.items[0].name}</div>
                <div class="notif-reminder-med-meta">
                  <span class="notif-reminder-qty-badge">Qty: ${n.previousOrder.items[0].qty}</span>
                  <span class="notif-reminder-meta-sep">•</span>
                  <span class="notif-reminder-ordered-date">Ordered: ${n.previousOrder.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Fallback/standard notifications card
      const rxIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
      const bellIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
      html += `
        <div class="notif-item ${n.unread ? 'unread' : ''} fade-in" onclick="markAsRead('${n.id}')">
          <div class="notif-icon ${n.icon}">${n.icon === 'blue' ? bellIcon : rxIcon}</div>
          <div class="notif-body">
            <div class="nb-title">${n.title}</div>
            <div class="nb-text">${n.text}</div>
            ${n.orderId ? `<div style="margin-top:6px;"><span style="font-size:11px; background:var(--primary-bg); color:var(--primary); padding:3px 8px; border-radius:6px; font-weight:600;">Order: ${n.orderId}</span></div>` : ''}
            <div class="nb-time" style="display:flex; align-items:center; gap:6px; margin-top:6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${n.time}
            </div>
          </div>
        </div>
      `;
    }
  });

  html += '</div>';
  container.innerHTML = html;
}

function markAsRead(id) {
  const notif = NOTIFICATIONS.find(n => n.id === id);
  if (notif && notif.unread) {
    notif.unread = false;
    renderNotifications();
  }
}

function markAllNotificationsAsRead() {
  let changed = false;
  NOTIFICATIONS.forEach(n => {
    if (n.unread) {
      n.unread = false;
      changed = true;
    }
  });
  if (changed) {
    renderNotifications();
  }
}

// ============ SUPPORT ============
let supportHistoryStatus = {
  'order-support': 'open',
  'product-support': 'open'
};

function setSupportTab(tab) {
  document.querySelectorAll('.support-tabs .order-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.stab === tab);
  });
  renderSupportContent(tab);
}

function renderSupportContent(tab) {
  const container = document.getElementById('support-content');
  if (!container) return;

  if (tab === 'order-support') {
    container.innerHTML = `
      <div class="support-content" style="text-align: left;">
        <div class="support-form" style="background:white; padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm);">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 10px; border-bottom: 2px solid var(--border-light); padding-bottom: 8px;">Order Support</h3>
          
          <div class="form-group compact">
            <label>Order Number <span style="color:#DC2626; font-weight:700;">*</span></label>
            <div class="input-wrapper compact" id="support-order-id-wrapper">
              <input type="text" id="support-order-id" placeholder="e.g. SRX-20260522-0042" value="${latestOrderId || ''}" oninput="populateOrderSupportDetails(this.value); clearSupportFieldError('support-order-id')" />
            </div>
            <span class="field-error" id="support-order-id-error"></span>
          </div>
          
          <div class="form-group compact">
            <label>Product Name</label>
            <div class="input-wrapper compact" style="background: var(--bg); border-color: var(--border-light);">
              <input type="text" id="support-order-product" disabled style="color: var(--text-muted); background: transparent;" placeholder="Auto-populated" />
            </div>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <div class="form-group compact" style="flex: 1; margin-bottom: 0;">
              <label>Quantity</label>
              <div class="input-wrapper compact" style="background: var(--bg); border-color: var(--border-light);">
                <input type="text" id="support-order-qty" disabled style="color: var(--text-muted); background: transparent;" placeholder="Auto-populated" />
              </div>
            </div>
            <div class="form-group compact" style="flex: 1; margin-bottom: 0;">
              <label>Pack Size</label>
              <div class="input-wrapper compact" style="background: var(--bg); border-color: var(--border-light);">
                <input type="text" id="support-order-packsize" disabled style="color: var(--text-muted); background: transparent;" placeholder="Auto-populated" />
              </div>
            </div>
          </div>
          <div style="height: 12px;"></div>
          
          <div class="form-group compact">
            <label>Issue Category</label>
            <div class="input-wrapper compact">
              <select id="support-order-issue-type" style="flex: 1; border: none; background: transparent; padding: 8px 0; font-size: 12px; color: var(--text-primary); outline: none; cursor: pointer;">
                <option value="">Select Issue Category</option>
                <option value="Missing Item">Missing Item</option>
                <option value="Wrong Product">Wrong Product</option>
                <option value="Delivery Delay">Delivery Delay</option>
              </select>
            </div>
          </div>
          
          <div class="form-group compact">
            <label>Response Type <span style="color:#DC2626; font-weight:700;">*</span></label>
            <div class="input-wrapper compact" id="support-response-type-wrapper" style="padding: 8px 10px; gap: 24px;">
              <label class="radio-label" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); cursor: pointer; font-weight: 500; margin: 0;">
                <input type="radio" name="support-order-response-type" value="Call Back" style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; margin: 0;" onclick="clearSupportFieldError('support-response-type')" />
                <span>Call Back</span>
              </label>
              <label class="radio-label" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); cursor: pointer; font-weight: 500; margin: 0;">
                <input type="radio" name="support-order-response-type" value="Email" checked style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; margin: 0;" onclick="clearSupportFieldError('support-response-type')" />
                <span>Email</span>
              </label>
            </div>
            <span class="field-error" id="support-response-type-error"></span>
          </div>
          
          <div class="form-group compact">
            <label>Additional Notes</label>
            <div class="input-wrapper textarea-wrapper compact">
              <textarea id="support-order-notes" placeholder="Enter additional details regarding your issue..." rows="1"></textarea>
            </div>
          </div>
          
          <button class="btn btn-primary btn-full" style="margin-top:8px;" onclick="submitOrderSupportRequest()">Submit Support Request</button>
        </div>

        <!-- History Section for Order Support -->
        <div class="history-section" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--primary); margin:0;">Order Tickets History</h3>
            <div style="display:flex; background:var(--border-light); padding:2px; border-radius:8px;">
              <button onclick="toggleSupportHistoryStatus('order-support', 'open')" id="order-support-history-open-btn" class="support-sub-tab active" style="font-size:12px; font-weight:600; padding:4px 12px; border-radius:6px; cursor: pointer; transition:var(--transition); background:white; box-shadow:var(--shadow-sm); color:var(--primary);">Open</button>
              <button onclick="toggleSupportHistoryStatus('order-support', 'closed')" id="order-support-history-closed-btn" class="support-sub-tab" style="font-size:12px; font-weight:600; padding:4px 12px; border-radius:6px; cursor: pointer; transition:var(--transition); background:none; box-shadow:none; color:var(--text-secondary);">Closed</button>
            </div>
          </div>
          <div id="order-support-tickets-list">
            <!-- Tickets list goes here -->
          </div>
        </div>
      </div>
    `;
    renderSupportTicketsList('order-support');

    if (latestOrderId) {
      setTimeout(() => populateOrderSupportDetails(latestOrderId), 50);
    }
  } else if (tab === 'product-support') {
    container.innerHTML = `
      <div class="support-content" style="text-align: left;">
        <div class="support-form" style="background:white; padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-sm);">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 10px; border-bottom: 2px solid var(--border-light); padding-bottom: 8px;">Product Enquiry</h3>
          
          <div class="form-group compact">
            <label>Product Description <span style="color:#DC2626; font-weight:700;">*</span></label>
            <div class="input-wrapper textarea-wrapper compact" id="support-prod-desc-wrapper">
 
              <textarea id="support-prod-desc" placeholder="Describe the product you are looking for.." rows="1" oninput="clearSupportFieldError('support-prod-desc')"></textarea>
            </div>
            <span class="field-error" id="support-prod-desc-error"></span>
          </div>
          
          <div class="form-group compact">
            <label>Pack Size</label>
            <div class="input-wrapper compact">
            
              <input type="text" id="support-prod-packsize" placeholder="e.g. 28 tablets" style="flex: 1; border: none; background: transparent; padding: 8px 0; font-size: 12px; color: var(--text-primary); outline: none;" />
            </div>
          </div>
          
          <div class="form-group compact">
            <label>Prescription Type <span style="color:#DC2626; font-weight:700;">*</span></label>
            <div class="input-wrapper compact" id="support-prod-rx-type-wrapper" style="padding: 8px 10px; gap: 24px;">
              <label class="radio-label" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); cursor: pointer; font-weight: 500; margin: 0;">
                <input type="radio" name="support-prod-rx-type" value="Private" style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; margin: 0;" onclick="clearSupportFieldError('support-prod-rx-type')" />
                <span>Private</span>
              </label>
              <label class="radio-label" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); cursor: pointer; font-weight: 500; margin: 0;">
                <input type="radio" name="support-prod-rx-type" value="NHS" checked style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; margin: 0;" onclick="clearSupportFieldError('support-prod-rx-type')" />
                <span>NHS</span>
              </label>
            </div>
            <span class="field-error" id="support-prod-rx-type-error"></span>
          </div>
          
          <div class="form-group compact">
            <label>Response type <span style="color:#DC2626; font-weight:700;">*</span></label>
            <div class="input-wrapper compact" id="support-prod-priority-wrapper" style="padding: 8px 10px; gap: 24px;">
              <label class="radio-label" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); cursor: pointer; font-weight: 500; margin: 0;">
                <input type="radio" name="support-prod-priority" value="Call Back" style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; margin: 0;" onclick="clearSupportFieldError('support-prod-priority')" />
                <span>Call Back</span>
              </label>
              <label class="radio-label" style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); cursor: pointer; font-weight: 500; margin: 0;">
                <input type="radio" name="support-prod-priority" value="Email" checked style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; margin: 0;" onclick="clearSupportFieldError('support-prod-priority')" />
                <span>Email</span>
              </label>
            </div>
            <span class="field-error" id="support-prod-priority-error"></span>
          </div>
            
          <div class="form-group compact">
            <label>Notes (Optional)</label>
            <div class="input-wrapper textarea-wrapper compact">
              
              <textarea id="support-prod-notes" placeholder="Enter any information" rows="1"></textarea>
            </div>
          </div>
          
          <button class="btn btn-primary btn-full" style="margin-top:8px;" onclick="submitProductSupportRequest()">Submit Product Request</button>
        </div>

        <!-- History Section for Product Support -->
        <div class="history-section" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--primary); margin:0;">Product Enquiry History</h3>
            <div style="display:flex; background:var(--border-light); padding:2px; border-radius:8px;">
              <button onclick="toggleSupportHistoryStatus('product-support', 'open')" id="product-support-history-open-btn" class="support-sub-tab active" style="font-size:12px; font-weight:600; padding:4px 12px; border-radius:6px; cursor: pointer; transition:var(--transition); background:white; box-shadow:var(--shadow-sm); color:var(--primary);">Open</button>
              <button onclick="toggleSupportHistoryStatus('product-support', 'closed')" id="product-support-history-closed-btn" class="support-sub-tab" style="font-size:12px; font-weight:600; padding:4px 12px; border-radius:6px; cursor: pointer; transition:var(--transition); background:none; box-shadow:none; color:var(--text-secondary);">Closed</button>
            </div>
          </div>
          <div id="product-support-tickets-list">
            <!-- Tickets list goes here -->
          </div>
        </div>
      </div>
    `;
    renderSupportTicketsList('product-support');
  } else if (tab === 'faq') {
    container.innerHTML = `
      <div class="support-content" style="text-align: left;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--primary); margin-bottom: 14px; border-bottom: 2px solid var(--border-light); padding-bottom: 8px;">Frequently Asked Questions</h3>
        ${FAQS.map((faq, i) => `
          <div class="faq-item" onclick="toggleFAQ(this)" style="background:white; border-radius:var(--radius-md); border:1px solid var(--border); margin-bottom:10px; padding:12px 14px; cursor:pointer;">
            <div class="faq-question" style="display:flex; justify-content:space-between; align-items:center; font-weight:600; font-size:14px; color:var(--text-primary);">
              <div style="display:flex; align-items:center; gap:4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--primary);flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>${faq.q}</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="transition:transform 0.3s;flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="faq-answer" style="display:none; font-size:13px; color:var(--text-secondary); margin-top:10px; line-height:1.5; border-top:1px dashed var(--border-light); padding-top:8px;">${faq.a}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function populateOrderSupportDetails(orderId) {
  const productInput = document.getElementById('support-order-product');
  const qtyInput = document.getElementById('support-order-qty');
  const packSizeInput = document.getElementById('support-order-packsize');

  if (!productInput || !qtyInput || !packSizeInput) return;

  const order = ORDERS.find(o => o.id === (orderId || '').trim());
  if (order && order.items && order.items.length > 0) {
    const item = order.items[0];
    productInput.value = item.name || '';
    qtyInput.value = item.qty || '';
    packSizeInput.value = item.packSize || '';
  } else {
    productInput.value = '';
    qtyInput.value = '';
    packSizeInput.value = '';
  }
}

function toggleSupportHistoryStatus(tab, status) {
  supportHistoryStatus[tab] = status;

  // Toggle classes manually (active style: white background with shadow, color primary)
  const openBtn = document.getElementById(`${tab}-history-open-btn`);
  const closedBtn = document.getElementById(`${tab}-history-closed-btn`);

  if (openBtn && closedBtn) {
    if (status === 'open') {
      openBtn.style.background = 'white';
      openBtn.style.boxShadow = 'var(--shadow-sm)';
      openBtn.style.color = 'var(--primary)';
      closedBtn.style.background = 'none';
      closedBtn.style.boxShadow = 'none';
      closedBtn.style.color = 'var(--text-secondary)';
    } else {
      closedBtn.style.background = 'white';
      closedBtn.style.boxShadow = 'var(--shadow-sm)';
      closedBtn.style.color = 'var(--primary)';
      openBtn.style.background = 'none';
      openBtn.style.boxShadow = 'none';
      openBtn.style.color = 'var(--text-secondary)';
    }
  }

  renderSupportTicketsList(tab);
}

function renderSupportTicketsList(tab) {
  const listContainer = document.getElementById(`${tab}-tickets-list`);
  if (!listContainer) return;

  const status = supportHistoryStatus[tab] || 'open';
  const filtered = SUPPORT_TICKETS.filter(t => t.type === tab && t.status === status);

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="padding: 24px; text-align: center; background: white; border-radius: var(--radius-md); border:1px solid var(--border);">
        <h4 style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;">No ${status} tickets</h4>
        <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Any requests submitted will be visible here.</p>
      </div>`;
    return;
  }

  listContainer.innerHTML = filtered.map(t => createTicketCard(t)).join('');
}

function clearSupportFieldError(fieldId) {
  const errorEl = document.getElementById(fieldId + '-error');
  const wrapperEl = document.getElementById(fieldId + '-wrapper');
  if (errorEl) errorEl.textContent = '';
  if (wrapperEl) wrapperEl.classList.remove('error');
}

function submitOrderSupportRequest() {
  const orderId = document.getElementById('support-order-id').value;
  const issueType = document.getElementById('support-order-issue-type').value;
  const responseTypeEl = document.querySelector('input[name="support-order-response-type"]:checked');
  const responseType = responseTypeEl ? responseTypeEl.value : '';
  const notes = document.getElementById('support-order-notes').value;
  const pharmaName = selectedPharmacy ? selectedPharmacy.name : '';

  // --- Mandatory field validation ---
  let valid = true;

  // Order Number
  const orderIdError = document.getElementById('support-order-id-error');
  const orderIdWrapper = document.getElementById('support-order-id-wrapper');
  if (orderIdError) orderIdError.textContent = '';
  if (orderIdWrapper) orderIdWrapper.classList.remove('error');
  if (!orderId.trim()) {
    if (orderIdError) orderIdError.textContent = 'Order Number is required';
    if (orderIdWrapper) orderIdWrapper.classList.add('error');
    valid = false;
  }

  // Response Type
  const responseError = document.getElementById('support-response-type-error');
  const responseWrapper = document.getElementById('support-response-type-wrapper');
  if (responseError) responseError.textContent = '';
  if (responseWrapper) responseWrapper.classList.remove('error');
  if (!responseTypeEl) {
    if (responseError) responseError.textContent = 'Please select a response type';
    if (responseWrapper) responseWrapper.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  showLoading('Submitting request...');
  setTimeout(() => {
    hideLoading();
    const ticketId = `SR-ORD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    SUPPORT_TICKETS.unshift({
      id: ticketId,
      type: 'order-support',
      orderId: orderId,
      pharmaName: pharmaName,
      orderDate: formatDateShort(new Date()),
      orderCategory: 'open',
      issueType: issueType || 'General Inquiry',
      description: 'Order inquiry',
      priority: responseType,
      notes: notes,
      status: 'open',
      statusLabel: 'Open',
      statusClass: 'status-review',
      date: formatDate(new Date())
    });

    showToast(`Request ${ticketId} submitted successfully`, 'success');

    // Clear fields
    document.getElementById('support-order-id').value = '';
    document.getElementById('support-order-issue-type').value = '';
    document.getElementById('support-order-notes').value = '';
    const emailRadio = document.querySelector('input[name="support-order-response-type"][value="Email"]');
    if (emailRadio) emailRadio.checked = true;

    renderSupportTicketsList('order-support');
  }, 1200);
}

function submitProductSupportRequest() {
  const description = document.getElementById('support-prod-desc').value;
  const packSize = document.getElementById('support-prod-packsize').value;
  const rxTypeEl = document.querySelector('input[name="support-prod-rx-type"]:checked');
  const rxType = rxTypeEl ? rxTypeEl.value : '';
  const priorityEl = document.querySelector('input[name="support-prod-priority"]:checked');
  const priority = priorityEl ? priorityEl.value : '';
  const notes = document.getElementById('support-prod-notes').value;

  // --- Mandatory field validation ---
  let valid = true;

  // Product Description
  const descError = document.getElementById('support-prod-desc-error');
  const descWrapper = document.getElementById('support-prod-desc-wrapper');
  if (descError) descError.textContent = '';
  if (descWrapper) descWrapper.classList.remove('error');
  if (!description.trim()) {
    if (descError) descError.textContent = 'Product Description is required';
    if (descWrapper) descWrapper.classList.add('error');
    valid = false;
  }

  // Prescription Type
  const rxError = document.getElementById('support-prod-rx-type-error');
  const rxWrapper = document.getElementById('support-prod-rx-type-wrapper');
  if (rxError) rxError.textContent = '';
  if (rxWrapper) rxWrapper.classList.remove('error');
  if (!rxTypeEl) {
    if (rxError) rxError.textContent = 'Please select a prescription type';
    if (rxWrapper) rxWrapper.classList.add('error');
    valid = false;
  }

  // Response Type
  const priorityError = document.getElementById('support-prod-priority-error');
  const priorityWrapper = document.getElementById('support-prod-priority-wrapper');
  if (priorityError) priorityError.textContent = '';
  if (priorityWrapper) priorityWrapper.classList.remove('error');
  if (!priorityEl) {
    if (priorityError) priorityError.textContent = 'Please select a response type';
    if (priorityWrapper) priorityWrapper.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  showLoading('Submitting request...');
  setTimeout(() => {
    hideLoading();
    const ticketId = `SR-PRD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    SUPPORT_TICKETS.unshift({
      id: ticketId,
      type: 'product-support',
      productName: 'General Product Inquiry',
      productCategory: 'Non-Tariff',
      issueType: 'General Inquiry',
      description: description,
      packSize: packSize,
      rxType: rxType,
      contactNo: '',
      priority: priority || 'Medium',
      notes: notes,
      status: 'open',
      statusLabel: 'Open',
      statusClass: 'status-review',
      date: formatDate(new Date())
    });

    showToast(`Request ${ticketId} submitted successfully`, 'success');

    // Clear fields
    document.getElementById('support-prod-desc').value = '';
    document.getElementById('support-prod-packsize').value = '';
    const nhsRadio = document.querySelector('input[name="support-prod-rx-type"][value="NHS"]');
    if (nhsRadio) nhsRadio.checked = true;
    const emailRadio = document.querySelector('input[name="support-prod-priority"][value="Email"]');
    if (emailRadio) emailRadio.checked = true;
    document.getElementById('support-prod-notes').value = '';

    renderSupportTicketsList('product-support');
  }, 1200);
}

function createTicketCard(ticket) {
  if (ticket.type === 'order-support') {
    return `
      <div class="support-ticket fade-in" style="background: white; border-radius: var(--radius-md); padding: 10px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); margin-bottom: 8px; text-align: left;">
        <div class="ticket-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <div class="ticket-id" style="font-size:14px; font-weight:700; color:var(--primary);">${ticket.id}</div>
            <div class="ticket-category" style="font-size:11.5px; color:var(--text-secondary); font-weight:600; margin-top:2px;">Order No: ${ticket.orderId}</div>
          </div>
          <span class="status-pill ${ticket.statusClass}" style="font-size:11px; padding:3px 8px; border-radius:100px;">${ticket.statusLabel}</span>
        </div>
        
        <div class="ticket-body" style="margin-bottom: 4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
            <div style="display:flex; flex-wrap:wrap; gap:4px;">
              <span style="font-size:11px; background:#EEF2F6; color:var(--primary); padding:4px 8px; border-radius:6px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ${ticket.issueType}
              </span>
              <span style="font-size:11px; background:#F5F3FF; color:#7C3AED; padding:4px 8px; border-radius:6px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                ${ticket.pharmaName}
              </span>
            </div>
            <div class="ticket-date" style="font-size:10px; color:var(--text-muted); text-align:right;">Submitted: ${ticket.date}</div>
          </div>
          ${ticket.notes ? `
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px; font-style: italic;">
              Notes: ${ticket.notes}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    return `
      <div class="support-ticket fade-in" style="background: white; border-radius: var(--radius-md); padding: 10px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); margin-bottom: 8px; text-align: left;">
        <div class="ticket-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <div class="ticket-id" style="font-size:14px; font-weight:700; color:var(--primary);">${ticket.id}</div>
          </div>
          <span class="status-pill ${ticket.statusClass}" style="font-size:11px; padding:3px 8px; border-radius:100px;">${ticket.statusLabel}</span>
        </div>
        
        <div class="ticket-body" style="margin-bottom: 4px;">
          <p style="margin:0 0 6px; font-size:13px; color:var(--text-primary); font-weight:600; line-height:1.4;">
            ${ticket.description}
          </p>
          
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
            <div style="display:flex; flex-wrap:wrap; gap:4px;">
              <span style="font-size:11px; background:#EEF2F6; color:var(--primary); padding:4px 8px; border-radius:6px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Response: ${ticket.priority}
              </span>
              ${ticket.packSize ? `
                <span style="font-size:11px; background:#ECFDF5; color:#059669; padding:4px 8px; border-radius:6px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  Pack Size: ${ticket.packSize}
                </span>
              ` : ''}
              ${ticket.rxType ? `
                <span style="font-size:11px; background:#EFF6FF; color:#1D4ED8; padding:4px 8px; border-radius:6px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Rx Type: ${ticket.rxType}
                </span>
              ` : ''}
            </div>
            <div class="ticket-date" style="font-size:10px; color:var(--text-muted); text-align:right;">Submitted: ${ticket.date}</div>
          </div>
          
          ${ticket.notes ? `
            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 4px; font-style: italic;">
              Notes: ${ticket.notes}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

function toggleFAQ(item) {
  item.classList.toggle('open');
  const ans = item.querySelector('.faq-answer');
  const icon = item.querySelector('.faq-question svg');
  if (ans && icon) {
    const open = item.classList.contains('open');
    ans.style.display = open ? 'block' : 'none';
    icon.style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
  }
}

// ============ ACCOUNT SUBPAGES ============
function showAccountSubpage(page) {
  const title = document.getElementById('subpage-title');
  const content = document.getElementById('subpage-content');

  if (page === 'profile') {
    title.textContent = 'Edit Profile';
    content.innerHTML = `
      <form class="profile-form" onsubmit="event.preventDefault();saveProfile();">
        <div class="form-group">
          <label>Full Name</label>
          <div class="input-wrapper">
            <input type="text" value="${selectedPharmacy.name}" />
          </div>
        </div>
        <div class="form-group">
          <label>Mobile Number</label>
          <div class="input-wrapper">
            <span class="input-prefix">+44</span>
            <input type="tel" value="7700 900147" />
          </div>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrapper">
            <input type="email" value="admin@greencross.co.uk" />
          </div>
        </div>
        <div class="form-group">
          <label>Delivery Address</label>
          <div class="input-wrapper textarea-wrapper">
            <textarea rows="3">${selectedPharmacy.address}</textarea>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Save Changes</button>
      </form>
    `;
  } else if (page === 'address') {
    title.textContent = 'Delivery Address';
    content.innerHTML = `
      <div style="padding:4px 0;">
        <div class="cart-section" style="margin-top:0;">
          <h4>Primary Address</h4>
          <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${selectedPharmacy.address}</p>
          <button class="btn btn-outline btn-sm" style="margin-top:12px;">Edit Address</button>
        </div>
      </div>
    `;

  } else if (page === 'change-password') {
    title.textContent = 'Change Password';
    content.innerHTML = `
      <form class="profile-form" onsubmit="event.preventDefault();changePassword();">
        <div class="form-group">
          <label>Current Password</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Enter current password" />
          </div>
        </div>
        <div class="form-group">
          <label>New Password</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Enter new password" />
          </div>
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <div class="input-wrapper">
            <input type="password" placeholder="Confirm new password" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Update Password</button>
      </form>
    `;
  }

  navigateTo('screen-account-subpage');
}

function saveProfile() {
  showLoading('Saving changes...');
  setTimeout(() => {
    hideLoading();
    showToast('Profile updated successfully', 'success');
  }, 1200);
}

function changePassword() {
  showLoading('Updating password...');
  setTimeout(() => {
    hideLoading();
    showToast('Password changed successfully', 'success');
  }, 1200);
}

function logout() {
  showLoading('Signing out...');
  setTimeout(() => {
    hideLoading();
    cart = [];
    rxUploaded = false;
    navigateTo('screen-login');
    showToast('Signed out successfully', 'info');
  }, 800);
}

// ============ UI HELPERS ============
function showLoading(text) {
  const el = document.getElementById('loading-overlay');
  const txt = document.getElementById('loading-text');
  if (txt) txt.textContent = text || 'Processing...';
  el.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  toast.className = `toast ${type}`;
  msgEl.textContent = message;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  iconEl.textContent = icons[type] || 'ℹ';

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.className = 'toast hidden', 400);
  }, 3000);
}

function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-content').innerHTML = content;
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function showAllOrdersModal() {
  const ordersHtml = ORDERS.map(order => createOrderCard(order, 'modal-all', false)).join('');
  const content = `
    <div class="modal-header-section" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-light); padding-bottom:12px;">
      <h3 style="font-size:16px; font-weight:700; color:var(--primary); margin:0;">All Orders</h3>
      <button onclick="closeModal()" style="font-size:13px; font-weight:700; color:var(--text-muted); cursor:pointer; background:none; border:none; outline:none; display:flex; align-items:center; gap:4px; padding: 4px 8px; border-radius:6px; transition:var(--transition); hover:background:var(--border-light);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Close
      </button>
    </div>
    <div class="orders-modal-list scrollable" style="max-height: 480px; overflow-y: auto; padding-right: 4px; display:flex; flex-direction:column; gap:12px;">
      ${ordersHtml}
    </div>
  `;
  openModal(content);
}

// ============ UTILITY ============
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateShort(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

// ============ GLOBAL EVENT LISTENERS ============
document.addEventListener('click', (e) => {
  const pDropdown = document.querySelector('.pharmacist-dropdown');
  if (pDropdown) pDropdown.classList.remove('open');

  const pSmartDropdown = document.getElementById('pharmacy-smart-dropdown');
  if (pSmartDropdown) pSmartDropdown.classList.remove('open');

  const specsDropdown = document.getElementById('cart-specs-dropdown');
  const specsContainer = document.getElementById('specs-dropdown-container');
  if (specsDropdown && specsContainer && !specsContainer.contains(e.target)) {
    specsDropdown.style.display = 'none';
    specsDropdown.classList.add('hidden');
  }
});

function toggleCartSpecsDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('cart-specs-dropdown');
  if (dropdown) {
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      dropdown.classList.remove('hidden');
      dropdown.style.display = 'flex';
    } else {
      dropdown.classList.add('hidden');
      dropdown.style.display = 'none';
    }
  }
}

function toggleAllCartSpecs(checkbox) {
  const cbs = document.querySelectorAll('.cart-spec-cb');
  cbs.forEach(cb => cb.checked = checkbox.checked);
  updateCartSpecsText();
}

function updateCartSpecsText() {
  const cbs = document.querySelectorAll('.cart-spec-cb');
  const allCb = document.getElementById('spec-select-all');
  const textEl = document.getElementById('cart-specs-text');

  const checked = Array.from(cbs).filter(cb => cb.checked);

  if (allCb) {
    allCb.checked = (checked.length === cbs.length && cbs.length > 0);
  }

  if (textEl) {
    if (checked.length === 0) {
      textEl.textContent = 'Select Specifications';
      textEl.style.color = 'var(--text-muted)';
    } else {
      textEl.textContent = checked.map(cb => cb.value).join(', ');
      textEl.style.color = 'var(--text-primary)';
    }
  }
}
