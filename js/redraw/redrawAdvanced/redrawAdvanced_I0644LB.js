function redrawAdvanced_I0644LB() {
  const tbody = document.querySelector('#subfileTableTbody');
  const thead = document.querySelector('#subfileTableThead');

  // Nessun subfile in schermata: non fare nulla
  if (!tbody || !thead) {
    return;
  }

  setRedrawAdvanced.On();

  const rows = tbody.querySelectorAll('tr');

  rows.forEach(row => {
    const opzCell = row.querySelector('td:first-child');
    const descCell = row.querySelector('td.text-start.align-middle, td[colspan="7"].align-middle');

    if (!descCell || !opzCell) return;

    const rawText = descCell.textContent
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const parsed = parseRiga_I0644LB(rawText);

    // Evidenzia righe speciali (Totale)
    if (
      (parsed?.wkType === 'rigaT' || parsed?.wkType === 'rigaT2' || parsed?.wkType === 'rigaC') &&
      parsed?.descrizione?.toLowerCase().includes('totale')
    ) {
      const da = (parsed?.da || '').toUpperCase();

      if (da === 'D') {
        // Totale a debito → rosso
        row.classList.add('rowTotaleD');
      } else if (da === 'A') {
        // Totale a credito → verde
        row.classList.add('rowTotaleA');
      } else {
        // fallback, se per qualche motivo non c'è D/A
        row.classList.add('rowTotale');
      }
    }

    // ➜ RISALTO: se è riga Partita, aggiungo una classe al <tr>
    if (parsed?.wkType === 'rigaP') {
      row.classList.add('rowPartita'); // oltre al custom
    }

    let partitaAnno = '';
    let partitaNumero = '';
    let partitaTipo = '';
    let partitaSaldo = '';
    let partitaDa = '';

    if (parsed?.wkType === 'rigaP') {
      partitaAnno = parsed.annoPartita;
      partitaNumero = parsed.numeroPartita;
      partitaTipo = parsed.tipoPartita;
      partitaSaldo = parsed.saldoPartita;
      partitaDa = parsed.saldoDa || '';
    } else {
      // fallback per partite “embedded”
      const partitaMatch = rawText.match(/Partita\s+(\d{4})\s+(\d{8,11})/i);
      if (partitaMatch) {
        partitaAnno = partitaMatch[1];
        partitaNumero = partitaMatch[2];
      }
      const tipoSaldoMatch = rawText.match(/\b([A-Z]{3})\s+Sdo Partita\s+([\d.,]+)/i);
      if (tipoSaldoMatch) {
        partitaTipo = tipoSaldoMatch[1];
        partitaSaldo = tipoSaldoMatch[2];
      }
    }

    const cells = [];
    cells.push(opzCell.cloneNode(true)); // Opz

    // --- SEZIONE RIGA (al centro, dopo Opz) ---
    if (parsed?.wkType && parsed.wkType.startsWith('riga')) {
      const { data, tipo, descrizione, numero, dataRif, importo, da } = parsed;

      const cols = [
        { val: data, right: false, bold: false }, // Data
        { val: tipo, right: false, bold: true }, // Tipo -> GRASSETTO
        { val: descrizione, right: false, bold: false }, // Descrizione
        { val: numero, right: true, bold: false }, // Numero
        { val: dataRif, right: false, bold: false }, // Data Rif.
        { val: importo, right: true, bold: false }, // Importo
        { val: da, right: false, bold: false }  // D/A
      ];

      cols.forEach(({ val, right, bold }) => {
        const td = document.createElement('td');
        td.textContent = val || '';
        td.classList.add('align-middle');
        if (right) td.classList.add('text-end');
        if (bold && val) td.classList.add('fw-bold'); // Bootstrap grassetto
        cells.push(td);
      });

    } else {
      // Riga non parsata: metto il testo in un'unica cella nella sezione "Riga"
      const td = document.createElement('td');
      td.textContent = rawText;
      td.colSpan = 7;
      td.classList.add('align-middle');
      cells.push(td);
    }


    // --- SEZIONE PARTITA (spostata a destra, con Saldo in grassetto) ---
    [
      { key: 'anno', val: partitaAnno, right: true },
      { key: 'numero', val: partitaNumero, right: true },
      { key: 'tipo', val: partitaTipo, right: false },
      { key: 'saldo', val: partitaSaldo, right: true },
      { key: 'da', val: partitaDa, right: false }
    ].forEach(({ key, val, right }) => {
      const td = document.createElement('td');
      td.textContent = val || '';
      td.classList.add('align-middle');
      if (right) td.classList.add('text-end');

      // saldo in grassetto
      if (key === 'saldo' && val) {
        td.classList.add('fw-bold'); // Bootstrap
        // oppure: td.style.fontWeight = 'bold';
      }

      cells.push(td);
    });

    replaceRowCellsPreservingInputs(row, cells);
  });

  // Intestazione: sezione Partita spostata a destra
  thead.innerHTML = `
    <tr>
      <th rowspan="2">Opz</th>
      <th rowspan="2">Data valuta</th>
      <th rowspan="2">Tipo</th>
      <th rowspan="2">Descrizione</th>
      <th rowspan="2">Numero</th>
      <th rowspan="2">Data contabile</th>
      <th rowspan="2">Importo</th>
      <th rowspan="2">D/A</th>
      <th colspan="5" class="text-center">Partita</th>
    </tr>
    <tr>
      <th>Anno</th>
      <th>Numero</th>
      <th>Tipo</th>
      <th>Saldo</th>
      <th>D/A</th>
    </tr>
  `;
  // Protezione da removeEmptyDataColumnsFromList
  thead.querySelectorAll("th").forEach(th => {
    th.dataset.keep = "true";
  });
}

function parseRiga_I0644LB(text) {
  const cleaned = text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // ➤ WK-RIGA1 con numero documento
  // Data + descrizione movimento 22 + numero documento + data contabile + importo + D/A
  const fullMatch = cleaned.match(
    /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{8,10})\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)\s+([DA])$/i
  );

  if (fullMatch) {
    const rawMovimento = fullMatch[2].trim();

    let tipo = '';
    let descrizione = '';

    const notaCreditoMatch = rawMovimento.match(/^N\.?\s*CREDITO\s*(.*)$/i);

    if (notaCreditoMatch) {
      tipo = 'NOTA CREDITO';
      descrizione = notaCreditoMatch[1].trim();
    } else {
      const parts = rawMovimento.split(/\s+/);

      tipo = (parts.shift() || '').toUpperCase();
      descrizione = parts.join(' ').trim();
    }

    return {
      data: fullMatch[1],
      tipo: tipo,
      descrizione: descrizione,
      numero: fullMatch[3],
      dataRif: fullMatch[4],
      importo: fullMatch[5],
      da: fullMatch[6],
      wkType: 'riga1'
    };
  }

  // ➤ WK-RIGA1 senza numero documento
  // Es: 11/05/2026 EVID. spese insoluti 20,000 D
  const fullMatchNoNumero = cleaned.match(
    /^(\d{2}\/\d{2}\/\d{4})\s+(EVID\.)\s+(.+?)\s+([\d.,]+)\s+([DA])$/i
  );

  if (fullMatchNoNumero) {
    return {
      data: fullMatchNoNumero[1],
      tipo: fullMatchNoNumero[2].toUpperCase(),
      descrizione: fullMatchNoNumero[3].trim(),
      numero: '',
      dataRif: '',
      importo: fullMatchNoNumero[4],
      da: fullMatchNoNumero[5],
      wkType: 'riga1'
    };
  }


  // ➤ rigaS  
  const rigasMatch = cleaned.match(
    /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)\s+([DA])$/
  );
  if (rigasMatch) {
    const rawDesc = rigasMatch[2].trim();
    const upper = rawDesc.toUpperCase();

    let tipo = '';
    let descrizione = '';

    // Caso 1: GIROCONTO -> va in colonna Tipo
    if (upper === 'GIROCONTO') {
      tipo = 'GIROCONTO';
      descrizione = '';

      // Caso 2: INIZIA con "Maturaz.Canon..." -> Tipo = MATURAZIONE
    } else {
      // "Canon" con "e" finale opzionale, e prendo tutto quello che viene dopo
      const maturazMatch = rawDesc.match(/^Maturaz\.Canon[e]?\s*(.*)$/i);
      if (maturazMatch) {
        tipo = 'MATURAZIONE';
        const resto = (maturazMatch[1] || '').trim();   // es. "0000000001"
        descrizione = resto ? `Canone ${resto}` : 'Canone';
      } else {
        // Default: tutto in descrizione
        descrizione = rawDesc;
      }
    }

    return {
      data: rigasMatch[1],
      tipo,
      descrizione,
      numero: '',
      dataRif: rigasMatch[3],
      importo: rigasMatch[4],
      da: rigasMatch[5],
      wkType: 'rigaS'
    };
  }

  // ➤ rigaP 
  const rigapMatch = cleaned.match(
    /^Partita\s+(\d{4})\s+(\d{8,11})\s+([A-Z]{3})\s+Sdo Partita\s+([\d.,]+)(?:\s+([DA]))?$/i
  );
  if (rigapMatch) {
    return {
      annoPartita: rigapMatch[1],
      numeroPartita: rigapMatch[2],
      tipoPartita: rigapMatch[3],
      saldoPartita: rigapMatch[4],
      saldoDa: rigapMatch[5] || '',
      wkType: 'rigaP'
    };
  }

  // ➤ rigaP senza tipo (es. "Partita 4000 00001200060 Sdo Partita 1.568,360 A")
  const rigapNoTypeMatch = cleaned.match(
    /^Partita\s+(\d{4})\s+(\d{8,11})\s+Sdo Partita\s+([\d.,]+)\s+([DA])$/i
  );
  if (rigapNoTypeMatch) {
    return {
      annoPartita: rigapNoTypeMatch[1],
      numeroPartita: rigapNoTypeMatch[2],
      tipoPartita: '',
      saldoPartita: rigapNoTypeMatch[3],
      saldoDa: rigapNoTypeMatch[4],
      wkType: 'rigaP'
    };
  }

  // ➤ rigaC
  const rigacMatch = cleaned.match(
    /^(.{1,23})\s+(\d{6,8})\s+([\d.,]+)\s+([DA])$/
  );
  if (rigacMatch) {
    return {
      descrizione: rigacMatch[1].trim(),
      numero: rigacMatch[2],
      importo: rigacMatch[3],
      da: rigacMatch[4],
      wkType: 'rigaC'
    };
  }

  // ➤ rigaC2
  const rigac2Match = cleaned.match(
    /^(.{1,5})\s+([\d.,]+)\s+([CE])\s+(.{1,6})\s+([\d.,]+)\s+([CE])\s+(.{1,8})\s+([\d.,]+)\s+([CE])$/
  );
  if (rigac2Match) {
    return {
      descContab: rigac2Match[1].trim(),
      totContab: rigac2Match[2],
      ceContab: rigac2Match[3],
      descExtrac: rigac2Match[4].trim(),
      totExtrac: rigac2Match[5],
      ceExtrac: rigac2Match[6],
      descEffetti: rigac2Match[7].trim(),
      importoEffetti: rigac2Match[8],
      ceEffetti: rigac2Match[9],
      wkType: 'rigaC2'
    };
  }

  // ➤ rigaT
  const rigatMatch = cleaned.match(/^(.+?)\s+([\d.,]+)\s+([DA])$/);
  if (rigatMatch && rigatMatch[1].length <= 30) {
    let data = '';
    let descrizione = rigatMatch[1].trim();

    // se i primi 10 caratteri sono una data GG/MM/AAAA -> sposta in colonna Data
    const dateStartMatch = descrizione.match(/^(\d{2}\/\d{2}\/\d{4})\s*(.*)$/);
    if (dateStartMatch) {
      data = dateStartMatch[1];
      descrizione = dateStartMatch[2].trim();
    }

    return {
      data,                 // può essere '' oppure la data trovata
      tipo: '',
      descrizione,
      numero: '',
      dataRif: '',
      importo: rigatMatch[2],
      da: rigatMatch[3],
      wkType: 'rigaT'
    };
  }

  // ➤ rigaT2
  const rigat2Match = cleaned.match(
    /^(.+?)\s+([\d.,]+)\s+([CE])\s+(.+?)\s+([\d.,]+)\s+([CE])\s+(.+?)\s+([\d.,]+)\s+([CE])$/
  );
  if (rigat2Match) {
    return {
      descContab: rigat2Match[1].trim(),
      totContab: rigat2Match[2],
      ceContab: rigat2Match[3],
      descExtrac: rigat2Match[4].trim(),
      totExtrac: rigat2Match[5],
      ceExtrac: rigat2Match[6],
      descEffetti: rigat2Match[7].trim(),
      importoEffetti: rigat2Match[8],
      ceEffetti: rigat2Match[9],
      wkType: 'rigaT2'
    };
  }

  // (opzionale) fallback: solo Data + Descrizione
  const dataDescrMatch = cleaned.match(/^(\d{2}\/\d{2}\/\d{4})\s*(.*)$/);
  if (dataDescrMatch) {
    return {
      data: dataDescrMatch[1],
      tipo: '',
      descrizione: dataDescrMatch[2].trim(),
      numero: '',
      dataRif: '',
      importo: '',
      da: '',
      wkType: 'rigaDataDesc'
    };
  }

  return null;
}
