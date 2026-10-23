function removeVisibleElements(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const elements = container.querySelectorAll('div, input');

    elements.forEach(el => {
        const isVisible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        if (isVisible) {
            el.remove();
        }
    });
}

function reserveRemoveElements(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const elements = container.querySelectorAll('div, input');

    elements.forEach(el => {
        const isVisible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        if (isVisible) {
            el.classList.add("delMe")
        }
    });
}

function getElemCursorPosition() {
    let elemCursor = null;

    let fields = retrieveAllFields.structuredList();
    for (const field of fields) {
        let elem = document.getElementById(field.id);
        if (elem) {
            let cursorPosition = getCursorPosition(elem.id);
            if (elemCursor === null && cursorPosition === 0) {
                elemCursor = elem.id
            } else if (cursorPosition > 0) {
                elemCursor = elem.id
            }
        }
    };
    return elemCursor;
}

function detectSubfileFromTextLines() {
    let startRow = null;
    let endRow = null;
    const lines = pui["5250"].buffer;
    const max = lines.length;

    for (let i = 0; i < max; i++) {
        const line = lines[i] || "";
        if (line.includes("Opz")) {
            startRow = i + 1; // dati dopo l’header
            break;
        }
    }

    if (startRow !== null) {
        for (let i = startRow; i < max; i++) {
            const line = lines[i] || "";
            if (line.trim() === "" || line.includes("  Fine") || line.includes("  Segue..")) {
                endRow = i - 1;
                break;
            }
        }
        if (endRow === null) endRow = max - 1;

        // valida solo se c’è almeno una riga dati
        if (endRow >= startRow) {
            return { subfile: { start: startRow, end: endRow } };
        }
    }

    return { subfile: null };
}

function detectSubfileFromRow(
    maxRows = row,
    maxColumns = column,
    rowOffset = 2,
    minRunLength = 2,   // minimo numero di righe nel blocco (es. 2 righe => 1 match)
    startFromRow = 0,   // riga di partenza inclusa
    endAtRow = null,    // riga di fine inclusa
    comparator = areRowSimilar
) {
    if (maxRows == null) maxRows = row;
    if (maxColumns == null) maxColumns = column;
    if (rowOffset == null) rowOffset = 0;
    if (minRunLength == null) minRunLength = 2;
    if (endAtRow == null) endAtRow = maxRows;

    const structCache = new Map();
    const getStruct = (r) => {
        if (structCache.has(r)) return structCache.get(r);
        const s = getRowStructure(r, maxColumns);
        structCache.set(r, s);
        return s;
    };

    let startRow = null;
    let endRow = null;
    let candidateStart = null;
    let matchCount = 0;
    let previousStructure = null;

    for (let r = Math.max(0, startFromRow); r <= endAtRow; r++) {
        const currentStructure = getStruct(r);

        let comparisonStructure = null;
        if (rowOffset === 0) {
            comparisonStructure = previousStructure;
        } else if (r - rowOffset >= startFromRow) {
            comparisonStructure = getStruct(r - rowOffset);
        }

        const valid =
            comparisonStructure &&
            currentStructure.length > 0 &&
            comparisonStructure.length > 0 &&
            comparator(currentStructure, comparisonStructure);

        if (valid) {
            if (candidateStart === null) {
                candidateStart = (rowOffset === 0)
                    ? Math.max(startFromRow, r - 1)
                    : Math.max(startFromRow, r - rowOffset);
            }
            matchCount++;

            // run length = matchCount + 1 (perché i match sono tra righe adiacenti/offsettate)
            if ((matchCount + 1) >= minRunLength) {
                startRow = candidateStart;
                endRow = r;
            }
        } else {
            candidateStart = null;
            matchCount = 0;
        }

        previousStructure = currentStructure;
    }

    // accetta solo range valido e della lunghezza richiesta
    if (startRow != null && endRow != null && endRow >= startRow && (endRow - startRow + 1) >= minRunLength) {
        return { subfile: { start: startRow, end: endRow } };
    }
    return { subfile: null };
}


function getRowStructure(row, maxColumns = column) {
    const structure = [];
    const nodes = document.querySelectorAll(`[id^="D_${row}_"], [id^="I_${row}_"]`);

    nodes.forEach(el => {
        const m = el.id.match(/^[DI]_(\d+)_(\d+)$/);
        if (!m) return;
        const col = parseInt(m[2], 10);
        if (Number.isFinite(maxColumns) && col > maxColumns) return;

        structure.push({
            tag: el.tagName,
            type: el.getAttribute("data-type") || el.getAttribute("fldtype") || "generic",
            position: col,
        });
    });

    structure.sort((a, b) => a.position - b.position);
    return structure;
}

function areRowSimilar(struct1, struct2) {
    if (struct1.length !== struct2.length) return false;

    for (let i = 0; i < struct1.length; i++) {
        const a = struct1[i];
        const b = struct2[i];

        if (
            a.tag !== b.tag ||
            a.type !== b.type ||
            a.position !== b.position
        ) {
            return false;
        }
    }

    return true;
}

function detectSegueOrFine(root) {
    root = root || document.getElementById('5250');
    if (!root) return null;

    const norm = s => (s || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    const nodes = root.querySelectorAll('*');

    // 1) cerca "Segue..."
    for (const el of nodes) {
        const t = norm(el.textContent);
        if (/Segue\.{3}$/i.test(t)) return 'segue';
    }

    // 2) altrimenti cerca "Fine"
    for (const el of nodes) {
        const t = norm(el.textContent);
        if (/(?:^|\s)Fine$/i.test(t)) return 'fine';
    }

    // 3) nulla trovato
    return null;
}