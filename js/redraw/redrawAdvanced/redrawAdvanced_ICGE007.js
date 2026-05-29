function redrawAdvanced_ICGE007() {
  setRedrawAdvanced.On();

  const tbody = document.querySelector('#subfileTableTbody');
  if (!tbody) return;

  // Header: Partita (6) + Movimenti (7)
  const thead = document.querySelector('#subfileTableThead');
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th rowspan="2" data-keep="true">Opz</th>
        <th colspan="6" class="text-center" data-keep="true">Partita</th>
        <th colspan="7" class="text-center" data-keep="true">Movimenti</th>
      </tr>
      <tr>
        <!-- WK-RIGAT -->
        <th data-keep="true">Anno</th>
        <th data-keep="true">Codice</th>
        <th data-keep="true">Ind. gest.</th>
        <th data-keep="true">Saldo</th>
        <th data-keep="true">Controvalore</th>
        <th data-keep="true">D/A</th>
        <!-- WK-RIGA1 -->
        <th data-keep="true">Causale</th>
        <th data-keep="true">Divisa</th>
        <th data-keep="true">Data Competenza</th>
        <th data-keep="true">Data Scadenza</th>
        <th data-keep="true">Importo</th>
        <th data-keep="true">Controvalore</th>
        <th data-keep="true">D/A</th>
      </tr>
    `;
    thead.querySelectorAll("th").forEach(th => th.dataset.keep = "true");
  }

  const rows = tbody.querySelectorAll('tr');

  rows.forEach(row => {
    const opzCell  = row.querySelector('td:first-child');
    const descCell = row.querySelector('td.text-start.align-middle, td[colspan="7"].align-middle') || row.children[1];
    if (!descCell || !opzCell) return;

    const rawText = (descCell.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const parsed = parseRiga_ICGE007(rawText);

    const cells = [];
    cells.push(opzCell.cloneNode(true)); // Opz invariata

    const wkType = parsed?.wkType;
    const rg = parsed?.rigat || {};
    const r1 = parsed?.riga1 || {};

    // =========== PARTITA (6) ===========
    let partitaVals = ['', '', '', '', '', '']; // default vuoto

    if (wkType === 'rigat') {
      // riga "Partita ..."
      partitaVals = [
        rg.ANPRTCN || '',   // Anno
        rg.CDPRTCN || '',   // Codice
        rg.FLGST   || '',   // Ind. gest.
        rg.TOTALE  || '',   // Saldo
        rg.TOTALECTV || '', // Controvalore
        rg.CDSEGCNI || ''   // D/A
      ];
    }
    // NB: per rigat2 (TOTALE ...) vogliamo lasciare il blocco Partita vuoto

    partitaVals.forEach((val, idx) => {
      const td = document.createElement('td');
      td.classList.add('align-middle');
      if (idx === 3 || idx === 4) td.classList.add('text-end');               // Saldo, Controvalore
      if (idx === 2 || idx === 5) td.classList.add('text-center','text-uppercase'); // Ind., D/A
      td.textContent = val;
      cells.push(td);
    });

    // =========== MOVIMENTI (7) ===========
    // Ordine: [Causale, Divisa, Dt Comp, Dt Scad, Importo, Controvalore, D/A]
    let movVals = ['', '', '', '', '', '', ''];

    if (wkType === 'riga1') {
      movVals = [
        r1.CDCAUCTB || r1.causale || '',
        r1.SIDIVUIC || r1.divisa || '',
        r1.DTCMPCTB || r1.dataComp || '',
        r1.DTSCVU   || r1.dataScad || '',
        r1.IMMOV    || r1.importo || '',
        r1.CONTROVAL|| r1.controvalore || '',
        r1.DA       || r1.da || ''
      ];
    } else if (wkType === 'rigat2') {
      // <<< Richiesta: la riga TOTALE riempie "Controvalore" e "D/A" dei MOVIMENTI
      movVals[4] = 'Totali';          // <-- Importo = "Totali"
      movVals[5] = rg.TOTALE   || ''; // Controvalore
      movVals[6] = rg.CDSEGCNI || ''; // D/A
    }

    movVals.forEach((val, idx) => {
      const td = document.createElement('td');
      td.classList.add('align-middle');
      if (idx === 4 || idx === 5) td.classList.add('text-end');               // Importo, Controvalore
      if (idx === 6) td.classList.add('text-center','text-uppercase');        // D/A
      td.textContent = val;
      cells.push(td);
    });

    // stile per evidenziare i totali
    if (wkType === 'rigat2') {
      row.style.fontWeight = 'bold';
    }

    replaceRowCellsPreservingInputs(row, cells);
    uniformizeBodyTdCount("subfileTable");
  });
}

function parseRiga_ICGE007(text) {
  const s = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const numIT = /(?:\d{1,3}(?:\.\d{3})*|\d+),\d{3}/g;
  const lastTok = (t) => (t.split(' ').filter(Boolean).pop() || '');
  const lastDA  = (t) => {
    const tok = lastTok(t);
    return /^[DA]$/i.test(tok) ? tok.toUpperCase() : '';
  };

  // --- WK-RIGAT: "Partita <ANNO> [<CODICE>] [<IND>] ... <TOTALE> ... <TOTALECTV> <D/A>"
  if (/^Partita\b/i.test(s)) {
    const mAnno = s.match(/^Partita\s+(\d{4})/i);
    let rest = s.replace(/^Partita\s+\d{4}\s*/i, '');

    let mCod  = rest.match(/^([A-Z0-9]{5,13})\b/);
    if (mCod) rest = rest.slice(mCod[0].length).trim();

    let mFlg  = rest.match(/^([A-Za-z])\b/);
    if (mFlg) rest = rest.slice(mFlg[0].length).trim();

    const amounts = s.match(numIT) || [];
    const segno = lastDA(s);

    return {
      wkType: 'rigat',
      rigat: {
        ANPRTCN:  mAnno ? mAnno[1] : '',
        CDPRTCN:  mCod  ? mCod[1]  : '',
        FLGST:    mFlg  ? mFlg[1]  : '',
        TOTALE:   amounts[0] || '',
        TOTALECTV:amounts[1] || '',
        CDSEGCNI: segno
      }
    };
  }

  // --- WK-RIGAT2: "TOTALE ... <importo> ... <D/A>"
  if (/^TOTALE\b/i.test(s)) {
    const amounts = s.match(numIT) || [];
    const segno   = lastDA(s);
    return {
      wkType: 'rigat2',
      rigat: {
        TOTALE:   amounts[0] || '',
        CDSEGCNI: segno
      }
    };
  }

  // --- WK-RIGA1: movimento
  const r1 = s.match(
    /^([A-Z0-9]{2,5})\s+([A-Z]{3})\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+((?:\d{1,3}(?:\.\d{3})*|\d+),\d{3})\s+((?:\d{1,3}(?:\.\d{3})*|\d+),\d{3})\s+([DA])$/i
  );
  if (r1) {
    return {
      wkType: 'riga1',
      riga1: {
        CDCAUCTB:  r1[1],
        SIDIVUIC:  r1[2],
        DTCMPCTB:  r1[3],
        DTSCVU:    r1[4],
        IMMOV:     r1[5],
        CONTROVAL: r1[6],
        DA:        r1[7].toUpperCase()
      }
    };
  }

  // fallback “mov” permissivo (importi + D/A in coda)
  const tail = s.match(/((?:\d{1,3}(?:\.\d{3})*|\d+),\d{3})\s+((?:\d{1,3}(?:\.\d{3})*|\d+),\d{3})\s+([DA])$/i);
  if (tail) {
    const dates = s.match(/\d{2}\/\d{2}\/\d{4}/g) || [];
    const div   = (s.match(/\b[A-Z]{3}\b/) || [])[0] || '';
    const caus  = (s.match(/^[A-Z0-9]{2,5}\b/) || [])[0] || '';
    return {
      wkType: 'riga1',
      riga1: {
        CDCAUCTB:  caus,
        SIDIVUIC:  div,
        DTCMPCTB:  dates[0] || '',
        DTSCVU:    dates[1] || '',
        IMMOV:     tail[1],
        CONTROVAL: tail[2],
        DA:        tail[3].toUpperCase()
      }
    };
  }

  return null;
}
