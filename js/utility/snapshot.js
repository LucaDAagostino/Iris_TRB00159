window.htmlSnapshot = (function () {
  // ====== CONFIG ======
  const LOG = false;                        // true per log diagnostici
  const DEFAULT_SELF_CONTAINED = true;      // inlinare CSS/IMG/font
  const DEFAULT_INCLUDE_CREDENTIALS = false;// true se le immagini richiedono cookie/session

  // ====== UTILS ======
  const ABS = (u) => new URL(u, location.href).href;

  // ---- naming helpers (skin, program, timestamp, titolo, filename) ----
  function _zero(n){ return String(n).padStart(2, '0'); }
  function _timestamp(){
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = _zero(d.getMonth()+1);
    const dd   = _zero(d.getDate());
    const HH   = _zero(d.getHours());
    const MM   = _zero(d.getMinutes());
    const SS   = _zero(d.getSeconds());
    return `${yyyy}-${mm}-${dd}_${HH}-${MM}-${SS}`;
  }
  function _safeFilename(s){
    return String(s || '')
      .replace(/[\/\\:\*\?"<>\|]+/g, '-')  // caratteri non validi
      .replace(/\s+/g, '_')                // spazi -> _
      .replace(/_+/g, '_')                 // comprimi _
      .replace(/^_+|_+$/g, '');            // trim _
  }
  function _getProgramName(){
    try {
      if (typeof getProgramName === 'object' && typeof getProgramName.name === 'function') {
        return String(getProgramName.name() || '').trim();
      }
    } catch(_) {}
    return '';
  }
  function _getSkin(){
    try {
      return (typeof pui === 'object' && pui && typeof pui.skin === 'string')
        ? pui.skin.trim()
        : '';
    } catch(_) { return ''; }
  }
  function _computeBaseName(){ // Snapshot_<skin>_<program>_<timestamp>
    const parts = ['Snapshot'];
    const skin = _getSkin();
    const prog = _getProgramName();
    if (skin) parts.push(skin);
    if (prog) parts.push(prog);
    parts.push(_timestamp());
    return parts.join('_');
  }
  function _ensureTitle(root, titleText){
    let head = root.querySelector('head');
    if (!head) {
      head = root.ownerDocument.createElement('head');
      const htmlEl = root.querySelector('html') || root;
      htmlEl.insertBefore(head, htmlEl.firstChild);
    }
    let t = head.querySelector('title');
    if (!t) { t = root.ownerDocument.createElement('title'); head.appendChild(t); }
    t.textContent = titleText;
  }

  // ====== FETCH ======
  async function fetchText(url, includeCredentials) {
    try {
      const r = await fetch(url, {
        mode: 'cors',
        credentials: includeCredentials ? 'include' : 'same-origin',
      });
      if (!r.ok) throw 0;
      return await r.text();
    } catch {
      LOG && consoleLog.warn('[snapshot] CSS fetch failed: ' + url);
      return '';
    }
  }
  async function fetchAsDataURL(url, includeCredentials) {
    try {
      const r = await fetch(url, {
        mode: 'cors',
        credentials: includeCredentials ? 'include' : 'same-origin',
      });
      if (!r.ok) throw 0;
      const b = await r.blob();
      return await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(b);
      });
    } catch {
      LOG && consoleLog.warn('[snapshot] IMG/font fetch failed: ' + url);
      return '';
    }
  }

  // ====== CSS inlining ======
  // url(...) nei CSS -> data:URL (se possibile), altrimenti URL assoluto
  async function inlineCssUrls(cssText, baseHref, includeCredentials) {
    const re = /url\(\s*(['"]?)(?!data:|blob:|about:|chrome-extension:)([^'")]+)\1\s*\)/g;
    const uniques = new Map();
    let m;
    while ((m = re.exec(cssText)) !== null) {
      const rel = m[2].trim();
      let abs;
      try { abs = new URL(rel, baseHref || location.href).href; } catch { continue; }
      if (!uniques.has(m[0])) uniques.set(m[0], abs);
    }
    const replacements = await Promise.all(
      [...uniques].map(async ([token, abs]) => {
        const data = await fetchAsDataURL(abs, includeCredentials);
        const target = data || abs;
        return [token, `url("${target}")`];
      })
    );
    let out = cssText;
    for (const [from, to] of replacements) out = out.split(from).join(to);
    return out;
  }

  // Risolve @import … ricorsivamente e poi inlina gli url(...)
  async function resolveCssImports(cssText, baseHref, includeCredentials) {
    const impRe = /@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?\s*([^;]*);/g;
    let out = cssText, m;
    const tasks = [];
    while ((m = impRe.exec(cssText))) {
      const href = ABS(new URL(m[1], baseHref).href);
      tasks.push((async () => {
        const sub = await fetchText(href, includeCredentials);
        const subResolved = await resolveCssImports(sub, href, includeCredentials);
        const subInlined = await inlineCssUrls(subResolved, href, includeCredentials);
        out = out.replace(m[0], subInlined);
      })());
    }
    await Promise.all(tasks);
    return out;
  }

  // <link rel="stylesheet"> -> <style> con CSS (font/immagini inclusi)
  async function inlineExternalStyles(root, includeCredentials) {
    const links = Array.from(root.querySelectorAll('link[rel="stylesheet"][href]'));
    for (const link of links) {
      const href = link.getAttribute('href');
      const abs = ABS(href);
      const raw = await fetchText(abs, includeCredentials);
      if (!raw) { LOG && consoleLog.warn('[snapshot] Do <link> (no CORS): ' +  abs); continue; }
      const withImports = await resolveCssImports(raw, abs, includeCredentials);
      const inlined = await inlineCssUrls(withImports, abs, includeCredentials);
      const style = root.ownerDocument.createElement('style');
      style.setAttribute('data-inlined-from', abs);
      style.textContent = inlined;
      link.replaceWith(style);
    }
  }

  // Inlina url(...) anche negli ATTRIBUTI style="..."
  async function inlineStyleAttributes(root, includeCredentials) {
    const nodes = Array.from(root.querySelectorAll('[style*="url("]'));
    for (const el of nodes) {
      const styleText = el.getAttribute('style');
      if (!styleText) continue;
      const patched = await inlineCssUrls(styleText, location.href, includeCredentials);
      el.setAttribute('style', patched);
    }
  }

  // ====== DOM normalizzazione ======
  // Salva negli IMG ORIGINALI l'URL effettivo usato in pagina (currentSrc/src)
  function annotateImageSources() {
    document.querySelectorAll('img').forEach((img) => {
      const eff = img.currentSrc || img.src || img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (eff) img.setAttribute('data-snapshot-src', eff);
    });
  }

  function fixForms(root) {
    root.querySelectorAll('input,textarea,select').forEach(el => {
      const tag = el.tagName;
      const type = (el.getAttribute('type') || '').toLowerCase();
      const mask = type === 'password' || el.matches('[data-private]');
      if (tag === 'TEXTAREA') {
        el.textContent = mask ? '***' : (el.value ?? '');
      } else if (tag === 'SELECT') {
        Array.from(el.options).forEach(o => o.selected ? o.setAttribute('selected', 'selected') : o.removeAttribute('selected'));
      } else {
        if (type === 'checkbox' || type === 'radio') {
          el.checked ? el.setAttribute('checked', 'checked') : el.removeAttribute('checked');
        } else if (type === 'file') {
          el.value = '';
        } else {
          el.setAttribute('value', mask ? '***' : (el.value ?? ''));
        }
      }
    });
  }

  function inlineCanvas(root) {
    root.querySelectorAll('canvas').forEach(cv => {
      try {
        const img = root.ownerDocument.createElement('img');
        img.src = cv.toDataURL('image/png'); img.width = cv.width; img.height = cv.height;
        cv.replaceWith(img);
      } catch {}
    });
  }

  // Inlina <img>: usa data-snapshot-src (effettivo), altrimenti src; se CORS fallisce → URL assoluto
  async function inlineImages(root, includeCredentials) {
    const imgs = Array.from(root.querySelectorAll('img'));
    await Promise.all(imgs.map(async img => {
      const annotated = img.getAttribute('data-snapshot-src');
      const srcAttr = img.getAttribute('src');
      const eff = annotated || srcAttr;
      if (!eff) return;
      const abs = ABS(eff);
      const data = await fetchAsDataURL(abs, includeCredentials);
      img.setAttribute('src', data || abs);
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    }));
  }

  function absolutize(root) {
    root.querySelectorAll('[src]').forEach(el => {
      const v = el.getAttribute('src'); if (v && !/^data:/.test(v)) el.setAttribute('src', ABS(v));
    });
    root.querySelectorAll('a[href],link[href]').forEach(el => {
      const v = el.getAttribute('href'); if (v && !/^data:|^mailto:|^javascript:/i.test(v)) el.setAttribute('href', ABS(v));
    });
  }

  function stripScripts(root) {
    root.querySelectorAll('script').forEach(s => s.remove());
    root.querySelectorAll('*').forEach(n => {
      [...n.attributes].forEach(a => { if (/^on/i.test(a.name)) n.removeAttribute(a.name); });
    });
  }

  // ====== BUILD / SAVE ======
  async function buildHtml(opts = {}) {
    const {
      rootElement = document.documentElement,
      selfContained = DEFAULT_SELF_CONTAINED,
      filename, // se passato, ha priorità
      includeCredentials = DEFAULT_INCLUDE_CREDENTIALS
    } = opts;

    // Nome base: Snapshot_<skin>_<program>_<timestamp>
    const base = _computeBaseName();

    // 1) annota gli <img> con l’URL effettivo (prima del clone!)
    try { annotateImageSources(); } catch {}

    // 2) attendi i font
    try { if (document.fonts?.ready) await document.fonts.ready; } catch {}

    // 3) clona
    const clone = rootElement.cloneNode(true);

    // 4) imposta il titolo HTML
    _ensureTitle(clone, base);

    // 5) normalizza e proteggi
    fixForms(clone);
    inlineCanvas(clone);
    stripScripts(clone);
    absolutize(clone);

    if (selfContained) {
      // CSS esterni e url(...) negli style inline
      await inlineExternalStyles(clone, includeCredentials);
      await inlineStyleAttributes(clone, includeCredentials);
    }

    // Immagini
    await inlineImages(clone, includeCredentials);

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;

    // Filename finale
    const finalName = filename || (_safeFilename(base) + '.html');

    return { html, filename: finalName };
  }

  async function save(opts = {}) {
    const { html, filename } = await buildHtml(opts);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { save, buildHtml };
})();
