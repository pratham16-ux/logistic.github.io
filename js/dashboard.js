/* ============================================================
   DASHBOARD SHARED JS — Stackly LogiFlow
   Handles: auth, sidebar, nav, modals, toasts, count animations,
            chart bars, table search/filter, global logout
   ============================================================ */

/* ══════════════════════════════════════
   SIDEBAR — open / close
══════════════════════════════════════ */
function openSidebar() {
  document.getElementById('dashSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('dashSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   NAV — switch pages
   (also exported as navTo for owner dash
    and navPage for customer dash — both
    call this same underlying function)
══════════════════════════════════════ */
function _navToPage(page) {
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.classList.toggle('active', item.dataset.page === page);
  });
  document.querySelectorAll('.dash-content[data-page]').forEach(function(section) {
    section.classList.toggle('active', section.dataset.page === page);
  });

  // Update topbar title from nav label
  var label = document.querySelector('.nav-item[data-page="' + page + '"] .nav-label');
  var titleEl = document.getElementById('topbarPageTitle');
  if (titleEl && label) {
    titleEl.innerHTML = label.textContent + ' <span>Dashboard</span>';
  }

  closeSidebar();
  window.scrollTo(0, 0);
}

// Expose under both names used by the two dashboards
function navTo(page)   { _navToPage(page); }
function navPage(page) { _navToPage(page); }

/* ══════════════════════════════════════
   MODALS
══════════════════════════════════════ */
function openModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast ' + type;

  var icon = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' }[type] || 'ℹ️';
  toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';

  container.appendChild(toast);

  setTimeout(function() {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

/* ══════════════════════════════════════
   COUNT ANIMATION
══════════════════════════════════════ */
function animateCounts() {
  document.querySelectorAll('[data-count]').forEach(function(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var isFloat = target % 1 !== 0;
    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = target * eased;
      el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ══════════════════════════════════════
   CHART BAR ANIMATIONS
══════════════════════════════════════ */
function animateChartBars() {
  document.querySelectorAll('.chart-bar[data-h]').forEach(function(bar, i) {
    setTimeout(function() {
      bar.style.height = bar.getAttribute('data-h') + '%';
    }, i * 60);
  });
}

/* ══════════════════════════════════════
   TABLE SEARCH
   searchId  — input element id
   tableId   — table element id
   colIndexes — array of column indexes to match against
══════════════════════════════════════ */
function initTableSearch(searchId, tableId, colIndexes) {
  var input = document.getElementById(searchId);
  var table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('input', function() {
    var query = this.value.toLowerCase().trim();
    var rows = table.querySelectorAll('tbody tr');

    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      var match = colIndexes.some(function(idx) {
        return cells[idx] && cells[idx].textContent.toLowerCase().indexOf(query) > -1;
      });
      row.style.display = (query === '' || match) ? '' : 'none';
    });
  });
}

/* ══════════════════════════════════════
   TABLE FILTER SELECT
   selectId  — select element id
   tableId   — table element id
   colIndex  — column index for status
══════════════════════════════════════ */
function initFilterSelect(selectId, tableId, colIndex) {
  var sel = document.getElementById(selectId);
  var table = document.getElementById(tableId);
  if (!sel || !table) return;

  sel.addEventListener('change', function() {
    var val = this.value.toLowerCase();
    var rows = table.querySelectorAll('tbody tr');

    rows.forEach(function(row) {
      var cell = row.querySelectorAll('td')[colIndex];
      if (!val || !cell) {
        row.style.display = '';
      } else {
        var cellText = cell.textContent.toLowerCase();
        row.style.display = cellText.indexOf(val) > -1 ? '' : 'none';
      }
    });
  });
}

/* ══════════════════════════════════════
   AUTH CHECK + POPULATE USER INFO
══════════════════════════════════════ */
function checkAuth() {
  var role = sessionStorage.getItem('lf_role');
  if (!role) {
    // Uncomment to enforce login redirect:
    // window.location.href = 'login.html';
    return false;
  }
  return true;
}

function populateUserInfo() {
  var name  = sessionStorage.getItem('lf_name')  || 'User';
  var email = sessionStorage.getItem('lf_email') || '';

  var initials = name.split(' ')
    .map(function(w) { return w[0] || ''; })
    .join('')
    .slice(0, 2)
    .toUpperCase();

  var firstName = name.split(' ')[0];

  // Avatar elements
  ['sidebarAvatar', 'topbarAvatar', 'settingsAvatar'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = initials;
  });

  // Name elements
  document.querySelectorAll('.user-name-display').forEach(function(el) {
    el.textContent = name;
  });

  // First name elements
  var topbarName = document.getElementById('topbarName');
  if (topbarName) topbarName.textContent = firstName;

  // Sidebar name
  var sidebarUserName = document.getElementById('sidebarUserName');
  if (sidebarUserName) sidebarUserName.textContent = name;

  // Email elements
  document.querySelectorAll('.user-email-display').forEach(function(el) {
    el.textContent = email;
  });

  var sidebarEmail = document.getElementById('sidebarUserEmail');
  if (sidebarEmail) sidebarEmail.textContent = email;
}

/* ══════════════════════════════════════
   SIDEBAR NAV CLICK BINDING
══════════════════════════════════════ */
function initSidebarNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.addEventListener('click', function() {
      _navToPage(this.dataset.page);
    });
  });
}

/* ══════════════════════════════════════
   MOBILE SIDEBAR TOGGLE
══════════════════════════════════════ */
function initMobileSidebar() {
  var hamburger = document.getElementById('topbarHamburger');
  var overlay   = document.getElementById('sidebarOverlay');

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      var sidebar = document.getElementById('dashSidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }
}

/* ══════════════════════════════════════
   LOGOUT
══════════════════════════════════════ */
function initLogout() {
  var btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', function() {
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }
}

/* ══════════════════════════════════════
   MODAL BACKDROP + CLOSE BUTTONS
══════════════════════════════════════ */
function initModals() {
  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Close on [data-modal-close] click
  document.querySelectorAll('[data-modal-close]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var modal = this.closest('.modal-backdrop');
      if (modal) modal.classList.remove('open');
    });
  });

  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(function(m) {
        m.classList.remove('open');
      });
    }
  });
}

/* ══════════════════════════════════════
   MAIN INIT — call once on DOMContentLoaded
══════════════════════════════════════ */
function initDashboard() {
  checkAuth();
  populateUserInfo();
  initSidebarNav();
  initMobileSidebar();
  initLogout();
  initModals();

  // Run animations after a short delay so elements are visible
  setTimeout(function() {
    animateCounts();
    animateChartBars();
  }, 100);
}

// Auto-init when DOM ready if not called manually
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Only auto-init if initDashboard hasn't been called yet
    // (pages call it themselves via boot functions)
  });
}