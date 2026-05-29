function redrawAdvanced() {
  setRedrawAdvanced.Off();
  switch (getProgramName.name()) {
    case 'I0644LB':
      redrawAdvanced_I0644LB()
      break;
    case 'I0664LB':
      redrawAdvanced_I0664LB()
      break;
    case 'I0403LB':
      redrawAdvanced_I0403LB()
      break;
    case 'I0065LB':
      redrawAdvanced_I0065LB()
      break;
    case 'ICGE007':
      redrawAdvanced_ICGE007()
      break;
    case 'ICGE011':
      redrawAdvanced_ICGE011()
      break;
    case 'ICGE012':
      redrawAdvanced_ICGE012()
      break;
    case 'ICGE013':
      redrawAdvanced_ICGE013()
      break;
    case 'I9104LB':
      redrawAdvanced_I9104LB()
      break;
    default:
      break;
  }
}

var setRedrawAdvanced = {
    On: function () {
        isRedrawAdvanced = true;
    },
    Off: function () {
        isRedrawAdvanced = false;
    }
}

function replaceRowCellsPreservingInputs(row, newCells) {
  const oldCells = Array.from(row.children);
  const preserved = [];

  // Trova tutte le <td> che contengono almeno un <input>
  oldCells.forEach(td => {
    if (td.querySelector('input')) {
      preserved.push(td);
    }
  });

  // Rimuove tutte le celle che non contengono input
  oldCells.forEach(td => {
    if (!preserved.includes(td)) {
      row.removeChild(td);
    }
  });

  // Aggiunge le nuove celle, evitando duplicati
  newCells.forEach(newTd => {
    const isDuplicate = preserved.some(p => p.isEqualNode(newTd));
    if (!isDuplicate) {
      row.appendChild(newTd);
    }
  });
}

// 2) Uniforma tutte le righe al numero massimo di colonne visive
function uniformizeBodyTdCount(tableId = "subfileTable") {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll("tr"));
  if (rows.length === 0) return;

  const visualCount = (row) =>
    Array.from(row.cells).reduce((sum, td) => sum + Math.max(1, td.colSpan || 1), 0);

  let maxCols = 0;
  rows.forEach(r => { maxCols = Math.max(maxCols, visualCount(r)); });

  rows.forEach(row => {
    let current = visualCount(row);
    if (current === maxCols) return;

    if (current < maxCols) {
      const toAdd = maxCols - current;
      for (let i = 0; i < toAdd; i++) {
        const td = document.createElement("td");
        td.classList.add("align-middle");
        row.appendChild(td);
      }
    } else {
      let toTrim = current - maxCols;
      const cells = Array.from(row.cells);
      for (let i = cells.length - 1; i >= 0 && toTrim > 0; i--) {
        const td = cells[i];
        const span = Math.max(1, td.colSpan || 1);
        if (span > 1) {
          const reduce = Math.min(span - 1, toTrim);
          td.colSpan = span - reduce;
          toTrim -= reduce;
        } else {
          td.remove();
          toTrim -= 1;
        }
      }
    }
  });
}

