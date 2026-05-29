function redrawAdvanced_I0403LB() {
  setRedrawAdvanced.On();

  const container = document.getElementById('detail_I0403LB00V');
  if (!container) return;

  const hideNames = new Set([
    'I0403LB00V_I0403LB01R_LABEL06006',
    'I0403LB00V_I0403LB01R_LABEL07004',
    'InputField14'
  ]);

  // seleziono tutti i campi con fldname
  const fields = container.querySelectorAll('[fldname]');

  fields.forEach((el) => {
    // FIX: attributo corretto è "fldname"
    const fldname = (el.getAttribute('fldname') || '').trim().toUpperCase();
    const nameAttr = (el.getAttribute('name') || '').trim();


    // nuova condizione: nascondo se VDSCT* oppure se name è in blacklist
    if (!fldname.startsWith('VDSCT') && !hideNames.has(nameAttr)) return;


    el.setAttribute('data-hide-fldname', '1');
    el.style.display = 'none';

    // nascondo label associata
    const id = el.id;
    if (id) {
      const lbl = container.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lbl) {
        lbl.textContent = '\u00A0';
        lbl.style.display = 'none';
      }
    }
  });

  // ✅ sicurezza extra: se uno dei 3 name non ha fldname (es. InputField14), lo nascondo qui
  container.querySelectorAll('[name]').forEach((el) => {
    const nameAttr = (el.getAttribute('name') || '').trim();
    if (!hideNames.has(nameAttr)) return;

    el.style.display = 'none';

    const id = el.id;
    if (id) {
      const lbl = container.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lbl) lbl.style.display = 'none';
    }
  });
}

