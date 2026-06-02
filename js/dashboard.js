/* ============================================================
   DASHBOARD SHARED JS — Stackly LogiFlow
   Used by: owner-dashboard.html & customer-dashboard.html
   ============================================================ */

/* ── Auth Guard ── */
function checkAuth() {
  const role  = sessionStorage.getItem('lf_role');
  const email = sessionStorage.getItem('lf_email');
  if (!role || !email) {
    window.location.href = 'login.html';
    return null;
  }
  return { role, email, name: sessionStorage.getItem('lf_name') || email };
}

/* ── Populate user info from session ── */
function populateUserInfo(user) {
  const initials = (user.name || user.email).split(' ').map(p => p[0]).join('').toUpperCase().slice(0,2);

  // Sidebar elements
  const elName  = document.getElementById('sidebarUserName');
  const elEmail = document.getElementById('sidebarUserEmail');
  const elAvatar= document.getElementById('sidebarAvatar');
  const elRole  = document.getElementById('sidebarRole');
  if (elName)   elName.textContent  = user.name || user.email;
  if (elEmail)  elEmail.textContent = user.email;
  if (elAvatar) elAvatar.textContent = initials;
  if (elRole)   elRole.textContent  = user.role === 'owner' ? '🏢 Owner' : '📦 Customer';

  // Topbar elements
  const tbName   = document.getElementById('topbarName');
  const tbAvatar = document.getElementById('topbarAvatar');
  if (tbName)   tbName.textContent   = (user.name || user.email).split(' ')[0];
  if (tbAvatar) tbAvatar.textContent = initials;

  // Any welcome text
  document.querySelectorAll('.user-email-display').forEach(el => { el.textContent = user.email; });
  document.querySelectorAll('.user-name-display').forEach(el  => { el.textContent = user.name || user.email; });
}

/* ── Sidebar Navigation ── */
function initSidebarNav() {
  const items   = document.querySelectorAll('.nav-item[data-page]');
  const contents= document.querySelectorAll('.dash-content');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      // Update active nav
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      // Show matching content
      contents.forEach(c => {
        c.classList.toggle('active', c.dataset.page === page);
      });
      // Update topbar title
      const titleEl = document.getElementById('topbarPageTitle');
      if (titleEl) titleEl.textContent = item.querySelector('.nav-label')?.textContent || '';
      // Close mobile sidebar
      closeSidebar();
    });
  });
}

/* ── Mobile Sidebar ── */
function initMobileSidebar() {
  const hamburger = document.getElementById('topbarHamburger');
  const sidebar   = document.getElementById('dashSidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar && sidebar.classList.add('open');
      overlay && overlay.classList.add('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });
}

function closeSidebar() {
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar && sidebar.classList.remove('open');
  overlay && overlay.classList.remove('open');
}

/* ── Logout ── */
function initLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  }
}

/* ── Toast Notifications ── */
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ── Modal Helpers ── */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
function initModals() {
  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });
  // Close buttons
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) modal.classList.remove('open');
    });
  });
}

/* ── Animate stat counters ── */
function animateDashCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const decimals = String(target).includes('.') ? 1 : 0;
      const duration = 1600;
      const start    = performance.now();

      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const val = easeOut(p) * target;
        el.textContent = prefix + val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => observer.observe(c));
}

/* ── Animate chart bars on scroll ── */
function initChartBars() {
  const bars = document.querySelectorAll('.chart-bar[data-h]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.height = entry.target.dataset.h + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  // Set initial height to 0
  bars.forEach(b => { b.style.height = '0%'; observer.observe(b); });
}

/* ── Search/Filter tables ── */
function initTableSearch(inputId, tableId, colIndexes) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      const text = Array.from(colIndexes ? colIndexes.map(i => cols[i]) : cols)
        .map(c => c ? c.textContent.toLowerCase() : '').join(' ');
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

/* ── Filter dropdowns ── */
function initFilterSelect(selectId, tableId, colIndex) {
  const sel   = document.getElementById(selectId);
  const table = document.getElementById(tableId);
  if (!sel || !table) return;

  sel.addEventListener('change', () => {
    const val = sel.value.toLowerCase();
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cell = row.querySelectorAll('td')[colIndex];
      if (!val || !cell) { row.style.display = ''; return; }
      row.style.display = cell.textContent.toLowerCase().includes(val) ? '' : 'none';
    });
  });
}

/* ── Ripple on buttons ── */
function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-primary');
    if (!btn) return;
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;border-radius:50%;
      background:rgba(255,255,255,0.25);pointer-events:none;
      top:${e.clientY - rect.top - size/2}px;
      left:${e.clientX - rect.left - size/2}px;
      transform:scale(0);animation:ripAnim 0.6s linear;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  if (!document.getElementById('rip-css')) {
    const s = document.createElement('style');
    s.id = 'rip-css';
    s.textContent = '@keyframes ripAnim{to{transform:scale(1);opacity:0}}';
    document.head.appendChild(s);
  }
}

/* ── Init all shared features ── */
function initDashboard() {
  const user = checkAuth();
  if (!user) return;
  populateUserInfo(user);
  initSidebarNav();
  initMobileSidebar();
  initLogout();
  initModals();
  animateDashCounters();
  initChartBars();
  initRipple();
  return user;
}

/* Expose globally */
window.showToast  = showToast;
window.openModal  = openModal;
window.closeModal = closeModal;
window.initTableSearch = initTableSearch;
window.initFilterSelect = initFilterSelect;