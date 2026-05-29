function loadPreviousScreen() {
    if (previousScreen) {
        const containerPreviousEmulatorOutside = document.getElementById("containerPreviousEmulatorOutside");
        if (containerPreviousEmulatorOutside) {
            containerPreviousEmulatorOutside.innerHTML = "";

            const existingIds = new Set(
                Array.from(document.querySelectorAll("[id]")).map(el => el.id)
            );

            sanitizeIdsUnique(
                previousScreen,
                { removePrefix: "prev_", addPrefix: "prev_", includeRoot: true },
                existingIds
            );

            if (!previousScreen.id) {
                previousScreen.id = "containerEmulatorOutside_prev";
            }
            previousScreen.classList.add("containerEmulatorOutsidePrev");

            previousScreen.setAttribute("inert", "");
            previousScreen.setAttribute("aria-hidden", "true");

            containerPreviousEmulatorOutside.appendChild(previousScreen);
        }
        previousScreen = null;

        // rimuove solo l'elemento con id "prev_pui_loading_animation" se esiste
        const element = document.getElementById("prev_pui_loading_animation");
        if (element) element.remove();
    }


    if (isSignon) {
        document.body.className = "containerBodySignon";
    } else {
        document.body.className = "containerBody";
        if (Boolean(isProgramAppCore) && !Boolean(isInsideProgramAppCore)) {
            lastContainerEmulatorOutside = document.getElementById("containerEmulatorOutside")
        }
    }
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

function applyFunctionKeyIcons(root) {
    const scope = root || document;

    const nodes = scope.querySelectorAll(
        'button, a, [role="button"], li.btn, .btn-functionKey, .ulFunctionKey > li'
    );

    nodes.forEach(btn => {
        if (!btn || btn.dataset.iconized === '1') return;

        const label = normalizeKeyText(btn.textContent);

        // helper per aggiungere l'icona (BI → FA fallback)
        const addIcon = (btn, bi, fa) => {
            if (btn.querySelector('i')) { btn.dataset.iconized = '1'; return; }
            const i = document.createElement('i');
            const hasBI =
                !!document.querySelector('link[href*="bootstrap-icons"]') ||
                !!document.querySelector('[class*=" bi-"], [class^="bi-"]');
            i.className = hasBI ? bi : fa;
            i.classList.add("iFunctionKey");
            i.style.marginRight = '0.4rem';
            btn.prepend(i);
            btn.dataset.iconized = '1';
        };

        // INVIO / CONFERMA / ENTER / OK → check
        if (/(^|\W)(INVIO|CONFERMA|ENTER|OK)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-check-lg', 'fa fa-check');
            return;
        }
        // PRECEDENTE / INDIETRO / BACK → freccia sinistra
        if (/(^|\W)(PRECEDE?N?TE|INDIETRO|BACK)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-arrow-left-short', 'fa fa-arrow-left');
            return;
        }
        // ESCI / ESC / ANNULLA / CHIUDI / CANCELLA → sign-out (rimane com'era)
        if (/(^|\W)(ESCI|ESC|ANNULLA|CHIUDI|CANCELLA)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-box-arrow-right', 'fa fa-sign-out-alt');
            return;
        }

        // === NUOVE MAPPE RICHIESTE ===
        // AGGIORNA → refresh
        if (/(^|\W)(AGGIORNA|REFRESH|RICARICA)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-arrow-repeat', 'fa fa-sync');
            return;
        }
        // INSERIMENTO → plus
        if (/(^|\W)(INSERIMENTO)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-plus-lg', 'fa fa-plus');
            return;
        }
        // FINE → X
        if (/(^|\W)(FINE)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-x-lg', 'fa fa-times');
            return;
        }

        // DETTAGLIO / ESPANDI → expand
        if (/(^|\W)(DETTAGLIO|DETTAGLI|ESPANDI|EXPAND)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-arrows-fullscreen', 'fa fa-expand');
            return;
        }

        // STAMPA → printer
        if (/(^|\W)(STAMPA|STAMPARE|PRINT|STAMP|STAMPE)(\W|$)/.test(label)) {
            addIcon(btn, 'bi bi-printer', 'fa fa-print');
            return;
        }

        // RIPOSIZIONA → move
        if (/(^|\W)(RIPOSIZIONA|RIPOSIZ\.)($|\W)/.test(label)) {

            addIcon(btn, 'bi bi-arrows-move', 'fa fa-arrows-alt');
            return;
        }
    });
}

function normalizeKeyText(s) {
    return (s || '')
        .trim()
        .replace(/\s+/g, ' ')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // rimuove accenti
        .toUpperCase();
}


/* ============================= S C R E E N S H O T ==================================== */
