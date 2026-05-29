(function logErrorReporter() {
  if (typeof Error !== 'undefined') { Error.stackTraceLimit = Infinity; }

  const SUBJECT_PREFIX = '[AppCore Error]';
  const MAX_BODY_CHARS_MAILTO = 1000; // prudenziale per client desktop
  const MAX_BODY_CHARS_WEB = 6000; // i compose web tollerano URL più lunghi

  // --- destinatari dinamici da properties.supportEmail (accetta , e ;)
  function getMailTo() {
    const fallback = 'luca.dagostino@trebi.it';
    const raw = (typeof properties === 'object' && properties && typeof properties.supportEmail === 'string')
      ? properties.supportEmail.trim()
      : '';
    if (!raw) return fallback;
    const emails = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    const isValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const validList = emails.filter(isValid);
    return validList.length ? validList.join(',') : fallback;
  }

  // --- URL compose web (provider: 'outlook' | 'gmail')
  function buildWebComposeUrl(provider, to, subject, body) {
    if (provider === 'gmail') {
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    // default: Outlook Web
    return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  // === bottone Chiudi: tenta di chiudere la scheda/finestra ===
  function tryCloseWindow() {
    try { window.close(); } catch (_) { }
    try { window.open('', '_self'); window.close(); } catch (_) { }
    setTimeout(() => { alert('Impossibile chiudere automaticamente questa scheda. Chiudila manualmente (Ctrl+W o ⌘W).'); }, 100);
  }

  let modalEl, modalBody, stackBox, copyBtn, sendBtn, sendWebToggle, sendWebOutlookItem, sendWebGmailItem, bsModalInstance,
    closeWinBtn;


  function nowISO() {
    return new Date().toLocaleString('sv-SE', { timeZoneName: 'short' });
  }

  function store(entry) {
    try {
      const KEY = 'appcore_errors';
      const arr = JSON.parse(sessionStorage.getItem(KEY) || '[]');
      arr.push(entry);
      sessionStorage.setItem(KEY, JSON.stringify(arr.slice(-100)));
    } catch (_) { }
  }

  // --- helper: apri mailto nella stessa scheda (non chiudiamo la modale)
  function openMailClient(href) {
    try { window.location.href = href; return; } catch (_) { }
    try {
      const a = document.createElement('a');
      a.href = href; a.target = '_self'; a.rel = 'noopener'; a.style.display = 'none';
      document.body.appendChild(a); a.click(); a.remove();
      return;
    } catch (_) { }
    try { window.open(href, '_self'); } catch (_) { }
  }

  // --- modale Bootstrap (una sola volta)
  function ensureModal() {
    if (modalEl) return;
    const tpl = document.createElement('div');
    tpl.className = 'modal fade';
    tpl.id = 'acErrorModal';
    tpl.setAttribute('tabindex', '-1');
    tpl.setAttribute('aria-labelledby', 'acErrorModalLabel');
    tpl.setAttribute('aria-hidden', 'true');
    tpl.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" style="background-color: white;">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title d-flex align-items-center gap-2" id="acErrorModalLabel">
              <span>⚠️</span><span>Errore applicazione</span>
              <span class="badge text-bg-light ms-2 fw-bold text-danger">LIVE</span>
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" id="acErrToggleStack">
              <i class="bi bi-braces" aria-hidden="true"></i><span class="ms-1">Mostra/Nascondi stack</span>
            </button>
            <button type="button" class="btn btn-outline-primary" id="acErrCopy">
              <i class="bi bi-clipboard" aria-hidden="true"></i><span class="ms-1">Copia dettagli</span>
            </button>

            <div class="btn-group">
              <button type="button" class="btn btn-success" id="acErrSend">
                <i class="bi bi-send-fill" aria-hidden="true"></i><span class="ms-1">Invia</span>
              </button>
              <button type="button" class="btn btn-outline-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false" id="acErrSendWebToggle" aria-label="Scegli servizio"></button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" id="acErrSendWebOutlook">
                  <i class="bi bi-globe2" aria-hidden="true"></i><span class="ms-1">Invia via Web (Outlook)</span>
                </a></li>
                <li><a class="dropdown-item" href="#" id="acErrSendWebGmail">
                  <i class="bi bi-envelope-at" aria-hidden="true"></i><span class="ms-1">Invia via Web (Gmail)</span>
                </a></li>
              </ul>
            </div>

            <button type="button" class="btn btn-outline-danger ms-2" id="acErrCloseWin">
              <i class="bi bi-x-lg" aria-hidden="true"></i><span class="ms-1">Chiudi</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(tpl);
    modalEl = tpl;
    modalBody = modalEl.querySelector('.modal-body');

    const toggleBtn = modalEl.querySelector('#acErrToggleStack');
    copyBtn = modalEl.querySelector('#acErrCopy');
    sendBtn = modalEl.querySelector('#acErrSend');
    sendWebToggle = modalEl.querySelector('#acErrSendWebToggle');
    sendWebOutlookItem = modalEl.querySelector('#acErrSendWebOutlook');
    sendWebGmailItem = modalEl.querySelector('#acErrSendWebGmail');
    closeWinBtn = modalEl.querySelector('#acErrCloseWin');

    toggleBtn.addEventListener('click', () => { if (stackBox) stackBox.classList.toggle('d-none'); });

    if (window.bootstrap && typeof bootstrap.Modal === 'function') {
      bsModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: 'static', keyboard: true });
    } else {
      modalEl.classList.remove('fade'); modalEl.style.display = 'block'; modalEl.classList.add('show');
    }
  }

  function composeData(entry) {
    const parts = [];
    parts.push(`Timestamp: ${entry.ts}`);
    parts.push(`Tipo: ${entry.type || 'error'}`);
    parts.push(`Messaggio: ${entry.message}`);
    if (entry.functionName) parts.push(`Funzione: ${entry.functionName}`);
    if (entry.source) parts.push(`File: ${entry.source}`);
    if (entry.lineno || entry.colno) parts.push(`Linea/Colonna: ${entry.lineno || 0}/${entry.colno || 0}`);
    parts.push(`URL: ${location.href}`);
    parts.push(`UserAgent: ${navigator.userAgent}`);
    parts.push('');
    parts.push(entry.stack || '(stack not available)');

    const subject = `[ERR] ${entry.message}`.slice(0, 120);
    const bodyFull = parts.join('\r\n');
    return { subject, bodyFull };
  }

  function renderModal(entry) {
    ensureModal();
    modalBody.innerHTML = '';

    function fmt(v) {
      if (v == null) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      try { return JSON.stringify(v); } catch { return String(v); }
    }

    const rows = [
      ['Timestamp', entry.ts],
      ['Tipo', entry.type || 'error'],
      ['Messaggio', entry.message],
      entry.functionName ? ['Funzione', entry.functionName] : null,
      entry.source ? ['File', entry.source] : null,
      (entry.lineno || entry.colno) ? ['Linea/Colonna', `${entry.lineno || 0}/${entry.colno || 0}`] : null,
      ['URL', location.href],
      ['UserAgent', navigator.userAgent]
    ].filter(Boolean);

    const CORE_KEYS = new Set(['ts', 'type', 'message', 'source', 'lineno', 'colno', 'stack', 'functionName']);

    for (const [key, val] of Object.entries(entry)) {
      if (!CORE_KEYS.has(key)) {
        rows.push([key, val]);
      }
    }

    const list = document.createElement('div');
    rows.forEach(([k, v]) => {
      const line = document.createElement('div');
      line.className = 'mb-2';

      const strong = document.createElement('strong');
      strong.textContent = k + ':';

      const space = document.createTextNode(' ');

      const span = document.createElement('span');
      span.className = 'font-monospace';
      span.textContent = fmt(v);

      line.appendChild(strong);
      line.appendChild(space);
      line.appendChild(span);
      list.appendChild(line);
    });
    modalBody.appendChild(list);

    // stack
    stackBox = document.createElement('pre');
    stackBox.className = 'bg-light border rounded p-2 mt-2 overflow-auto';
    stackBox.style.maxHeight = '240px';
    stackBox.textContent = entry.stack || '(stack not available)';
    modalBody.appendChild(stackBox);

    // Copia dettagli
    copyBtn.onclick = async () => {
      const lines = [];
      rows.forEach(([k, v]) => lines.push(`${k}: ${fmt(v)}`));
      lines.push('', entry.stack || '(stack not available)');
      const bodyFull = lines.join('\r\n');
      try { await navigator.clipboard.writeText(bodyFull); } catch { }
    };

    // Invia (mailto)
    sendBtn.onclick = async () => {
      const subject = `[ERR] ${(entry.message || 'Errore')}`.slice(0, 120);
      const lines = [];
      rows.forEach(([k, v]) => lines.push(`${k}: ${fmt(v)}`));
      lines.push('', entry.stack || '(stack not available)');
      const bodyFull = lines.join('\r\n');

      let bodyToSend = bodyFull;
      let note = '';
      if (bodyToSend.length > MAX_BODY_CHARS_MAILTO) {
        bodyToSend = bodyFull.slice(0, MAX_BODY_CHARS_MAILTO) + '\r\n...(troncato)';
        note = '\r\n\r\n[Contenuto completo copiato negli appunti]';
        try { await navigator.clipboard.writeText(bodyFull); } catch { }
      }
      const mailTo = getMailTo();
      const href =
        `mailto:${mailTo}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyToSend + note)}`;
      openMailClient(href);
    };

    function sendViaWeb(provider) {
      const subject = `[ERR] ${(entry.message || 'Errore')}`.slice(0, 120);
      const lines = [];
      rows.forEach(([k, v]) => lines.push(`${k}: ${fmt(v)}`));
      lines.push('', entry.stack || '(stack not available)');
      const bodyFull = lines.join('\r\n');

      let bodyToSend = bodyFull;
      if (bodyToSend.length > MAX_BODY_CHARS_WEB) {
        bodyToSend = bodyFull.slice(0, MAX_BODY_CHARS_WEB) + '\r\n...(troncato)';
        try { navigator.clipboard.writeText(bodyFull); } catch { }
      }
      const to = getMailTo();
      const url = buildWebComposeUrl(provider, to, subject, bodyToSend);
      window.open(url, '_blank', 'noopener');
    }

    sendWebOutlookItem?.addEventListener('click', (e) => { e.preventDefault(); sendViaWeb('outlook'); });
    sendWebGmailItem?.addEventListener('click', (e) => { e.preventDefault(); sendViaWeb('gmail'); });

    sendWebToggle?.addEventListener('click', (e) => {
      if (!(window.bootstrap && bootstrap.Dropdown)) {
        e.preventDefault();
        const choice = (prompt('Inviare via Web con: outlook / gmail', 'outlook') || '').trim().toLowerCase();
        if (choice === 'gmail' || choice === 'outlook') sendViaWeb(choice);
      }
    });

    closeWinBtn?.addEventListener('click', () => { tryCloseWindow(); });
  }

  function showModal(entry) {
    renderModal(entry);
    if (bsModalInstance) { bsModalInstance.show(); }
  }

  // ======== API PUBBLICA: logger (per try/catch) ========

  // Estrae functionName / file / linea / colonna dal primo frame utile dello stack
  function __ul_parseStackLocation(stack) {
    if (!stack) return {};
    const lines = String(stack).split('\n').map(s => s.trim()).filter(Boolean);

    const cand = lines.find(l =>
      /https?:\/\/.+:\d+:\d+/.test(l) || /\/[^ )]+:\d+:\d+/.test(l)
    );
    if (!cand) return {};

    const out = {};

    const fnMatch = cand.match(/at ([^(]+) \(|^([^\s@]+)@/);
    if (fnMatch) {
      out.functionName = (fnMatch[1] || fnMatch[2] || '').trim();
      out.functionName = out.functionName.replace(/^async\s+/, '').replace(/^Object\./, '');
    }

    const tailMatch = cand.match(/(https?:\/\/[^\s)]+|\S+):(\d+):(\d+)\)?$/);
    if (tailMatch) {
      out.source = tailMatch[1]
        .replace(/^\(+/, '')   // rimuovi "(" iniziali
        .replace(/\)+$/, '');  // rimuovi ")" finali (per sicurezza)
      out.lineno = parseInt(tailMatch[2], 10) || 0;
      out.colno = parseInt(tailMatch[3], 10) || 0;
    }
    return out;
  }

  // Crea una entry standard a partire da un Error e (opz.) extra
  function __ul_buildEntryFromError(err, extra) {
    const e = (err instanceof Error) ? err : new Error(String(err));

    function __ul_parseStackLocation(stack) {
      if (!stack) return {};
      const lines = String(stack).split('\n').map(s => s.trim()).filter(Boolean);
      const cand = lines.find(l => /https?:\/\/.+:\d+:\d+/.test(l) || /\/[^ )]+:\d+:\d+/.test(l));
      if (!cand) return {};
      const out = {};
      const fnMatch = cand.match(/at ([^(]+) \(|^([^\s@]+)@/);
      if (fnMatch) {
        out.functionName = (fnMatch[1] || fnMatch[2] || '').trim()
          .replace(/^async\s+/, '').replace(/^Object\./, '');
      }
      const tailMatch = cand.match(/(https?:\/\/[^\s)]+|\S+):(\d+):(\d+)\)?$/);
      if (tailMatch) {
        out.source = tailMatch[1]
          .replace(/^\(+/, '')   // rimuovi "(" iniziali
          .replace(/\)+$/, '');  // rimuovi ")" finali (per sicurezza)
        out.lineno = parseInt(tailMatch[2], 10) || 0;
        out.colno = parseInt(tailMatch[3], 10) || 0;
      }
      return out;
    }

    const loc = __ul_parseStackLocation(e.stack);

    const entry = {
      ts: (typeof nowISO === 'function') ? nowISO() : (new Date()).toISOString(),
      type: (extra && extra.type) || 'error',
      message: (extra && extra.messageOverride)
        ? String(extra.messageOverride)
        : (e.name + ': ' + (e.message || 'Errore')),
      source: (extra && extra.source) || loc.source || '',
      lineno: loc.lineno || 0,
      colno: loc.colno || 0,
      stack: e.stack || '',
      functionName: (extra && extra.functionName) || loc.functionName || ''
    };

    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (!(k in entry)) entry[k] = v;
      }
    }

    return entry;
  }

  // --- BGNIWMSG: builder e invio WS (fusione ex logErrorServer in logger.js)
  function buildBGNIWMSGPayload(entry, extra) {
    return {
      iJob: {
        iJobName: window.pui?.appJob?.name || '',
        iJobUser: window.pui?.appJob?.user || '',
        iJobNumber: window.pui?.appJob?.number || ''
      },
      iClient: { timeStamp: entry.ts, instance: pui?.ctrlJob?.name, skin: pui?.skin, url: location.href, userAgent: navigator.userAgent },
      iError: {
        errorType: entry.type || 'error',
        errorMessage: entry.message || '',
        functionName: entry.functionName || '',
        errorSource: entry.source || '',
        lineNo: entry.lineno || 0,
        colNo: entry.colno || 0,
        stack: entry.stack || ''
      }
    };
  }

  function sendErrorToBGNIWMSG(entry, extra) {
    try {
      if (!entry) {
        const arr = JSON.parse(sessionStorage.getItem('appcore_errors') || '[]');
        entry = arr[arr.length - 1];
      }
    } catch { }
    if (!entry) return;

    if (typeof window.invokeWebService_BGNIWMSG === 'function') {
      const payload = buildBGNIWMSGPayload(entry, extra);

      // --- GUARD reentrancy: disabilita forwarding dei consoleLog → WS durante l'invoke
      window.__CL_NO_FORWARD = (window.__CL_NO_FORWARD || 0) + 1;
      try {
        window.invokeWebService_BGNIWMSG(payload);
      } finally {
        window.__CL_NO_FORWARD = Math.max(0, (window.__CL_NO_FORWARD || 1) - 1);
      }
    } else {
      console.warn('invokeWebService_BGNIWMSG not available');
    }
  }

  // Espone una piccola API pubblica, riusando store()/showModal() già presenti nel file
  window.logger = {
    /**
     * Registra e mostra la modale a partire da un Error catturato.
     * @param {Error|any} err
     * @param {Object} [extra] - { type, source, messageOverride, functionName, ... }
     */
    fromError: function (err, extra) {
      try {
        const entry = __ul_buildEntryFromError(err, extra || null);
        if (typeof store === 'function') store(entry);
        if (typeof showModal === 'function') showModal(entry);
        // Invio al WS
        sendErrorToBGNIWMSG(entry, extra);
      } catch (e) {
        setTimeout(() => { throw err; }, 0);
      }
    },

    /**
     * Registra e mostra la modale passando direttamente un "entry" completo.
     * Campi attesi: { ts, type, message, source, lineno, colno, stack, functionName }
     */
    report: function (entry) {
      try {
        const safe = Object.assign({
          ts: (typeof nowISO === 'function') ? nowISO() : (new Date()).toISOString(),
          type: 'error',
          message: 'Errore',
          source: '',
          lineno: 0,
          colno: 0,
          stack: '',
          functionName: ''
        }, entry || {});
        if (typeof store === 'function') store(safe);
        if (typeof showModal === 'function') showModal(safe);
        // Invio al WS
        sendErrorToBGNIWMSG(safe, entry?.extra);
      } catch (_) { /* no-op */ }
    },

    /**
     * Invio manuale al WS (senza mostrare la modale). Se entry è null, invia l'ultima salvata.
     */
    sendErrorToBGNIWMSG: function (entry, extra) {
      sendErrorToBGNIWMSG(entry, extra);
    }
  };

  // ====== Handler generico da riusare nei catch ======
  window.handleCaughtError = function handleCaughtError(err, opts = {}) {
    console.error(err);
    if (window.logger?.fromError) {
      logger.fromError(err, { type: "handled", ...opts });
    }
  };

  // ====== Wrapper per non scrivere try/catch ovunque ======
  window.wrapTryCatch = function wrapTryCatch(fn, opts = {}) {
    return function wrappedHandled(...args) {
      const cfg = { ...(window.wrapTryCatch.defaults || {}), ...(opts || {}) };

      if (typeof fn !== 'function') {
        console.error('wrapTryCatch: fn non è una funzione', fn);
        return;
      }

      try {
        return fn.apply(this, args);
      } catch (err) {
        if (window.handleCaughtError) handleCaughtError(err, cfg);
        else console.error(err);
        if (cfg.abort) throw err;
        return 'fallback' in cfg ? cfg.fallback : undefined;
      }
    };
  };

  // imposta default iniziali
  window.wrapTryCatch.defaults = {
    invokeWebServiceConsole: properties?.invokeWs_BGNIWMSG,
    severity: 'critical',
    abort: true
  };

  // crea un wrapper preconfigurato con opzioni di base
  window.wrapTryCatch.with = function withOptions(baseOpts = {}) {
    return function configuredWrap(fn, opts = {}) {
      return window.wrapTryCatch(fn, { ...baseOpts, ...opts });
    };
  };

  // ====== Handler globali (rete di sicurezza) ======
  if (!window.__UL_GLOBAL_ERROR_HOOKS__) {
    window.__UL_GLOBAL_ERROR_HOOKS__ = true;

    window.addEventListener("error", function (evt) {
      try {
        const err = evt?.error || new Error(evt?.message || "Errore sconosciuto");
        if (window.logger?.fromError) {
          logger.fromError(err, { type: "unhandled" });
        } else {
          console.error("UNHANDLED ERROR:", err);
          // invio diretto come fallback
          const entry = {
            ts: nowISO(),
            type: 'error',
            message: err.name + ': ' + (err.message || 'Errore'),
            source: '',
            lineno: 0, colno: 0,
            stack: err.stack || ''
          };
          store(entry);
          sendErrorToBGNIWMSG(entry, { type: "global-error-fallback" });
        }
      } catch (_) { }
    });

    window.addEventListener("unhandledrejection", function (evt) {
      try {
        const reason = evt?.reason;
        const err = (reason instanceof Error) ? reason : new Error(String(reason));
        if (window.logger?.fromError) {
          logger.fromError(err, { type: "unhandled-promise" });
        } else {
          console.error("UNHANDLED REJECTION:", err);
          const entry = {
            ts: nowISO(),
            type: 'unhandledrejection',
            message: err.name + ': ' + (err.message || 'Errore'),
            source: '',
            lineno: 0, colno: 0,
            stack: err.stack || ''
          };
          store(entry);
          sendErrorToBGNIWMSG(entry, { type: "unhandledrejection-fallback" });
        }
      } catch (_) { }
    });
  }

  // --- Cattura errori GLOBALI (tracciati direttamente qui) ---
  window.addEventListener('error', function (event) {
    const errObj = event.error instanceof Error ? event.error : null;
    const entry = {
      ts: nowISO(),
      type: 'error',
      message: errObj ? (errObj.name + ': ' + errObj.message) : String(event.message || 'Errore sconosciuto'),
      source: event.filename || event.target?.src || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      stack: errObj?.stack || ''
    };
    console.error('JS Error catturato:', entry);
    store(entry);
    showModal(entry);
    sendErrorToBGNIWMSG(entry, { type: "global-error" });
  }, true);

  window.onunhandledrejection = function (event) {
    const reason = event?.reason;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    const entry = {
      ts: nowISO(),
      type: 'unhandledrejection',
      message: err.name + ': ' + err.message,
      source: '',
      lineno: 0,
      colno: 0,
      stack: err.stack || ''
    };

    console.error('Unhandled Promise Rejection:', entry);
    store(entry);
    showModal(entry);
    sendErrorToBGNIWMSG(entry, { type: "unhandledrejection" });
  };
})();
