/* ── TRACKING PAGE JS ── */

document.addEventListener('DOMContentLoaded', () => {

  /* Tab switching */
  const tabs = document.querySelectorAll('.ttab');
  const input = document.getElementById('trackingInput');
  const placeholders = {
    tracking: 'e.g. LF-2025-048291',
    booking:  'e.g. BK-78432-A',
    container: 'e.g. MSCU4829103'
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (input) input.placeholder = placeholders[tab.dataset.tab] || '';
    });
  });

  /* Track button */
  const trackBtn = document.getElementById('trackBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', doTrack);
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') doTrack(); });
  }
});

function fillDemo(val) {
  const input = document.getElementById('trackingInput');
  if (input) { input.value = val; input.focus(); }
}

function doTrack() {
  const input = document.getElementById('trackingInput');
  const val   = (input ? input.value : '').trim();
  if (!val) {
    if (input) { input.focus(); input.style.borderColor = 'var(--orange)'; }
    return;
  }
  const resultSection = document.getElementById('trackResult');
  const resultId      = document.getElementById('resultId');
  if (resultSection) {
    if (resultId) resultId.textContent = val;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}