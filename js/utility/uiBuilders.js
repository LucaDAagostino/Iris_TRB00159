function createDiv(id, classe, testo) {
    let element = document.createElement('div');
    if (id) element.id = id;
    if (classe) element.classList = classe;
    if (testo) element.innerText = testo;
    return element;
}

function createSectionTitle(testo) {
    let title = document.createElement('div');
    title.classList = "sectionTitle";
    title.innerText = testo;
    return title;
}

function createLabel(id, tipo, testo, classe) {
    if (tipo == null) {
        tipo = 'h4'
    }
    let element = document.createElement(tipo);
    if (id) element.id = id;
    if (classe) element.classList = classe;
    element.innerText = testo;
    element.style.width = "auto";

    let title = document.createElement('span');
    element.appendChild(title)
    title.classList = "label label-default";

    return element;
}

function createList(id, classe) {
    let element = document.createElement('ul');
    if (id) element.id = id;
    if (classe) element.classList = classe;
    return element;
}

function appendList(id, classe, testo, list) {
    let nodeList = document.getElementById(list);

    if (nodeList == null) {
        nodeList = createList(null, null)
    }

    let node = document.createElement('li');

    if (id) node.id = id;
    if (classe) node.classList = classe;
    if (testo) node.appendChild(document.createTextNode(testo));

    nodeList.appendChild(node);

    return node;
};

function createDropdown(id, classe, testo) {
    let dropdown = document.createElement('div');
    if (id) dropdown.id = id;
    dropdown.classList = "btn btn-secondary dropdown-toggle";
    if (classe) dropdown.classList.add = classe;

    let dropdownButton = document.createElement('button');
    if (id) dropdownButton.id = id + "Button";
    dropdownButton.setAttribute("data-toggle", "dropdown");
    dropdownButton.setAttribute("aria-haspopup", "true");
    dropdownButton.setAttribute("aria-expanded", "false");
    dropdownButton.innerText = testo;
    dropdown.appendChild(dropdownButton);

    let dropdownMenuButton = document.createElement('div');
    if (id) dropdown.id = id + "MenuButton";
    dropdownMenuButton.setAttribute("aria-labelledby", "dropdownMenuButton");
    dropdown.appendChild(dropdownMenuButton);

    return dropdown;
}

function appendDropdown(id, classe, testo, menuButton) {
    let dropdownMenuButton = document.getElementById(menuButton);
    if (dropdownMenuButton) {
        let dropdownMenuButtonItem = document.createElement('a');
        if (id) dropdownMenuButtonItem.id = id + "MenuButtonItem";
        if (classe) dropdownMenuButtonItem.classList = classe;
        dropdownMenuButtonItem.href = "#"
        dropdownMenuButtonItem.innerText = testo
        dropdownMenuButton.appendChild(dropdownMenuButtonItem);
        return dropdownMenuButtonItem;
    }
    return null;
}

function createButton(id, classe, tasto, testo, icona, valore, element, popover) {
    let button = document.createElement('button');
    if (id) button.id = id;
    button.classList = "btn " + classe;
    button.innerText = testo;
    if (icona) {
        let icon = document.createElement("i");
        icon.classList = icona;
        if (testo != null) {
            icon.style.marginLeft = "0.8rem";
        }
        button.appendChild(icon)
    }
    if (popover) {
        button.setAttribute('data-toggle', 'popover');
        button.setAttribute('data-trigger', 'hover');
        button.setAttribute('data-placement', 'right');
        button.setAttribute('title', popover);
    }
    if (element != null) {
        if (!element) {
            button.addEventListener("click", function () {
                pressKey(tasto);
            });
        } else {
            let attribute01 = document.createAttribute("element");
            attribute01.value = element;
            button.setAttributeNode(attribute01);
            let attribute02 = document.createAttribute("valore");
            attribute02.value = valore;
            button.setAttributeNode(attribute02);
            let attribute03 = document.createAttribute("tasto");
            attribute03.value = tasto;
            button.setAttributeNode(attribute03);

            button.addEventListener("click", function (e) {
                let element = e.target;
                if (element.getAttribute('valore') !== 'valore') pui.set(element.getAttribute('elemeclearcontnt'), element.getAttribute('valore'));
                setCursor(element.getAttribute('element'));
                if (element.getAttribute('tasto')) {
                    element.focus();
                    pressKey(element.getAttribute('tasto'));
                }
            });
        }
    }

    return button;
}

function createFloatingLabel(id, label, classe) {
    let field = document.getElementById(id);
    field.classList.add("form-control", "formControl");

    field.setAttribute("placeholder", label);
    field.style.maxWidth = "none";
    field.style.height = "auto";

    let fieldLabel = document.createElement('label');
    fieldLabel.innerHTML = label;
    fieldLabel.classList = "fieldLabel";
    fieldLabel.setAttribute("for", id);

    let elementCol = document.createElement('div');
    if (classe) elementCol.classList = classe;
    elementCol.classList.add("col");

    let element = document.createElement('div');
    element.classList = "form-floating mt-2 mb-2";
    element.appendChild(field);
    element.appendChild(fieldLabel);

    elementCol.appendChild(element);

    return elementCol;
}

function createFormLabel(id, text, classe, icon, iconClass, typeLabel) {
    const labelInput = document.getElementById(id);
    if (!labelInput) return;

    labelInput.classList.add("form-control", "formControl");

    labelInput.style.maxWidth = "none";
    labelInput.style.height = "auto";

    // Caso speciale: se typeLabel è "HIDDEN", ritorna solo l'input (eventualmente decorato con icona)
    if (typeLabel && typeLabel.toUpperCase() === "HIDDEN") {
        if (icon) {
            const inputDiv = document.createElement('div');
            inputDiv.className = "input-group flex-nowrap";
            inputDiv.appendChild(labelInput);

            const iconBtn = document.createElement("button");
            iconBtn.className = "btn " + (iconClass ?? "btn-outline-secondary btn-widget");
            iconBtn.type = "button";

            iconBtn.style.height = getComputedStyle(labelInput).height;
            iconBtn.style.padding = getComputedStyle(labelInput).padding;

            const iconEl = document.createElement("i");
            iconEl.className = icon;
            iconBtn.appendChild(iconEl);

            if (labelInput.getAttribute("doF6") === "1" || labelInput.getAttribute("doF4") == "1") {
                iconEl.style.cursor = "pointer";
                labelInput.style.cursor = "";
                iconBtn.addEventListener("click", function () {
                    setCursor(labelInput.id);
                    labelInput.focus();
                    if (labelInput.getAttribute("doF6") === "1") pressKey('F6');
                    else if (labelInput.getAttribute("doF4") === "1") pressKey('F4');
                });
            }

            if (labelInput.getAttribute("doCalendar") === "1") {
                initDatepicker(labelInput, iconBtn);
            }

            inputDiv.appendChild(iconBtn);
            return inputDiv;
        }

        const inputDiv = document.createElement('div');
        inputDiv.className = "input-group";
        inputDiv.append(labelInput);
        return inputDiv;
    }

    const inputDiv = document.createElement('div');
    inputDiv.className = "input-group";
    inputDiv.append(labelInput);

     if (typeLabel === 'O') {
        labelInput.classList.add("formControl", "formControlOutsideLabel");
    }
    if (typeLabel === 'M') {
        labelInput.classList.add("formControl", "formControlMiddleLabel");
    }
    if (typeLabel === 'I') {
        labelInput.classList.add("formControl", "formControlInsideLabel");
        labelInput.setAttribute("placeholder", text);
    }


    let label = document.createElement('label');
    if (!text) {
        text = "&nbsp;";
        label.style.color = "transparent";
        label.style.zIndex = "-1";
    } else {
        text = text.replace(/\./g, ' ');
    }
    label.innerHTML = text;
    label.setAttribute("for", id);

    if (typeLabel === 'I') {
        label.classList.add("form-label", "formInsideLabel");
    } else if (typeLabel === 'M') {
        label.classList.add("form-label", "formMiddleLabel");
        labelInput.classList.add("formControlMiddleLabel");
    } else {
        label.classList.add("form-label", "formLabel");
    }

    const labelContainer = document.createElement('div');
    if (classe) labelContainer.classList = classe;
    labelContainer.classList.add("col");

    const labelDiv = document.createElement('div');
    if (typeLabel === 'I') {
        labelDiv.classList = "form-floating";
    } else if (typeLabel === 'M') {
        labelDiv.classList = "labelGroupMiddleLabel";
    } else {
        labelDiv.classList = "labelGroup";
    }

    labelDiv.appendChild(label);
    labelDiv.appendChild(typeLabel !== 'I' ? inputDiv : labelInput);

    if (icon) {
        const labelInputGroup = document.createElement('div');
        labelInputGroup.classList = "input-group inputGroup";

        const labelIconGroup = document.createElement("button");
        labelIconGroup.className = "btn " + (iconClass ?? "btn-outline-secondary btn-widget");
        labelIconGroup.type = "button";
        labelIconGroup.style.height = getComputedStyle(labelInput).height;
        labelIconGroup.style.padding = getComputedStyle(labelInput).padding;

        const labelIcon = document.createElement("i");
        labelIcon.classList = icon;

        if (labelInput.getAttribute("doF6") === "1" || labelInput.getAttribute("doF4") === "1") {
            labelIcon.style.cursor = "pointer";
            labelInput.style.cursor = "";
            labelIconGroup.addEventListener("click", function () {
                setCursor(labelInput.id);
                labelInput.focus();
                if (labelInput.getAttribute("doF6") === "1") pressKey('F6');
                else if (labelInput.getAttribute("doF4") === "1") pressKey('F4');
            });
        }

        if (labelInput.getAttribute("doCalendar") === "1") {
            initDatepicker(labelInput, labelIconGroup);
        }

        labelIconGroup.appendChild(labelIcon);

        labelInputGroup.appendChild(labelDiv);
        if (typeLabel !== 'I') {
            inputDiv.appendChild(labelIconGroup);
        } else {
            labelInputGroup.appendChild(labelIconGroup);
        }

        labelContainer.appendChild(labelInputGroup);
    } else {
        labelInput.addEventListener("click", function () {
            if (labelInput.getAttribute("doF6") === "1") pressKey('F6');
            else if (labelInput.getAttribute("doF4") === "1") pressKey('F4');
        });

        labelContainer.appendChild(labelDiv);
    }

    return labelContainer;
}

function createRow(id, classe) {
    let row = document.createElement('div');
    if (id) row.id = id;
    if (classe) row.classList = classe;
    row.classList.add("row")
    return row;
}

function clearContainer(container) {
    for (let i = 0; i < container.length; i++) {
        let element = container[i];
        element.style.display = 'none'
    }
}

function removeContainer(containerId) {
    let container = document.getElementById(containerId);

    if (container) {
        container.remove();  // Rimuove il contenitore e tutto il suo contenuto
    }
}

function moveChildrens(sourceId, targetId) {
    // Ottieni il div di origine e il div di destinazione
    let sourceDiv = document.getElementById(sourceId);
    let targetDiv = document.getElementById(targetId);

    // Se entrambi i div esistono
    if (sourceDiv && targetDiv) {
        // Sposta tutti i figli dal div di origine a quello di destinazione
        while (sourceDiv.firstChild) {
            targetDiv.appendChild(sourceDiv.firstChild);
        }
    }
}

function copyAttributes(sourceId, targetId) {
    // Ottieni il div di origine e il div di destinazione
    let sourceDiv = document.getElementById(sourceId);
    let targetDiv = document.getElementById(targetId);

    // Se entrambi i div esistono
    if (sourceDiv && targetDiv) {
        // Ottieni tutti gli attributi del div di origine
        let attributes = sourceDiv.getAttributeNames();

        // Copia ogni attributo dal div di origine al div di destinazione
        attributes.forEach(attr => {
            let value = sourceDiv.getAttribute(attr);
            targetDiv.setAttribute(attr, value);
        });
    }
}

function removeAllChildren(containerId) {
    let container = document.getElementById(containerId);

    // Verifica se il contenitore esiste
    if (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);  // Rimuove il primo figlio finché non ci sono più figli
        }
    }
}

function setReadOnly(id) {
    element = document.getElementById(id);
    if (element !== null) {
        element.setAttribute("readonly", "readonly");
    }
}

function removeReadOnly(id) {
    element = document.getElementById(id);
    if (element !== null) {
        element.removeAttribute('readonly');
        if (element.classList.contains("readOnly")) {
            element.classList.remove("readOnly");
        }
    }
}

function initDatepicker(inputElement, iconElement) {
    if (inputElement && iconElement) {
        iconElement.style.cursor = "pointer";
        inputElement.setAttribute("placeholder", "gg/mm/aaaa");

        const fp = flatpickr(inputElement, {
            dateFormat: "d/m/Y",
            locale: "it",
            allowInput: true,
            clickOpens: false
        });

        iconElement.addEventListener("click", () => {
            fp.open();
        });

        let parseTimer = null;

        inputElement.addEventListener("input", () => {
            const raw = inputElement.value.trim();

            // Cancella eventuali timeout precedenti
            if (parseTimer) clearTimeout(parseTimer);

            // Caso 8 cifre: ggmmaaaa → subito
            if (/^\d{8}$/.test(raw)) {
                const gg = raw.slice(0, 2);
                const mm = raw.slice(2, 4);
                const yyyy = raw.slice(4, 8);
                applyParsedDate(gg, mm, yyyy);
                return;
            }

            // Caso 6 cifre: ggmmaa → aspetta per vedere se l'utente continua (Se aa >= 50 → 19aa altrimenti 20)
            if (/^\d{6}$/.test(raw)) {
                parseTimer = setTimeout(() => {
                    const gg = raw.slice(0, 2);
                    const mm = raw.slice(2, 4);
                    const aa = raw.slice(4, 6);
                    const aaNum = parseInt(aa, 10);
                    const yyyy = aaNum >= 50 ? `19${aa}` : `20${aa}`;
                    applyParsedDate(gg, mm, yyyy);
                }, 1000); // aspetta 100ms
            }
        });

        function applyParsedDate(gg, mm, yyyy) {
            const giorno = parseInt(gg, 10);
            const mese = parseInt(mm, 10);
            const anno = parseInt(yyyy, 10);

            const isValid =
                giorno >= 1 && giorno <= 31 &&
                mese >= 1 && mese <= 12 &&
                anno >= 1900;

            if (isValid) {
                const formatted = `${gg}/${mm}/${yyyy}`;
                inputElement.value = formatted;
                fp.setDate(`${yyyy}-${mm}-${gg}`, true, "Y-m-d");
            } else {
                inputElement.value = "";
                fp.clear();
            }
        }

        return fp;
    }

    return null;
}

function removePuiCalendar() {
    document.querySelectorAll('div.pui-calendar-icon').forEach(el => {
        el.remove();
    });

    // Siccome il pui-calendar è inserito dopo l'afterLoad
    const style = document.createElement('style');
    style.innerHTML = `.pui-calendar-icon { display: none !important; }`;
    document.head.appendChild(style);
}


function filterMapByParent(map, parent) {
    if (!(parent instanceof HTMLElement)) {
        return new Map(); // fallback: mappa vuota
    }

    return new Map(
        [...map.entries()].filter(([_, elem]) => parent.contains(elem))
    );
}

function addIdToMapAndSort(id) {
    const parsed = parseId(id);
    if (!parsed) return idMap;

    idMap.push(parsed);

    idMap.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    return idMap;
}

function calculateSubfileEnd() {
    const buffer = pui["5250"].buffer;
    const endMarkers = ["    Segue...", "   Fine"];

    for (let row = subfileStartRow; row < buffer.length; row++) {
        const line = buffer[row];
        if (endMarkers.some(marker => line.includes(marker))) {
            return row;
        }
    }

    // Fallback se tutto è vuoto
    return subfileStartRow;
}

function calculateSubfileStartByEnd() {
    const buffer = pui["5250"].buffer;

    for (let row = subfileEndRow - 1; row >= 0; row--) {
        const line = buffer[row];

        if (line && line.trim().length > 0) {
            return row - offsetRow + 1;
        }
    }
    // Fallback: non trovata
    return 0;
}

