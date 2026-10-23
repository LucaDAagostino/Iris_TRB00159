getCurrentWindow = function (currentWindow) {
    let windowObject = null;

    windowObject = searchCurrentWindow(currentWindow);
    if (windowObject !== null) {
        return windowObject;
    }

    windowObject = createWindowFromColons();
    if (windowObject !== null) {
        windowObject = searchCurrentWindow(currentWindow);
        if (windowObject !== null) {
            return windowObject;
        }
    }

    return null;
};

searchCurrentWindow = function (currentWindow) {
    for (let i = 20; i >= 0; i--) {
        let windowObject = getObj("window" + i);

        if (windowObject != null && !(windowObject.className || "").includes("menu-bar-pulldown")) {
            if (currentWindow == null) {
                return { windowObject, index: i };
            } else if (windowObject.id !== currentWindow.id) {
                return { windowObject, index: i };
            }
        }
    }

    return null;
};


// Costruisce window non standard usando i ":" solo come delimitatori
window.createWindowFromColons = function () {
    return (function () {
        "use strict";

        const WINDOW_ID = "window1";
        const FORM_SELECTOR = "form[name='main']";
        const WINDOW_SUFFIX = "_W1";

        function px(value) {
            if (value == null) return 0;
            const n = parseFloat(String(value).replace("px", "").trim());
            return Number.isNaN(n) ? 0 : n;
        }

        function getStyleNumber(el, prop) {
            const cs = window.getComputedStyle(el);
            return px(cs[prop]);
        }

        function getRectFromStyle(el) {
            const left = getStyleNumber(el, "left");
            const top = getStyleNumber(el, "top");
            const width = getStyleNumber(el, "width") || el.offsetWidth || 0;
            const height = getStyleNumber(el, "height") || el.offsetHeight || 23;

            return {
                left,
                top,
                width,
                height,
                right: left + width,
                bottom: top + height
            };
        }

        function getText(el) {
            return (el.textContent || "").replace(/\u00a0/g, " ").trim();
        }

        function getRawText(el) {
            return (el.textContent || "").replace(/\u00a0/g, " ");
        }

        function isDiv(el) {
            return el && el.tagName === "DIV";
        }

        function isColonOnly(el) {
            return isDiv(el) && getText(el) === ":";
        }

        function isBottomBorder(el) {
            if (!isDiv(el)) return false;
            const txt = getText(el);
            return /^:\.+:$/.test(txt);
        }

        function isBorderElement(el) {
            if (!isDiv(el)) return false;

            const txt = getText(el);

            if (txt === ":") return true;
            if (/^:\.+:$/.test(txt)) return true;

            return false;
        }

        function isEmptySpaceDiv(el) {
            if (!isDiv(el)) return false;

            const raw = getRawText(el);
            return raw.trim() === "";
        }

        function isInsideRect(rect, container, tolerance = 2) {
            return (
                rect.left >= container.left - tolerance &&
                rect.right <= container.right + tolerance &&
                rect.top >= container.top - tolerance &&
                rect.bottom <= container.bottom + tolerance
            );
        }

        function groupByLeft(elements) {
            const map = new Map();

            for (const el of elements) {
                const r = getRectFromStyle(el);
                const key = Math.round(r.left);

                if (!map.has(key)) {
                    map.set(key, []);
                }

                map.get(key).push(el);
            }

            return Array.from(map.entries())
                .map(([left, els]) => ({
                    left: Number(left),
                    elements: els,
                    count: els.length
                }))
                .sort((a, b) => a.left - b.left);
        }

        function findWindowBounds(form) {
            const children = Array.from(form.children);

            const bottomBorder = children.find(isBottomBorder);
            if (!bottomBorder) return null;

            const bottomRect = getRectFromStyle(bottomBorder);

            const colonDivs = children.filter(isColonOnly).filter((el) => {
                const r = getRectFromStyle(el);
                return r.top <= bottomRect.top + 1;
            });

            if (colonDivs.length < 2) return null;

            const columns = groupByLeft(colonDivs).filter((c) => c.count >= 2);
            if (columns.length < 2) return null;

            const leftColumn = columns[0];
            const rightColumn = columns[columns.length - 1];

            const leftRects = leftColumn.elements.map(getRectFromStyle);
            const rightRects = rightColumn.elements.map(getRectFromStyle);

            const top = Math.min(
                ...leftRects.map((r) => r.top),
                ...rightRects.map((r) => r.top)
            );

            const left = Math.min(...leftRects.map((r) => r.left));
            const right = Math.max(
                ...rightRects.map((r) => r.right),
                bottomRect.right
            );
            const bottom = bottomRect.bottom;

            return {
                left,
                top,
                right,
                bottom,
                width: right - left,
                height: bottom - top
            };
        }

        function ensureWindowContainer(form, bounds) {
            let win = document.getElementById(WINDOW_ID);

            if (!win) {
                win = document.createElement("div");
                win.id = WINDOW_ID;
                form.appendChild(win);
            }

            // (v.1.0.4) Questa finestra viene costruita dalla skin e usa gli identificativi
            // riservati di Genie (window1 / _W1). Genie si aspetta quindi di
            // trovare anche layerInfo, come avviene per le finestre native.
            const multX = Number(pui?.multX) || 1;
            const multY = Number(pui?.multY) || 1;
            const outerWidth = Math.max(1, Math.round(bounds.width / multX));
            const outerHeight = Math.max(1, Math.round(bounds.height / multY));

            win.layerInfo = {
                row: Math.max(0, Math.round(bounds.top / multY)),
                col: Math.max(0, Math.round(bounds.left / multX)),
                width: Math.max(1, outerWidth - 2),
                height: Math.max(1, outerHeight - 2)
            };
            win.dataset.customSyntheticWindow = "1";

            win.style.position = "absolute";
            win.style.left = bounds.left + "px";
            win.style.top = bounds.top + "px";
            win.style.width = bounds.width + "px";
            win.style.height = bounds.height + "px";
            win.style.boxSizing = "border-box";
            win.style.pointerEvents = "auto";
            win.style.zIndex = "1000";
            win.style.background = "var(--bs-color-window-body)"

            return win;
        }

        function transformWindowElementId(originalId) {
            if (!originalId) return originalId;

            const match = originalId.match(/^([A-Za-z]+)_(\d+)_(\d+)$/);
            if (!match) {
                return originalId + WINDOW_SUFFIX;
            }

            const prefix = match[1];
            const firstNum = Math.max(0, parseInt(match[2], 10) - 2);
            const secondNum = Math.max(0, parseInt(match[3], 10) - 2);

            return prefix + "_" + firstNum + "_" + secondNum + WINDOW_SUFFIX;
        }

        function ensureWindowElementId(el) {
            if (!el.id) return;

            if (!el.dataset.originalId) {
                el.dataset.originalId = el.id;
            }

            if (!el.dataset.windowId) {
                el.dataset.windowId = transformWindowElementId(el.dataset.originalId);
            }

            el.id = el.dataset.windowId;
        }

        function moveElementsIntoWindow(form, win, bounds) {
            const children = Array.from(form.children);

            for (const el of children) {
                if (el === win) continue;
                if (el.dataset.windowManaged === "1") continue;

                // usa i ":" solo come delimitatori, non come contenuto
                if (isBorderElement(el)) continue;

                // esclude i div vuoti / fatti solo di spazi o nbsp
                if (isEmptySpaceDiv(el)) continue;

                const rect = getRectFromStyle(el);
                if (!isInsideRect(rect, bounds, 2)) continue;

                const currentLeft = getStyleNumber(el, "left");
                const currentTop = getStyleNumber(el, "top");

                // coordinate relative alla finestra
                el.style.left = (currentLeft - bounds.left) + "px";
                el.style.top = (currentTop - bounds.top) + "px";

                // salva id originale e trasforma in *_W1 con -2/-2
                ensureWindowElementId(el);

                el.dataset.windowManaged = "1";
                win.appendChild(el);
            }
        }

        const form = document.querySelector(FORM_SELECTOR);
        if (!form) return null;

        const bounds = findWindowBounds(form);
        if (!bounds) return null;

        const win = ensureWindowContainer(form, bounds);
        moveElementsIntoWindow(form, win, bounds);

        return win;
    })();
};
