function redrawAdvanced_I0664LB() {
  setRedrawAdvanced.On();

  // ===== CONFIG =====
  const TBODY_SELECTOR = "#subfileTableTbody";
  const TABLE_SELECTOR = "#subfileTable";
  const TEXTAREA_ID = "subfileTextareaFull";
  const CHAR_COUNTER_ID = "subfileTextareaCounter";
  const LABEL_TEXT = "Descrizione nota";
  const FORCE_UPPERCASE = true;
  const PRESERVE_NL = true;
  const MAX_ROWS_VISUAL = 30;
  const WIDTH_REM = 85;   // larghezza logica

  // ===== Utilities =====
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);
  const toUpperMaybe = s => (FORCE_UPPERCASE ? s.toUpperCase() : s);
  const rtrim = str => str.replace(/\s+$/g, "");
  const debounce = (fn, ms = 40) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const tbody = $(TBODY_SELECTOR);
  const table = $(TABLE_SELECTOR);
  if (!tbody || !table) return;

  // ----- per riga: <input> oppure <div readonly [id][maxlength]> -----
  function getFieldElems() {
    const rows = $$("#subfileTableTbody tr");
    const elems = [];
    for (const tr of rows) {
      let el = tr.querySelector("input");
      if (!el) el = tr.querySelector('div[id][maxlength]');
      if (el) elems.push(el);
    }
    return elems;
  }
  function fieldGet(el) {
    if (!el) return "";
    return el.tagName === "INPUT" ? (el.value || "") : (el.textContent || "");
  }
  function fieldSet(el, val) {
    if (!el) return;
    if (el.tagName === "INPUT") { if (el.value !== val) el.value = val; }
    else { if (el.textContent !== val) el.textContent = val; }
    try { if (typeof pui !== "undefined" && pui.set) pui.set(el.id, val); } catch (_) { }
  }
  function fieldHide(el) {
    if (!el) return;
    if (!el.dataset.__visibleBeforeTextarea) el.dataset.__visibleBeforeTextarea = el.style.display || "";
    el.style.display = "none";
  }

  let fields = getFieldElems();
  if (!fields.length) return;

  const HAS_AT_LEAST_ONE_INPUT = fields.some(el => el.tagName === "INPUT");
  const IS_READONLY = !HAS_AT_LEAST_ONE_INPUT; // se tutti sono <div>, blocca textarea

  const LINE_LEN = Number(fields[0].getAttribute("maxlength")) || 66;
  const TOTAL_MAX = fields.length * LINE_LEN;

  // ---------- UI ----------
  // rimuovi eventuale struttura precedente
  const existingTA = document.getElementById(TEXTAREA_ID);
  if (existingTA) {
    const maybeOldContainer = existingTA.closest(".mb-3");
    if (maybeOldContainer && maybeOldContainer.querySelector("#" + CHAR_COUNTER_ID)) {
      try { maybeOldContainer.remove(); } catch (_) { }
    }
  }

  // container principale
  const container = document.createElement("div");
  container.className = "mb-3";

  // Label
  const label = document.createElement("label");
  label.className = "form-label fw-semibold mb-3";
  label.textContent = LABEL_TEXT;

  // MIDDLE: Textarea centrata
  const midRow = document.createElement("div");
  //midRow.style.width = `${WIDTH_REM}rem`;
  midRow.style.width = "100%";
  midRow.style.maxWidth = "100%";
  midRow.style.marginLeft = "auto";
  midRow.style.marginRight = "auto";
  midRow.setAttribute("tabindex", "-1");

  const ta = document.createElement("textarea");
  ta.id = TEXTAREA_ID;
  ta.classList.add("form-control", "formControl");
  ta.autocomplete = "off";
  ta.spellcheck = false;
  ta.style.width = "100%";
  ta.style.resize = "vertical";
  ta.style.whiteSpace = "pre-wrap";
  ta.style.minHeight = "10rem"

  if (IS_READONLY) {
    ta.readOnly = true;
    ta.setAttribute("aria-readonly", "true");
    ta.title = "Textarea bloccata: nessun campo modificabile disponibile";
    ta.classList.add("bg-light", "text-muted");
  }

  midRow.appendChild(ta);

  // BOTTOM: SOLO contatore CARATTERI a destra
  const bottomRow = document.createElement("div");
  bottomRow.className = "d-flex mt-1";
  //bottomRow.style.width = `${WIDTH_REM}rem`;
  bottomRow.style.width = "100%";
  bottomRow.style.maxWidth = "100%";
  bottomRow.style.marginLeft = "auto";
  bottomRow.style.marginRight = "auto";
  bottomRow.style.justifyContent = "end";
  bottomRow.setAttribute("tabindex", "-1");


  const charCounter = document.createElement("div");
  charCounter.id = CHAR_COUNTER_ID;
  charCounter.setAttribute("tabindex", "-1");
  charCounter.innerHTML = `<span class="badge rounded-pill bg-secondary" tabindex="-1">0 / ${TOTAL_MAX}</span>`;
  bottomRow.appendChild(charCounter);

  // monta PRIMA della tabella
  container.appendChild(label);
  container.appendChild(midRow);
  container.appendChild(bottomRow);
  table.parentElement.insertBefore(container, table);

  // Nascondi i campi originali + tabella
  fields.forEach(fieldHide);
  if (table) table.style.display = "none";

  // ---------- Logica editor ----------
  function splitHard(str, n) {
    const out = [];
    let i = 0;
    while (i < str.length) { out.push(str.slice(i, i + n)); i += n; }
    return out.length ? out : [""];
  }
  function autosize() {
    const lines = (ta.value.match(/\n/g) || []).length + 1;
    ta.rows = Math.min(Math.max(lines, 3), MAX_ROWS_VISUAL);
  }
  function effectiveLengthNoNewlines(s) {
    return (s || "").replace(/\r/g, "").replace(/\n/g, "").length;
  }

  function updateCounter() {
    const eff = effectiveLengthNoNewlines(ta.value);
    const isLimit = eff >= TOTAL_MAX;
    charCounter.innerHTML =
      `<span class="badge rounded-pill ${isLimit ? "bg-danger" : "bg-secondary"}" tabindex="-1">${eff} / ${TOTAL_MAX}</span>`;
  }

  function hydrateTextareaFromRows() {
    fields = getFieldElems();
    if (!fields.length) return;
    const rawLines = fields.map(el => fieldGet(el) || "");
    let text = rawLines.map(rtrim).join("");
    text = text.replace(/\s+$/g, "");
    ta.value = toUpperMaybe(text);
    autosize();
    updateCounter();
  }

  const distributeTextareaToRows = debounce(() => {
    fields = getFieldElems();
    if (!fields.length) return;

    let raw = ta.value || "";
    if (raw.includes("\r")) raw = raw.replace(/\r/g, "");
    raw = toUpperMaybe(raw);

    let chunks = [];
    if (PRESERVE_NL) {
      const manualLines = raw.split("\n");
      for (const m of manualLines) splitHard(m, LINE_LEN).forEach(c => chunks.push(c));
    } else {
      splitHard(raw.replace(/\n/g, ""), LINE_LEN).forEach(c => chunks.push(c));
    }
    if (chunks.length < fields.length) for (let i = chunks.length; i < fields.length; i++) chunks.push("");
    else if (chunks.length > fields.length) chunks = chunks.slice(0, fields.length);

    chunks.forEach((line, idx) => {
      const padded = line.slice(0, LINE_LEN);
      const el = fields[idx];
      if (!el) return;
      if (fieldGet(el) !== padded) fieldSet(el, padded);
    });

    autosize();
    updateCounter();
  }, 0);

  // ====== BLOCCO A TOTAL_MAX (solo caratteri utili; i \n restano permessi) ======
  function enforceMaxPayload() {
    let raw = ta.value.replace(/\r/g, "");
    let effLen = effectiveLengthNoNewlines(raw);
    if (effLen > TOTAL_MAX) {
      let chars = 0, result = "";
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch !== "\n") {
          if (chars >= TOTAL_MAX) break;
          chars++;
        }
        result += ch;
      }
      ta.value = result;
    }
  }

  // ---- Event binding (una sola volta) ----
  if (!ta.dataset.bound) {
    if (!IS_READONLY) {
      ta.addEventListener("input", () => {
        if (FORCE_UPPERCASE) ta.value = ta.value.toUpperCase();
        enforceMaxPayload();
        distributeTextareaToRows();
      });
      ta.addEventListener("paste", () => setTimeout(() => {
        ta.value = ta.value.replace(/\r/g, "");
        if (FORCE_UPPERCASE) ta.value = ta.value.toUpperCase();
        enforceMaxPayload();
        distributeTextareaToRows();
      }, 0));
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          const { selectionStart, selectionEnd, value } = ta;
          ta.value = value.slice(0, selectionStart) + "\n" + value.slice(selectionEnd);
          ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
          ta.dispatchEvent(new Event("input"));
        }
      });
    }
    ta.dataset.bound = "1";
  }

  // Setup iniziale
  ta.rows = Math.min(Math.max(3, fields.length), 12);
  ta.maxLength = TOTAL_MAX + fields.length; // consenti \n, blocco payload via enforce
  hydrateTextareaFromRows();

  // Nasconde recordTypeC
  document.querySelectorAll(".recordTypeC .container5250").forEach(div => {
    div.style.display = "none";
  });
}