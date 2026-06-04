/* ══════════════════════════════════════
   contact.js — FAQ + Form
   Place this file in your js/ folder
══════════════════════════════════════ */

/* ── FAQ ACCORDION ── */
function toggleFaq(btn) {
  var item   = btn.parentElement;
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(f) {
    f.classList.remove('open');
  });
  if (!isOpen) item.classList.add('open');
}

/* ── FORM SUBMISSION ── */
function handleContactSubmit() {
  var fields  = ['fname', 'lname', 'email', 'origin', 'dest'];
  var errorEl = document.getElementById('formError');
  var valid   = true;

  // Clear previous error states
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.borderColor = ''; el.style.background = ''; }
  });
  if (errorEl) errorEl.style.display = 'none';

  // Validate required fields
  fields.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.style.borderColor = '#ef4444';
      el.style.background  = 'rgba(239,68,68,0.04)';
      el.addEventListener('input', function() {
        el.style.borderColor = '';
        el.style.background  = '';
      }, { once: true });
      valid = false;
    }
  });

  // Email format
  var emailEl = document.getElementById('email');
  if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.style.borderColor = '#ef4444';
    valid = false;
  }

  if (!valid) {
    if (errorEl) errorEl.style.display = 'block';
    var firstBad = document.querySelector('#contactForm [style*="ef4444"]');
    if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Submit
  var btn  = document.getElementById('submitBtn');
  var text = document.getElementById('submitText');
  if (text) text.textContent = 'Sending…';
  if (btn)  btn.disabled = true;

  setTimeout(function() {
    var form    = document.getElementById('contactForm');
    var success = document.getElementById('formSuccess');
    if (form)    form.style.display = 'none';
    if (success) success.classList.add('visible');
  }, 1200);
}