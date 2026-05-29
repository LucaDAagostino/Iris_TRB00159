function redrawAdvanced_I9104LB() {
  setRedrawAdvanced?.On?.(); // se presente

  const emulator = document.getElementById("5250");
  if (!emulator) return;

  // 1) RIMUOVI dal DOM tutti gli elementi con flduse="L"
  emulator.querySelectorAll('[flduse="L"]').forEach(el => el.remove());


  emulator.querySelectorAll('[fldname="VDDTERNG"]').forEach(el => {
    const raw = (typeof el.value === "string" ? el.value : el.textContent) || "";
    let s = raw.replace(/\u00a0/g, " ");
    const cut = s.indexOf("<");
    if (cut !== -1) s = s.slice(0, cut);
    s = s.replace(/\s+$/g, "");
    if (typeof el.value === "string") el.value = s; else el.textContent = s;
  });

  function getName(nameAttr) {
    if (!nameAttr) return "";
    const el = emulator.querySelector(`[name="${nameAttr}"]`);
    return (el?.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getText(id) {
    const el = document.getElementById(id);
    return (el?.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getInputVal(row) {
    const el = document.getElementById(`I_${row}_23`);
    if (!el) return "";
    return (el.value ?? el.textContent ?? "")
      .replace(/\u00a0/g, " ")
      .trim();
  }

  const labels = Array.from(emulator.querySelectorAll('.labelField[id^="D_"]'));

  const fields = [];
  labels.forEach((labelEl) => {
    const id = labelEl.id;
    const m = id.match(/^D_(\d+)_/);
    if (!m) return;
    const row = m[1];

    const label = (labelEl.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const value = getInputVal(row);
    const code = getText(`D_${row}_82`);
    const codeDesc = getText(`D_${row}_86`);

    if (!label && !value && !code && !codeDesc) return;

    fields.push({ row: +row, label, value, code, codeDesc });
  });

  fields.sort((a, b) => a.row - b.row);
  uniformizeBodyTdCount?.("subfileTable");
}