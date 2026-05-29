
// For todays date;
Date.prototype.dateNow = function () {
    return ((this.getDate() < 10) ? "0" : "") + this.getDate() + "/" + (((this.getMonth() + 1) < 10) ? "0" : "") + (this.getMonth() + 1) + "/" + this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}

getLastMenuBar = function () {
    for (let i = 20; i >= 0; i--) {
        let menuBar = getObj("window" + i);
        if (menuBar != null && menuBar.className.includes("menu-bar-pulldown")) {
            return menuBar;
        }
    }
    return null;
}

function isSideBarOpen() {
    return !!document.querySelector('#sideBarItems .sideBarItem.open .sideBarSubmenu');
}


getLastSubfile = function () {
    let subfileObj = getObj("subfile");
    if (subfileObj != null) {
        return subfileObj;
    }

    for (let i = 10; i >= 0; i--) {
        subfileObj = getObj("subfile" + i);
        if (subfileObj != null) {
            return subfileObj;
        }
    }

    return null;
}

getObjectById = function (objectId) {
    if (objectId) return document.getElementById(objectId);
    return null;
}

getObjectByName = function (objectName) {
    if (objectName) {
        let objects = document.getElementsByName(objectName);
        if (objects.length === 1) return objects[0];
        return objects;
    }
    return null;
}


compareStrings = function (string, stringCompare) {
    string = string.replace(/\s/g, '');
    stringCompare = stringCompare.replace(/\s/g, '');
    return string.includes(stringCompare);
}

searchString = function (string, stringCompare) {
    if (string != null && stringCompare != null) {
        let stringConvert = convertString(string, '/[\xa0]/g', '\x20');
        return stringConvert.includes(stringCompare);
    }
    return false;
}

convertString = function (string, subStringOld, subStringNew) {
    if (string != null) {
        return string.replace(subStringOld, subStringNew);
    }
}

isNumeric = function (value) {
    let regex = /^([-+]?(\d+[,.]))|((\d+[,.])?[-+])*\d+$/;
    if (value.trim().search(regex) == 0) {
        return true
    }
    return false;
}

matchElementAndTagAndString = function (element, tag, where, text, search) {
    let array = null;
    switch (element.toUpperCase()) {
        case 'DIV': array = $("div[" + tag + where + "= '" + text + "']"); break;
        case 'INPUT': array = $("element[" + tag + where + "= '" + text + "']"); break;
        case 'A': array = $("a[" + tag + where + "= '" + text + "']"); break;
    }

    if (array != null) {
        for (let val = 0; val < array.length; val++) {
            if (array[val].textContent != "" && array[val].textContent.match(search)) {
                return array[val];
            }
        }
    }

    return null;
}

removeClassStartingWith = function (node, begin) {
    node.removeClass(function (index, className) {
        return (className.match(new RegExp("\\b" + begin + "\\S+", "g")) || []).join(' ');
    });
}

function removeElementsByIdPrefix(prefix = "prev_", root = document) {
    if (!root) return;
    root.querySelectorAll(`[id^="${prefix}"]`).forEach(el => el.remove());
}


function replaceElementTag(targetSelector, newTagString) {
    $(targetSelector).each(function () {
        var newElem = $(newTagString, { html: $(this).html() });
        $.each(this.attributes, function () {
            newElem.attr(this.name, this.value);
        });
        $(this).replaceWith(newElem);
    });
}

isElementVisible = function (element) {
    return !(element.offsetWidth == 0 && element.offsetHeight == 0) && element.style.visibility != "hidden";
}

function removeDots(text) {
    return text.replace(/\./g, '').trim();
}

function getMaxRowByFmtTypeDOM(fmtType = null, { onlyVisible = false, within = null } = {}) {
    // Costruisci il selettore
    let selector;
    if (fmtType == null) {
        // Tutti gli elementi che hanno l’attributo fmttype
        selector = '[fmttype]';
    } else if (Array.isArray(fmtType)) {
        // Qualsiasi dei valori passati
        selector = fmtType.map(v => `[fmttype="${String(v)}"]`).join(',');
    } else {
        // Singolo valore
        selector = `[fmttype="${String(fmtType)}"]`;
    }

    const scope = (within instanceof Element) ? within : document;
    const nodes = scope.querySelectorAll(selector);

    let maxRow = -Infinity;

    nodes.forEach(el => {
        if (onlyVisible) {
            const visible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
            if (!visible) return;
        }

        // 1) prova dagli attributi "fldrow"
        let row = parseInt(el.getAttribute('fldrow'), 10);

        // 2) fallback: parse da id tipo D_<row>_<col> o I_<row>_<col>
        if (!Number.isFinite(row) && el.id) {
            const m = el.id.match(/^[DI]_(\d+)_/);
            if (m) row = parseInt(m[1], 10);
        }

        if (Number.isFinite(row) && row > maxRow) {
            maxRow = row;
        }
    });

    return Number.isFinite(maxRow) ? maxRow : null;
}

function setStyleNoImportant(el, prop, value) {
    if (!el) return;
    el.style.setProperty(prop, value, "");
}

function fadeTo(el, targetOpacity, durationMs) {
    if (!el) return;
    const duration = Math.max(0, Number(durationMs) || 0);
    el.style.transition = `opacity ${duration}ms`;
    requestAnimationFrame(() => {
        el.style.opacity = String(targetOpacity);
    });
}

// 1) Encoding per HTML (contenuto)
function encodeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// 2) Encoding per attributi
function encodeAttr(str) {
    // per sicurezza: evita anche spazi/controlli non stampabili
    return encodeHTML(str).replace(/`/g, "&#96;");
}

// 3) URL sicuri
function buildSafeUrl(base, paramsObj) {
    const url = new URL(base, window.location.origin);
    Object.entries(paramsObj || {}).forEach(([k, v]) => {
        url.searchParams.set(k, String(v));
    });
    return url.toString();
}

// 4) Setter sicuri di comodo
function setSafeText(el, value) {
    el.textContent = value == null ? "" : String(value);
}
function setSafeAttr(el, name, value) {
    el.setAttribute(name, encodeAttr(value == null ? "" : String(value)));
}