(function (global) {
  'use strict';

  function _getDefaultTo() {
    try {
      if (global.properties && typeof global.properties.supportEmail === 'string') {
        const s = global.properties.supportEmail.trim();
        if (s) return s;
      }
    } catch (e) {}
    return '';
  }

  function normalizeRecipients(str) {
    if (!str) return '';
    return String(str).split(/[;,]/).map(s => s.trim()).filter(Boolean).join(',');
  }

  function canShareFiles(files) {
    try {
      return !!(navigator && navigator.canShare && files && navigator.canShare({ files }));
    } catch (e) {
      return false;
    }
  }

  function composeUrl(opts) {
    const {
      provider = 'outlook', // 'outlook' | 'gmail' | 'mailto'
      to = '',
      cc = '',
      bcc = '',
      subject = '',
      body = ''
    } = (opts || {});

    const _to = normalizeRecipients(to);
    const _cc = normalizeRecipients(cc);
    const _bcc = normalizeRecipients(bcc);

    if (provider === 'gmail') {
      let u = 'https://mail.google.com/mail/?view=cm&fs=1';
      if (_to) u += '&to=' + encodeURIComponent(_to);
      if (_cc) u += '&cc=' + encodeURIComponent(_cc);
      if (_bcc) u += '&bcc=' + encodeURIComponent(_bcc);
      if (subject) u += '&su=' + encodeURIComponent(subject);
      if (body) u += '&body=' + encodeURIComponent(body);
      return u;
    } else if (provider === 'mailto') {
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      if (_cc) params.set('cc', _cc);
      if (_bcc) params.set('bcc', _bcc);
      return 'mailto:' + encodeURIComponent(_to) + (params.toString() ? '?' + params.toString() : '');
    } else {
      // Outlook Web default
      const params = new URLSearchParams();
      if (_to) params.set('to', _to);
      if (_cc) params.set('cc', _cc);
      if (_bcc) params.set('bcc', _bcc);
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      return 'https://outlook.office.com/mail/deeplink/compose?' + params.toString();
    }
  }

  function openCompose(opts) {
    const url = composeUrl(opts || {});
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      location.href = url; // extreme fallback
    }
  }

  async function _buildSnapshotFile() {
    if (!global.htmlSnapshot || typeof global.htmlSnapshot.buildHtml !== 'function') {
      throw new Error('htmlSnapshot.buildHtml() not available. Load utility_snapshot.js before utility_email.js.');
    }
    const { html, filename } = await global.htmlSnapshot.buildHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const file = new File([blob], filename, { type: 'text/html' });
    return { blob, file, filename };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function sendSnapshot(opts) {
    const {
      provider = 'outlook',
      to = _getDefaultTo(),
      cc = '',
      bcc = '',
      subjectPrefix = 'Snapshot',
      bodyPrefix = 'In allegato lo snapshot della pagina.',
      includeUrlInBody = true
    } = (opts || {});

    // soggetto contestuale (se disponibile)
    let programName = '';
    try {
      if (global.getProgramName && typeof global.getProgramName.name === 'function') {
        programName = String(global.getProgramName.name() || '').trim();
      }
    } catch (e) {}

    const subject = programName ? `${subjectPrefix} - ${programName}` : subjectPrefix;
    const body = bodyPrefix
      + (includeUrlInBody ? `\n\nURL: ${location.href}` : '')
      + `\n\nSe l'allegato non è presente automaticamente, allega il file scaricato.`;

    // genera file snapshot
    const { blob, file, filename } = await _buildSnapshotFile();

    // tenta Web Share (allegato diretto su mobile/alcuni browser)
    try {
      if (canShareFiles([file])) {
        await navigator.share({ title: subject, text: body, files: [file] });
        return;
      }
    } catch (e) {
      // ignore
    }

    // fallback: download + compose web
    downloadBlob(blob, filename);
    openCompose({ provider, to, cc, bcc, subject, body });
  }

  // API pubblica
  const api = {
    normalizeRecipients,
    canShareFiles,
    composeUrl,
    openCompose,
    sendSnapshot,
    downloadBlob,
    // export interno utile: se vuoi riutilizzare il file altrove
    _buildSnapshotFile
  };

  global.emailUtil = api;
})(window);
