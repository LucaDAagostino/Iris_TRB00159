/******************** UX LAYER: overlay + stato ********************/
(function () {
  const q = (s, r = document) => r.querySelector(s);

  function ensureOverlay() {
    if (q('#exportOverlay')) return;
    const d = document.createElement('div');
    d.id = 'exportOverlay';
    d.innerHTML = `
      <div class="panel">
        <div class="title">Esportazione in corso…</div>
        <div class="sub" id="expInfo">Preparazione…</div>
        <div class="bar"><i id="expBar"></i></div>
      </div>`;
    document.body.appendChild(d);
  }

  function showOverlay(info) {
    ensureOverlay();
    document.body.classList.add('exporting');
    const ov = document.querySelector('#exportOverlay');
    if (!ov) return;

    ov.style.display = 'flex';
    void ov.offsetWidth;
    ov.classList.add('is-open');

    if (info) {
      const el = document.querySelector('#expInfo');
      if (el) el.textContent = info;
    }
  }

  function hideOverlay(cb) {
    const ov = document.querySelector('#exportOverlay');
    const finish = () => {
      if (ov) {
        ov.style.display = 'none';
        ov.removeEventListener('transitionend', finish);
      }
      document.body.classList.remove('exporting');
      if (typeof cb === 'function') cb();
    };

    if (!ov) return finish();

    ov.classList.remove('is-open'); // opacity -> 0 (fade-out)
    ov.addEventListener('transitionend', finish);
    setTimeout(finish, 400);
  }

  function setProgress(pct) { // 0–100
    const bar = q('#expBar');
    if (!bar) return;
    const v = Math.max(8, Math.min(100, Math.round(pct)));
    bar.style.width = v + '%';
  }

  window.ExportOverlayUX = {
    show: (msg = 'Raccolta righe…') => showOverlay(msg),
    hide: (cb) => hideOverlay(cb),
    setInfo: (msg) => { const e = document.querySelector('#expInfo'); if (e) e.textContent = msg; },
    setProgress
  };

  // Ripristina overlay al reload
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const raw = getDataStorage(EXPORT_COUNT, "session");
      const st = raw ? JSON.parse(raw) : null;
      if (st && st.active) {
        showOverlay('Ripresa esportazione…');
        setProgress(st.prog ?? 20);
      }
    } catch { }
  });
})();

/******************** BUTTON ********************/
/******************** BUTTON ********************/
window.addExportButton = function addExportButton(marker) {
  const table = document.querySelector('#subfileTable');
  if (!table) {
    consoleLog.warn('addExportButton: #subfileTable non trovato.');
    return;
  }

  // Evita doppio bottone (sia via dataset che via id nel DOM)
  if (table.dataset.exportBtnAdded === '1') return;
  if (document.getElementById('btnExportTable')) return;

  const header = document.getElementById('subfileTableHeader');

  // ===================== CASO 1: header esiste → uso quello =====================
  if (header) {
    // assicuro che sia una riga flex orizzontale
    header.classList.add('d-flex', 'align-items-center', 'mb-2');

    const btn = document.createElement('button');
    btn.id = "btnExportTable";
    btn.type = 'button';
    btn.className = 'btn btn-success btn-sm me-2'; // un po' di spazio verso la paginazione
    btn.setAttribute('data-role', 'export-subfile-btn');
    btn.innerHTML = '<i class="fa fa-file-excel"></i> Export';

    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Export in corso…';
      startExportAllPages(marker);
    });

    // Excel a SINISTRA → lo inserisco come primo elemento dell'header
    if (header.firstChild) {
      header.insertBefore(btn, header.firstChild);
    } else {
      header.appendChild(btn);
    }

    table.dataset.exportBtnAdded = '1';

    const st = loadState();
    if (st && st.active) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Export in corso…';
    }

    return;
  }

  // ===================== CASO 2: fallback → vecchio comportamento =====================
  const bar = document.createElement('div');
  bar.className = 'd-flex justify-content-end mb-2';

  const btn = document.createElement('button');
  btn.id = "btnExportTable";
  btn.type = 'button';
  btn.className = 'btn btn-success btn-sm';
  btn.setAttribute('data-role', 'export-subfile-btn');
  btn.innerHTML = '<i class="fa fa-file-excel"></i> Export';

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Export in corso…';
    startExportAllPages(marker);
  });

  bar.appendChild(btn);
  table.parentNode && table.parentNode.insertBefore(bar, table);
  table.dataset.exportBtnAdded = '1';

  const st = loadState();
  if (st && st.active) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Export in corso…';
  }
};


/******************** TASTI: PAGEDOWN / F5 ********************/
function doPageDown() {
  try {
    if (window.pui && typeof pui.pressKey === 'function') { pui.pressKey('PageDown'); return true; }
    if (typeof window.pressKey === 'function') { window.pressKey('PageDown'); return true; }
    if (window.pui && pui.genie && typeof pui.genie.pressKey === 'function') { pui.genie.pressKey('PageDown'); return true; }
  } catch (e) {
    consoleLog.warn('doPageDown error:', e);
  }
  consoleLog.warn('doPageDown: pressKey not available');
  return false;
}

function doF5() {
  try {
    if (window.pui && typeof pui.pressKey === 'function') { pui.pressKey('F5'); return true; }
    if (typeof window.pressKey === 'function') { window.pressKey('F5'); return true; }
    if (window.pui && pui.genie && typeof pui.genie.pressKey === 'function') { pui.genie.pressKey('F5'); return true; }
  } catch (e) {
    consoleLog.warn('doF5 error:', e);
  }
  consoleLog.warn('doF5: pressKey not available');
  return false;
}

function doF16() {
  try {
    if (window.pui && typeof pui.pressKey === 'function') { pui.pressKey('F16'); return true; }
    if (typeof window.pressKey === 'function') { window.pressKey('F16'); return true; }
    if (window.pui && pui.genie && typeof pui.genie.pressKey === 'function') { pui.genie.pressKey('F16'); return true; }
  } catch (e) {
    consoleLog.warn('doF16 error:', e);
  }
  consoleLog.warn('doF16: pressKey not available');
  return false;
}

/******************** EXPORT-MODE HELPERS (NUOVI, non invasivi) ********************/
// flag globale comodo per altri moduli (es. per saltare removeEmptyDataColumnsFromList)
window.__EXPORT_ACTIVE = false;

/** true se export attivo */
window.isExcelExportActive = function isExcelExportActive() {
  return !!window.__EXPORT_ACTIVE;
};

/** risolve un selettore o elemento tabella */
function resolveTable(t) {
  if (!t) return document.querySelector('#subfileTable');
  if (typeof t === 'string') return document.querySelector(t);
  return t;
}

/** calcola gli indici delle colonne da escludere in base ai <th> */
function computeSkipIndices(table, { skipNames = null, skipNamePredicate = null } = {}) {
  const ths = Array.from(table.querySelectorAll('thead th'));
  const skip = new Set();
  for (let i = 0; i < ths.length; i++) {
    const th = ths[i];
    const name = th.getAttribute('name') || th.getAttribute('data-col') || '';
    let shouldSkip = false;

    if (Array.isArray(skipNames) && skipNames.length) {
      // match esatto
      if (skipNames.includes(name)) shouldSkip = true;
    }
    if (!shouldSkip && typeof skipNamePredicate === 'function') {
      try { if (skipNamePredicate(name)) shouldSkip = true; } catch { /* no-op */ }
    }

    if (shouldSkip) skip.add(i);
  }
  return skip;
}

/** prepara la tabella per l'export (idempotente) */
window.beginExcelExport = function beginExcelExport(tableOrSel, options = {}) {
  const table = resolveTable(tableOrSel);
  if (!table) return new Set();

  // per il tuo caso: salta qualsiasi name che TERMINA con 'VDSCT'
  const mergedOptions = Object.assign({
    skipNamePredicate: (name) => typeof name === 'string' && /VDSCT$/.test(name)
  }, options || {});

  const skip = computeSkipIndices(table, mergedOptions);
  table.dataset.exportSkipActive = '1';
  table.dataset.exportSkipCols = JSON.stringify(Array.from(skip));
  window.__EXPORT_ACTIVE = true;
  return skip;
};

/** chiusura export-mode */
window.endExcelExport = function endExcelExport() {
  const table = document.querySelector('#subfileTable');
  if (table) {
    delete table.dataset.exportSkipActive;
    delete table.dataset.exportSkipCols;
  }
  window.__EXPORT_ACTIVE = false;
};

/** leggi gli indici da saltare memorizzati sulla tabella */
function getSkipIndicesFromTable(table) {
  if (!table || table.dataset.exportSkipActive !== '1') return new Set();
  try {
    const raw = table.dataset.exportSkipCols;
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}

/******************** HEADERS & RIGHE ********************/
function getSuggestedFilename() {
  const t = document.querySelector('#insideHeaderTitle');
  const base = (t && t.textContent) ? t.textContent.trim().replace(/\s+/g, '_') : 'Export_Subfile';
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${base}_${y}${m}${day}`;
}

function getHeaders(table) {
  if (!table || !table.querySelectorAll) return [];
  const ths = Array.from(table.querySelectorAll('thead th'));
  const skip = getSkipIndicesFromTable(table); // << usa export-mode se attiva

  const seen = new Set();
  const headers = [];
  for (let i = 0; i < ths.length; i++) {
    if (skip.has(i)) continue; // salta colonna
    const th = ths[i];
    let h = (th.textContent || '').replace(/\u00A0/g, ' ').trim();
    if (!h) h = th.getAttribute('name') || th.getAttribute('data-col') || `Colonna ${headers.length + 1}`;
    let base = h, k = 2;
    while (seen.has(h)) h = `${base} (${k++})`;
    seen.add(h);
    headers.push(h);
  }
  return headers;
}

function cleanText(s) {
  return (s == null ? '' : String(s)).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}

function gatherVisibleRowsMatrix(table, headers) {
  const rowsEls = Array.from(table.querySelectorAll('tbody > tr'));
  const ths = Array.from(table.querySelectorAll('thead th'));
  const skip = getSkipIndicesFromTable(table);           // << usa export-mode se attiva
  const keepIdx = [];
  for (let i = 0; i < ths.length; i++) {
    if (!skip.has(i)) keepIdx.push(i);
  }

  const cols = headers.length; // allineato a keepIdx.length
  return rowsEls.map(tr => {
    const tds = Array.from(tr.children);
    const row = new Array(cols).fill('');
    for (let c = 0; c < cols; c++) {
      const td = tds[ keepIdx[c] ];
      let v = '';
      if (td) {
        const inp = td.querySelector('input, select, textarea');
        if (inp) {
          if (inp.tagName === 'SELECT') {
            const sel = inp.selectedOptions && inp.selectedOptions[0];
            v = sel ? (sel.textContent ?? sel.value) : inp.value;
          } else if (inp.type === 'checkbox') {
            v = inp.checked ? '1' : '0';
          } else if (inp.type === 'radio') {
            const name = inp.name;
            const checked = name ? td.querySelector(`input[type="radio"][name="${CSS.escape(name)}"]:checked`) : (inp.checked ? inp : null);
            v = checked ? (checked.value ?? checked.textContent) : '';
          } else {
            v = inp.value ?? inp.textContent;
          }
        } else {
          v = td.textContent;
        }
      }
      row[c] = cleanText(v);
    }
    return row;
  });
}

/******************** STATO ********************/
function loadState() {
  try {
    const raw = getDataStorage(EXPORT_COUNT, "session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState(st) {
  try { setDataStorage(EXPORT_COUNT, JSON.stringify(st), "session"); }
  catch (e) { consoleLog.warn('saveState error:', e); }
}
function clearState() {
  try { removeDataStorage(EXPORT_COUNT, "session"); } catch { }
}

/******************** CSV / XLSX ********************/
function toCSV(headers, rows, { sep = ';', addBOM = true } = {}) {
  const esc = (v) => {
    const s = (v == null ? '' : String(v)).replace(/"/g, '""');
    const rx = new RegExp(`[${sep}\\n",]`);
    return rx.test(s) ? `"${s}"` : s;
  };
  const head = headers.map(esc).join(sep);
  const body = rows.map(r => r.map(esc).join(sep)).join('\n');
  const content = head + '\n' + body;
  return addBOM ? '\uFEFF' + content : content;
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const _fmtIT = new Intl.NumberFormat('it-IT');
function fmtInt(n) { return _fmtIT.format(Number(n) || 0); }

/******************** PROGRESS ********************/
function computeProgressFromRows(totalRows, prevProg) {
  // crescita combinata: logaritmica per i primi step + lineare tenue
  const base = 12 + Math.min(83, Math.floor(Math.log10((totalRows || 0) + 1) * 28 + (totalRows || 0) / 80));
  const next = Math.max((prevProg || 12) + 1, base);
  return Math.min(95, next);
}

/******************** EXPORT: AVVIO, RESUME, FINALE ********************/
function startExportAllPages(marker) {
  const filename = getSuggestedFilename();
  const st = { active: true, filename, headers: [], rows: [], pages: 0, totalRows: 0, prog: 12, needsF16: true };
  saveState(st);

  ExportOverlayUX.show('Inizializzo…');
  ExportOverlayUX.setProgress(12);

  ExportOverlayUX.setInfo('Preparazione…');
  doF5();
}

window.generateExport = function generateExport(marker) {
  const st = loadState();
  if (!st || !st.active) return;

  const table = document.querySelector('#subfileTable');
  if (!table) { setTimeout(() => window.generateExport(marker), 60); return; }

  // --- F16 gestione dettaglio ---
  // Prima volta: fai F16.
  // Dalle pagine successive: se l'export era partito con dettaglio attivo,
  // verifica che il tbody abbia ancora detailrow="1".
  // Se manca, rifai F16 prima di raccogliere le righe.
  const tbody = table.querySelector('#subfileTableTbody');
  const hasDetailRow = tbody?.getAttribute('detailrow') === '1';

  if (st.needsF16) {
    ExportOverlayUX.setInfo('Attivo dettagli (F16)…');

    st.needsF16 = false;
    st.waitingAfterF16 = true;

    saveState(st);

    doF16();
    return;
  }

  if (st.waitingAfterF16) {
    st.waitingAfterF16 = false;
    st.expectedDetailRow = hasDetailRow === true;
    saveState(st);
  }

  if (st.expectedDetailRow && !hasDetailRow) {
    ExportOverlayUX.setInfo('Riattivo dettagli (F16)…');

    st.waitingAfterF16 = true;
    saveState(st);

    doF16();
    return;
  }

  // === Export-mode: ogni volta (idempotente) escludi colonne con name che TERMINA in 'VDSCT'
  beginExcelExport(table, {
    skipNamePredicate: (name) => typeof name === 'string' && /VDSCT$/.test(name)
  });

  // headers coerenti con le colonne non saltate
  const headers = Array.isArray(st.headers) && st.headers.length ? st.headers : getHeaders(table);
  st.headers = headers;

  // raccogli righe della pagina corrente (colonne coerenti con headers)
  const pageRows = gatherVisibleRowsMatrix(table, headers);
  st.rows.push(...pageRows);

  // aggiorna conteggi
  const added = pageRows.length;
  st.pages = (st.pages || 0) + 1;
  st.totalRows = (st.totalRows || 0) + added;

  // calcola progress da righe
  const newProg = computeProgressFromRows(st.totalRows, st.prog);
  st.prog = newProg;

  // UI overlay
  ExportOverlayUX.setInfo(`Righe raccolte: ${st.totalRows} (pag. ${st.pages})`);
  ExportOverlayUX.setProgress(st.prog);

  // salva stato
  saveState(st);

  // continua o chiudi
  if (marker === 'segue') {
    ExportOverlayUX.setInfo(`Paginazione… (pag. ${st.pages} → ${st.pages + 1}) • Righe: ${fmtInt(st.totalRows)}`);
    setTimeout(() => { doPageDown(); }, 30);
  } else {
    finalizeAndDownload();
  }
};

function finalizeAndDownload() {
  const st = loadState();
  if (!st || !st.active) return;

  const { filename, headers, rows } = st;

  ExportOverlayUX.setInfo('Generazione file…');
  ExportOverlayUX.setProgress(98);

  if (window.XLSX && XLSX.utils && XLSX.writeFile) {
    const data = rows.map(r => {
      const o = {};
      for (let i = 0; i < headers.length; i++) o[headers[i]] = r[i] ?? '';
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dati');
    XLSX.writeFile(wb, filename + '.xlsx');
  } else {
    const csv = toCSV(headers, rows, { sep: ';', addBOM: true });
    downloadBlob(csv, filename + '.csv', 'text/csv;charset=utf-8;');
  }

  // chiudi export-mode
  try { endExcelExport(); } catch (_) {}

  clearState();

  ExportOverlayUX.setProgress(100);
  const useXlsx = !!(window.XLSX && XLSX.utils && XLSX.writeFile);
  ExportOverlayUX.setInfo(`Completato • Righe: ${fmtInt(st.totalRows)} • File: ${filename}.${useXlsx ? 'xlsx' : 'csv'}`);

  setTimeout(() => { doF5(); }, 60);
  setTimeout(() => ExportOverlayUX.hide(), 3500);

  // Riabilita il bottone
  const btn = document.querySelector('[data-role="export-subfile-btn"]');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-file-excel"></i> Export';
  }
}

// utility: ritorna true se dobbiamo bypassare logiche che alterano la tabella durante l'export
window.shouldBypassForExport = function shouldBypassForExport(tableOrSelector) {
  // normalizza il riferimento alla tabella
  let el = tableOrSelector;
  if (typeof el === 'string') {
    el = document.getElementById(el) || document.querySelector(el);
  }
  if (!el) {
    el = document.querySelector('#subfileTable') || null;
  }

  // se esiste già una funzione "ufficiale", delega a quella
  try {
    if (typeof window.isExcelExportActive === 'function' && window.isExcelExportActive()) {
      return true;
    }
  } catch (_) {}

  // fallback: controlla i vari flag/attributi che usi in giro
  return !!(
    window.__EXPORT_ACTIVE === true ||                         // flag globale
    document.body.classList.contains('exporting') ||           // overlay aperto
    (el && el.dataset && el.dataset.exportSkipActive === '1') || // data-flag sul table
    (window._exportMode && window._exportMode.isExcel) ||      // retro-compat
    (el && typeof el.hasAttribute === 'function' && el.hasAttribute('data-exporting'))
  );
};
