let groupedOptions = new Map();

invokeWebService_BGNIDSPF = function () {
  isSuccessBGNIDSPF = false;

  if (Boolean(properties.invokeWs_BGNIDSPF) && Boolean(isAppCore) && (Boolean(isProgramAppCore) || Boolean(isWindowAppCore)) && Boolean(!sideBarIsActive()) && pui.appJob.name) {
    let url = properties.urlWs_BGNIDSPF;
    url = buildWebServiceUrl(url);

    let type = "POST";
    let dataType = "json";
    let cache = properties.cacheWs;

    // Disabilita la cache se il nome programma è tra quelli esclusi
    if (properties.disableCacheWs.includes(getProgramName.name()) || isWindowAppCore) {
      cache = false;
    }

    let useLocalCache = false;
    if (cache) {
      useLocalCache = true;
    }


    let headers = { "Content-Type": "application/json" };

    let data = JSON.stringify({
      iJob: {
        iJobName: pui.appJob.name,
        iJobUser: pui.appJob.user,
        iJobNumber: pui.appJob.number,
        iPgmName: getProgramName.name(),
        iPgmAppFct: getApplicationFunction.name(),
        iPgmSctFct: getSelectionFunction.name()
      },
    });

    let asyncr = false;
    let crossDomain = true;
    let timeout = properties?.timeoutWs || 3000;

    if (!getProgramName.name()) {
      useLocalCache = false;
    }

    let urlCache = buildWebServiceUrlCacheKey(url, isWindowAppCore, data);

    if (!useLocalCache) {
      // Rimuove la cache con il flag attuale
      localCache.remove(urlCache);

      // Rimuove anche l'altra variante solo se è diversa
      const inverseWindowCache = buildWebServiceUrlCacheKey(url, !isWindowAppCore, data);
      if (inverseWindowCache !== urlCache) {
        localCache.remove(inverseWindowCache);
      }

      urlCache = null;
    }

    invokeWebService(
      properties.nameWs_BGNIDSPF,
      url,
      headers,
      type,
      dataType,
      data,
      cache,
      useLocalCache,
      urlCache,
      asyncr,
      crossDomain,
      timeout,
      handleResponse_BGNIDSPF,
      errorWebService
    );
  }
};

handleResponse_BGNIDSPF = function (response, urlCache) {
  groupedOptions = new Map();
  subfileStartMessage = 0;
  let messageFmtName = null;

  let tag_oErrorNode = "oErrorNode";
  // Verifica se c'è un errore
  if (tag_oErrorNode in response) {
    const oError = response.oErrorNode;
    const returnCode = oError?.returnCode;

    // Se returnCode è valorizzato, gestisci l'errore e interrompi
    if (returnCode !== undefined && returnCode !== null && returnCode !== "") {
      const message = oError.returnCodeDescription || "Si è verificato un errore.";
      consoleLog.error("Error web service BGNIDSPF. Code ", returnCode, message);
      isSuccessBGNIDSPF = false;
      return;
    }
  }

  let tag_oVideoNode = "oVideoNode";
  isSuccessBGNIDSPF = true;

  let map = new Map();
  let keyMap = null;
  let objMap = null;


  const item = response[tag_oVideoNode];

  if (item?.fmtNode?.fmt) {
    item.fmtNode.fmt.forEach(function (elFmt) {
      let fmtElem = elFmt.fmtElem;
      let fldNode = elFmt.fldNode;
      let optNode = elFmt.optNode;

      if (Boolean(isProgramAppCore) && (fmtElem.fmtType === 2 || fmtElem.fmtType === 4)) {
        typeProgramAppCore = TYPE_PROGRAM_APP_CORE.List;
      }

      if (offsetRow === 0 && fmtElem.fmtSubfileDroppedRow !== 0) {
        offsetRow = fmtElem.fmtSubfileDroppedRow
      }

      // Opzioni
      if (optNode) {
        const localGrouped = groupOptionsByFieldId(optNode);
        localGrouped.forEach((list, fldId) => {
          if (!groupedOptions.has(fldId)) {
            groupedOptions.set(fldId, []);
          }
          groupedOptions.get(fldId).push(...list);
        });
      }

      fldNode.fld.forEach(function (elFld) {
        keyMap = elFld.fldElem.fldRow + "_" + elFld.fldElem.fldColumn;
        objMap = new setObjMap(fmtElem, elFld.fldElem);
        map.set(keyMap, objMap);


        // Rileva la riga inizio subfile
        if (fmtElem.fmtType === 2) {
          if (subfileStartRow === 0 || elFld.fldElem.fldRow < subfileStartRow) {
            subfileStartRow = elFld.fldElem.fldRow;
          }
        }

        // Rileva la riga per i messaggi
        if (fmtElem.fmtType === 9) {
          if (subfileStartMessage === 0 || elFld.fldElem.fldRow < subfileStartMessage) {
            subfileStartMessage = elFld.fldElem.fldRow;
            messageFmtName = fmtElem.fmtName || fmtElem.fmtname || null;
          }
        }
      });
    });


    enrichGroupedOptionsWith5250BeforeSubfile(groupedOptions, map, subfileStartRow);

    // Applica i valori ai campi HTML
    let row = null;
    let allFields = retrieveAllFields.sortByRowCol();

    for (let idField = 0; idField < allFields.length; idField++) {
      let key = allFields[idField];
      if (key) {
        let valueMap = map.get(key);
        if (valueMap != null) {
          let querySelectorStr = isWindowAppCore
            ? `[id$=_${key}_W${numberWindowAppCore}]`
            : `[id$=_${key} ]`;

          let elem = document.querySelector(querySelectorStr);
          if (elem) {
            modifyElem(elem, valueMap);
          }
        }
      }
    }

    // Evidenzia i messaggi nella riga trovata
    if (subfileStartMessage > 0) {
      const row = parseInt(subfileStartMessage, 10);
      const targetFmtName = (messageFmtName || "").trim();

      const sel = targetFmtName
        ? `[fldRow="${row}"][fmtName="${CSS.escape(targetFmtName)}"]`
        : `[fldRow="${row}"]`;

      document.querySelectorAll(sel).forEach(el => {
        el.setAttribute("fldIsMessage", "1");
        messageRow = row;
      });
    }
  }

  markContinuousFieldsByLength({
    maxRowLookahead: 12,  // se vuoi cercare più a lungo
    inputsOnly: true,     // considera solo <input>
    clearExisting: true
  });

  // Cancella la cache solo se il web service dice di farlo
  if (response.oProgramNode.disableCache === "Y" && urlCache) {
    localCache.remove(urlCache);
  }
};

setObjMap = function (fmtElem, fldElem) {
  this.fmtElem = fmtElem;
  this.fldElem = fldElem;
}

modifyElem = function (elem, valueMap) {
  if (elem != null && elem != '') {
    elem.setAttribute("name", valueMap.fmtElem.fmtFileName + "_" + valueMap.fmtElem.fmtName + "_" + valueMap.fldElem.fldName);
    elem.setAttribute("fmtName", valueMap.fmtElem.fmtName);
    elem.setAttribute("fmtFileName", valueMap.fmtElem.fmtFileName);
    elem.setAttribute("fmtType", valueMap.fmtElem.fmtType);
    elem.setAttribute("fmtIsWindow", valueMap.fmtElem.fmtIsWindow);
    elem.setAttribute("fmtSubfileDroppedRow", valueMap.fmtElem.fmtSubfileDroppedRow);
    elem.setAttribute("fldId", valueMap.fldElem.fldId);
    elem.setAttribute("fldName", valueMap.fldElem.fldName);
    elem.setAttribute("fldType", valueMap.fldElem.fldType);
    elem.setAttribute("fldUse", valueMap.fldElem.fldUse);
    elem.setAttribute("fldIsList", valueMap.fldElem.fldIsList);
    elem.setAttribute("fldIsExpand", valueMap.fldElem.fldIsExpand);
    elem.setAttribute("fldIsMessage", valueMap.fldElem.fldIsMessage);
    elem.setAttribute("fldRow", valueMap.fldElem.fldRow);
    elem.setAttribute("fldColumn", valueMap.fldElem.fldColumn);
    elem.setAttribute("fldLength", valueMap.fldElem.fldLength);

    if (valueMap.fldElem.fldClass !== null && valueMap.fldElem.fldClass !== "") {
      elem.setAttribute("fldClass", valueMap.fldElem.fldClass);
      elem.classList.add(valueMap.fldElem.fldClass);
    }
    if (valueMap.fldElem.fldStyle !== null && valueMap.fldElem.fldStyle !== "") {
      elem.setAttribute("fldStyle", valueMap.fldElem.fldStyle);
    }
    if (valueMap.fldElem.fldText !== null && valueMap.fldElem.fldText !== "") {
      elem.setAttribute("fldText", valueMap.fldElem.fldText);
    }
    if (valueMap.fldElem.fldLabel !== null && valueMap.fldElem.fldLabel !== "") {
      elem.setAttribute("fldLabel", valueMap.fmtElem.fmtFileName + "_" + valueMap.fmtElem.fmtName + "_" + valueMap.fldElem.fldLabel);
    }
    if (valueMap.fldElem.fldIsList != "" || valueMap.fldElem.fldIsExpand != "") {
      elem.style.cursor = "pointer";
    }
    if (valueMap.fldElem.fldName === "VDSCT") {
      elem.classList.add("subfileOption");
    }

    // Aggiunta dataoption ordinati (per codice o descrizione)
    if (groupedOptions && groupedOptions.has(valueMap.fldElem.fldId)) {
      const optsArray = [...groupedOptions.get(valueMap.fldElem.fldId)];

      const sortBy = 'code'; // oppure 'descr'
      optsArray.sort((a, b) => {
        const aCode = a.optElem.optCode || '';
        const bCode = b.optElem.optCode || '';
        const aDescr = a.optElem.optDescr || '';
        const bDescr = b.optElem.optDescr || '';

        const isNumA = /^\d+$/.test(aCode);
        const isNumB = /^\d+$/.test(bCode);

        if (isNumA && isNumB) {
          // Se entrambi sono numerici, ordina numericamente
          return parseInt(aCode, 10) - parseInt(bCode, 10);
        } else if (isNumA) {
          // Se solo A è numerico → viene prima
          return -1;
        } else if (isNumB) {
          // Se solo B è numerico → viene prima
          return 1;
        } else {
          // Entrambi alfanumerici → ordina in base a sortBy
          const aVal = sortBy === 'code' ? aCode : aDescr;
          const bVal = sortBy === 'code' ? bCode : bDescr;
          return aVal.localeCompare(bVal, 'it', { sensitivity: 'base' });
        }
      });

      const opts = optsArray.map(({ optElem }) => {
        const code = optElem?.optCode || '';
        const descr = (optElem?.optDescr || '').replace(/>/g, '');
        return JSON.stringify({ code, descr });
      }).join(';');

      elem.setAttribute("dataoption", opts);
    }
  }
}

function groupOptionsByFieldId(optNode) {
  const grouped = new Map();

  for (const entry of optNode.opt) {
    const { optFldId } = entry.optElem;
    if (!grouped.has(optFldId)) {
      grouped.set(optFldId, []);
    }
    grouped.get(optFldId).push(entry);
  }

  return grouped;
}


function extract5250InlineOptionsBeforeSubfile(subfileStartRow) {
  const emulator = document.getElementById("5250");
  if (!emulator) return [];

  const container5250 = emulator.querySelector('form[name="main"]');
  if (!container5250) return [];

  const divs = container5250.querySelectorAll('div[id^="D_"]');
  const options = [];
  const uniqueCodes = new Set();

  divs.forEach(div => {
    const text = (div.textContent || "")
      .replace(/\u00a0/g, " ")
      .trim();

    if (!text) return;

    // solo valori tipo 1=..., 2=..., 16=...
    const match = text.match(/^(\d+)=(.*)$/);
    if (!match) return;

    const idMatch = (div.id || "").match(/^D_(\d+)_(\d+)$/);
    if (!idMatch) return;

    const row = parseInt(idMatch[1], 10);

    // solo prima del subfile
    if (Number.isFinite(subfileStartRow) && subfileStartRow > 0 && row >= subfileStartRow) {
      return;
    }

    const code = match[1].trim();
    let descr = match[2].trim();

    // override specifico
    if (code === "1") {
      descr = "Selezione";
    }

    if (!code || !descr) return;

    // evita duplicati tra i div 5250
    if (uniqueCodes.has(code)) return;
    uniqueCodes.add(code);

    options.push({ code, descr });
  });

  return options;
}

function enrichGroupedOptionsWith5250BeforeSubfile(groupedOptions, map, subfileStartRow) {
  if (!(groupedOptions instanceof Map) || !(map instanceof Map)) return groupedOptions;

  const inlineOptions = extract5250InlineOptionsBeforeSubfile(subfileStartRow);
  if (!inlineOptions.length) return groupedOptions;

  function normalizeOptCode(code) {
    const value = String(code ?? "").trim();
    if (/^\d+$/.test(value)) {
      return value.padStart(2, "0");
    }
    return value;
  }

  for (const [, objMap] of map.entries()) {
    const fldElem = objMap?.fldElem;
    if (!fldElem) continue;

    // solo sul campo opzione
    if (fldElem.fldName !== "VDSCT") continue;

    const fldId = fldElem.fldId;
    if (!fldId) continue;

    if (!groupedOptions.has(fldId)) {
      groupedOptions.set(fldId, []);
    }

    const currentList = groupedOptions.get(fldId);

    inlineOptions.forEach(opt => {
      const normalizedCode = normalizeOptCode(opt.code);

      const exists = currentList.some(entry =>
        normalizeOptCode(entry?.optElem?.optCode) === normalizedCode
      );

      if (!exists) {
        currentList.push({
          optElem: {
            optFldId: fldId,
            optCode: normalizedCode,
            optDescr: opt.descr
          }
        });
      }
    });
  }

  return groupedOptions;
}



/* ============================================================
   markContinuousFieldsByLength(options)
   - Parte dal fldLength (server) del campo corrente.
   - Se fldLength > maxlength dell'input, cerca segmenti sulla riga
     successiva, poi ancora sulle righe successive, sommando i maxlength
     finché copre fldLength.
   - NON tocca i valori; aggiunge soli data-attribute:
       data-continuous="1"
       data-cont-group="<id del primo segmento>"
       data-cont-index="0..N-1"
       (sul primo anche: data-cont-master="1")
   - Il segmento successivo può essere in colonna diversa.
   - Heuristics di scelta segmento: riga successiva, input text, non già marcato,
     preferenza al più vicino come colonna rispetto al precedente; in pareggio,
     quello con maxlength maggiore.
   - options:
       maxRowLookahead : quante righe al massimo esplorare (default 10)
       inputsOnly      : true = solo <input>; false = include anche <div.form-control>
       clearExisting   : true = rimuove marcature precedenti (default true)
   ============================================================ */
(function () {
  window.markContinuousFieldsByLength = function markContinuousFieldsByLength(options = {}) {
    const CFG = {
      maxRowLookahead: 10,
      inputsOnly: true,
      clearExisting: true,
      ...options
    };

    // ---- helper ----
    function parseRC(id) {
      // supporta _Wn (finestre)
      const m = /^(I|D)_(\d+)_(\d+)(?:_W\d+)?$/.exec(id || "");
      if (!m) return null;
      return { kind: m[1], row: +m[2], col: +m[3] };
    }

    function isTextual(el) {
      if (!el) return false;
      if (el.tagName === "INPUT") {
        const t = (el.getAttribute("type") || "text").toLowerCase();
        return ["", "text", "search", "tel", "email", "password"].includes(t);
      }
      if (!CFG.inputsOnly && el.tagName === "DIV") {
        return el.classList.contains("form-control");
      }
      return false;
    }

    function cap(el) {
      // capacità del segmento HTML
      const raw = el.getAttribute("maxlength");
      const n = raw != null ? parseInt(raw, 10) : (typeof el.maxLength === "number" ? el.maxLength : NaN);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }

    function fldLen(el) {
      // lunghezza logica lato server (fldLength salvata in modifyElem)
      const raw = el.getAttribute("fldLength");
      const n = raw != null ? parseInt(raw, 10) : NaN;
      return Number.isFinite(n) && n > 0 ? n : null;
    }

    function candidatesOnRow(r) {
      const sel = CFG.inputsOnly
        ? `input[id^="I_${r}_"]`
        : `input[id^="I_${r}_"], div.form-control[id^="D_${r}_"]`;
      return Array.from(document.querySelectorAll(sel))
        .filter(isTextual)
        .filter(el => !el.dataset.contGroup); // non già usato
    }

    function pickNearestByCol(cands, prevCol) {
      let best = null, bestDelta = Infinity, bestCap = -1;
      for (const el of cands) {
        const rc = parseRC(el.id);
        if (!rc) continue;
        const delta = Math.abs(rc.col - prevCol);
        const c = cap(el);
        if (
          delta < bestDelta ||
          (delta === bestDelta && c > bestCap)
        ) {
          best = el; bestDelta = delta; bestCap = c;
        }
      }
      return best;
    }

    function markChain(chain) {
      const gid = chain[0].id;
      chain.forEach((el, i) => {
        el.dataset.continuous = "1";
        el.dataset.contGroup = gid;
        el.dataset.contIndex = String(i);
      });
      chain[0].dataset.contMaster = "1";
    }

    function clearMarks() {
      document.querySelectorAll("[data-cont-group]").forEach(el => {
        delete el.dataset.continuous;
        delete el.dataset.contGroup;
        delete el.dataset.contIndex;
        delete el.dataset.contMaster;
      });
    }

    // ---- run ----
    if (CFG.clearExisting) clearMarks();

    // ordina tutti i candidati per riga/colonna
    const all = Array.from(
      document.querySelectorAll(
        CFG.inputsOnly ? 'input[id^="I_"]' : 'input[id^="I_"], div.form-control[id^="D_"]'
      )
    )
      .filter(isTextual)
      .sort((a, b) => {
        const ra = parseRC(a.id), rb = parseRC(b.id);
        if (!ra || !rb) return 0;
        return ra.row === rb.row ? ra.col - rb.col : ra.row - rb.row;
      });

    for (const el of all) {
      if (el.dataset.contGroup) continue; // già marcato
      const rc0 = parseRC(el.id);
      if (!rc0) continue;

      const L = fldLen(el);     // dal server
      const c0 = cap(el);       // capacità locale
      if (!L || c0 <= 0 || L <= c0) continue; // non continuous

      let remaining = L - c0;
      const chain = [el];
      let row = rc0.row;
      let prevCol = rc0.col;

      for (let step = 0; step < CFG.maxRowLookahead && remaining > 0; step++) {
        const nextRow = row + 1;
        const cands = candidatesOnRow(nextRow).filter(x => cap(x) > 0);
        if (!cands.length) break;

        // scegli il più vicino come colonna; se parità, quello con maxlength maggiore
        const pick = pickNearestByCol(cands, prevCol);
        if (!pick) break;

        chain.push(pick);
        remaining -= cap(pick);
        const rc = parseRC(pick.id);
        row = rc ? rc.row : nextRow;
        prevCol = rc ? rc.col : prevCol;
      }

      if (chain.length > 1) {
        markChain(chain);
      }
    }
  };
})();
