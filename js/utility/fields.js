// Helper: restituisce i campi a partire da un root (se presente) oppure da tutto lo schermo
function getFieldsFromRoot(root) {
    if (root) {
        // Solo i campi (div/input) con id che inizia per D_ o I_ sotto il container passato
        return root.querySelectorAll('div[id^="D_"], input[id^="I_"]');
    }
    // Comportamento standard: usa la funzione di Genie che non possiamo modificare
    return getAllFields();
}

function retrieveFieldsInRow(row, root) {
    let fields = getFieldsFromRoot(root);
    let arrayAllFields = [];
    for (let field of fields) {
        let fieldRow = getRow(field);
        if (fieldRow !== null && fieldRow === row) {
            arrayAllFields.push(field.id);
        }
    }
    return arrayAllFields;
}

var retrieveAllFields = {
    // Restituisce un array di stringhe "row_col"
    rowCol: function (root) {
        let fields = getFieldsFromRoot(root);
        let arrayAllFields = [];
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            if (field.id.startsWith("D_") || field.id.startsWith("I_")) {
                let rowTemp = getRow(field);
                let columnTemp = getCol(field);
                if ((!isNaN(rowTemp) && rowTemp > 0 && !isNaN(columnTemp) && columnTemp > 0)) {
                    let elem = rowTemp + "_" + columnTemp;
                    arrayAllFields.push(elem);
                }
            }
        }
        return arrayAllFields;
    },

    // Ordina l’array "row_col" per riga/colonna
    sortByRowCol: function (root) {
        const array = this.rowCol(root);
        return array.sort((a, b) => {
            const [rowA, colA] = a.split("_").map(Number);
            const [rowB, colB] = b.split("_").map(Number);
            if (rowA === rowB) {
                return colA - colB;
            }
            return rowA - rowB;
        });
    },

    // Restituisce una Map key = "rrr_ccc" → value = field (ordinata per chiave)
    rowColMap: function (root) {
        const map = new Map();
        let fields = getFieldsFromRoot(root);

        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            if (field.id.startsWith("D_") || field.id.startsWith("I_")) {
                let rowTemp = null;
                let columnTemp = null;
                let parent = field.parentNode;

                if (field.id.includes("subfileRow_") ||
                    (parent != null && parent.id != null && parent.id.includes("subfile"))) {

                    rowTemp = Number(field.id.substring(field.id.indexOf("_") + 1, field.id.lastIndexOf("_")));
                    columnTemp = Number(field.id.substring(field.id.lastIndexOf("_") + 1));
                } else {
                    rowTemp = getRow(field);
                    columnTemp = getCol(field);
                }

                if ((!isNaN(rowTemp) && rowTemp > 0 && !isNaN(columnTemp) && columnTemp > 0)) {
                    let row = rowTemp.toString().padStart(3, '0');
                    let column = columnTemp.toString().padStart(3, '0');
                    let fieldRowAndCol = row + "_" + column;
                    map.set(fieldRowAndCol, field);
                }
            }
        }

        // Ordina la mappa per chiave (row_col)
        return new Map([...map.entries()].sort());
    },

    // Restituisce una lista strutturata [{id, row, col}, ...] ordinata
    structuredList: function (root) {
        const fields = getFieldsFromRoot(root);
        const result = [];

        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];

            if (field.id.startsWith("D_") || field.id.startsWith("I_")) {
                let row = getRow(field);
                let col = getCol(field);

                if (!isNaN(row) && row > 0 && !isNaN(col) && col > 0) {
                    result.push({
                        id: field.id,
                        row: row,
                        col: col
                    });
                }
            }
        }

        result.sort((a, b) => {
            if (a.row === b.row) {
                return a.col - b.col;
            }
            return a.row - b.row;
        });

        return result;
    }
};

function parseId(id) {
    if (!id || typeof id !== "string" || !id.includes("_")) {
        return null;
    }

    const parts = id.split("_");
    if (parts.length < 3) {
        return null;
    }

    const row = parseInt(parts[1], 10);
    const col = parseInt(parts[2], 10);

    if (isNaN(row) || isNaN(col)) {
        return null;
    }

    return { id, row, col };
}

function setFieldValue(id, value) {
    if (id === null || value === null) return;
    const element = document.getElementById(id);
    if (element) {
        if (element.tagName === "INPUT") {
            element.value = value;
            pui.set(id, value);
        } else if (element.tagName === "DIV") {
            element.textContent = value;
            pui.set(id, value);
        } else {
            // fallback generico
            element.value = value;
        }
    }
}

function removeBasicClass() {
    document.querySelectorAll('div, input').forEach(el => {
        const aClasses = Array.from(el.classList).filter(cls => cls.startsWith('A'));
        if (!aClasses.length) return;

         el.setAttribute('data-removed-classes', aClasses.join(','));

        const hiddenClasses = findHiddenClasses(el, aClasses);

        if (hiddenClasses.length) {
            el.setAttribute('data-was-hidden-by-class', hiddenClasses.join(','));
        }

        el.classList.remove(...aClasses);

        if (hiddenClasses.length) {
            hideElementAndLabel(el);
        }
    });
}

function hideElementAndLabel(el) {
    if (!el) return;

    // nascondo elemento
    el.style.display = 'none';
    el.hidden = true;

    // cerco la label associata
    if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) {
            label.style.display = 'none';
            label.hidden = true;
        }
    }
}

function findHiddenClasses(el, classList) {
    const hiddenClasses = [];

    const clone = el.cloneNode(true);

    // container isolato (non eredità visibility:hidden)
    const sandbox = document.createElement('div');
    sandbox.style.position = 'absolute';
    sandbox.style.visibility = 'visible';
    sandbox.style.display = 'block';
    sandbox.style.top = '-9999px';

    document.body.appendChild(sandbox);
    sandbox.appendChild(clone);

    classList.forEach(cls => {
        const testEl = clone.cloneNode(true);

        // rimuovo tutte le classi A*
        testEl.className = testEl.className
            .split(' ')
            .filter(c => !c.startsWith('A'))
            .join(' ');

        // aggiungo SOLO quella che sto testando
        testEl.classList.add(cls);

        sandbox.appendChild(testEl);

        const style = window.getComputedStyle(testEl);

        if (style.visibility === 'hidden' || style.display === 'none') {
            hiddenClasses.push(cls);
        }

        sandbox.removeChild(testEl);
    });

    document.body.removeChild(sandbox);

    return hiddenClasses;
}

function isEffectivelyHidden(el) {
    if (!el || el.nodeType !== 1) return true;

    // se un parent è display:none => offsetParent è null (tranne position:fixed)
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return true;

    // copre anche casi parent hidden + elementi non renderizzati
    if (el.offsetParent === null && style.position !== "fixed") return true;

    return false;
}

function isTechnicalLike(s) {
    // euristica: i name tecnici hanno quasi sempre "_" e sono lunghi
    return typeof s === "string" && s.includes("_") && s.length > 15;
}

function getBestOriginalLabel(lbl, elem) {
    // se già salvato, riusa
    if (lbl.dataset.labelHumanOriginal) return lbl.dataset.labelHumanOriginal;

    const fldtext = (elem.getAttribute("fldtext") || "").trim();
    if (fldtext) return (lbl.dataset.labelHumanOriginal = fldtext);

    const current = (lbl.textContent || "").trim();
    // salva il testo corrente solo se NON sembra tecnico
    if (current && !isTechnicalLike(current)) {
        return (lbl.dataset.labelHumanOriginal = current);
    }

    // fallback: almeno non mettiamo il name tecnico come "originale"
    return (lbl.dataset.labelHumanOriginal = "");
}
