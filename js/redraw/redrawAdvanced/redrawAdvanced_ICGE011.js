function redrawAdvanced_ICGE011() {
  setRedrawAdvanced.On();

  const tbody = document.querySelector('#subfileTableTbody');
  const rows = tbody.querySelectorAll('tr');

  rows.forEach(row => {
    const opzCell = row.querySelector('td:first-child');
    const descCell = row.querySelector('td.text-start.align-middle, td[colspan="7"].align-middle');
    if (!descCell || !opzCell) return;

    const rawText = descCell.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const parsed = parseRiga_ICGE011(rawText);

    if (parsed?.wkType === 'rigaT') {
      row.style.fontWeight = 'bold';
    }

    const cells = [];
    cells.push(opzCell.cloneNode(true)); // Colonna Opz

    if (parsed?.wkType === 'rigaT' || parsed?.wkType === 'rigaT2') {
      const { conto = '', descrizione = '', importo = '', da = '', saldoTipo = '' } = parsed;

      [conto, descrizione, , saldoTipo, importo, da].forEach((val, idx) => {
        const td = document.createElement('td');
        td.textContent = val;
        td.classList.add('align-middle');
        if (idx >= 3 && idx <= 4) td.classList.add('text-end'); // Importo e D/A
        if (idx === 2) td.classList.add('text-uppercase', 'text-center'); // saldoTipo
        cells.push(td);
      });

      // Colonne movimento vuote (6 invece di 7 per fare spazio a saldoTipo)
      for (let i = 0; i < 6; i++) {
        const td = document.createElement('td');
        td.classList.add('align-middle');
        cells.push(td);
      }

      // Colorazione riga
      //row.style.backgroundColor = saldoTipo === 'Pre:' ? '#fff3cd' : '#cce5ff';

    } else if (parsed?.wkType === 'riga1') {
      // Colonne totali vuote (5 ora, includendo saldoTipo)
      for (let i = 0; i < 5; i++) {
        const td = document.createElement('td');
        td.classList.add('align-middle');
        cells.push(td);
      }

      const {
        causale = '', divisa = '', dataComp = '', dataScad = '',
        importo = '', controvalore = '', da = ''
      } = parsed;

      [causale, divisa, dataComp, dataScad, importo, controvalore, da].forEach((val, idx) => {
        const td = document.createElement('td');
        td.textContent = val;
        td.classList.add('align-middle');
        if (idx >= 4) td.classList.add('text-end'); // Importo, Controvalore, D/A
        cells.push(td);
      });
    } else {
      const td = document.createElement('td');
      td.textContent = rawText;
      td.colSpan = 12; // 1 opz + 5 tot + 6 mov
      td.classList.add('align-middle');
      cells.push(td);
    }

    replaceRowCellsPreservingInputs(row, cells);
    uniformizeBodyTdCount("subfileTable");
  });

  // Intestazione completa
  const thead = document.querySelector('#subfileTableThead');
  thead.innerHTML = `
    <tr>
      <th rowspan="2">Opz</th>
      <th colspan="5"> </th>
      <th colspan="7" class="text-center">Movimenti</th>
    </tr>
    <tr>
      <th>Conto</th>
      <th>Descrizione</th>
      <th>Tipo Saldo</th>
      <th>Saldo</th>
      <th>D/A</th>

      <th>Causale</th>
      <th>Divisa</th>
      <th>Data Competenza</th>
      <th>Data Scadenza</th>
      <th>Importo</th>
      <th>Controvalore</th>
      <th>D/A</th>
    </tr>
  `;
  // ⬅ Protezione da removeEmptyDataColumnsFromList
  thead.querySelectorAll("th").forEach(th => {
    th.dataset.keep = "true";
  });
}

function parseRiga_ICGE011(text) {
  const cleaned = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  // ➤ rigaT / rigaT2
  const rigatMatch = cleaned.match(/^Cnt\s+([A-Z0-9]+)\s+(.+?)\s+Sld\.\s+(Pre:|Tot:)\s+([\d.,]+)\s+([DA])$/);
  if (rigatMatch) {
    return {
      conto: rigatMatch[1],
      descrizione: rigatMatch[2].trim(),
      saldoTipo: rigatMatch[3], // "Pre:" o "Tot:"
      importo: rigatMatch[4],
      da: rigatMatch[5],
      wkType: 'rigaT'
    };
  }

  // ➤ riga1
  const riga1Match = cleaned.match(/^([A-Z0-9]{2,5})\s+([A-Z]{3})\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)\s+([\d.,]+)\s+([DA])$/);
  if (riga1Match) {
    return {
      causale: riga1Match[1],
      divisa: riga1Match[2],
      dataComp: riga1Match[3],
      dataScad: riga1Match[4],
      importo: riga1Match[5],
      controvalore: riga1Match[6],
      da: riga1Match[7],
      wkType: 'riga1'
    };
  }

  return null;
}
