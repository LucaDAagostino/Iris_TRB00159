(function () {
  // -------- Utils --------
  function byId(id){ return document.getElementById(id); }
  function textOf(el){ return (el && (el.textContent || '')).replace(/\u00A0/g,' ').trim(); }
  function createEl(tag, cls, html){
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }
  function pressKeySafe(k){
    try {
      if (typeof window.pressKey === 'function'){ window.pressKey(k); return; }
      if (typeof window.sendAidKey === 'function'){ window.sendAidKey(k); return; }
      if (typeof window.pui === 'object' && typeof window.pui.clickKey === 'function'){ window.pui.clickKey(k); return; }
      if (k === 'Enter'){ try{ document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'})); }catch(e){} }
    } catch(e){}
  }

  // --- COUNTERS / PERSISTENCE (solo MODAL) ---
  const COUNTER_NS   = 'RSCNMSG.page';
  const PAGESIZE_NS  = 'RSCNMSG.pageSize';

  function getCurrentProgramName(header){
    try {
      if (window.getProgramName && typeof window.getProgramName.name === 'function') {
        const v = window.getProgramName.name();
        if (v) return String(v);
      }
      if (typeof window.getProgramName === 'function') {
        const r = window.getProgramName();
        if (typeof r === 'string' && r) return r;
        if (r && typeof r.name === 'function') {
          const v2 = r.name();
          if (v2) return String(v2);
        }
      }
    } catch(e){}
    return header.programName || '';
  }

  function counterKey(header){
    const prog = getCurrentProgramName(header) || header.programName || '';
    return `${COUNTER_NS}:${prog}`;
  }
  function pageSizeKey(header){
    const prog = getCurrentProgramName(header) || header.programName || '';
    return `${PAGESIZE_NS}:${prog}`;
  }
  function getIntFromStorage(key, def=0){
    try {
      const v = sessionStorage.getItem(key);
      if (v == null) return def;
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : def;
    } catch(e){
      window.__RSCNMSGFallback = window.__RSCNMSGFallback || {};
      return (window.__RSCNMSGFallback[key] ?? def);
    }
  }
  function setIntToStorage(key, value){
    try { sessionStorage.setItem(key, String(value)); }
    catch(e){
      window.__RSCNMSGFallback = window.__RSCNMSGFallback || {};
      window.__RSCNMSGFallback[key] = value;
    }
  }

  function updatePageBadge(el, pageZeroBased){
    if (!el) return;
    el.innerHTML = `Pagina <strong>${pageZeroBased + 1}</strong>`;
  }

  // Reset pagina se cambia programma rispetto alla tua variabile globale
  function autoResetIfProgramChanged(header){
    const current = getCurrentProgramName(header);
    if (typeof window.lastProgramName !== 'undefined' && current !== window.lastProgramName) {
      setIntToStorage(counterKey(header), 0);
      setIntToStorage(pageSizeKey(header), 0);
    }
  }

  // --- Modal helpers: chiusura come la X ---
  function closeModalSafe(id){
    const modal = document.getElementById(id);
    if (!modal) { pressKeySafe('Enter'); return; }

    try {
      if (window.bootstrap && typeof window.bootstrap.Modal === 'function') {
        window.bootstrap.Modal.getOrCreateInstance(modal).hide();
        return;
      }
    } catch(e){}
    try {
      if (window.$ && typeof window.$.fn.modal === 'function') {
        window.$(modal).modal('hide');
        return;
      }
    } catch(e){}

    // Fallback manuale
    try {
      modal.style.display = 'none';
      modal.classList.remove('show');
      pressKeySafe('Enter');
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    } catch(e){}
  }

  // -------- Header / Messaggi --------
  function extractHeader(emulator){
    var titleEl   = emulator.querySelector('#D_1_33');
    var pgmNameEl = emulator.querySelector('#D_1_74');
    return {
      title: textOf(titleEl) || 'Elenco Messaggi',
      programName: textOf(pgmNameEl) || ''
    };
  }
  function isContinuationText(t){ return /^\s*(segue|fine)\b/i.test(t); }

  function extractMessagesCol2(emulator){
    var lines = [];
    try {
      if (window.retrieveAllFields && typeof window.retrieveAllFields.rowColMap === 'function'){
        var map = window.retrieveAllFields.rowColMap();
        map.forEach(function(el, key){
          if (!el || !el.id || el.id.indexOf('D_') !== 0) return;
          var parts = key.split('_'); if (parts.length !== 2) return;
          var col = Number(parts[1]); if (col !== 2) return;
          var t = textOf(el); if (!t) return;
          if (/<\s*Invio\s*>\s*=/.test(t)) return;
          if (isContinuationText(t)) return;
          lines.push(t);
        });
      }
    } catch(e){}

    if (lines.length === 0){
      var divs = emulator.getElementsByTagName('div');
      var rows = [];
      for (var i=0;i<divs.length;i++){
        var el = divs[i];
        if (!el.id || el.id.indexOf('D_')!==0) continue;
        var m = /^D_(\d+)_([0-9]+)$/.exec(el.id);
        if (!m) continue;
        var r = parseInt(m[1],10);
        var c = parseInt(m[2],10);
        if (c !== 2) continue;
        var t = textOf(el); if (!t) continue;
        if (/<\s*Invio\s*>\s*=/.test(t)) continue;
        if (isContinuationText(t)) continue;
        rows.push({ row:r, text:t });
      }
      rows.sort(function(a,b){ return a.row - b.row; });
      for (var j=0;j<rows.length;j++) lines.push(rows[j].text);
    }
    return lines;
  }

  // -------- UI (solo MODAL: body+footer) --------
  function buildUI(header, messages) {
    var cb  = createEl('div','p-0','');
    var resp = createEl('div','table-responsive','');
    resp.style.maxHeight = '60vh';
    resp.style.overflowY = 'auto';

    // Counters
    var cKey = counterKey(header);
    var pzKey = pageSizeKey(header);
    var pageCount = getIntFromStorage(cKey, 0);

    // pageSize: se non noto o alla prima pagina, prendo dal loop e memorizzo
    var pageSize = getIntFromStorage(pzKey, 0);
    if (pageCount === 0 || pageSize <= 0) {
      pageSize = messages.length;
      setIntToStorage(pzKey, pageSize);
    }

    // Tabella
    var table = createEl('table','table table-lg table-hover align-middle mb-0','');
    table.style.lineHeight = "1.5rem";
    var thead = createEl('thead','table-light','');
    var trh   = createEl('tr','', '');
    trh.appendChild(createEl('th','', '#'));
    trh.appendChild(createEl('th','', 'Messaggio'));
    thead.appendChild(trh);

    var tbody = createEl('tbody','', '');
    for (var i=0;i<messages.length;i++){
      var tr = createEl('tr','', '');
      var thIdx = createEl('th','', String((pageCount * pageSize) + (i + 1))); // numerazione CONTINUA
      thIdx.setAttribute('scope','row');
      var tdMsg = createEl('td','', '');
      tdMsg.textContent = messages[i];
      tr.appendChild(thIdx);
      tr.appendChild(tdMsg);
      tbody.appendChild(tr);
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    resp.appendChild(table);
    cb.appendChild(resp);

    // -------- Footer (LEFT = Pagina | RIGHT = Prev/Next/Enter) --------
    var cf = createEl('div','bg-white pt-3 pb-3','');

    // Contenitore FLEX a tutta larghezza
    var footerBar = createEl('div','d-flex align-items-center w-100','');
    footerBar.id = 'ulFunctionKeyRSCNMSG'; // se hai CSS esistenti su questo id, rimane compatibile

    // Gruppi
    var leftGroup  = createEl('div','d-flex align-items-center gap-2','');          // resta a sinistra
    var rightGroup = createEl('div','d-flex align-items-center gap-2 ms-auto','');  // spinto tutto a destra

    // Badge pagina + bottoni (no <li/>)
    var pageBadge  = createEl('span', 'btn btn-sm btn-light disabled', '');
    var btnPrev    = createEl('button','btn btn-sm btn-functionKey btn-custom','<span aria-hidden="true">«</span> Previous');
    var btnNext    = createEl('button','btn btn-sm btn-functionKey btn-custom','Next <span aria-hidden="true">»</span>');
    var btnEnter   = createEl('button','btn btn-sm btn-functionKey btn-success','Enter=Invio');
    btnPrev.type = btnNext.type = btnEnter.type = 'button';

    updatePageBadge(pageBadge, pageCount);

    // Prev / Next: aggiorna contatore pagina e invia AID key
    btnPrev.addEventListener('click', function(e){
      e.preventDefault();
      pageCount = Math.max(0, getIntFromStorage(cKey, 0) - 1);
      setIntToStorage(cKey, pageCount);
      updatePageBadge(pageBadge, pageCount);
      pressKeySafe('PageUp');
    });
    btnNext.addEventListener('click', function(e){
      e.preventDefault();
      pageCount = getIntFromStorage(cKey, 0) + 1;
      setIntToStorage(cKey, pageCount);
      updatePageBadge(pageBadge, pageCount);
      pressKeySafe('PageDown');
    });

    let containerFunctionKey = document.getElementById("containerFunctionKey");
    if (containerFunctionKey) containerFunctionKey.style.visibility = "hidden";

    let insideHeaderButtons = document.getElementById("insideHeaderButtons");
		if 	(insideHeaderButtons) insideHeaderButtons.style.visibility = "hidden";

    // Enter=Invio → chiudi modal come la X
    btnEnter.addEventListener('click', function(e){ e.preventDefault(); closeModalSafe('RSCNMSGModal'); });

    // Monta gruppi
    leftGroup.appendChild(pageBadge);
    rightGroup.appendChild(btnPrev);
    rightGroup.appendChild(btnNext);
    rightGroup.appendChild(btnEnter);

    footerBar.appendChild(leftGroup);
    footerBar.appendChild(rightGroup);
    cf.appendChild(footerBar);

    return { cardBody: cb, cardFooter: cf };
  }

  // -------- Modal Bootstrap (sempre modal) --------
  function showInBootstrapModal(ui, { id = 'RSCNMSGModal', title = 'Elenco Messaggi', size = 'xl' } = {}) {
    let modal = document.getElementById(id);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal fade';
      modal.classList.add (id);
      modal.tabIndex = -1;
      modal.setAttribute('role', 'dialog');
      modal.innerHTML = `
        <div class="modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable" role="document">
          <div class="modal-content" style="background-color: white">
            <div class="modal-header">
              <h3 class="modal-title">${title}</h3>
              <button type="button" class="close btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
          </div>
        </div>`;
      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('.btn-close') || modal.querySelector('.close');
      if (closeBtn && !closeBtn.innerHTML.trim()) {
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-hidden', 'true');
      }

      // Alla chiusura: invia Enter e rimuovi il nodo
      modal.addEventListener('hidden.bs.modal', () => {
        try { pressKeySafe('Enter'); } catch(e){}
        try {
          if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        } catch(e){}
      });
    }

    const titleEl = modal.querySelector('.modal-title');
    if (titleEl) titleEl.textContent = title;

    const header = modal.querySelector('.modal-header');
    const body = modal.querySelector('.modal-body');
    const footer = modal.querySelector('.modal-footer');
    if (body && footer) {
      // evito che il flex della .modal-footer impatti i miei gruppi
      footer.style.display = 'block';
      body.innerHTML = '';
      footer.innerHTML = '';
      body.appendChild(ui.cardBody);
      footer.appendChild(ui.cardFooter);
    }
    if (header) header.style.borderBottom = "0";
    if (footer) footer.style.borderTop = "0";

    try {
      if (window.bootstrap && typeof window.bootstrap.Modal === 'function') {
        window.bootstrap.Modal.getOrCreateInstance(modal).show();
      } else if (window.$ && typeof window.$.fn.modal === 'function') {
        window.$(modal).modal('show');
      } else {
        modal.style.display = 'block';
        modal.classList.add('show');
      }
    } catch (e) {
      modal.style.display = 'block';
      modal.classList.add('show');
    }
    return modal;
  }

  // -------- Entrypoint (solo modal) --------
  function redrawCustomized_RSCNMSG(){
    if (window.setRedrawCustomized && typeof window.setRedrawCustomized.On === 'function'){
      try { window.setRedrawCustomized.On(); } catch(e){}
    }

    var emulator = byId('5250');
    if (!emulator){ return; }

    // nascondi sorgente
    (function hideSourceNodes(){
      var form = emulator.querySelector('form');
      if(form){
        var n1 = form.querySelectorAll('*:not(script)');
        for(var i=0;i<n1.length;i++){
          var el = n1[i];
          if (!el || !el.style) continue;
          el.dataset = el.dataset || {};
          el.dataset.redrawHiddenBackupDisplay = el.style.display || '';
          el.style.display = 'none';
        }
      }
      var n2 = emulator.querySelectorAll('input[readonly]');
      for(var j=0;j<n2.length;j++){
        var el2 = n2[j];
        if (!el2 || !el2.style) continue;
        el2.dataset = el2.dataset || {};
        el2.dataset.redrawHiddenBackupDisplay = el2.style.display || '';
        el2.style.display = 'none';
      }
    })();

    var header   = extractHeader(emulator);
    autoResetIfProgramChanged(header);

    var messages = extractMessagesCol2(emulator);
    var ui = buildUI(header, messages);

    showInBootstrapModal(ui, { id: 'RSCNMSGModal', title: header.title || 'Elenco Messaggi', size: 'xl' });

    if (typeof window.clearContainer === 'function'){
      try { window.clearContainer(document.getElementsByName('container5250')); } catch(e){}
    }
  }

  window.redrawCustomized_RSCNMSG = redrawCustomized_RSCNMSG;
})();
