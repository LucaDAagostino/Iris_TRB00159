/* ============================================================================
   ENTRYPOINT
============================================================================ */
window.forceAfterLoad = function () {
  try {
    window.showSessionExpired && window.showSessionExpired();
    window.showSessionClosed && window.showSessionClosed();
    window.showLegacyError   && window.showLegacyError();
  } catch(e){ console.error(e); }
};

/* ============================================================================
   UTILS (nomi estesi e parlanti)
============================================================================ */
(function () {
  // Normalizza testo per i check (non usata per mostrare i messaggi!)
  window.normalizeTextForCheck = function (s) {
    try {
      return String(s || "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\u00A0/g, " ")
        .replace(/[\s:]+/g, " ")
        .trim();
    } catch (e) {
      return String(s || "").toLowerCase()
        .replace(/\u00A0/g, " ")
        .replace(/[\s:]+/g, " ")
        .trim();
    }
  };

  // Escape HTML per contenuti dinamici non-HTML
  window.escapeHtmlForModal = function (s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  // Converte HTML in testo plain preservando i <br> come newline
  window.htmlToPlainText = function(html) {
    var safe = String(html || "");
    safe = safe.replace(/<br\s*\/?>/gi, "\n");
    var div = document.createElement("div");
    div.innerHTML = safe;
    var txt = div.textContent || div.innerText || "";
    // compatta newlines e spazi ridondanti attorno ai newline
    txt = txt.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n");
    // evita \n troppo ripetuti
    txt = txt.replace(/\n{3,}/g, "\n\n").trim();
    return txt;
  };

  // Costruisce una modale parametrica (variant: 'danger' | 'warning' | 'secondary')
  window.buildBootstrapModal = function (opts) {
    var id      = opts.id || "genericModal";
    var title   = escapeHtmlForModal(opts.title || "");
    var html    = opts.html || ""; // può essere HTML pronto (già “fidato”)
    var variant = opts.variant || "secondary";
    var footer  = opts.footerHtml || "";

    var classes = {
      danger:    { border: "border-danger",    header: "bg-danger-subtle"    },
      warning:   { border: "border-warning",   header: "bg-warning-subtle"   },
      secondary: { border: "border-secondary", header: "bg-secondary-subtle" }
    }[variant] || { border: "border-secondary", header: "bg-secondary-subtle" };

    return ''
      + '<div class="modal fade" id="'+id+'" tabindex="-1" aria-labelledby="'+id+'Title" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">'
      + '  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg modal-fullscreen-sm-down">'
      + '    <div class="modal-content '+classes.border+' bg-white" style="--bs-modal-bg:#fff; font-family: var(--bs-font-sans-serif);">'
      + '      <div class="modal-header '+classes.header+' border-0">'
      + '        <h1 class="modal-title fs-5" id="'+id+'Title">'+title+'</h1>'
      + '        <button type="button" class="btn-close" id="'+id+'CloseX" aria-label="Chiudi"></button>'
      + '      </div>'
      + '      <div class="modal-body" style="max-height:min(70vh, 720px); overflow-y:auto;">'
      + '        <div class="text-break" style="white-space:pre-wrap; overflow-wrap:anywhere; word-break:break-word;">'
      +            html
      + '        </div>'
      + '      </div>'
      + '      <div class="modal-footer">'
      +          footer
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  };

  // Mostra una modale Bootstrap (fallback: forza visibilità)
  window.showBootstrapModal = function(modalId){
    var el = document.getElementById(modalId);
    if (!el) return;
    if (window.bootstrap && window.bootstrap.Modal) {
      try { new bootstrap.Modal(el, { backdrop:"static", keyboard:false }).show(); }
      catch(e){ el.className += " show"; el.style.display="block"; el.removeAttribute("aria-hidden"); }
    } else {
      el.className += " show"; el.style.display="block"; el.removeAttribute("aria-hidden");
    }
  };

  // Chiude SOLO la modale (fallback se manca Bootstrap JS)
  window.closeBootstrapModal = function(modalId){
    var el = document.getElementById(modalId);
    if (!el) return;
    if (window.bootstrap && window.bootstrap.Modal) {
      try { bootstrap.Modal.getOrCreateInstance(el).hide(); }
      catch(e){
        el.className = el.className.replace(/\bshow\b/, "").trim();
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      }
    } else {
      el.className = el.className.replace(/\bshow\b/, "").trim();
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
    }
  };

  // Chiude finestra o torna indietro/blank
  window.safeCloseWindowOrBack = function(){
    try { window.close(); } catch(e){}
    try { window.open("", "_self"); window.close(); } catch(e){}
    setTimeout(function(){
      if (history && history.length>1) history.back();
      else location.href="about:blank";
    }, 100);
  };

  // NASCONDE tutto il body eccetto la modale (e l’eventuale backdrop)
  window.hideNonModalContent = function (modalId) {
    var body = document.body;
    if (!body) return;
    body.classList.add("modal-exclusive");
    Array.prototype.forEach.call(body.children, function (el) {
      if (!el) return;
      if (el.id === modalId) return;
      if (el.classList && el.classList.contains("modal-backdrop")) return;
      if (el.hasAttribute("data-hidden-by-exclusive")) return;
      el.setAttribute("data-hidden-by-exclusive", "1");
      if (!el.hasAttribute("data-prev-style")) el.setAttribute("data-prev-style", el.getAttribute("style") || "");
      el.style.setProperty("display", "none", "important");
    });
  };

  // RIPRISTINA il body quando la modale viene chiusa
  window.restoreHiddenContent = function () {
    var body = document.body;
    if (!body) return;
    body.classList.remove("modal-exclusive");
    var hidden = body.querySelectorAll("[data-hidden-by-exclusive]");
    hidden.forEach(function (el) {
      el.removeAttribute("data-hidden-by-exclusive");
      var prev = el.getAttribute("data-prev-style");
      if (prev != null) {
        if (prev) el.setAttribute("style", prev);
        else el.removeAttribute("style");
        el.removeAttribute("data-prev-style");
      } else {
        el.style.removeProperty("display");
      }
    });
  };
})();

/* ============================================================================
   LEGACY ERROR (lettura dinamica da tabella 5250) — "Copia dettagli" + "Chiudi"
============================================================================ */
(function () {
  function normalizeLegacyLabel(s){
    var t = normalizeTextForCheck(s);
    return t.replace(/[.\u2022\u00B7•]+/g, "").replace(/[:\s]+/g, " ").trim();
  }

  function hasLegacyError() {
    var rows = document.querySelectorAll("table tr");
    var hasMsg = false, hasHelp = false;
    for (var i=0;i<rows.length;i++){
      var r = rows[i]; if (!r.cells || r.cells.length<2) continue;
      var label = normalizeLegacyLabel(r.cells[0].textContent);
      if (/^(message|messaggio)\b/.test(label)) hasMsg  = true;
      if (/^(help|aiuto)\b/.test(label))        hasHelp = true;
      if (hasMsg && hasHelp) return true;
    }
    return false;
  }

  function extractLegacyError() {
    var res = { title:"Si è verificata un’eccezione", exception:"", message:"", help:"" };
    try{
      var tSpan = document.body.querySelector("span span");
      if (tSpan && tSpan.textContent) res.title = tSpan.textContent.replace(/\s+/g," ").trim();
      var rows = document.querySelectorAll("table tr");
      for (var i=0;i<rows.length;i++){
        var r = rows[i]; if (!r.cells || r.cells.length<2) continue;
        var label = normalizeLegacyLabel(r.cells[0].textContent);
        var value = (r.cells[1].textContent || "").replace(/\s+/g," ").trim();
        if (/^exception\b/.test(label))                res.exception = value;
        else if (/^(message|messaggio)\b/.test(label)) res.message   = value;
        else if (/^(help|aiuto)\b/.test(label))        res.help      = value;
      }
    }catch(e){}
    if (!res.exception) res.exception = "Sconosciuta";
    if (!res.message)   res.message   = "Errore non specificato.";
    return res;
  }

  window.showLegacyError = function () {
    if (document.getElementById("errorModal")) return;
    if (!hasLegacyError()) return;

    var d = extractLegacyError();

    var html = ''
      + '<dl class="row mb-0">'
      + '  <dt class="col-12 col-sm-3">Exception</dt>'
      + '  <dd class="col-12 col-sm-9"><span class="text-break">'+escapeHtmlForModal(d.exception)+'</span></dd>'
      + '  <dt class="col-12 col-sm-3">Messaggio</dt>'
      + '  <dd class="col-12 col-sm-9">'+escapeHtmlForModal(d.message)+'</dd>'
      + '  <dt class="col-12 col-sm-3">Help</dt>'
      + '  <dd class="col-12 col-sm-9">'+escapeHtmlForModal(d.help)+'</dd>'
      + '</dl>';

    // Footer: aggiungo "Chiudi"
    var footer =
      '<button type="button" class="btn btn-light" id="btnCopyError">Copia dettagli</button> ' +
      '<button type="button" class="btn btn-outline-secondary" id="errorModalCloseBtn">Chiudi</button>';

    var modalHTML = buildBootstrapModal({
      id: "errorModal", variant: "danger", title: d.title, html: html, footerHtml: footer
    });

    var wrap = document.createElement("div");
    wrap.innerHTML = modalHTML;
    document.body.appendChild(wrap.firstChild);

    // Disabilita e NASCONDE la X (ma resta nel DOM)
    var btnX = document.getElementById("errorModalCloseX");
    if (btnX) {
      btnX.setAttribute("disabled", "true");
      btnX.style.pointerEvents = "none";
      btnX.style.visibility = "hidden";
    }

    // Nascondi tutto il resto
    hideNonModalContent("errorModal");

    // Wiring pulsanti e ripristino body
    var btnCopy = document.getElementById("btnCopyError");
    var btnC    = document.getElementById("errorModalCloseBtn");
    var el      = document.getElementById("errorModal");

    if (btnCopy) btnCopy.onclick = function(){
      var txt = "Exception: "+d.exception+"\n"+"Messaggio: "+d.message+"\n"+"Help: "+d.help;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
      else {
        var ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta);
        ta.select(); try{ document.execCommand("copy"); }catch(e){} document.body.removeChild(ta);
      }
      btnCopy.textContent="Copiato!"; setTimeout(function(){ btnCopy.textContent="Copia dettagli"; },1500);
    };

    // "Chiudi" → chiude la finestra/scheda
    if (btnC) btnC.onclick = function(){ restoreHiddenContent(); safeCloseWindowOrBack(); };

    if (window.bootstrap && el) el.addEventListener("hidden.bs.modal", restoreHiddenContent, { once:true });

    showBootstrapModal("errorModal");
  };
})();

/* ============================================================================
   SESSION EXPIRED (mostra HTML del BODY) — "Copia dettagli" + "Chiudi"
============================================================================ */
(function () {
  function hasSessionExpired() {
    var t = normalizeTextForCheck(document.body && document.body.textContent);
    return t.indexOf("la tua sessione e scaduta") !== -1 || t.indexOf("sessione scaduta") !== -1;
  }

  function extractSessionExpired() {
    var res = { title:"Sessione scaduta", messageHtml:"" };
    try {
      var b = document.body;
      if (b) res.messageHtml = (b.innerHTML || "").trim(); // HTML originale
    } catch(e){}
    if (!res.messageHtml) res.messageHtml = "La tua sessione è scaduta.";
    return res;
  }

  window.showSessionExpired = function(){
    if (document.getElementById("sessionModal")) return;
    if (!hasSessionExpired()) return;

    var d = extractSessionExpired();

    // Footer: aggiungo "Chiudi"
    var footer =
      '<button type="button" class="btn btn-light" id="btnCopySession">Copia dettagli</button> ' +
      '<button type="button" class="btn btn-outline-secondary" id="sessionModalCloseBtn">Chiudi</button>';

    var modalHTML = buildBootstrapModal({
      id: "sessionModal", variant: "warning", title: d.title, html: d.messageHtml, footerHtml: footer
    });

    var wrap = document.createElement("div");
    wrap.innerHTML = modalHTML;
    document.body.appendChild(wrap.firstChild);

    // Disabilita e NASCONDE la X
    var btnX = document.getElementById("sessionModalCloseX");
    if (btnX) {
      btnX.setAttribute("disabled", "true");
      btnX.style.pointerEvents = "none";
      btnX.style.visibility = "hidden";
    }

    // Nascondi tutto il resto
    hideNonModalContent("sessionModal");

    // Wiring pulsanti e ripristino body
    var btnCopy = document.getElementById("btnCopySession");
    var btnC    = document.getElementById("sessionModalCloseBtn");
    var el      = document.getElementById("sessionModal");

    if (btnCopy) btnCopy.onclick = function(){
      var txt = htmlToPlainText(d.messageHtml);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
      else {
        var ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta);
        ta.select(); try{ document.execCommand("copy"); }catch(e){} document.body.removeChild(ta);
      }
      btnCopy.textContent="Copiato!"; setTimeout(function(){ btnCopy.textContent="Copia dettagli"; },1500);
    };

    // "Chiudi" → chiude la finestra/scheda
    if (btnC) btnC.onclick = function(){ restoreHiddenContent(); safeCloseWindowOrBack(); };

    if (window.bootstrap && el) el.addEventListener("hidden.bs.modal", restoreHiddenContent, { once:true });

    showBootstrapModal("sessionModal");
  };
})();

/* ============================================================================
   SESSION CLOSED (mostra HTML da #close-browser-msg) — "Copia dettagli" + "Chiudi"
============================================================================ */
(function () {
  function hasSessionClosed() {
    var div = document.getElementById("close-browser-msg");
    if (!div) return false;
    var t = normalizeTextForCheck(div.textContent || "");
    return t.indexOf("la sessione si e conclusa") !== -1 ||
           t.indexOf("chiudere la finestra del browser") !== -1;
  }

  function extractSessionClosed() {
    var res = { title:"Sessione terminata", messageHtml:"" };
    try {
      var el = document.getElementById("close-browser-msg");
      if (el) res.messageHtml = (el.innerHTML || "").trim(); // HTML originale
    } catch(e){}
    if (!res.messageHtml) {
      res.messageHtml = "La sessione si è conclusa.<br><br>Per completare la chiusura della sessione, chiudere la finestra del browser.";
    }
    return res;
  }

  window.showSessionClosed = function(){
    if (document.getElementById("sessionClosedModal")) return;
    if (!hasSessionClosed()) return;

    var d = extractSessionClosed();

    // Footer: aggiungo "Chiudi"
    var footer =
      '<button type="button" class="btn btn-light" id="btnCopyClosed">Copia dettagli</button> ' +
      '<button type="button" class="btn btn-outline-secondary" id="sessionClosedModalCloseBtn">Chiudi</button>';

    var modalHTML = buildBootstrapModal({
      id: "sessionClosedModal", variant: "secondary", title: d.title, html: d.messageHtml, footerHtml: footer
    });

    var wrap = document.createElement("div");
    wrap.innerHTML = modalHTML;
    document.body.appendChild(wrap.firstChild);

    // Disabilita e NASCONDE la X
    var btnX = document.getElementById("sessionClosedModalCloseX");
    if (btnX) {
      btnX.setAttribute("disabled", "true");
      btnX.style.pointerEvents = "none";
      btnX.style.visibility = "hidden";
    }

    // Nascondi tutto il resto
    hideNonModalContent("sessionClosedModal");

    // Wiring pulsanti e ripristino body
    var btnCopy = document.getElementById("btnCopyClosed");
    var btnC    = document.getElementById("sessionClosedModalCloseBtn");
    var el      = document.getElementById("sessionClosedModal");

    if (btnCopy) btnCopy.onclick = function(){
      var txt = htmlToPlainText(d.messageHtml);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
      else {
        var ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta);
        ta.select(); try{ document.execCommand("copy"); }catch(e){} document.body.removeChild(ta);
      }
      btnCopy.textContent="Copiato!"; setTimeout(function(){ btnCopy.textContent="Copia dettagli"; },1500);
    };

    // "Chiudi" → chiude la finestra/scheda
    if (btnC) btnC.onclick = function(){ restoreHiddenContent(); safeCloseWindowOrBack(); };

    if (window.bootstrap && el) el.addEventListener("hidden.bs.modal", restoreHiddenContent, { once:true });

    showBootstrapModal("sessionClosedModal");
  };
})();
