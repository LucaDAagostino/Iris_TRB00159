redraw = function () {
    /* Contenitore per programmi custom */

    const state = detectSegueOrFine();
    const hasNextPage = state === 'segue';
    const isLastPage = state === 'fine';

    let containerElement = document.createElement("div");
    containerElement.id = "container5250Custom";
    containerElement.className = "container5250";
    containerElement.setAttribute("name", "container5250Custom");
    document.getElementById("5250").append(containerElement);

    if (!pui.genie.isCustomized) {
        redrawCustomized();

        if (isRedrawCustomized) return;

        let disableRedrawProgramAppCore = false;
        if ((Array.isArray(properties.disableRedrawProgramAppCore) && properties.disableRedrawProgramAppCore.includes(getProgramName.name())) || !properties.redraw || !isSuccessBGNIDSPF) {
            disableRedrawProgramAppCore = true;
        }

        if (!disableRedrawProgramAppCore) {
            switch (typeProgramAppCore) {
                case TYPE_PROGRAM_APP_CORE.List:
                    if (properties.redraw) {
                        redrawProgramAppCoreList();
                    } else {
                        redrawProgramAppCoreListBasic();
                    }
                    break;
                case TYPE_PROGRAM_APP_CORE.Detail:
                    if (properties.redraw) {
                        redrawProgramAppCoreDetail();
                    } else {
                        redrawProgramAppCoreDetailBasic();
                    }
                    break;
                case TYPE_PROGRAM_APP_CORE.Window:
                    if (properties.redraw) {
                        redrawWindowAppCore()
                    }
                    else {
                        redrawWindowAppCoreBasic
                    }
                    break;
            }
            try {
                if (properties.redraw) {
                    continuousTextareaAutoAttach({
                        scope: "#container5250Program",
                        hideOriginal: true,
                        excludeSubfile: true, // lascia stare i subfile 
                        syncBack: true
                    });
                }
            } catch (e) {
                consoleLog.warn("ContinuousTextareaAutoAttach error:", e);
            }
        } else {
            switch (typeProgramAppCore) {
                case TYPE_PROGRAM_APP_CORE.List:
                    redrawProgramAppCoreListBasic();
                    break;
                case TYPE_PROGRAM_APP_CORE.Detail:
                    redrawProgramAppCoreDetailBasic();
                    break;
                case TYPE_PROGRAM_APP_CORE.Window:
                    redrawWindowAppCoreBasic();
                    break;
            }
            redrawBasic();
        }
    }
};

resizeProgramAppCore = function () {
    compactFields();
    fixLabelsNearWidgetButtons();
    autoSizeFloatingLabels();
    enhanceLabels();
    autoSizeButtonsByLabel();

}

/* ================================  D E T A I L  =============================== */
redrawProgramAppCoreDetail = function () {
    removeBasicClass();

    let mapFormat = new Map();

    const result = createContainerFormatRecord();
    if (result?.mapFormat) { mapFormat = result.mapFormat }

    const fieldsMap = retrieveAllFields.rowColMap();
    hideAllRecordTypeT();
    normalizeLabelFields();
    renderValidRecordTypes(fieldsMap, mapFormat);

    removeEmptyReadOnlyFormat4();
    resizeProgramAppCore();

    redrawAdvanced();

    removePuiCalendar();
}

redrawProgramAppCoreDetailBasic = function () {
}

/* ================================  L I S T  =================================== */

redrawProgramAppCoreList = function () {
    removeBasicClass();

    const state = detectSegueOrFine();
    const hasNextPage = state === 'segue';
    const isLastPage = state === 'fine';

    let mapFormat = new Map();
    let mapFormatSubfile = new Map();
    let mapFormatDetail = new Map();
    let mapFormatOther = new Map();

    const fields = retrieveAllFields.structuredList();
    const result = createContainerFormatRecord();
    if (result?.mapFormat) mapFormat = result.mapFormat;
    if (result?.mapFormatSubfile) mapFormatSubfile = result.mapFormatSubfile;
    if (result?.mapFormatDetail) mapFormatDetail = result.mapFormatDetail;
    if (result?.mapFormatOther) mapFormatOther = result.mapFormatOther;

    const fieldsMap = retrieveAllFields.rowColMap();

    getOptionPressKeyValue(document);

    hideAllRecordTypeT();
    normalizeLabelFields();
    renderValidRecordTypes(fieldsMap, mapFormat);
    const rowStartRemove = removeInstructionalRows(mapFormatOther);
    removeUnpreservedContainer(rowStartRemove, mapFormatDetail);
    removeUnusedContainer(mapFormat, mapFormatDetail, mapFormatOther);


    if (mapFormatSubfile.size !== 0) {
        let offset = offsetRow;
        if (offsetRow > 0) {
            const result = calculateRowOffset(mapFormatSubfile);
            if (result) {
                offset = result.offset;
            } else {
                offset = -1;
            }
        }

        if (offset >= 0) {
            inheritAttributesSubfile(mapFormatSubfile, offset)
        }

        removeSubfileLabelColumns(mapFormatSubfile);
        createSubfileTable(mapFormatSubfile);

        buildSubfileTbody(mapFormatSubfile);
        mergeSubfileDetailRows(mapFormatSubfile, false);
        buildSubfileThead(mapFormatSubfile);
        buildSubfilePagination(mapFormatSubfile); // Pagination

        resetAbsoluteChildren(mapFormat);
        relocateSubfileInputs(mapFormatSubfile);
        applyIconsToSubfileElements(mapFormatSubfile);
        //cleanSubfileTableFromNonInputs();
        removeNonSubfileInputsFromMap(mapFormatSubfile);

        redrawAdvanced();

        enhanceSubfileInputs();
        resetTabIndexes();
        if (!isRedrawAdvanced) {
            if (properties.showPreviousScreen) {
                removeEmptyDataColumnsFromList();
            }
        }
        applyTabIndexesToInputs();
        blockTabOnOtherElements();
        restoreCursor(fields);
    }

    resizeProgramAppCore();

    removePuiCalendar();

    reserveRemoveElements('form[name="main"]');

    removeEmptyReadOnlyFormat4();

    addExportButton(state);
    setTimeout(() => generateExport(state), 60);
};

redrawProgramAppCoreListBasic = function () {
    var subfile = getLastSubfile();
    if (subfile === null) {
        return;
    }

    redrawProgramAppCoreListBasicSubfileOption(subfile);
}


redrawProgramAppCoreListBasicSubfileOption = function (subfile) {
    if (subfile === null) return;

    let currentOption = null;

    // Array subfileOptions (rimane identico al tuo)
    arraySubfileOptions = [];
    document.querySelectorAll('.subfileOption').forEach(function (elem) {
        arraySubfileOptions.push(elem);
    });

    // nuovo: prendo il valore dalla cache (1 o 5)
    const pressKeyValue = getPressKeyValue();

    const subfileChildren = subfile.children;
    if (subfileChildren != null) {
        for (let iChildren = 0; iChildren < subfileChildren.length; iChildren++) {
            let elem = subfileChildren[iChildren];
            let rowSubfile = getRow(subfile.id) - 1 + getRow(elem.id);
            let colSubfile = getCol(elem.id);
            elem.id = subfile.id + "Row_" + rowSubfile + "_" + colSubfile;
            elem.style.fontFamily = "";
            elem.style.cursor = "pointer";

            // unico punto in cui decide 1 o 5
            elem.setAttribute("onclick", "onClickSubfileOption(" + rowSubfile + "," + pressKeyValue + ")");

            if (colSubfile == -1) {
                for (let i = 0; i < arraySubfileOptions.length; i++) {
                    if (arraySubfileOptions[i].id.match(rowSubfile)) {
                        currentOption = arraySubfileOptions[i];
                        let newId = subfile.id + "Row_" + rowSubfile + "_" + currentOption.id.substr(currentOption.id.lastIndexOf("_") + 1, currentOption.id.lenght);
                        $("#" + elem.id).attr("id", newId);
                    }
                }
            }
        }
    }
}

function createSubfilePaginationContainer() {
    if (totalPages === null) {
        totalPages = 1;
        currentPage = 1;
    }

    const paginationContainer = document.createElement("div");
    paginationContainer.id = "subfilePagination";
    paginationContainer.className = "subfilePagination d-flex justify-content-end mt-2";

    const paginationSize = document.createElement("div");
    paginationSize.id = "paginationSize";
    paginationSize.className = "paginationSize";
    paginationContainer.appendChild(paginationSize);


    const paginationMove = document.createElement("ul");
    paginationMove.id = "paginationMove";
    paginationMove.className = "pagination paginationMove";
    paginationContainer.appendChild(paginationMove);

    return paginationContainer;
}

function renderSubfilePagination() {
    const pagination = document.getElementById("paginationMove");
    pagination.innerHTML = ""; // Pulizia della paginazione

    // Bottone "Previous"
    const prev = document.createElement("li");
    prev.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prev.innerHTML = `<a class="page-link">Previous</a>`;

    prev.addEventListener("click", handlePrevClick);
    pagination.appendChild(prev);

    // Bottone "Next"
    const next = document.createElement("li");
    next.className = `page-item`;
    next.innerHTML = `<a class="page-link">Next</a>`;
    next.addEventListener("click", handleNextClick);
    pagination.appendChild(next);
}

function changePage(newPage) {
    if (newPage < 1) return; // Evita pagine negative
    currentPage = newPage;
    // Se l'utente va oltre l'ultima pagina, aggiungo una nuova pagina
    if (currentPage > totalPages) {
        totalPages = currentPage;
    }
}

function handlePrevClick() {
    changePage(currentPage - 1);
    setCursor(getElemCursorPosition());
    pressKey('PageUp');
}

function handleNextClick() {
    changePage(currentPage + 1);
    setCursor(getElemCursorPosition());
    pressKey('PageDown');
}

onClickSubfileOption = function (row) {

    const prefix = `I_${row}_`;

    const arr = Array.isArray(window.arraySubfileOptions)
        ? window.arraySubfileOptions
        : [];

    let currentEl = null;

    // Cerca il campo opzione della riga
    for (const el of arr) {
        if (el && el.id && el.id.startsWith(prefix)) {
            currentEl = el;
            break;
        }
    }

    // Fallback sul DOM
    if (!currentEl) {
        currentEl =
            document.querySelector(
                `[data-subfile-option="1"][id^="${prefix}"]`
            ) ||
            document.querySelector(
                `input[id^="${prefix}"][dataoption]`
            );
    }

    if (!currentEl) {
        return;
    }

    const currentId = currentEl.id;

    /*
     * Valore standard = 5.
     *
     * Diventa 1 SOLO se nel dataoption esiste
     * un codice "1" oppure "01".
     *
     */
    let pressKeyValue = "5";

    const dataoptions =
        currentEl.getAttribute("dataoption") || "";

    if (dataoptions) {

        const options = dataoptions.split(";");

        const hasOption1 = options.some(raw => {

            try {

                const option = JSON.parse(raw);

                const code =
                    String(option?.code ?? "").trim();

                return code === "1" || code === "01";

            } catch (_) {
                return false;
            }

        });

        if (hasOption1) {
            pressKeyValue = "1";
        }
    }

    /*
     * Azzera eventuali opzioni presenti
     * sulle altre righe.
     */
    if (arr.length) {

        arr.forEach(el => {

            if (
                el &&
                el.id &&
                el.id !== currentId
            ) {

                try {
                    pui.set(el.id, null);
                } catch (_) {
                    try {
                        el.value = "";
                    } catch (_) { }
                }

            }

        });

    }

    /*
     * Legge il valore attuale.
     *
     * Se l'utente ha già scritto qualcosa
     * NON lo sovrascriviamo.
     */
    let curVal = null;

    try {
        curVal = pui.get(currentId);
    } catch (_) {
        curVal = currentEl.value;
    }

    if (
        curVal == null ||
        String(curVal).trim() === ""
    ) {

        try {

            pui.set(
                currentId,
                pressKeyValue
            );

        } catch (_) {

            currentEl.value = pressKeyValue;

        }

    }

    /*
     * Invio ENTER
     */
    try {
        pressKey("Enter");
    } catch (_) { }

};


function applyIconsToSubfileElements(mapFormatSubfile) {
    mapFormatSubfile.forEach((el, key) => {
        const currentEl = document.getElementById(el.id);
        if (!currentEl) return;

        // Applica solo agli <input> che NON hanno la classe 'subfileOption'
        if (currentEl.tagName !== "INPUT" ||
            currentEl.classList.contains("subfileOption")
        ) return;

        if (currentEl.tagName === "INPUT" && currentEl.classList.contains("readOnly")) {
            const div = document.createElement('div');

            // Copia tutti gli attributi da input a div
            for (const attr of currentEl.attributes) {
                if (attr.name !== 'class') {
                    div.setAttribute(attr.name, attr.value);
                }
            }

            // Imposta il contenuto testuale al valore dell'input
            div.textContent = currentEl.value;

            // Sostituisci l'input con il div all'interno del td
            currentEl.replaceWith(div);
            return
        };

        const fldUse = currentEl.getAttribute("flduse");
        const fldType = currentEl.getAttribute("fldtype");


        if (fldUse && fldUse !== "L" && currentEl.style.visibility !== "hidden") {
            const { icon, iconClass } = setIconAndAttributes(currentEl, fldUse, fldType);
            const parent = currentEl.parentNode;
            const nextSibling = currentEl.nextSibling;

            const wrapped = createFormLabel(currentEl.id, fldText, null, icon, iconClass, 'hidden');

            if (parent) {
                if (nextSibling) {
                    parent.insertBefore(wrapped, nextSibling);
                } else {
                    parent.appendChild(wrapped);
                }
            }
        }
    });
}

function removeInstructionalRows(map) {
    let rowStart = null;

    map.forEach((el, key) => {
        const row = parseInt(key.split("_")[2], 10);
        const text = el.textContent.toLowerCase();
        const fldname = el.getAttribute("fldname");
        const flduse = el.getAttribute("flduse");

        const isInRecordTypeC = el.closest('.recordTypeC');
        const isInRecordTypeD = el.closest('.recordTypeD');

        const isInstructional = isInRecordTypeC && text.includes("immettere") && text.includes("premere");
        const isVDO01TXT = isInRecordTypeC && fldname === "VDO01TXT";
        const isEmptyField = el.getAttribute("empty") === "true" && !el.classList.contains("form-control");

        if ((isInstructional || isVDO01TXT) && rowStart === null) {
            rowStart = row;
        }

        if (isInRecordTypeD) return;

        if (isVDO01TXT) {
            el.remove();
            map.delete(key);
            return
        }
        // Preserva eventuali campi validi in recordTypeC
        if (isFieldValidAfterInstruction(el, row, rowStart)) return;

        if ((rowStart !== null && row >= rowStart) || isEmptyField) {
            el.remove();
            map.delete(key);
        }
    });

    return rowStart;
}

function createSubfileTable(map) {
    map.forEach((_, key) => {
        const id = key.split("_")[0] + "_" + key.split("_")[1];
        const container = document.getElementById(id);

        if (container && !document.getElementById("subfileTableThead")) {
            container.classList.add("containerRecordTypeSubfile");

            // === HEADER SUBFILE: creato UNA volta, prima della tabella ===
            let header = document.getElementById("subfileTableHeader");
            if (!header) {
                header = document.createElement("div");
                header.id = "subfileTableHeader";
                header.className = "subfileTableHeader d-flex align-items-center mb-2";
                // L’header DEVE stare prima della tabella
                container.appendChild(header);
            }

            // === TABELLA SUBFILE ===
            const table = document.createElement("table");
            table.id = "subfileTable";
            table.className = "subfileTable table table-striped table-striped-custom table-bordered mt-2";

            const thead = document.createElement("thead");
            thead.id = "subfileTableThead";
            thead.className = "subfileTableThead";

            const tbody = document.createElement("tbody");
            tbody.id = "subfileTableTbody";
            tbody.className = "subfileTableTbody";

            table.append(thead, tbody);
            container.appendChild(table);

            // Applica font monospace se richiesto
            if (Array.isArray(properties.monospaceProgramAppCore) &&
                properties.monospaceProgramAppCore.includes(getProgramName.name())) {

                const tbodyEl = document.getElementById('subfileTableTbody');
                if (tbodyEl) {
                    tbodyEl.classList.add('subfile-monospace');
                }
            }
        }
    });
}

function removeSubfileLabelColumns(mapFormatSubfile) {
    if (!(mapFormatSubfile instanceof Map) || mapFormatSubfile.size === 0) return;

    const labelNamesToRemove = new Set();

    // 1. raccolgo tutti i fldlabel usati dai campi reali
    for (const [, elem] of mapFormatSubfile.entries()) {
        const fldUse = elem.getAttribute("flduse");
        const fldLabel = elem.getAttribute("fldlabel");

        if (fldUse !== "L" && fldLabel) {
            labelNamesToRemove.add(fldLabel.trim());
        }
    }

    if (labelNamesToRemove.size === 0) return;

    // 2. rimuovo dalla mappa le label corrispondenti
    for (const [key, elem] of mapFormatSubfile.entries()) {
        const name = elem.getAttribute("name")?.trim() || "";
        const fldUse = elem.getAttribute("flduse");

        if (fldUse === "L" && labelNamesToRemove.has(name)) {
            mapFormatSubfile.delete(key);
            elem.remove();
        }
    }
}

function buildSubfileThead(map) {
    const thead = document.getElementById("subfileTableThead");
    const tbody = document.getElementById("subfileTableTbody");
    if (!thead) return;

    const header = document.createElement("tr");

    // 1. provo a usare la prima riga reale del tbody, se esiste già
    let firstRowCells = null;
    if (tbody) {
        const firstRow = tbody.querySelector("tr");
        if (firstRow) {
            firstRowCells = Array.from(firstRow.cells);
        }
    }

    // 2. fallback: se il tbody non è ancora pronto, uso la prima main row dal map
    if (!firstRowCells || firstRowCells.length === 0) {
        const detailRowMap = getDetailRowElements(map);
        const detailRowKeys = new Set(detailRowMap.keys());

        let firstMainRow = null;
        const firstMainRowElems = [];

        for (const [, el] of map.entries()) {
            const row = getRow(el);
            if (detailRowKeys.has(row)) continue;

            if (firstMainRow === null) {
                firstMainRow = row;
            }

            if (row === firstMainRow) {
                firstMainRowElems.push(el);
            }
        }

        firstMainRowElems.sort((a, b) => {
            const colA = Number(a.getAttribute("fldcolumn")) || 0;
            const colB = Number(b.getAttribute("fldcolumn")) || 0;
            return colA - colB;
        });

        firstMainRowCells = firstMainRowElems.map(el => {
            const fakeTd = document.createElement("td");
            copySubfileAttrsToCell(el, fakeTd);
            fakeTd.setAttribute("idFather", el.id);
            return fakeTd;
        });
    }

    // 3. creo i TH in base alle celle reali
    firstRowCells.forEach((cell, idx) => {
        const th = document.createElement("th");
        th.scope = "col";

        const idFather = cell.getAttribute("idfather");
        const sourceEl = idFather ? document.getElementById(idFather) : null;

        const nameValue =
            cell.getAttribute("name") ||
            sourceEl?.getAttribute("name");

        if (nameValue) {
            th.setAttribute("name", nameValue);
        }

        const fldtext =
            cell.getAttribute("fldtext") ||
            sourceEl?.getAttribute("fldtext");

        th.textContent = (fldtext && fldtext.trim() !== "")
            ? fldtext
            : "\u00A0";

        header.appendChild(th);
    });

    thead.innerHTML = "";
    thead.appendChild(header);
}

function buildSubfileTbody(map) {
    const tbody = document.getElementById("subfileTableTbody");
    if (tbody !== null) {
        tbody.innerHTML = "";
        let lastRow = null, rowEl = null;

        map.forEach((el, key) => {
            const fldUse = (el.getAttribute("flduse") || "").trim();
            // salta le label del subfile
            if (fldUse === "L") return;

            const row = key.split("_")[2];

            if (lastRow === null || row !== lastRow) {
                if (rowEl) tbody.appendChild(rowEl);
                rowEl = document.createElement("tr");
                rowEl.id = "subfileRow_" + getRow(el);
                rowEl.setAttribute("scope", "row");

                lastRow = row;
            }

            const td = document.createElement("td");
            td.textContent = computeValue(el);

            copySubfileAttrsToCell(el, td);

            if (el.getAttribute("fldtype") === "S") {
                td.classList.add("text-end");
            } else {
                td.classList.add("text-start");
            }
            td.classList.add("align-middle");

            rowEl.appendChild(td);
        });

        if (rowEl) tbody.appendChild(rowEl);
    }
}

function copySubfileAttrsToCell(sourceEl, td) {
    if (!sourceEl || !td) return;

    // Sul TD tengo solo attributi utili al layout/debug,
    // NON quelli che identificano logicamente il campo.
    const attrsToKeep = [
        "fmtname",
        "fmtfilename",
        "fmttype",
        "fmtiswindow",
        "fmtsubfiledroppedrow",
        "fldtype",
        "fldlength"
    ];

    attrsToKeep.forEach(attr => {
        const value = sourceEl.getAttribute(attr);
        if (value !== null) {
            td.setAttribute(attr, value);
        }
    });

    // Questo è l'unico legame vero tra cella e campo originale
    td.setAttribute("idFather", sourceEl.id);

    // Copia anche le classi rimosse originali
    const sourceRemoved = (sourceEl.getAttribute("data-removed-classes") || "")
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const tdRemoved = (td.getAttribute("data-removed-classes") || "")
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const merged = [...new Set([...tdRemoved, ...sourceRemoved])];
    if (merged.length) {
        td.setAttribute("data-removed-classes", merged.join(','));
    }
}

function buildSubfilePagination(map) {
    // Evito doppia paginazione
    if (document.getElementById("subfilePagination")) return;

    const header = document.getElementById("subfileTableHeader");
    if (!header) return;

    const subfilePaginationContainer = createSubfilePaginationContainer();
    subfilePaginationContainer.classList.remove("mt-2");
    subfilePaginationContainer.classList.add("ms-auto"); // va a destra

    header.appendChild(subfilePaginationContainer);

    renderSubfilePagination();

    if (properties.showSubfilePageOf) {
        document.getElementById("paginationSize").textContent =
            "Page " + currentPage + " of " + totalPages;
    }
}

function resetAbsoluteChildren(mapFormat) {
    mapFormat.forEach(container => {
        Array.from(container.children).forEach(el => {
            el.style.position = "static";
            el.style.removeProperty("top");
            el.style.removeProperty("left");
        });
    });
}

function relocateSubfileInputs(mapFormatSubfile) {
    if (!mapFormatSubfile || mapFormatSubfile.size === 0) return;

    const tbody = document.querySelector('#subfileTableTbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    const tdMap = new Map();
    rows.forEach(row => {
        Array.from(row.cells).forEach(td => {
            const idFather = td.getAttribute('idfather');
            if (idFather) tdMap.set(idFather, td);
        });
    });

    for (const [_, elem] of mapFormatSubfile) {
        if (!elem || elem.tagName !== 'INPUT') continue;

        const td = tdMap.get(elem.id);
        if (td) {
            td.textContent = null;
            elem.style.position = 'static';
            elem.style.removeProperty('top');
            elem.style.removeProperty('left');
            td.appendChild(elem);
        }
    }
}

function cleanSubfileTableFromNonInputs() {
    document.querySelectorAll('#subfileTableTbody td').forEach(td => {
        Array.from(td.children).forEach(child => {
            if (!child.classList.contains('subfileOption')) child.remove();
        });
    });
}

function enhanceSubfileInputs() {
    let zIndex = 1050;

    arraySubfileOptions = [];
    document.querySelectorAll('.subfileOption').forEach(function (elem) {
        arraySubfileOptions.push(elem);
    });

    document.querySelectorAll('.subfileOption').forEach(input => {
        if (input.dataset.dropdownEnhanced) return;
        input.dataset.dropdownEnhanced = 'true';

        // marca l’elemento così lo possiamo ritrovare anche dopo aver rimosso la classe
        input.setAttribute('data-subfile-option', '1');

        // registra l’input nell’array globale una volta sola
        if (!window.arraySubfileOptions.includes(input)) window.arraySubfileOptions.push(input);

        const wrapper = document.createElement('div');
        wrapper.className = 'position-relative mb-0';
        wrapper.style.width = '6rem';
        wrapper.style.zIndex = zIndex;
        wrapper.style.overflow = 'visible';

        input.className = 'form-control formControlSubfile';
        input.placeholder = '';
        input.style.width = '5rem';
        input.style.padding = '0';
        input.style.paddingLeft = '0.5rem'
        input.style.backgroundColor = 'white';

        const btnToggle = document.createElement('button');
        btnToggle.type = 'button';
        btnToggle.className = 'btn p-1';
        btnToggle.style.position = 'absolute';
        btnToggle.style.top = '50%';
        btnToggle.style.right = '1.25rem';
        btnToggle.style.transform = 'translateY(-50%)';
        btnToggle.style.border = 'none';
        btnToggle.style.zIndex = zIndex + 1;

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-chevron-down';
        btnToggle.appendChild(icon);

        const menu = document.createElement('ul');
        menu.id = "ulMenu_VDSCT";
        menu.className = 'dropdown-menu';
        menu.style.maxHeight = '30rem';
        menu.style.overflowY = 'auto';
        menu.style.position = 'absolute';
        menu.style.width = "auto";
        menu.style.top = '100%';
        menu.style.left = '0';
        menu.style.display = 'none';
        menu.style.backgroundColor = 'white';
        menu.style.zIndex = zIndex;

        btnToggle.addEventListener('click', e => {
            e.preventDefault();
            const isShown = menu.style.display === 'block';

            const otherMenu = document.getElementById('ulMenu_VDSCT');
            if (otherMenu && otherMenu !== menu) otherMenu.style.display = 'none';

            document.querySelectorAll('.btn i.fa-chevron-up').forEach(i => {
                i.classList.replace('fa-chevron-up', 'fa-chevron-down');
            });

            menu.style.display = isShown ? 'none' : 'block';
            icon.className = isShown ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
        });

        document.addEventListener('click', e => {
            if (!wrapper.contains(e.target)) {
                menu.style.display = 'none';
                icon.className = 'fa-solid fa-chevron-down';
            }
        });

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(btnToggle);
        wrapper.appendChild(menu);

        zIndex -= 10;

        input.classList.remove('subfileOption');

        // menu opzioni
        renderDropdownFromDataOptions(input);

        // click sulla riga → onClickSubfileOption(rowIdx, pressKeyValue)
        const tr = input.closest('tr');

        if (tr && !tr.dataset._rowClickBound) {
            let rowIdx = null;
            if (/^subfileRow_\d+$/.test(tr.id)) {
                rowIdx = parseInt(tr.id.split('_')[1], 10);
            } else if (typeof getRow === 'function') {
                rowIdx = getRow(input.id || input);
            }
            if (rowIdx != null && typeof onClickSubfileOption === 'function') {
                tr.addEventListener('click', (ev) => {
                    if (
                        ev.target.closest(
                            'input,button,ul.dropdown-menu,.position-relative'
                        )
                    ) {
                        return;
                    }
                    onClickSubfileOption(rowIdx);
                }, { capture: true });
                tr.style.cursor = 'pointer';
                tr.dataset._rowClickBound = '1';
            }
        }
    });
}

function resetTabIndexes() {
    document.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
}

function applyTabIndexesToInputs() {
    let index = 1;
    document.querySelectorAll('#container5250Program input').forEach(input => {
        input.setAttribute('tabindex', index++);
    });
}

function blockTabOnOtherElements() {
    document.querySelectorAll('a, button, [role], div, span').forEach(el => {
        if (!el.closest('#container5250Program') || el.tagName.toLowerCase() !== 'input') {
            el.setAttribute('tabindex', '-1');
        }
    });
}

function restoreCursor(fields) {
    let elemCursor = null;
    for (const field of fields) {
        const elem = document.getElementById(field.id);
        if (elem) {
            const pos = getCursorPosition(elem.id);
            if (elemCursor === null || pos > 0) {
                elemCursor = elem.id;
            }
        }
    }
}

function removeNonSubfileInputsFromMap(map) {
    const tbody = document.getElementById('subfileTableTbody');
    if (!tbody) return;

    const idsInTbody = new Set(
        Array.from(tbody.querySelectorAll('td'))
            .flatMap(td => Array.from(td.querySelectorAll('*')))
            .map(el => el.id)
            .filter(id => !!id)
    );

    for (const [key, elem] of map) {
        if (!idsInTbody.has(elem.id)) {
            elem.remove();       // rimuove dal DOM
            map.delete(key); // rimuove dalla mappa
        }
    }
}

function mergeSubfileDetailRows(mapFormatSubfile, mergeCells = false, detailThPrefix = 'Colonna') {
    const tbody = document.querySelector('#subfileTableTbody');
    const thead = document.querySelector('#subfileTableThead');
    if (!tbody || !thead) return;

    const thRow = thead.querySelector('tr') || (() => {
        const tr = document.createElement('tr');
        thead.appendChild(tr);
        return tr;
    })();

    const norm = s => (s || '').replace(/\u00A0/g, ' ').trim().toLowerCase();

    const existingKeys = new Set(
        Array.from(thRow.querySelectorAll('th')).map(th =>
            th.getAttribute('data-colkey') || th.getAttribute('name') || norm(th.textContent)
        )
    );

    const addThOnce = (colKey, label, name) => {
        const k = String(colKey || name || norm(label));
        if (!k || existingKeys.has(k)) return;

        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = label;
        if (name) th.setAttribute('name', name);
        th.setAttribute('data-colkey', k);
        th.setAttribute('data-from-detail', '1');
        thRow.appendChild(th);
        existingKeys.add(k);
    };

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const detailRowMap = getDetailRowElements(mapFormatSubfile);
    const detailRowKeys = new Set(detailRowMap.keys());

    let currentMainRow = null;

    for (const row of rows) {
        const rowIndex = parseInt(row.id.split('_')[1], 10);

        if (!detailRowKeys.has(rowIndex)) {
            currentMainRow = row;
            continue;
        }

        const detailElems = detailRowMap.get(rowIndex);
        if (!currentMainRow || !detailElems) continue;

        if (mergeCells) {
            const detailText = detailElems
                .map(el => el.innerHTML?.trim() || '')
                .filter(Boolean)
                .join('<br>');

            const td = document.createElement('td');
            const firstDetailEl = detailElems[0];
            const fldType = firstDetailEl?.getAttribute('fldtype');

            td.className = 'align-middle detailRow';
            td.classList.add(fldType === 'S' ? 'text-end' : 'text-start');
            td.innerHTML = detailText;

            if (firstDetailEl) {
                copySubfileAttrsToCell(firstDetailEl, td);
            }

            currentMainRow.appendChild(td);

            if (thead.dataset.detailAugmented !== '1') {
                addThOnce('detail-merged', detailThPrefix, null);
            }
        } else {
            detailElems.forEach((el, idx) => {
                const field = document.getElementById(el.id);
                if (field && field.getAttribute('flduse') === 'L') return;

                const td = document.createElement('td');
                const fldType = el.getAttribute('fldtype') || field?.getAttribute('fldtype');

                td.className = 'align-middle detailRow';
                td.classList.add(fldType === 'S' ? 'text-end' : 'text-start');
                td.innerHTML = el.innerHTML;

                copySubfileAttrsToCell(el, td);
                currentMainRow.appendChild(td);

                const colKey =
                    field?.getAttribute('fldcolumn') ||
                    field?.getAttribute('fldname') ||
                    `d-${idx}`;

                const label =
                    field?.getAttribute('fldtext') ||
                    `${detailThPrefix} ${idx + 1}`;

                const name = field?.getAttribute('name') || null;

                if (thead.dataset.detailAugmented !== '1') {
                    addThOnce(colKey, label, name);
                }
            });
        }

        row.remove();
    }

    thead.dataset.detailAugmented = '1';
}

function removeEmptyDataColumnsFromList(tableId = "subfileTable") {
    const table = document.getElementById(tableId);
    if (!table) return;

    // BYPASS durante export Excel
    if (window.shouldBypassForExport(table)) return;

    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    if (!thead || !tbody) return;

    const headerCells = Array.from(thead.querySelectorAll("th"));
    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (headerCells.length === 0 || rows.length === 0) return;

    // helper: controlla se una cella ha contenuto visibile o elementi interattivi
    const cellHasContent = (cell) => {
        if (!cell) return false;

        // interattivi presenti?
        if (cell.querySelector("input, select, textarea, button")) return true;

        // testo visibile?
        const text = (cell.textContent || "").replace(/\u00A0/g, " ").trim();
        if (text.length > 0) return true;

        // figli visibili (layout)
        const hasVisibleChild = Array.from(cell.children).some(
            (el) => el.offsetWidth > 0 || el.offsetHeight > 0
        );
        return hasVisibleChild;
    };

    // individua colonne completamente vuote
    const columnsToRemove = [];
    for (let colIndex = 0; colIndex < headerCells.length; colIndex++) {
        let isEmptyColumn = true;

        for (const row of rows) {
            const cell = row.cells[colIndex];
            if (cellHasContent(cell)) {
                isEmptyColumn = false;
                break;
            }
        }

        if (isEmptyColumn) columnsToRemove.push(colIndex);
    }

    if (columnsToRemove.length === 0) return;

    // Rimuovi dall'ultima alla prima per non sfasare gli indici
    columnsToRemove.sort((a, b) => b - a);

    // th
    for (const colIndex of columnsToRemove) {
        if (headerCells[colIndex]) headerCells[colIndex].remove();
    }

    // td
    for (const row of rows) {
        const cells = Array.from(row.cells);
        for (const colIndex of columnsToRemove) {
            if (cells[colIndex]) cells[colIndex].remove();
        }
    }
}

function getDetailRowElements(mapFormatSubfile) {
    const rowToCols = new Map();
    const rowToElements = new Map();

    for (const [, elem] of mapFormatSubfile.entries()) {
        if (!elem) continue;

        const fldUse = (elem.getAttribute("flduse") || "").trim();

        // ignora completamente le label
        if (fldUse === "L") continue;

        const row = getRow(elem);
        const col = getCol(elem);

        if (!rowToCols.has(row)) {
            rowToCols.set(row, new Set());
            rowToElements.set(row, []);
        }

        rowToCols.get(row).add(col);
        rowToElements.get(row).push(elem);
    }

    const sortedRows = Array.from(rowToCols.keys()).sort((a, b) => a - b);
    if (sortedRows.length === 0) return new Map();

    const detailRowMap = new Map();
    let previousMainCols = null;

    for (let i = 0; i < sortedRows.length; i++) {
        const currentRow = sortedRows[i];
        const currentCols = Array.from(rowToCols.get(currentRow)).sort((a, b) => a - b);
        const currentElems = rowToElements.get(currentRow);

        if (!previousMainCols) {
            previousMainCols = currentCols;
            continue;
        }

        const isSameStructure =
            currentCols.length === previousMainCols.length &&
            currentCols.every((col, idx) => col === previousMainCols[idx]);

        if (isSameStructure) {
            previousMainCols = currentCols;
        } else {
            detailRowMap.set(currentRow, currentElems);
        }
    }

    return detailRowMap;
}

function renderDropdownFromDataOptions(inputElement) {
    const container = inputElement.closest('.position-relative');
    const dropdown = container?.querySelector('ul.dropdown-menu');
    const icon = container?.querySelector('button i');
    const dataoptions = inputElement.getAttribute('dataoption');

    if (!dropdown || !dataoptions) return;

    // Pulisce completamente il menu
    dropdown.innerHTML = '';

    const optionsArray = dataoptions.split(';')
        .map(str => {
            try {
                return JSON.parse(str);
            } catch (e) {
                return null;
            }
        })
        .filter(opt => opt && opt.code);

    // Categorizza
    const opzioni = [];
    const componenti = [];
    const selezioni = [];

    optionsArray.forEach(opt => {
        const codice = opt.code;
        const isNumeric = /^[0-9]+$/.test(codice);
        const numVal = parseInt(codice, 10);

        if (isNumeric && numVal < 30) {
            opzioni.push(opt);
        } else if (isNumeric) {
            componenti.push(opt);
        } else {
            selezioni.push(opt);
        }
    });

    // Funzione per creare header/separatore
    function createSeparator(label) {
        const li = document.createElement('li');
        li.innerHTML = `<strong class="dropdown-header dropdown-header-custom" >${label}</strong>`;
        return li;
    }

    // Funzione per creare voce
    function createOptionItem(opt) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'dropdown-item';
        a.setAttribute('data-code', opt.code);
        a.textContent = `${opt.code} - ${opt.descr}`;

        a.addEventListener('click', e => {
            e.preventDefault();
            dropdown.style.display = 'none';
            if (icon) icon.className = 'fa-solid fa-chevron-down';
            inputElement.value = opt.code;
            pui.set(inputElement.id, opt.code);
            inputElement.focus();
            setCursor(inputElement.id);
            pressKey('Enter');
        });

        li.appendChild(a);
        return li;
    }

    // Inserisce le tre sezioni
    if (opzioni.length) {
        dropdown.appendChild(createSeparator('Attività'));
        opzioni.forEach(opt => dropdown.appendChild(createOptionItem(opt)));
    }

    if (componenti.length) {
        dropdown.appendChild(createSeparator('Componente'));
        componenti.forEach(opt => dropdown.appendChild(createOptionItem(opt)));
    }

    if (selezioni.length) {
        dropdown.appendChild(createSeparator('Selezione rapida'));
        selezioni.forEach(opt => dropdown.appendChild(createOptionItem(opt)));
    }
}
function computeValue(el) {
    if (!el) return '';

    // Se l'elemento è un contenitore come <td> o <div> con dentro un input
    const input = el.querySelector?.('input, select, textarea');
    if (input) return input.value;

    const tag = el.tagName?.toUpperCase();

    switch (tag) {
        case 'INPUT':
        case 'TEXTAREA':
        case 'SELECT':
            return el.value;
        default:
            return el.textContent?.trim() || el.innerText?.trim() || el.fieldInfo?.data || '';
    }
}

/**
 * Eredita tutti gli attributi HTML di ciascun elemento della prima riga
 * su tutti gli elementi della stessa colonna nelle righe successive.
 * Funziona su chiavi della forma: "list_FMT_#_row_col" → HTMLElement
 */
function inheritAttributesSubfile(mapFormatSubfile, offsetRow = 1) {
    if (offsetRow === 0) {
        offsetRow = 1;
    }

    const elementByRowCol = new Map();

    // Costruisci la mappa "riga_colonna" → elemento
    for (const [key, element] of mapFormatSubfile.entries()) {
        if (!(element instanceof HTMLElement)) continue;

        const match = key.match(/_(\d+)_(\d+)$/);
        if (!match) continue;

        const row = parseInt(match[1], 10);
        const col = parseInt(match[2], 10);
        const mapKey = `${row}_${col}`;

        elementByRowCol.set(mapKey, element);
    }

    // Attributi che NON devono mai essere ereditati
    const excludedAttrs = new Set([
        'id',
        'value',
        'name',
        'readonly',
        'data-removed-classes',
        'data-was-hidden-by-class'
    ]);

    // Passaggio: per ogni elemento, copia gli attributi dal target
    for (const [key, element] of mapFormatSubfile.entries()) {
        if (!(element instanceof HTMLElement)) continue;

        const match = key.match(/_(\d+)_(\d+)$/);
        if (!match) continue;

        const row = parseInt(match[1], 10);
        const col = parseInt(match[2], 10);

        const targetRow = row - offsetRow;
        const targetKey = `${targetRow}_${col}`;
        const targetElement = elementByRowCol.get(targetKey);

        if (!targetElement || targetElement === element) continue;

        const normalize = v => (v == null ? null : v.trim());
        const fldNameBefore = normalize(element.getAttribute("fldname"));

        const baseAttrs = targetElement.attributes;
        for (let i = 0; i < baseAttrs.length; i++) {
            const { name, value } = baseAttrs[i];

            if (excludedAttrs.has(name)) continue;

            try {
                element.setAttribute(name, value);
            } catch (err) {
                consoleLog.warn(`Error when copying ${name} da ${targetKey} a ${key}:`, err);
            }
        }

        const fldNameAfter = normalize(element.getAttribute("fldname"));

        if (fldNameBefore !== null && fldNameBefore !== fldNameAfter) {
            const fmtfilename =
                element.getAttribute("fmtfilename") ||
                targetElement.getAttribute("fmtfilename") ||
                "";

            const fmtname =
                element.getAttribute("fmtname") ||
                targetElement.getAttribute("fmtname") ||
                "";

            if (fmtfilename && fmtname && fldNameAfter) {
                element.setAttribute("name", `${fmtfilename}_${fmtname}_${fldNameAfter}`);
            }
        }
    }
}

function calculateRowOffset(mapFormatSubfile) {
    const entries = [...mapFormatSubfile.entries()];
    if (entries.length === 0) return null;

    const [firstKey, firstValue] = entries[0];

    const match = firstKey.match(/^list_([^_]+)_(\d+)_(\d+)_(\d+)$/);
    if (!match) return null;

    const baseId = match[1];
    const baseIndex = parseInt(match[2], 10);
    const baseRow = parseInt(match[3], 10);

    // Mappa colonne → size dalla riga base
    const baseColSizeMap = new Map();

    for (const [key, value] of entries) {
        const parts = key.match(/^list_[^_]+_(\d+)_(\d+)_(\d+)$/);
        if (!parts) continue;

        const idx = parseInt(parts[1], 10);
        const row = parseInt(parts[2], 10);
        const col = parseInt(parts[3], 10);

        if (idx === baseIndex && row === baseRow) {
            const size = value?.fieldInfo?.size;
            if (size != null) {
                baseColSizeMap.set(col, size);
            }
        }
    }

    // Scorri i subfile successivi
    for (let offset = 1; offset < 100; offset++) {
        const testIndex = baseIndex + offset;
        const testRow = baseRow + offset;

        let matchOk = true;
        const matchedCols = [];

        for (const [col, baseSize] of baseColSizeMap.entries()) {
            const testKey = `list_${baseId}_${testIndex}_${testRow}_${col}`;
            const testEntry = mapFormatSubfile.get(testKey);

            if (!testEntry || testEntry.fieldInfo?.size !== baseSize) {
                matchOk = false;
                break;
            }

            matchedCols.push(col);
        }

        if (matchOk) {
            return {
                offset,
                foundSubfileIndex: testIndex,
                matchedRow: testRow,
                matchedCols,
            };
        }
    }

    return null;
}

function extractMainRowStructure(mapFormatSubfile) {
    const result = calculateRowOffset(mapFormatSubfile);
    if (!result) return null;

    const { matchedRow, matchedCols } = result;
    const structure = new Set(matchedCols);

    return {
        baseRow: matchedRow,
        baseCols: structure
    };
}



// --- Ultima opzione predefinita calcolata (1 oppure 5) ---
window.optionPressKeyValue = (typeof window.optionPressKeyValue === "string") ? window.optionPressKeyValue : null;

/**
 * Correzione del 12/09/2026: riconosce l'opzione 1 anche nell'elenco
 * dataoption di VDSCT, con codice "1" o "01", quando manca il testo "1=".
 * Il valore predefinito viene ricalcolato sulle opzioni correnti per evitare
 * di mantenere quello della schermata precedente; in assenza di 1 usa 5.
 * Non modifica il valore digitato manualmente nel campo.
 *
 * Cerca il codice 1 nelle opzioni di VDSCT (anche come "01").
 * Mantiene il riconoscimento del testo "1=" come fallback.
 */

function getOptionPressKeyValue(root = document) {

    const scope = root || document;

    let found = false;

    /*
     * Prima controllo direttamente il dataoption
     * del campo VDSCT.
     *
     * Sono validi SOLO: 1 - 01
     */
    const optionFields =
        scope.querySelectorAll(
            '[fldname="VDSCT"][dataoption]'
        );

    for (const field of optionFields) {

        const options =
            (field.getAttribute("dataoption") || "")
                .split(";");

        found = options.some(raw => {

            try {

                const option = JSON.parse(raw);

                const code =
                    String(option?.code ?? "").trim();

                return (
                    code === "1" ||
                    code === "01"
                );

            } catch (_) {

                return false;

            }

        });

        if (found) {
            break;
        }

    }

    /*
     * Fallback:
     * cerca eventuale indicazione testuale
     *
     * 1=
     * 1 =
     */
    if (!found) {

        const candidates =
            scope.querySelectorAll(
                '.recordTypeC [fmtname], ' +
                '.recordTypeC [fmtName], ' +
                '.recordTypeC div, ' +
                '[fmtname], ' +
                '[fmtName], ' +
                '[fldname], ' +
                'div'
            );

        for (const el of candidates) {

            const text =
                (el.textContent || "")
                    .trim()
                    .replace(/\s+/g, " ");

            if (/^1\s*=/.test(text)) {

                found = true;
                break;

            }

        }

    }

    window.optionPressKeyValue =
        found ? "1" : "5";

    return window.optionPressKeyValue;
}

/** Ricalcola sulle opzioni correnti, senza riutilizzare la schermata precedente. */
function getPressKeyValue() {
    return getOptionPressKeyValue(document);
}


/* ================================  W I N D O W  =================================== */

redrawWindowAppCore = function () {
    let currentWindow = getCurrentWindow();
    if (currentWindow !== null && currentWindow.windowObject !== null) {
        removeBasicClass();

        let windowObject = currentWindow.windowObject;
        containerWindowOutside = document.createElement("div");
        containerWindowOutside.id = "containerWindowOutside";
        containerWindowOutside.className = "containerWindowOutside";
        containerWindowOutside.setAttribute("name", "containerWindowOutside");
        document.getElementById("5250").append(containerWindowOutside);

        containerWindowInside = document.createElement("div");
        containerWindowInside.id = "containerWindowInside";
        containerWindowInside.className = "containerWindowInside";
        containerWindowInside.setAttribute("name", "containerWindowInside");

        containerWindowInsideHeader = document.createElement("div");
        containerWindowInsideHeader.id = "containerWindowInsideHeader";
        containerWindowInsideHeader.classList.add("containerWindowInsideHeader");
        containerWindowInsideHeader.style.display = "flex";
        windowHeaderTitle = document.createElement("div");
        windowHeaderTitle.classList.add("headerTitle");
        windowHeaderTitle.textContent = getProgramTitle.name();
        containerWindowInsideHeader.append(windowHeaderTitle);
        containerWindowInside.append(containerWindowInsideHeader);

        containerWindowInsideBody = document.createElement("div");
        containerWindowInsideBody.id = "containerWindowInsideBody";
        containerWindowInsideBody.classList.add("containerWindowInsideBody");
        containerWindowInside.append(containerWindowInsideBody);
        containerWindowOutside.append(containerWindowInside);

        containerWindowInsideFooter = document.createElement("div");
        containerWindowInsideFooter.id = "containerWindowInsideFooter";
        containerWindowInsideFooter.classList.add("containerWindowInsideFooter");
        containerWindowInside.append(containerWindowInsideFooter);
        containerWindowOutside.append(containerWindowInside);

        containerWindowInsideFooterUp = document.createElement("div");
        containerWindowInsideFooterUp.id = "containerWindowInsideFooterUp";
        containerWindowInsideFooterUp.classList.add("containerWindowInsideFooterUp");
        containerWindowInsideFooter.append(containerWindowInsideFooterUp);

        containerWindowInsideFooterDown = document.createElement("div");
        containerWindowInsideFooterDown.id = "containerWindowInsideFooterDown";
        containerWindowInsideFooterDown.classList.add("containerWindowInsideFooterDown");

        containerFunctionKeyWindow = document.createElement("div");
        containerFunctionKeyWindow.id = "containerFunctionKeyWindow";
        containerFunctionKeyWindow.className = "containerFunctionKeyWindow";
        containerWindowInsideFooterDown.append(containerFunctionKeyWindow);
        containerWindowInsideFooter.append(containerWindowInsideFooterDown);

        removePreviousWindow(windowObject);
        moveFunctionKeyWindow(windowObject);

        let fields = retrieveAllFields.rowColMap(windowObject);

        let lastFieldRow = null;
        let setNewContainer = true;
        let iField = 0;

        let containerElement = null;
        let rowElement = null;

        for (const [key, value] of fields) {
            if (value.id.includes("_W")) {
                let fieldValue = value;
                let validField = true
                if (fieldValue.textContent.toLowerCase().includes("immettere") && fieldValue.textContent.toLowerCase().includes("premere")) {
                    validField = false;
                }
                if (validField) {
                    let fieldRow = Number(key.substring(0, key.indexOf("_")));

                    iField++;

                    fieldValue.classList.add("col");
                    fieldValue.style.top = null;
                    fieldValue.style.bottom = null;
                    fieldValue.style.left = null;
                    fieldValue.style.right = null;
                    fieldValue.style.position = null;

                    if (fieldValue.style.maxWidth == null || fieldValue.style.maxWidth == "") {
                        fieldValue.style.maxWidth = fieldValue.style.width;
                    }
                    //fieldValue.style.maxWidth = "none";

                    fieldValue.style.width = null;

                    if (lastFieldRow != fieldRow) {
                        setNewContainer = true;
                    }

                    if (Boolean(setNewContainer)) {
                        setNewContainer = false;
                        iField = 1;

                        let elementId = fieldRow;

                        containerElement = document.createElement("div");
                        containerElement.id = "container5250_" + elementId;
                        containerElement.className = "container5250"
                        containerElement.setAttribute("name", "container5250");

                        rowElement = document.createElement("div");
                        rowElement.id = "row5250_" + elementId;
                        rowElement.className = "row justify-content-start align-items-center gy-2 gx-4";
                        rowElement.setAttribute("name", "row5250");

                        lastFieldRow = fieldRow;
                    }

                    if (containerElement != null) {
                        rowElement.append(fieldValue);
                        containerElement.append(rowElement);
                        containerWindowInsideBody.append(containerElement);
                    }
                }
            }
        }

        removeContainerLabel(containerWindowInsideBody.id);
        setContainerLabel(containerWindowInsideBody.id);
        addContainerLabel(containerWindowInsideBody.id);

        removePuiCalendar();

        updateWindowFooterAlert();

        document.querySelectorAll('[fldname="MSGPGMQ"]').forEach(el => {
            el.classList.remove(...el.classList); // rimuove tutte le classi
            el.classList.add('messageBadge', 'badge', 'bg-warning-custom', 'text-dark');
        });

        resizeProgramAppCore();
        redrawAdvanced();

        removeEmptyReadOnlyFormat4();

        windowObject.remove();

        // Elimina elementi
        let selector = 'form[name="main"]';
        reserveRemoveElements(selector);
    }
}

redrawWindowAppCoreBasic = function () {
    let currentWindow = getCurrentWindow();
    if (currentWindow !== null && currentWindow.windowObject !== null) {
        let windowObject = currentWindow.windowObject;
        windowObject.classList.add("window");
        let height = windowObject.offsetHeight;
        if (height === 0 && windowObject.style.height) {
            height = parseInt(windowObject.style.height, 10);
        }
        height += 40;
        windowObject.style.height = height + "px";

        let windowHeader = newElement();
        windowHeader.id = windowObject.id + "Header";
        windowHeader.className = "windowHeader";
        windowObject.appendChild(windowHeader)

        let windowBody = newElement();
        windowBody.id = windowObject.id + "Body";
        windowBody.className = "windowBody";
        windowObject.appendChild(windowBody);

        let windowMessage = newElement();
        windowMessage.id = windowObject.id + "Message";
        windowMessage.className = "windowMessage";
        windowObject.appendChild(windowMessage);

        let windowFooter = newElement();
        windowFooter.id = windowObject.id + "Footer";
        windowFooter.className = "windowFooter";
        windowFooter.innerHTML = '<div id= "containerFunctionKeyWindow" class="containerFunctionKeyWindow"></div>';
        windowObject.appendChild(windowFooter);
        $("#" + windowBody.id).append(...windowObject.childNodes);
        $("#" + windowHeader.id).insertBefore("#" + windowBody.id);
        $("#" + windowMessage.id).insertAfter("#" + windowBody.id);
        $("#" + windowFooter.id).insertAfter("#" + windowMessage.id);

        var divHeader = windowBody.querySelectorAll('[id^=D_1_]');
        for (let i = 0; i < divHeader.length; i++) {
            divHeader[i].textContent = divHeader[i].textContent.trim();
            divHeader[i].style.visibility = "hidden";
            if (i == 0) {
                divHeader[i].style.textAlign = "left"
            } else {
                if (i == divHeader.length - 1) {
                    divHeader[i].style.textAlign = "right";
                } else {
                    divHeader[i].style.textAlign = "center";
                }
            }
            if (i == 1) {
                divHeader[i].classList.add("headerTitle");
                divHeader[i].style.visibility = "visible";
                divHeader[i].style.color = "var(--bs-light)";
                divHeader[i].style.top = convertPx.rem("10px");
                divHeader[i].style.top = "";
                divHeader[i].style.left = "0";
                divHeader[i].style.paddingLeft = convertPx.rem("10px");
                divHeader[i].style.textAlign = "left";
                divHeader[i].style.width = "auto";
            }

            divHeader[i].classList.add("rowHeader")
            windowHeader.appendChild(divHeader[i]);
        }

        $("#" + windowHeader.id).append(divHeader);
        removePreviousWindow(windowObject);
        moveFunctionKeyWindow(windowObject);
        $("#" + windowObject.id).appendTo('#containerWindow')
        $("#" + windowObject.id).detach().appendTo('#containerWindow').css("z-index", "99");

        $("#" + windowObject.id).css("position", "absolute");
        let windowTop = Math.max(0, 10, (($(window).height() - $("#" + windowObject.id).outerHeight()) / 2) + $(window).scrollTop() - $("#containerHeader").outerHeight() - 40) + "px";
        $("#" + windowObject.id).css("top", convertPx.rem(windowTop));
        let windowLeft = Math.max(0, 10, (($(window).width() - $("#" + windowObject.id).outerWidth()) / 2) + $(window).scrollLeft()) + "px";
        $("#" + windowObject.id).css("left", convertPx.rem(windowLeft));
        let windowHeight = $("#" + windowObject.id).height();
        $("#" + windowObject.id).css("height", convertPx.rem(windowHeight));
        let windowWidth = $("#" + windowObject.id).width();
        $("#" + windowObject.id).css("width", convertPx.rem(windowWidth));

        var divs = document.getElementById("5250").getElementsByTagName("div");
        for (let i = 0; i < divs.length; i++) {
            let div = divs[i];
            if (div.style.visibility != "hidden") {
                div.style.display = "none";
            }
        }
    }
}


function updateWindowFooterAlert() {
    // FooterUp (crea o riusa)
    let footerUp = document.getElementById("containerWindowInsideFooterUp");
    if (!footerUp) {
        footerUp = document.createElement("div");
        footerUp.id = "containerWindowInsideFooterUp";
        footerUp.className = "containerWindowInsideFooterUp";
        document.getElementById("containerWindowInside")?.appendChild(footerUp);
    }

    // Container alert (crea o riusa)
    let containerWindowAlert = document.getElementById("containerWindowAlert");
    if (!containerWindowAlert) {
        containerWindowAlert = document.createElement("div");
        containerWindowAlert.id = "containerWindowAlert";
        containerWindowAlert.className = "containerWindowAlert align-items-center gap-2";
        footerUp.appendChild(containerWindowAlert);
    }

    // Messaggi nel footer (crea o riusa)
    let messageWindowAlert = document.getElementById("messageWindowAlert");
    if (!messageWindowAlert) {
        messageWindowAlert = document.createElement("div");
        messageWindowAlert.id = "messageWindowAlert";
        messageWindowAlert.className = "messageWindowAlert";
        containerWindowAlert.insertBefore(messageWindowAlert, containerWindowAlert.firstChild);
    }

    // Controlli (crea o riusa)
    let controlWindowAlert = document.getElementById("controlWindowAlert");
    if (!controlWindowAlert) {
        controlWindowAlert = document.createElement("div");
        controlWindowAlert.id = "controlWindowAlert";
        controlWindowAlert.className = "controlWindowAlert d-flex gap-2";
        containerWindowAlert.appendChild(controlWindowAlert);
    }

    // === MODIFICA 1: selettore basato su fldismessage ===
    const messages = Array.from(document.querySelectorAll('[fldismessage="1"]'));

    const info = messages.map(el => {
        const id = el.id || "";
        const parts = id.split("_");
        const rowStr = parts[1];
        const colStr = parts[2];
        const row = Number(el.getAttribute("fldrow") ?? rowStr);
        const col = Number(el.getAttribute("fldcolumn") ?? colStr);
        const text = (el.textContent || "").replace(/\u00a0/g, " ").trim();
        return { el, row, col, text };
    });

    // evita che il "+" venga scelto come primo messaggio
    const first = info.find(m => m.text.length > 0 && m.text !== "+");
    const messageRow = first?.row ?? null;
    const messageId = first?.id ?? null;

    if (!messageRow) {
        messageWindowAlert.replaceChildren();
        containerWindowAlert.style.display = "none";
        return { visible: false, row: null };
    }

    // Mostra
    containerWindowAlert.style.display = "";
    footerUp.style.display = "";

    // Sposta SOLO gli elementi della stessa riga
    const sameRowMsgs = Array.from(document.querySelectorAll(`[fldismessage="1"]`))
        .filter(el => {
            const rr = Number(el.getAttribute("fldrow")) ||
                Number((el.getAttribute("fldid") || el.id || "").split("_")[1]);
            return rr === messageRow;
        });

    const nodesToMove = new Set(sameRowMsgs);
    messageWindowAlert.replaceChildren(...nodesToMove);

    // === MODIFICA 2: elimina i "+" della stessa riga ===
    messageWindowAlert.querySelectorAll('[fldismessage="1"]').forEach(el => {
        const r = Number(el.getAttribute("fldrow")) ||
            Number((el.getAttribute("fldid") || el.id || "").split("_")[1]);
        const txt = (el.textContent || "").replace(/\u00a0/g, " ").trim();
        if (r === messageRow && txt === "+") el.remove();
    });

    // === CLEANUP SOLO IN messageWindowAlert ===
    messageWindowAlert.querySelectorAll("div").forEach(el => {
        const isEmpty = el.children.length === 0 && (el.textContent || "").replace(/\u00a0/g, " ").trim() === "";
        const isMarkedEmpty = el.getAttribute("empty") === "true";
        if (isEmpty || isMarkedEmpty) {
            el.remove();
        }
    });

    // Bottoni SU/GIÙ (crea o riusa)
    let arrowUp = document.getElementById("arrowAlertUp");
    if (!arrowUp) {
        arrowUp = document.createElement("button");
        arrowUp.type = "button";
        arrowUp.id = "arrowAlertUp";
        arrowUp.className = "btn btn-outline-secondary btn-sm";
        arrowUp.innerHTML = '<i id="iArrowUp" class="fas fa-arrow-up"></i>';
    }

    let arrowDown = document.getElementById("arrowAlertDown");
    if (!arrowDown) {
        arrowDown = document.createElement("button");
        arrowDown.type = "button";
        arrowDown.id = "arrowAlertDown";
        arrowDown.className = "btn btn-outline-secondary btn-sm";
        arrowDown.innerHTML = '<i id="iArrowDown" class="fas fa-arrow-down"></i>';
    }

    controlWindowAlert.replaceChildren(arrowUp, arrowDown);

    // Handlers (lasciati come li hai ora)
    arrowUp.onclick = () => {
        setCursor(messageId);
        pressKey("PageUp");
    };
    arrowDown.onclick = () => {
        setCursor(messageId);
        pressKey("PageDown");
    };

    return { visible: true, row: messageRow };
}


// =========================  T E X T   A R E A   ============================== */
function continuousTextareaAutoAttach(userOptions) {
    // ---- Config di default ----
    const OPT = Object.assign({
        scope: "#container5250Program", // radice in cui cercare i master
        hideOriginal: true,             // nasconde padre+figli
        excludeSubfile: true,           // ignora tabelle subfile
        syncBack: true,                 // textarea -> segmenti (le modifiche fatte nella textarea devono essere propagate nei campi originali)
        rows: undefined,                // rows iniziali della textarea
        showLabel: false,               // di solito c'è già la label del campo
        labelText: null,                // se showLabel=true e vuoi forzarla
        widthRem: 85,                   // larghezza “logica” del wrapper
        maxRowsVisual: 30,              // limite auto-resize
        preserveNewlines: true          // consenti \n per editing (non vanno nei segmenti)
    }, userOptions || {});

    // ---- helpers ----
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const $ = (sel, root = document) => root.querySelector(sel);
    const root = typeof OPT.scope === "string" ? $(OPT.scope) : (OPT.scope || document);
    if (!root) return;

    const parseRC = id => {
        const m = /^(I|D)_(\d+)_(\d+)(?:_W\d+)?$/i.exec(id || "");
        return m ? { row: +m[2], col: +m[3] } : null;
    };
    const cap = el => {
        const raw = el?.getAttribute?.("maxlength");
        const n = raw != null ? parseInt(raw, 10)
            : (typeof el?.maxLength === "number" ? el.maxLength : NaN);
        return Number.isFinite(n) && n > 0 ? n : 0;
    };
    const fldLen = el => {
        const raw = el.getAttribute("fldLength");
        const n = raw != null ? parseInt(raw, 10) : NaN;
        return Number.isFinite(n) && n > 0 ? n : null;
    };

    const isInputEditable = el => el?.tagName === "INPUT" && !el.readOnly && !el.classList?.contains("readOnly");

    const valueOf = el => !el ? "" : (el.tagName === "INPUT" ? (el.value || "") : (el.textContent || ""));

    const setValue = (el, val) => {
        if (!el) return;
        if (el.tagName === "INPUT") {
            if (el.value !== val) el.value = val;
            try { if (typeof pui !== "undefined" && pui.set) pui.set(el.id, val); } catch (_) { }
        } else {
            if (el.textContent !== val) el.textContent = val;
        }
    };
    const rtrim = s => (s || "").replace(/\s+$/g, "");

    const getChain = master => {
        const groupId = master.dataset.contGroup || master.id;
        if (!groupId) return [];
        const chain = $$(`[data-cont-group="${groupId}"]`, document);
        if (!chain.some(x => x.id === groupId)) {
            const m = document.getElementById(groupId);
            if (m) chain.push(m);
        }
        chain.sort((a, b) => {
            const ia = a.dataset.contIndex != null ? parseInt(a.dataset.contIndex, 10) : NaN;
            const ib = b.dataset.contIndex != null ? parseInt(b.dataset.contIndex, 10) : NaN;
            const aHas = Number.isFinite(ia), bHas = Number.isFinite(ib);
            if (aHas && bHas) return ia - ib;
            if (aHas) return -1;
            if (bHas) return 1;
            const ra = parseRC(a.id), rb = parseRC(b.id);
            if (!ra || !rb) return 0;
            return ra.row === rb.row ? ra.col - rb.col : ra.row - rb.row;
        });
        return chain;
    };

    function buildUI(master, chain) {
        const groupId = master.dataset.contGroup || master.id;
        const taId = groupId + "_TA";
        const cntId = groupId + "_CNT";   // unico contatore (in basso)

        // Evita duplicati
        if (document.getElementById(taId)) return null;

        const inputGroup = master.closest('.input-group') || master.parentElement || master;

        // ===== WRAPPER: textarea + contatore CARATTERI (basso, a destra) =====
        const wrapper = document.createElement("div");
        wrapper.className = "mb-0 w-100 mt-0";
        wrapper.style.width = "100%";
        wrapper.style.maxWidth = "100%";
        wrapper.style.marginLeft = "0";
        wrapper.style.marginRight = "0";
        wrapper.style.flexBasis = "100%";

        const ta = document.createElement("textarea");
        ta.id = taId;
        ta.className = 'form-control formControl';
        copyFormControlClasses(master, ta); // eredita classi che iniziano con formControl
        ta.autocomplete = "off";
        ta.spellcheck = false;
        ta.style.width = "100%";
        ta.style.resize = "vertical";
        ta.style.whiteSpace = "pre-wrap";

        // readonly se tutti segmenti sono <div>
        const allDivs = chain.every(el => el.tagName !== 'INPUT');
        if (allDivs) {
            ta.readOnly = true;
            ta.setAttribute("aria-readonly", "true");
            ta.classList.add("bg-light", "text-muted");
        }
        wrapper.appendChild(ta);

        // Contatore caratteri in basso a destra (UNICO)
        const bottomRow = document.createElement("div");
        bottomRow.className = "d-flex mt-1 justify-content-end";
        const charCounter = document.createElement("div");
        charCounter.id = cntId;
        charCounter.innerHTML = `<span class="badge rounded-pill bg-secondary">0 / 0</span>`;
        bottomRow.appendChild(charCounter);
        wrapper.appendChild(bottomRow);

        // Monta sotto l’input-group (dopo la label già esistente)
        inputGroup.appendChild(wrapper);

        return { ta, charCounter, wrapper };
    }

    // ---- logica di editing/sync con contatore ----
    function attachBehavior(master, chain, ui) {
        if (!ui) return;
        const { ta, charCounter } = ui;

        const isUpper =
            (master.style.textTransform || "").toLowerCase() === "uppercase" ||
            getComputedStyle(master).textTransform.toLowerCase() === "uppercase";

        const caps = chain.map(el => cap(el));
        const totalMax = fldLen(master) || (caps.reduce((s, n) => s + n, 0) || undefined);

        // stato readonly se NESSUN segmento è editabile
        const editable = chain.some(isInputEditable);
        if (!editable) {
            ta.readOnly = true;
            ta.setAttribute("aria-readonly", "true");
            ta.classList.add("bg-light", "text-muted");
        }

        // hydrate iniziale
        const initial = rtrim(chain.map(valueOf).join("").replace(/\u00A0/g, " "));
        ta.value = isUpper ? initial.toUpperCase() : initial;

        // helpers
        const effLenNoNL = s => (s || "").replace(/\r/g, "").replace(/\n/g, "").length;
        const autosize = () => {
            const lines = (ta.value.match(/\n/g) || []).length + 1;
            ta.rows = Math.min(Math.max(lines, 3), OPT.maxRowsVisual);
        };
        const updateCharCounter = () => {
            const eff = effLenNoNL(ta.value);
            const atLimit = totalMax ? eff >= totalMax : false;
            charCounter.innerHTML =
                `<span class="badge rounded-pill ${atLimit ? "bg-danger" : "bg-secondary"}">${eff} / ${totalMax ?? eff}</span>`;
        };
        const enforceMaxPayload = () => {
            if (!totalMax) return;
            const raw = (ta.value || "");
            let eff = 0, out = "";
            for (let i = 0; i < raw.length; i++) {
                const ch = raw[i];
                if (ch !== "\n" && ch !== "\r") {
                    if (eff >= totalMax) break;
                    eff++;
                }
                out += ch;
            }
            if (out !== raw) ta.value = out;
        };
        const distribute = () => {
            if (!OPT.syncBack || !editable) return;

            // Testo corrente della textarea
            let txt = (ta.value || "").replace(/\r|\n/g, "");  // rimuove ritorni a capo
            if (isUpper) txt = txt.toUpperCase(); // forza maiuscolo se necessario

            // Se la catena già rappresenta esattamente il testo della textarea, non fare nulla
            const chainText = chain.map(valueOf).join("").replace(/\u00A0/g, " ");
            if (chainText === txt) return;

            let pos = 0;
            // per ciascun campo (segmento) nella catena
            for (let i = 0; i < chain.length; i++) {
                const seg = chain[i]; // elemento <input> originale i-esimo
                const take = caps[i] || (totalMax ? Math.max(0, totalMax - pos) : 9999);  // "take" = quanti caratteri prendere per questo segmento
                const slice = take > 0 ? txt.substring(pos, pos + take) : ""; // estrai una sottostringa dal testo complessivo

                setValue(seg, slice); // scrivi la parte nel campo corrispondente
                pos += take; // avanza la posizione
            }
        };

        // bind eventi (solo se editabile)
        if (editable && !ta.dataset.bound) {
            ta.addEventListener("input", () => {
                if (isUpper) {
                    const s = ta.selectionStart, e = ta.selectionEnd;
                    ta.value = (ta.value || "").toUpperCase();
                    try { ta.setSelectionRange(s, e); } catch (_) { }
                }
                enforceMaxPayload();
                distribute();
                autosize();
                updateCharCounter();
            });
            ta.addEventListener("paste", () => setTimeout(() => {
                ta.value = (ta.value || "").replace(/\r/g, "");
                if (!OPT.preserveNewlines) ta.value = ta.value.replace(/\n/g, "");
                if (isUpper) ta.value = ta.value.toUpperCase();
                enforceMaxPayload();
                distribute();
                autosize();
                updateCharCounter();
            }, 0));
            ta.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    const { selectionStart, selectionEnd, value } = ta;
                    ta.value = value.slice(0, selectionStart) + "\n" + value.slice(selectionEnd);
                    ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
                    ta.dispatchEvent(new Event("input"));
                }
                if (!OPT.preserveNewlines && e.key === "Enter") {
                    e.preventDefault(); // se non vogliamo \n
                }
            });
            ta.dataset.bound = "1";
        }

        // setup iniziale UI
        ta.rows = Math.min(Math.max(OPT.rows ?? 3, 3), Math.max(3, OPT.maxRowsVisual));
        if (totalMax) ta.maxLength = totalMax + (OPT.preserveNewlines ? chain.length : 0);
        autosize();
        updateCharCounter();
        distribute();
    }

    // ---- main loop: trova i master e applica UI+sync ----
    const masters = $$('[data-cont-master="1"]', root);
    for (const master of masters) {
        if (OPT.excludeSubfile && (master.closest('#subfileTable') || master.closest('.containerRecordTypeSubfile'))) {
            continue;
        }
        const chain = getChain(master);
        if (!chain || chain.length < 2) continue;

        const ui = buildUI(master, chain);
        if (!ui) continue;

        if (OPT.hideOriginal) {
            chain.forEach(seg => {
                if (!seg.dataset._prevDisplay) seg.dataset._prevDisplay = seg.style.display || "";
                seg.style.display = "none";
            });
        }

        attachBehavior(master, chain, ui);
    }
}

// Copia tutte le classi che iniziano con "formControl" dall’originator alla textarea
function copyFormControlClasses(fromEl, toEl) {
    if (!fromEl || !toEl) return;
    fromEl.classList.forEach(cls => {
        if (cls.startsWith('formControl') && !toEl.classList.contains(cls)) {
            toEl.classList.add(cls);
        }
    });
}


/* ================================  O T H E R  =================================== */

function removeContainerLabel(id) {
    if (!id) return;

    const container = document.getElementById(id);
    if (!container) return;

    // 1) Caso "generico": qualunque elemento che abbia fldlabel
    container.querySelectorAll('[fldlabel]').forEach(el => {
        const fldLabelTag = el.getAttribute('fldlabel');
        if (!fldLabelTag) return;
        // rimuovo TUTTI gli elementi con name uguale a fldlabel
        container.querySelectorAll(`[name="${fldLabelTag}"]`).forEach(lbl => {
            lbl.remove();

        });
    });

    container.querySelectorAll('[id^="row5250_"]').forEach(row => {
        row.querySelectorAll('*').forEach(el => {
            const fldUse = el.getAttribute("flduse");
            if (el.hasAttribute("fldtext") && el.hasAttribute("fldlabel") && fldUse !== 'L') {
                const fldLabelTag = el.getAttribute("fldlabel");
                if (!fldLabelTag) return;
                const fldLabel = container.querySelector(`[name="${fldLabelTag}"]`);
                if (fldLabel) {
                    fldLabel.remove();
                }
            }
        });
    });
}


function addContainerLabel(id) {
    if (id != null) {
        let container = document.getElementById(id)
        if (container != null) {
            let containerTemp = createDiv("containerTemp", "container gx-0 gy-0");
            container.appendChild(containerTemp);

            let fldTextLast = null;
            let fldRowLast = null

            container.querySelectorAll('[id^="row5250_"]').forEach(row => {
                let rowTemp = document.createElement("div");
                rowTemp.id = "temp" + row.id;

                if (row.id && (row.id.startsWith("row5250_1_"))) {
                    row.style.display = "none";
                }

                row.querySelectorAll('*').forEach(el => {
                    let label = null;
                    let fldUse = el.getAttribute("flduse");
                    let fldType = el.getAttribute("fldtype");
                    let fldRow = el.getAttribute("fldrow");
                    let fldlength = el.getAttribute("fldlength");

                    if (!el.classList.contains("hide") && el.style.visibility !== "hidden" && el.style.display !== "none" && fldUse !== null && fldUse !== 'L') {
                        fldText = el.getAttribute("fldtext");
                        if (fldText === null) {
                            if (fldTextLast !== null && fldRowLast === fldRow && fldUse === "O" && fldType === "A" && fldlength > 5) {
                                fldText = 'Descrizione  ' + fldTextLast.toLowerCase()
                                fldTextLast = null;
                            }
                        }

                        let { icon, iconClass } = setIconAndAttributes(el, fldUse, fldType);

                        switch (showTypeLabel) {
                            case "insideLabel":
                                label = createFormLabel(el.id, fldText, null, icon, iconClass, "I");
                                break;
                            case "middleLabel":
                                label = createFormLabel(el.id, fldText, null, icon, iconClass, "M");
                                break;
                            case "outLabel":
                                label = createFormLabel(el.id, fldText, null, icon, iconClass, null);
                                break;
                            default:
                                label = createFormLabel(el.id, fldText, null, icon, iconClass, null);

                        }

                        if (el.classList.contains("col")) {
                            el.classList.remove("col");
                        }
                    }

                    fldTextLast = null;
                    if (label != null) {
                        rowTemp.appendChild(label);
                        fldTextLast = fldText;
                        fldRowLast = fldRow;
                    } else {
                        rowTemp.appendChild(el);
                    }
                    containerTemp.appendChild(rowTemp)
                });

                moveChildrens(rowTemp.id, row.id);
            });

            removeAllChildren(containerTemp.id);
            containerTemp.remove();
        }
    }
}

function setIconAndAttributes(el, fldUse, fldType) {
    let icon = null;
    let iconClass = null;

    const rawValue = (el.tagName === "DIV") ? el.textContent : el.value;
    const normalizedValue = (rawValue || "")
        .replace(/\u00A0/g, " ")
        .trim();

    const isNullValue = normalizedValue === "" || /^[0]+$/.test(normalizedValue);

    const hasList = el.getAttribute("fldislist") === "1";
    const hasExpand = el.getAttribute("fldisexpand") === "1";
    const hasListOrExpand = hasList || hasExpand;

    const isInput = el.tagName === "INPUT";

    if (!hasListOrExpand && isInput && normalizedValue === ">") {
        el.style.display = "none";
        icon = "fa-solid fa-expand mt-2";
        iconClass = "btn-primary btnDynamic";
    }

    // Caso "standard" 
    if (hasListOrExpand) {
        if (fldUse !== "O") {
            // [1.0.5]
            if (hasExpand && hasList && normalizedValue === ">") {
                icon = "fa fa-search";
                setDoF4(el);
            } else if (hasExpand) {
                if (!isNullValue) {
                    icon = "fa-regular fa-eye";
                    setDoF6(el);
                } else {
                    icon = "fa fa-search";
                    setDoF4(el);
                }
            } else {
                icon = "fa fa-search";
                setDoF4(el);
            }

        } else {
            if (hasExpand && !isNullValue) {
                setDoF6(el);
            } else {
                setDoF4(el);
            }
        }
        if (normalizedValue === "<") {
            el.style.display = "none";
            icon = "fa fa-bolt mt-2";
            iconClass = "btn-primary btnDynamic";
        }
        if (normalizedValue === ">") {
            if (el.getAttribute("doF4") === "1") {

                el.style.display = "none";
                icon = "fa fa-search mt-2";
                iconClass = "btn-primary btnDynamic";
            } else if (el.getAttribute("doF6") === "1") {
                el.style.display = "none";
                icon = "fa-regular fa-eye mt-2";
                iconClass = "btn-primary btnDynamic";
            }
        }
    }

    switch (fldType) {
        case "D":
            icon = "fa-regular fa-calendar";
            el.setAttribute("doCalendar", "1");
            break;
        case "S":
            el.classList.add("text-end");
            break;
    }

    return { icon, iconClass };
}

function setDoF4(el) {
    el.setAttribute("doF4", "1");
    el.removeAttribute("doF6");
}

function setDoF6(el) {
    el.setAttribute("doF6", "1");
    el.removeAttribute("doF4");
}


function setContainerLabel(id) {
    if (id != null && !Number.isNaN(properties.redrawGridColumn) && properties.redrawGridColumn < 12) {
        let container = document.getElementById(id)
        if (container != null) {
            let lastFieldRow = null;
            let setNewContainer = true;
            let iField = 0;
            let iColumn = 0;
            let iContainer = 0;

            let containerElement = null;
            let rowElement = null;

            let elements = Array.from(container.querySelectorAll('div, input')).filter(el => el.id && (el.id.startsWith("D_") || el.id.startsWith("I_")));

            elements.forEach((element, index) => {

                iField++;

                let fieldRow = getRow(element.id);

                if (!element.classList.contains("labelField")) {
                    element.style.maxWidth = "none";
                }

                if (iField > properties.redrawGridColumn) {
                    setNewContainer = true;
                }

                if (lastFieldRow != fieldRow) {
                    setNewContainer = true;
                    iContainer++;
                }

                if (Boolean(setNewContainer)) {
                    setNewContainer = false;
                    iField = 1;

                    if (lastFieldRow != fieldRow) {
                        iColumn = 0;
                    }

                    let elementId = fieldRow + "_" + ++iColumn;

                    containerElement = document.createElement("div");
                    containerElement.id = "container5250_" + elementId;
                    containerElement.className = "container5250"
                    containerElement.setAttribute("name", "container5250");

                    rowElement = document.createElement("div");
                    rowElement.id = "row5250_" + elementId;
                    rowElement.className = "row justify-content-start align-items-center gy-2 gx-4";
                    rowElement.setAttribute("name", "row5250");

                    lastFieldRow = fieldRow;
                }

                if (containerElement && rowElement) {
                    rowElement.append(element);
                    containerElement.append(rowElement);
                    container.append(containerElement);
                }
                iContainer = fieldRow;
            })

            for (let i = 1; i <= iContainer; i++) {
                let row5250 = document.getElementById("row5250_" + i);
                if (row5250) {
                    row5250.remove();
                }
                let container5250 = document.getElementById("container5250_" + i);
                if (container5250) {
                    container5250.remove();
                }
            }
        }
    }
}

function buildLayoutForRecordType(fieldsMap, container) {
    if (!container || !fieldsMap || fieldsMap.size === 0) return;

    const filteredMap = filterMapByParent(fieldsMap, container);
    if (filteredMap.size > 0) {
        container.classList.add("containerRecordType")
        createContainerLayout(filteredMap, container);

        const bodyContainer = document.getElementById("containerEmulatorInsideBody");
        if (bodyContainer) {
            bodyContainer.style.backgroundColor = "var(--bs-gray-200)";
            bodyContainer.style.borderBottomLeftRadius = "0.5rem";
            bodyContainer.style.borderBottomRightRadius = "0.5rem";
        }
    }
}

function createContainerLayout(fields, container) {
    let lastFieldRow = null;
    let setNewContainer = true;
    let iField = 0;

    let containerElement = null;
    let rowElement = null;

    for (const [key, value] of fields) {
        let fieldRow = Number(key.substring(0, key.indexOf("_")));
        let fieldValue = value;

        iField++;

        // Reset class and styles
        fieldValue.classList.add("col");
        fieldValue.style.top = null;
        fieldValue.style.bottom = null;
        fieldValue.style.left = null;
        fieldValue.style.right = null;
        fieldValue.style.position = null;

        if (!fieldValue.style.maxWidth || fieldValue.style.maxWidth === "") {
            fieldValue.style.maxWidth = fieldValue.style.width;
        }

        fieldValue.style.width = null;

        // Controllo se cambiare riga
        if (lastFieldRow !== fieldRow) {
            setNewContainer = true;
        }

        // Creazione nuovo contenitore per riga
        if (setNewContainer) {
            setNewContainer = false;
            iField = 1;

            let elementId = fieldRow;

            containerElement = document.createElement("div");
            containerElement.id = "container5250_" + elementId;
            containerElement.className = "container5250";
            containerElement.setAttribute("name", "container5250");

            rowElement = document.createElement("div");
            rowElement.id = "row5250_" + elementId;
            rowElement.className = "row justify-content-start align-items-center gy-2 gx-4";
            rowElement.setAttribute("name", "row5250");

            lastFieldRow = fieldRow;
        }

        if (containerElement) {
            rowElement.append(fieldValue);
            containerElement.append(rowElement);
            container.append(containerElement);
        }
    }

    // Funzioni per etichette
    removeContainerLabel(container.id);
    setContainerLabel(container.id);
    addContainerLabel(container.id);
}

function createContainerFormatRecord() {
    let container5250Program = document.getElementById("container5250Program");
    if (!container5250Program) {
        container5250Program = document.createElement("div");
        container5250Program.id = "container5250Program";
        container5250Program.className = "container5250Program";
        container5250Program.setAttribute("name", "container5250Program");
        document.getElementById("5250").append(container5250Program);
    }

    let container5250Custom = document.getElementById("container5250Custom");
    if (container5250Custom) {
        container5250Custom.remove();
    }

    const mapFormat = new Map();
    const mapFormatSubfile = new Map();
    const mapFormatDetail = new Map();
    const mapFormatOther = new Map();
    let lastRow = null;
    let subfileIndex = 0;
    let rowOption = null;
    let columnOption = null;


    let prefixType = "generic";
    switch (typeProgramAppCore) {
        case TYPE_PROGRAM_APP_CORE.List:
            prefixType = "list";
            break;
        case TYPE_PROGRAM_APP_CORE.Detail:
            prefixType = "detail";
            break;
        case TYPE_PROGRAM_APP_CORE.Window:
            prefixType = "window";
            break;
    }

    let fields = retrieveAllFields.rowColMap();

    let containerFormatFileName = null;
    let lastFormatNameId = null;

    let fmtfilename = null;
    let fmtname = null;
    let fmttype = null;
    let dataoptions = null;

    // eredita attributi fornmato subfile
    for (const [key, elem] of fields) {
        const [rowStr, colStr] = key.split("_");
        const row = Number(rowStr);
        const col = Number(colStr);

        if (row >= subfileStartRow && row <= subfileEndRow) {
            const currentFmtfilename = elem.getAttribute("fmtfilename")?.trim() || "";
            const currentFmtname = elem.getAttribute("fmtname")?.trim() || "";
            const currentFmttype = elem.getAttribute("fmttype")?.trim() || "";

            // Salva il primo valore non vuoto
            if (!fmtfilename && currentFmtfilename) {
                fmtfilename = currentFmtfilename;
                fmtname = currentFmtname;
                fmttype = currentFmttype;
            }

            // Completa i campi mancanti
            if (fmtfilename && !currentFmtfilename) {
                elem.setAttribute("fmtfilename", fmtfilename);
            }
            if (fmtname && !currentFmtname) {
                elem.setAttribute("fmtname", fmtname);
            }
            if (fmttype && !currentFmttype) {
                elem.setAttribute("fmttype", fmttype);
            }
        }
    }

    for (const [key, value] of fields) {
        let elem = value;
        let field = {
            row: Number(key.split("_")[0]),
            col: Number(key.split("_")[1])
        };

        // FILE-LEVEL CONTAINER
        if (containerFormatFileName === null) {
            containerFormatFileName = document.createElement('div');
            if (elem && elem.hasAttribute("fmtfilename") && elem.getAttribute("fmtfilename").trim() !== "") {
                containerFormatFileName.id = prefixType + "_" + elem.getAttribute("fmtfilename");
            } else {
                containerFormatFileName.id = prefixType + "_fileGeneric";
            }
            container5250Program.append(containerFormatFileName);
        }

        // FORMAT-LEVEL CONTAINER
        let formatNameId;
        if (elem && elem.hasAttribute("fmtfilename") && elem.hasAttribute("fmtname") && elem.getAttribute("fmtname").trim() !== "") {
            formatNameId = prefixType + "_" + elem.getAttribute("fmtname");
        } else if (lastFormatNameId && (elem.tagName?.toUpperCase() === 'INPUT')) {
            formatNameId = lastFormatNameId;
        } else {
            formatNameId = prefixType + "_formatGeneric";
        }

        let formatName = containerFormatFileName.querySelector("#" + formatNameId);
        if (formatName === null) {
            let containerFormatName = document.createElement('div');
            containerFormatName.id = formatNameId;

            // Aggiungi classi dinamiche
            if (containerFormatName.id.includes("_formatGeneric")) {
                containerFormatName.classList.add("recordTypeGeneric");
            } else {
                containerFormatName.classList.add("recordType" + containerFormatName.id.slice(-1));
                if (elem && elem.hasAttribute("fmttype") && elem.getAttribute("fmttype") !== null) {
                    containerFormatName.classList.add("formatType" + elem.getAttribute("fmttype"));
                }
            };

            containerFormatFileName.appendChild(containerFormatName);
            mapFormat.set(formatNameId, containerFormatName);

            formatName = containerFormatName;
        }

        // Aggiungi il campo
        formatName.appendChild(elem);

        // Subfile rows
        if (field.row >= subfileStartRow && field.row <= subfileEndRow) {

            if (field.row !== lastRow) {
                lastRow = field.row;
                subfileIndex++;
            }

            mapFormatSubfile.set(`${formatNameId}_${subfileIndex}_${field.row}_${field.col}`, elem);

            if (elem.getAttribute("fldName") === "VDSCT") {
                if (rowOption === null) {
                    rowOption = field.row
                    columnOption = field.col;
                    dataoptions = elem.getAttribute("dataoption")?.trim() || "";
                }
            }

            if (field.row === rowOption + offsetRow && field.col === columnOption) {
                elem.classList.add("subfileOption");
                if (dataoptions !== null) {
                    elem.setAttribute("dataoption", dataoptions);
                }
            }

            if (mapFormat.has("list_" + elem.getAttribute("fmtname"))) {
                mapFormat.delete(formatNameId);
            }
        }
        // Elementi fuori dal subfile
        else {
            if (elem.hasAttribute("fmttype") && (elem.getAttribute("fmttype") === "4" || elem.getAttribute("fmttype") === "1")) {
                if (formatName.id.slice(-1) === 'R') {
                    mapFormatDetail.set(`${formatNameId}_${field.row}_${field.col}`, elem);
                } else {
                    mapFormatOther.set(`${formatNameId}_${field.row}_${field.col}`, elem);
                }
            }
        }

        lastFormatNameId = formatNameId
    }

    // Restituisci solo le mappe valorizzate
    return {
        mapFormat: mapFormat.size > 0 ? mapFormat : null,
        mapFormatSubfile: mapFormatSubfile.size > 0 ? mapFormatSubfile : null,
        mapFormatDetail: mapFormatDetail.size > 0 ? mapFormatDetail : null,
        mapFormatOther: mapFormatOther.size > 0 ? mapFormatOther : null
    };
}

function hideAllRecordTypeT() {
    document.querySelectorAll(".recordTypeT").forEach(c => c.style.display = "none");
}

function renderValidRecordTypes(fieldsMap, mapFormat) {
    let count = 0;
    const valid = ["recordTypeD", "recordTypeC", "recordTypeS", "recordTypeR"];
    mapFormat.forEach(container => {
        if (valid.some(type => container.classList.contains(type))) {
            count++;
            if (count === 1) container.style.marginTop = "0.125rem";
            buildLayoutForRecordType(fieldsMap, container);
        }
    });
}



function isFieldValidAfterInstruction(el, row, rowStart) {
    const isInRecordTypeC = el.closest('.recordTypeC');
    const flduse = el.getAttribute("flduse");
    return isInRecordTypeC && flduse !== 'L' && rowStart !== null && row > rowStart;
}


function removeUnpreservedContainer(rowStart, mapFormatDetail) {
    if (rowStart == null) return;

    const preservedIds = new Set();

    // 1. Preserva i container contenenti campi attivi (già noti)
    mapFormatDetail.forEach(el => {
        const container = el.closest('[id^="container5250_"]');
        if (container) preservedIds.add(container.id);
    });

    // 2. Scansiona tutti i container5250 del DOM
    document.querySelectorAll('[id^="container5250_"]').forEach(container => {
        const row = parseInt(container.id.split("_")[1], 10);
        let isPreserved = preservedIds.has(container.id);

        // 3. Preserva se contenuto in recordTypeD
        if (!isPreserved && container.closest('.recordTypeD')) {
            isPreserved = true;
        }

        // 4. Preserva se contiene almeno un campo valido dopo rowStart
        if (!isPreserved) {
            const validFieldFound = Array.from(container.querySelectorAll('[flduse]')).some(el => {
                const key = el.id || '';
                const rowEl = parseInt(key.split("_")[1], 10);
                return isFieldValidAfterInstruction(el, rowEl, rowStart);
            });
            if (validFieldFound) {
                isPreserved = true;
            }
        }

        // 5. Verifica se contiene solo label
        const firstFmtElem = container.querySelector('[fmtname]');
        const fmtname = firstFmtElem?.getAttribute('fmtname') || null;
        const onlyLabels = isOnlyLabelFields(container, fmtname);

        // 6. Rimuovi se row ≥ rowStart E (non preservato O solo label)
        if (!isNaN(row) && row >= rowStart && (!isPreserved || onlyLabels)) {
            container.remove();
        }
    });
}

function removeUnusedContainer(mapFormat, mapFormatDetail, mapFormatOther) {
    const usedIds = new Set();

    // 1. Costruisci la lista di ID usati da Detail e Other
    mapFormatDetail.forEach((_, key) => {
        const id = key.split("_")[0] + "_" + key.split("_")[1];
        usedIds.add(id);
    });

    mapFormatOther.forEach((_, key) => {
        const id = key.split("_")[0] + "_" + key.split("_")[1];
        usedIds.add(id);
    });

    // 2. Funzione di supporto: container effettivamente vuoto
    function isEffectivelyEmpty(el) {
        return Array.from(el.children).every(child => {
            const isContainerVuoto = child.matches('[id^="container5250_"]') && child.children.length === 0;
            const hasNoVisibleText = child.textContent?.trim() === '';
            const isInvisible = child.offsetHeight === 0 || child.offsetWidth === 0;
            return isContainerVuoto || hasNoVisibleText || isInvisible;
        });
    }

    // 3. Verifica e rimozione blocchi inutilizzati
    mapFormat.forEach((_, id) => {
        const el = document.getElementById(id);
        if (!el) return;

        // 3a. Preserva blocchi dentro .recordTypeT e recordTypeD
        if (el.closest('.recordTypeT')) return;
        if (el.closest('.recordTypeD')) return;

        // 3b. Verifica se ha solo labelField
        const fmtname = id.replace(/^list_/, "") || null;
        const onlyLabelFields = isOnlyLabelFields(el, fmtname);

        // 3c. Verifica se è usato oppure vuoto
        const isUnused = !usedIds.has(id);
        const isEffectivelyEmptyBlock = isEffectivelyEmpty(el);

        // 3d. Rimozione se soddisfa una delle condizioni
        if (onlyLabelFields || isUnused || isEffectivelyEmptyBlock) {
            el.remove();
            mapFormat.delete(id);
        }
    });
}

function isOnlyLabelFields(container, fmtname = null) {
    if (!container) return false;

    // Se c'è QUALSIASI elemento interattivo, non è valido
    const hasInteractive = container.querySelector('input, select, textarea, button');
    if (hasInteractive) return false;

    // Scegli i div da controllare
    const divs = fmtname
        ? container.querySelectorAll(`div[fmtname="${fmtname}"]`)
        : container.querySelectorAll('div');

    if (divs.length === 0) return false;

    // Tutti devono avere SOLO la classe labelField
    return Array.from(divs).every(div => div.classList.contains('labelField'));
}

function removeEmptyReadOnlyFormat4() {
    document.querySelectorAll('.formatType4 div[empty="true"][readonly]').forEach(el => {
        // davvero vuoto? (solo spazi / &nbsp;)
        const text = (el.textContent || "")
            .replace(/\u00A0/g, " ")
            .trim();

        if (text.length === 0) {
            const inputGroup = el.closest('.input-group');
            const col = el.closest('.col');
            const row = el.closest('[id^="row5250_"]');
            const container = el.closest('[id^="container5250_"]');

            // rimuovo il div vuoto 
            el.remove();

            // se l'input-group è rimasto vuoto → rimuovo anche quello
            if (inputGroup && inputGroup.children.length === 0) {
                inputGroup.remove();
            }

            // se la colonna è vuota → rimuovo anche la col
            if (col && col.querySelectorAll('*').length === 0) {
                col.remove();
            }

            // se la riga è vuota → rimuovo la riga
            if (row && row.querySelectorAll('*').length === 0) {
                row.remove();
            }

            // se il container è vuoto → rimuovo il container
            if (container && container.querySelectorAll('*').length === 0) {
                container.remove();
            }
        }
    });
}

function compactFields(root = document) {
    const fields = root.querySelectorAll('.form-control[fldlength]');

    fields.forEach(el => {
        // 1) Escludo i SUBFILE
        if (el.closest('#subfileTable, .subfileTable, .recordTypeList, [data-subfile="1"]')) {
            return;
        }

        const fldType = el.getAttribute('fldtype');
        const fldUse = el.getAttribute('flduse');
        const fldName = el.getAttribute('fldname') || '';
        const lenAttr = el.getAttribute('fldlength');
        const len = lenAttr ? parseInt(lenAttr, 10) : NaN;
        if (!len || isNaN(len)) return;

        // 2) BYPASS
        if (fldType === 'A' && fldUse === 'O' && len > 18) return; // descrizioni lunghe
        if (fldName.startsWith('DS')) return;                       // campi DS*

        const col = el.closest('.col, .col-auto');
        if (!col) return;

        // reset
        col.classList.remove('col-auto');
        col.classList.add('col');
        el.classList.remove('w-auto', 'paddingWidget');
        el.style.minWidth = '';
        const group = el.closest('.input-group');
        if (group) group.classList.remove('w-auto');

        // --- CAMPI PICCOLI -------------------------------------------------
        if (len <= 18) {
            col.classList.remove('col');
            col.classList.add('col-auto');

            if (group) group.classList.add('w-auto');
            else el.classList.add('w-auto');

            const hasWidgetBtn = !!(group && group.querySelector('button, .btn'));

            const isRightAligned =
                el.classList.contains('text-end') ||
                getComputedStyle(el).textAlign === 'right';

            // padding extra SOLO se NON c'è alcun bottone widget
            if (group && !hasWidgetBtn && !isRightAligned) {
                el.classList.add('paddingWidget');
            }

            // larghezza in base alla fldlength
            setWidthByLength(el, len, fldType);

            return;
        }
    });
}

function fixLabelsNearWidgetButtons(root = document) {
    root.querySelectorAll('.labelGroupMiddleLabel').forEach(labelGroup => {
        const control = labelGroup.querySelector('input, select, textarea');
        if (!control) return;

        const inputGroup = control.closest('.input-group, .inputGroup');
        if (!inputGroup) return;

        // qualsiasi bottone, blu incluso
        const widgetBtn = inputGroup.querySelector('button, .btn');
        if (!widgetBtn) return;

        labelGroup.classList.add('label-has-widget');
    });
}

function autoSizeFloatingLabels(root = document) {
    const FLOATING_SELECTOR = '.form-floating .formInsideLabel';

    // font-size di riferimento per i rem (html / :root)
    const rootFontSizePx = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    ) || 16;

    root.querySelectorAll(FLOATING_SELECTOR).forEach(label => {
        const container = label.closest('.form-floating');
        const control = container && container.querySelector('.formControlInsideLabel');

        if (!container || !control) return;

        // 1) reset per misurare correttamente
        container.style.minWidth = '';
        control.style.minWidth = '';

        // 2) assicuro che il testo sia tutto misurabile
        label.style.whiteSpace = 'nowrap';
        label.style.overflow = 'visible';
        label.style.textOverflow = 'clip';

        // 3) misuro larghezze in px
        const labelWidthPx = label.scrollWidth;
        const controlWidthPx = control.offsetWidth;
        if (!labelWidthPx || !controlWidthPx) return;

        // 4) converto in rem
        const labelWidthRem = labelWidthPx / rootFontSizePx;
        const controlWidthRem = controlWidthPx / rootFontSizePx;

        // extra = 4ch ≈ 4rem
        const extraRem = 2;

        // 5) imposto min-width SOLO se la label è più larga del controllo
        if (labelWidthRem > controlWidthRem) {
            const desiredRem = labelWidthRem + extraRem;
            container.style.minWidth = desiredRem.toFixed(2) + 'rem';
        } else {
            container.style.minWidth = '';
        }
    });
}

function setWidthFromLength(el, len, fldType) {
    const isDate =
        fldType === 'D' ||
        el.classList.contains('flatpickr-input');

    // base: n caratteri + un po' di margine
    let ch = len + 4;

    // per le date voglio almeno lo spazio di "gg/mm/aaaa"
    if (isDate) {
        ch = Math.max(ch, 10); // 10ch ≈ "gg/mm/aaaa"
    }

    // 1ch ≈ larghezza di "0"
    el.style.minWidth = ch + 'ch';
}

function setWidthByLength(el, fldLength, fldType) {
    if (!el) return;

    let len = Number(fldLength) || 0;
    const isDate =
        fldType === 'D' ||
        el.classList.contains('flatpickr-input');

    let ch;

    if (len <= 6) {
        ch = 8;
    } else if (len <= 12) {
        ch = 14;
    } else if (len <= 18) {
        ch = 20;
    } else {
        // > 18 → lascia decidere al layout (Bootstrap col-auto)
        el.style.minWidth = '';
        el.classList.add('col-auto');
        return;
    }

    // per le date garantisco almeno lo spazio di "gg/mm/aaaa"
    if (isDate) {
        ch = Math.max(ch, 10);
    }

    // applichi la larghezza in ch
    el.style.minWidth = ch + 'ch';

    // se prima avevi messo col-auto, lo tolgo
    el.classList.remove('col-auto');
}

function enhanceLabels(root = document) {
    removeHiddenFldText(root);

    root.querySelectorAll('#containerEmulatorInsideBody .container5250 > .row[name="row5250"]').forEach(row => {

        const firstCol = row.querySelector(':scope > .labelField.col');
        if (!firstCol) return;

        const fldUse = firstCol.getAttribute('flduse') || '';

        const widgetCol = row.querySelector(':scope > .col-auto .input-group, :scope > .col .input-group');
        const hasWidget = !!widgetCol;

        // ===== CASO 1: label che introduce widget/campi a destra =====
        if (hasWidget && fldUse === 'L') {
            if (firstCol.dataset.wrappedLabel) return;

            const colWrapper = document.createElement('div');
            colWrapper.className = 'col-auto';

            const labelGroup = document.createElement('div');

            const fakeLabel = document.createElement('label');

            if (showTypeLabel === 'middleLabel') {
                labelGroup.className = 'labelGroupMiddleLabel labelGroupOnly';
                fakeLabel.className = 'form-label formMiddleLabel invisibleLabel';
            } else if (showTypeLabel === 'insideLabel') {
                labelGroup.className = 'form-floating labelGroupOnly';
                fakeLabel.className = 'form-label formInsideLabel invisibleLabel';
            } else {
                labelGroup.className = 'labelGroup labelGroupOnly';
                fakeLabel.className = 'form-label formLabel invisibleLabel';
            }

            fakeLabel.innerHTML = '&nbsp;';

            const group = document.createElement('div');
            group.className = 'input-group inputGroup';

            const textWrapper = document.createElement('span');
            textWrapper.className = 'input-group-text inputGroupText';

            row.insertBefore(colWrapper, firstCol);

            firstCol.classList.remove('col');
            firstCol.classList.add('labelFieldCustom');
            firstCol.style.maxWidth = 'none';
            firstCol.style.width = 'auto';
            firstCol.style.flex = '';

            textWrapper.appendChild(firstCol);
            group.appendChild(textWrapper);
            labelGroup.append(fakeLabel, group);
            colWrapper.appendChild(labelGroup);

            firstCol.dataset.wrappedLabel = '1';
            return;
        }

        // ===== CASO 2: riga con SOLO label flduse = L =====
        if (!hasWidget && fldUse === 'L') {
            firstCol.classList.add('labelFieldSectionCustom');
            firstCol.style.maxWidth = 'none';
            firstCol.style.width = '100%';
            firstCol.classList.add('col');
            return;
        }
    });

    // ===== CASO 3: rimozione label flduse=L con fldtext="*HIDDEN" =====
    root.querySelectorAll('#containerEmulatorInsideBody .labelField[flduse="L"]').forEach(el => {
        const fldText = el.getAttribute('fldtext') || '';

        if (fldText === '*HIDDEN') {
            const parentCol = el.closest('.col, .col-auto');

            if (parentCol) {
                parentCol.remove();
            } else {
                el.remove();
            }
        }
    });

    removeHiddenFldText(root);
    applyFldClassAndStyleToWrappers(root);
}

function autoSizeButtonsByLabel(root = document) {
    // Selettore dei bottoni da gestire
    const buttons = root.querySelectorAll('#containerFunctionKeyWindow .btnDynamic');

    if (!buttons.length) return;

    const rootFontSizePx = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    ) || 16;

    buttons.forEach(btn => {
        // reset per misurare correttamente
        btn.style.minWidth = '';
        btn.style.width = 'auto';

        // testo (solo visibile)
        const labelText = (btn.textContent || '').trim();
        if (!labelText) return;

        // larghezza reale in px del bottone col testo attuale
        const btnWidthPx = btn.scrollWidth;
        if (!btnWidthPx) return;

        const btnWidthRem = btnWidthPx / rootFontSizePx;

        // extra “cuscinetto” a destra (come fai per le middle label)
        const extraRem = 1.5;

        const desiredRem = btnWidthRem + extraRem;

        btn.style.minWidth = desiredRem.toFixed(2) + 'rem';
    });
}

function normalizeLabelFields(root = document) {
    root.querySelectorAll('[flduse="L"][fldtext]').forEach(el => {
        const fldText = el.getAttribute('fldtext');

        if (!fldText || fldText.trim() === '') return;

        el.textContent = fldText;
    });
}

function removeHiddenFldText(root = document) {
    root.querySelectorAll('#containerEmulatorInsideBody [fldtext="*HIDDEN"]').forEach(el => {
        const col = el.closest('.col, .col-auto');

        if (col) {
            col.remove();
        } else {
            el.remove();
        }
    });

    root.querySelectorAll('#containerEmulatorInsideBody label').forEach(label => {
        const text = (label.textContent || '')
            .replace(/\u00a0/g, ' ')
            .trim();

        if (text !== '*HIDDEN') return;

        const col = label.closest('.col, .col-auto');

        if (col) {
            col.remove();
        } else {
            label.remove();
        }
    });
}

function applyFldClassAndStyleToWrappers(root = document) {
    root.querySelectorAll('#containerEmulatorInsideBody [fldclass], #containerEmulatorInsideBody [fldstyle]').forEach(el => {
        const col = el.closest('.col, .col-auto');

        if (col) {
            applyFldClassAndStyle(el, col);
        }
    });
}

function applyFldClassAndStyle(sourceEl, targetEl) {
    if (!sourceEl || !targetEl) return;

    const fldClass = sourceEl.getAttribute('fldclass');
    const fldStyle = sourceEl.getAttribute('fldstyle');

    if (fldClass) {
        fldClass
            .split(/\s+/)
            .filter(Boolean)
            .forEach(cls => targetEl.classList.add(cls));
    }

    if (fldStyle) {
        fldStyle
            .split(';')
            .map(s => s.trim())
            .filter(Boolean)
            .forEach(rule => {
                const idx = rule.indexOf(':');
                if (idx === -1) return;

                const prop = rule.substring(0, idx).trim();
                const value = rule.substring(idx + 1).trim();

                if (prop && value) {
                    targetEl.style.setProperty(prop, value);
                }
            });
    }
}