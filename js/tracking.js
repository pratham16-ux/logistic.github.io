/* ── TRACKING PAGE JS ── */

let shipmentMap = null; // single map instance — reused on re-track

document.addEventListener('DOMContentLoaded', () => {

  /* ── Tab switching ── */
  const tabs  = document.querySelectorAll('.ttab');
  const input = document.getElementById('trackingInput');
  const placeholders = {
    tracking:  'e.g. LF-2025-048291',
    booking:   'e.g. BK-78432-A',
    container: 'e.g. MSCU4829103'
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (input) input.placeholder = placeholders[tab.dataset.tab] || '';
    });
  });

  /* ── Track button ── */
  const trackBtn = document.getElementById('trackBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', doTrack);
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') doTrack(); });
  }
});

/* ── Fill demo IDs from hero links ── */
function fillDemo(val) {
  const input = document.getElementById('trackingInput');
  if (input) { input.value = val; input.focus(); }
}

/* ── Main track action ── */
function doTrack() {
  const input = document.getElementById('trackingInput');
  const val   = (input ? input.value : '').trim();

  if (!val) {
    if (input) {
      input.focus();
      input.style.borderColor = 'var(--orange)';
      setTimeout(() => input.style.borderColor = '', 1500);
    }
    return;
  }

  const resultSection = document.getElementById('trackResult');
  const resultId      = document.getElementById('resultId');

  if (resultSection) {
    if (resultId) resultId.textContent = val;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    /*
     * Delay map init until after:
     *  1. display:block is painted (so the div has real dimensions)
     *  2. smooth-scroll has started moving the viewport
     * 350 ms is enough for both.
     */
    setTimeout(() => initShipmentMap(), 350);
  }
}

/* ── Leaflet map initialisation ── */
function initShipmentMap() {
  const mapEl = document.getElementById('shipmentMap');
  if (!mapEl) return;

  /* Destroy previous instance so Leaflet doesn't complain on re-track */
  if (shipmentMap) {
    shipmentMap.remove();
    shipmentMap = null;
  }

  /*
   * Route: Mumbai → Arabian Sea → Gulf of Aden → Port Said (CURRENT)
   *        → Mediterranean → Gibraltar → Hamburg → Frankfurt
   *
   * Each waypoint carries display metadata used for markers and popups.
   */
  const waypoints = [
    { lat: 18.9388,  lng: 72.8354,  label: 'Mumbai, India',            sublabel: 'Origin · Picked up 14 Jan',          done: true,  isOrigin: true  },
    { lat: 12.0,     lng: 50.0,     label: 'Arabian Sea',               sublabel: 'In transit · 15–16 Jan',             done: true  },
    { lat: 11.5,     lng: 43.15,    label: 'Gulf of Aden',              sublabel: 'Passed · 17 Jan',                    done: true  },
    { lat: 12.8628,  lng: 45.0369,  label: 'Bab-el-Mandeb Strait',      sublabel: 'Passed · 18 Jan',                    done: true  },
    { lat: 31.2638,  lng: 32.3019,  label: 'Port Said, Egypt',          sublabel: '📡 Current position · Est. dep. 21 Jan', done: false, active: true },
    { lat: 35.5,     lng: 23.0,     label: 'Mediterranean Sea',         sublabel: 'Pending',                            done: false },
    { lat: 36.1408,  lng: 5.3536,   label: 'Strait of Gibraltar',       sublabel: 'Pending',                            done: false },
    { lat: 53.5753,  lng: 9.9950,   label: 'Hamburg Port, Germany',     sublabel: 'Expected 28 Jan',                    done: false },
    { lat: 50.1109,  lng: 8.6821,   label: 'Frankfurt, Germany',        sublabel: 'Destination · Expected 30 Jan',      done: false, isDest: true  },
  ];

  const latlngs   = waypoints.map(p => [p.lat, p.lng]);
  const activeIdx = waypoints.findIndex(p => p.active);

  /* — Create map — */
  shipmentMap = L.map('shipmentMap', {
    zoomControl:       true,
    scrollWheelZoom:   false,   // prevent page-scroll hijack
    attributionControl: true,
  });

  /* OpenStreetMap tiles */
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 14,
  }).addTo(shipmentMap);

  /* — Completed route line (orange, solid) — */
  const doneCoords = waypoints.slice(0, activeIdx + 1).map(p => [p.lat, p.lng]);
  L.polyline(doneCoords, {
    color:   '#e8631a',
    weight:  4,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap:  'round',
  }).addTo(shipmentMap);

  /* — Remaining route line (slate, dashed) — */
  const pendCoords = waypoints.slice(activeIdx).map(p => [p.lat, p.lng]);
  L.polyline(pendCoords, {
    color:     '#94a3b8',
    weight:    3,
    opacity:   0.7,
    dashArray: '10 10',
  }).addTo(shipmentMap);

  /* — Markers — */
  waypoints.forEach((p, i) => {
    let iconHtml, size;

    if (p.active) {
      /* Pulsing current-position dot */
      iconHtml = `
        <div style="
          width:22px; height:22px; border-radius:50%;
          background:#e8631a; border:3px solid #fff;
          box-shadow:0 0 0 5px rgba(232,99,26,0.28), 0 2px 10px rgba(0,0,0,0.35);
          animation:mapPulse 1.6s ease-in-out infinite;
        "></div>`;
      size = [22, 22];

    } else if (p.isOrigin) {
      /* Bold origin marker */
      iconHtml = `
        <div style="
          background:#1a3156; color:#fff;
          padding:5px 10px; border-radius:20px;
          font-size:11px; font-weight:800; white-space:nowrap;
          box-shadow:0 3px 10px rgba(0,0,0,0.35);
          font-family:sans-serif; letter-spacing:0.04em;
        ">📍 Mumbai</div>`;
      size = [100, 30];

    } else if (p.isDest) {
      /* Bold destination marker */
      iconHtml = `
        <div style="
          background:#e8631a; color:#fff;
          padding:5px 10px; border-radius:20px;
          font-size:11px; font-weight:800; white-space:nowrap;
          box-shadow:0 3px 10px rgba(232,99,26,0.45);
          font-family:sans-serif; letter-spacing:0.04em;
        ">🏁 Frankfurt</div>`;
      size = [110, 30];

    } else if (p.done) {
      /* Small solid dot for completed waypoints */
      iconHtml = `
        <div style="
          width:12px; height:12px; border-radius:50%;
          background:#e8631a; border:2px solid #fff;
          box-shadow:0 1px 5px rgba(0,0,0,0.3);
        "></div>`;
      size = [12, 12];

    } else {
      /* Small grey dot for pending waypoints */
      iconHtml = `
        <div style="
          width:10px; height:10px; border-radius:50%;
          background:#cbd5e1; border:2px solid #fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.2);
        "></div>`;
      size = [10, 10];
    }

    const icon = L.divIcon({
      html:      iconHtml,
      className: '',
      iconSize:  size,
      iconAnchor: [size[0] / 2, size[1] / 2],
    });

    const popupContent = `
      <div style="font-family:sans-serif; min-width:160px;">
        <strong style="font-size:13px; color:#1a1a1a; display:block; margin-bottom:4px;">${p.label}</strong>
        <span style="font-size:12px; color:#64748b;">${p.sublabel}</span>
      </div>`;

    const marker = L.marker([p.lat, p.lng], { icon }).addTo(shipmentMap);
    marker.bindPopup(popupContent, { maxWidth: 220 });

    /* Auto-open popup on the active (current) position */
    if (p.active) {
      marker.openPopup();
    }
  });

  /* — Fit map to show the full route — */
  shipmentMap.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48] });

  /* — Inject pulse keyframe once into <head> — */
  if (!document.getElementById('map-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'map-pulse-style';
    style.textContent = `
      @keyframes mapPulse {
        0%, 100% { box-shadow: 0 0 0 5px rgba(232,99,26,0.28), 0 2px 10px rgba(0,0,0,0.35); }
        50%       { box-shadow: 0 0 0 12px rgba(232,99,26,0.06), 0 2px 10px rgba(0,0,0,0.35); }
      }
    `;
    document.head.appendChild(style);
  }

  /* — Trigger a resize so Leaflet recalculates tile layout — */
  setTimeout(() => shipmentMap && shipmentMap.invalidateSize(), 100);
}

document.getElementById("trackBtn").addEventListener("click", function () {
    const input = document.getElementById("trackingInput");

    if (!input.value.trim()) {
        input.reportValidity();
        return;
    }

    document.getElementById("trackResult").style.display = "block";
});