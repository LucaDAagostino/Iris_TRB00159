
/** Clona la videata corrente e la mette da parte per il prossimo giro */
function archiveCurrentScreen() {
    const live = document.getElementById("containerEmulatorOutside");
    if (!live) return;
    previousScreen = live.cloneNode(true); // deep clone
    // opzionale: rendila "inert" finché è in memoria (non nel DOM)
    previousScreen.setAttribute("inert", "");
}

/** Rinomina TUTTI gli id dentro root con regole flessibili, assicurando unicità contro 'existingIds' */
function sanitizeIdsUnique(
    root,
    { addPrefix = "", removePrefix = "", includeRoot = false } = {},
    existingIds = new Set()
) {
    if (!root) return new Map();

    // raccogli tutti gli id originali del clone (inclusa la root)
    const internalIds = new Set();
    root.querySelectorAll("[id]").forEach(el => internalIds.add(el.id));
    if (root.id) internalIds.add(root.id);

    const mapOldToNew = new Map();
    const allocated = new Set([...existingIds]); // id già occupati nel DOM live

    // helper per trovare un id libero che non collida con DOM live né con id originali del clone
    const uniq = (base) => {
        let candidate = base || "_";
        let i = 1;
        while (allocated.has(candidate) || internalIds.has(candidate)) {
            candidate = `${base}_${i++}`;
        }
        allocated.add(candidate);
        return candidate;
    };

    const transform = (oldId) => {
        let nextId = oldId;
        if (removePrefix && nextId.startsWith(removePrefix)) nextId = nextId.slice(removePrefix.length);
        if (addPrefix) nextId = addPrefix + nextId;
        if (/^[^A-Za-z_]/.test(nextId)) nextId = "_" + nextId;     // se inizia con carattere non valido, prefissa "_"
        nextId = nextId.replace(/__+/g, "_").trim();                // normalizza underscore
        return nextId;
    };

    // 1) rinomina la ROOT prima di tutto (se richiesto)
    if (includeRoot && root.id) {
        const oldId = root.id;
        const nextId = transform(oldId);
        if (nextId !== oldId || allocated.has(nextId)) {
            const uniqueId = uniq(nextId);
            root.id = uniqueId;
            mapOldToNew.set(oldId, uniqueId);
        } else {
            allocated.add(nextId); // riserva comunque l'id se resta invariato
        }
    } else if (root.id) {
        // se non la rinominiamo, riserva comunque l'id corrente per evitare riusi
        allocated.add(root.id);
    }

    // 2) rinomina TUTTI i discendenti (in-place)
    root.querySelectorAll("[id]").forEach(el => {
        const oldId = el.id;
        let nextId = transform(oldId);

        // se non cambia, riserva/gestisci collisioni con DOM live
        if (nextId === oldId) {
            if (allocated.has(nextId)) {
                const uniqueId = uniq(nextId);
                el.id = uniqueId;
                mapOldToNew.set(oldId, uniqueId);
            } else {
                allocated.add(nextId);
            }
            return;
        }

        const uniqueId = uniq(nextId);
        el.id = uniqueId;
        mapOldToNew.set(oldId, uniqueId);
    });

    // 3) aggiorna riferimenti interni nel clone (for, aria-*, href="#...")
    const refAttrs = ["for", "aria-labelledby", "aria-controls", "aria-describedby"];
    refAttrs.forEach(attr => {
        root.querySelectorAll(`[${attr}]`).forEach(el => {
            const val = el.getAttribute(attr);
            if (!val) return;
            const newVal = val.split(/\s+/).map(v => mapOldToNew.get(v) || v).join(" ");
            if (newVal !== val) el.setAttribute(attr, newVal);
        });
    });

    root.querySelectorAll('a[href^="#"]').forEach(a => {
        const href = a.getAttribute("href");
        const frag = href.slice(1);
        if (mapOldToNew.has(frag)) {
            a.setAttribute("href", `#${mapOldToNew.get(frag)}`);
        }
    });

    return mapOldToNew;
}