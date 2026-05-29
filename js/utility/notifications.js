// === utility_notifications.js (fixed) ===
(function () {
  // Namespace robusto per contatori e stato
  const notif = (window.notifications = window.notifications || {
    total: 0,
    partial: 0
  });

  // Helper: safe query
  const $id = (id) => document.getElementById(id);

  function updateNotificationBadge(count) {
    const button = $id('notificationButton');
    const badge = $id('notificationBadge');
    if (!button || !badge) return;

    // assicurati che il bottone sia position-relative per l'ancoraggio del badge
    button.classList.add('position-relative');

    // Se esiste una variabile globale "notificationMessage", preserva il comportamento
    const hasMessageFlag =
      (typeof window.notificationMessage !== 'undefined') && !!window.notificationMessage;

    // reset totale del badge
    badge.className = '';
    badge.removeAttribute('style');
    badge.textContent = '';
    badge.setAttribute('tabindex', '-1');

    // classi comuni di badge_classizionamento
    const BADGE_CLASS = ['position-absolute', 'top-0', 'start-100', 'translate-middle'];

    if (hasMessageFlag) {
      // Pill con numero
      badge.classList.add(
        ...BADGE_CLASS,
        'badge', 'rounded-pill', 'bg-danger'
      );
      badge.setAttribute('aria-label', 'Notifiche');

    } else {
      // Dot tondo perfetto (no padding)
      badge.classList.add(
        ...BADGE_CLASS,
        'bg-danger', 'border', 'border-light', 'rounded-circle'
      );
      Object.assign(badge.style, {
        width: '.6rem',
        height: '.6rem',
        display: 'inline-block'
      });
      badge.setAttribute('aria-label', 'Nuove notifiche');
    }

    if (count > 0) {
      if (hasMessageFlag) {
        badge.textContent = count > 99 ? '99+' : String(count);
      }
      button.classList.remove('d-none');
    } else {
      // nessuna notifica: nascondi il bottone
      button.classList.add('d-none');
    }
  }

  function setupNotificationButton() {
    const button = $id('notificationButton');
    if (!button) return;

    button.addEventListener('click', () => {
      try {
        if (typeof window.pressKey === 'function') {
          window.pressKey('F2');
        } else if (window.pui && typeof pui.pressKey === 'function') {
          pui.pressKey('F2');
        }
      } catch (e) {
        consoleLog.warn('setupNotificationButton: pressKey not available', e);
      }
    });
  }

  function notifyMessage(elements) {
    const list = normalizeMessage(elements);
    list.forEach(el => {
      const messageText = (el.textContent || '').trim();
      if (!messageText) return;

      // Nasconde l’elemento messaggio (verrà ripristinato alla chiusura toast)
      el.style.visibility = 'hidden';

      // Tipo default
      let type = 'danger';
      if (messageText === 'Premere\u00A0F15\u00A0per\u00A0confermare\u00A0ignorando\u00A0i\u00A0messaggi\u00A0di\u00A0avviso.') {
        type = 'warning';
      } else if (messageText === "L'operazione\u00A0\u00E8\u00A0stata\u00A0effettuata\u00A0correttamente.") {
        type = 'success';
        resetMessage();
      }

      createMessage(messageText, type, el);
    });
  }

  function normalizeMessage(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (input instanceof NodeList) return Array.from(input);
    return [input];
  }

  function createMessage(messaggio, type, element) {
    const msg = (messaggio || '').trim();
    if (!msg) return;

    // Normalizza spazi per confronti e visualizzazione
    const nuovoMessaggio = msg.replace(/\s+/g, ' ');

    let containerPopup = $id('containerPopup');
    if (!containerPopup) {
      // fallback: crea il contenitore se non esiste
      containerPopup = document.createElement('div');
      containerPopup.id = 'containerPopup';
      document.body.appendChild(containerPopup);
    }

    // Evita duplicati
    const toasts = containerPopup.querySelectorAll('.toast-body');
    for (const toast of toasts) {
      const esistente = (toast.innerText || '').trim().replace(/\s+/g, ' ');
      if (esistente === nuovoMessaggio) return; // già presente
    }

    // Aggiorna contatori in namespace
    notif.total += 1;
    notif.partial += 1;
    updateNotificationBadge(notif.total);

    const color = type ? `text-bg-${type}` : 'text-bg-primary';

    const toastEl = document.createElement('div');
    toastEl.classList.add(
      'toast', 'align-items-center', color, 'border-0',
      'animate__animated', 'animate__fadeInUp', 'customToast'
    );
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fs-6 badge">${nuovoMessaggio}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    containerPopup.appendChild(toastEl);

    // Bootstrap Toast
    let toast;
    try {
      toast = new bootstrap.Toast(toastEl, { delay: 7000 });
      toast.show();
    } catch (e) {
      // Se Bootstrap non c'è, fallback minimale
      toastEl.style.display = 'block';
      setTimeout(() => toastEl.remove(), 7000);
    }

    // Ripristina l’elemento di origine alla chiusura
    toastEl.addEventListener('hidden.bs.toast', () => {
      if (element) element.style.visibility = 'visible';
      toastEl.remove();
    });

    // Chiusura automatica dopo 7s (trigga hidden.bs.toast)
    setTimeout(() => {
      try {
        const t = bootstrap.Toast.getInstance(toastEl);
        if (t) t.hide();
      } catch (_) {
        toastEl.remove();
      }
    }, 7000);
  }

  function resetMessage() {
    notif.total = 0;
    updateNotificationBadge(0);
    clearMessage();
  }

  function clearMessage() {
    notif.partial = 0;

    const container = $id('containerPopup');
    if (container) container.innerHTML = '';

    // Rimuove eventuali calendari flatpickr aperti (come già previsto)
    document.querySelectorAll('body .flatpickr-calendar.animate').forEach(el => {
      el.remove();
    });
  }

  function adjustPopupBottomVar(gapPx = 8, targetId = 'containerAlert') {
    const popup = $id('containerPopup');
    if (!popup) return;

    const target = $id(targetId);
    let offset = 0;

    if (target) {
      const cs = window.getComputedStyle(target);
      const visible = cs.display !== 'none' && cs.visibility !== 'hidden' && target.offsetHeight > 0;
      if (visible) {
        offset = Math.ceil(target.getBoundingClientRect().height);
      }
    }

    if (offset === 0) {
      const footer = $id('containerFooter');
      if (footer) offset = Math.ceil(footer.getBoundingClientRect().height);
    }

    popup.style.setProperty('--popup-bottom', `${offset + gapPx}px`);
  }

  function ensurePopupBottomListeners(targetId = 'containerAlert') {
    if (window.__popupBottomInit) return;
    window.__popupBottomInit = true;

    // Recalcolo su resize finestra
    window.addEventListener('resize', () => adjustPopupBottomVar(8, targetId));

    // Recalcolo quando cambia l’alert (mostra/nascondi/testo/classi)
    const alertEl = $id(targetId);
    if (alertEl) {
      const mo = new MutationObserver(() => adjustPopupBottomVar(8, targetId));
      mo.observe(alertEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
      window.__popupBottomObserver = mo; // opzionale per disconnessione futura
    }
  }

  // Esporta API su window per compatibilità
  window.updateNotificationBadge = updateNotificationBadge;
  window.setupNotificationButton = setupNotificationButton;
  window.notifyMessage = notifyMessage;
  window.normalizeMessage = normalizeMessage;
  window.createMessage = createMessage;
  window.resetMessage = resetMessage;
  window.clearMessage = clearMessage;
  window.adjustPopupBottomVar = adjustPopupBottomVar;
  window.ensurePopupBottomListeners = ensurePopupBottomListeners;
})();