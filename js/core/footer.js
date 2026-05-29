/* ==============================  F O O T E R  ============================== */

footer = function () {
  lastButtonsFunctionKey = [];

  hideContainerFooter();
  moveFunctionKey();
  handleSystemMessage();
  showLogoCompany();

  // prima: $("#containerFooter").css(...)
  const cf = document.getElementById("containerFooter");
  if (cf) {
    cf.style.backgroundColor = sideBarIsActive()
      ? "transparent"
      : "var(--bs-color-footer)";
  }

  moveFooterTextToHeader();

  // restano le chiamate ai tuoi helper esterni
  adjustPopupBottomVar(12, "messageAlert");
  ensurePopupBottomListeners();

  const containers = [
    document.getElementById("containerFunctionKey"),
    document.getElementById("containerFunctionKeyWindow"),
  ].filter(Boolean);
  containers.forEach(applyFunctionKeyIcons);
};

/* -------------------------------------------------------------------------- */

hideContainerFooter = function () {
  var containerFooter = document.getElementById("containerFooter");
  if (containerFooter != null) {
    containerFooter.setAttribute("style", "padding:0 !important;");
    if (Boolean(isSignon)) {
      // prima: $('#containerFooter').attr("style", "display:none !important");
      containerFooter.style.setProperty("display", "none", "important");
    } else {
      // prima: $('#containerFooter').attr("style", "display:block !important");
      containerFooter.style.setProperty("display", "block", "important");
    }
  }
};

/* -------------------------------------------------------------------------- */
/* helper compatibile: rimuove tutte le classi che iniziano con un prefisso   */
function removeClassStartingWith(elOrSelector, prefix) {
  const el =
    typeof elOrSelector === "string"
      ? document.querySelector(elOrSelector)
      // se accidentalmente arriva un oggetto jQuery, prova a prendere [0]
      : (elOrSelector && elOrSelector[0]) || elOrSelector;
  if (!el || !el.classList || !prefix) return;
  const toRemove = [];
  el.classList.forEach((c) => {
    if (c.startsWith(prefix)) toRemove.push(c);
  });
  toRemove.forEach((c) => el.classList.remove(c));
}

/* -------------------------------------------------------------------------- */

handleSystemMessage = function () {
  var message = "";
  var messageError = "";
  var containerAlert = document.getElementById("containerAlert");

  containerAlert.className = "containerAlert";
  var messageAlert = document.getElementById("messageAlert");
  messageAlert.innerHTML = "";

  var messageInfo = null;
  containerAlert.style.display = "none";

  // Calcola messageRow
  if (messageRow === null || messageRow === 0) {
    if (pui.genie.displaySize == 80) {
      messageInfo = document.getElementById("D_24_2");
      if (!messageInfo) {
        messageInfo = document.getElementById("D_24_1");
      }
      if (messageInfo) {
        messageRow = getRow(messageInfo.id);
      }
    } else {
      messageInfo = document.getElementById("D_27_2");
      if (!messageInfo) {
        messageInfo = document.getElementById("D_27_1");
      }
      if (!messageInfo) {
        messageInfo = document.getElementById("D_24_2");
      }
      if (!messageInfo) {
        messageInfo = document.getElementById("D_24_1");
      }
      if (messageInfo) {
        messageRow = getRow(messageInfo.id);
      }
    }
  } else {
    messageInfo = document.getElementById("D_" + messageRow + "_2");
  }

  if (messageRow === null || messageRow === 0) {
    return;
  }

  let messagePlus = null;
  messagePlus = document.getElementById(
    "D_" + messageRow + "_" + (pui.genie.displaySize - 1)
  );

  const ALLOWED_OPS = ["INS", "CAN", "DEL", "VAR"];
  duringNotificationMessage = false;
  if (
    notificationMessage &&
    isProgramAppCore &&
    ALLOWED_OPS.includes(getApplicationFunction.name()) &&
    totalNumberNotificationMessage <
      parseInt(properties.totalMaxNumberNotificationMessage - 1) &&
    messagePlus &&
    messagePlus.textContent === "+" &&
    !disableNotificationMessage
  ) {
    duringNotificationMessage = true;

    if (currentElementPosition === null) {
      currentElementPosition = getElemCursorPosition();
    }
    setCursor(messageRow, 2);

    pressKey("PageDown");
  }

  if (currentElementPosition !== null) {
    setCursor(currentElementPosition);
  }

  messageAlert.classList.remove("badge", "bg-info", "text-dark");

  if (messageInfo != null && messageInfo.textContent != null) {
    notifyMessage(messageInfo);

    containerAlert.style.display = "flex";
    messageInfo.className = "";
    messageInfo.classList.add("messageBadge", "badge", "bg-warning-custom", "text-dark");

    messageInfo.onclick = function (e) {
      pressKey("F1");
    };

    message = messageInfo.textContent;
    messageAlert.appendChild(messageInfo);

    if (message != null) {
      containerAlert.classList.add("alert");
      containerAlert.classList.add("alert-info");
    }
  }

  if (pui.genie.displaySize == 80) {
    messageError = document.getElementById("D_25_2");
  } else {
    messageError = document.getElementById("D_28_2");
  }

  if (messageError != null && messageError.textContent != null) {
    notifyMessage(messageError);

    containerAlert.style.display = "flex";
    messageError.className = "";
    messageError.classList.add("messageBadge", "badge", "bg-danger");

    if (messageInfo != null) {
      messageInfo.style.display = "none";
    }

    messageAlert.appendChild(messageError);

    // prima: removeClassStartingWith($('#containerAlert'), 'alert-');
    removeClassStartingWith(containerAlert, "alert-");
    containerAlert.classList.add("alert");
    containerAlert.classList.add("alert-info");
  }

  if (containerAlert.style.display != "none" && messagePlus !== null) {
    let controlAlert = document.getElementById("controlAlert");
    if (!controlAlert) {
      controlAlert = document.createElement("div");
    }

    controlAlert.id = "controlAlert";
    controlAlert.className = "controlAlert d-flex gap-2";

    // Bottone Freccia Su
    let arrowUp = document.getElementById("arrowAlertUp");
    if (!arrowUp) {
      arrowUp = document.createElement("button");
    }
    arrowUp.id = "arrowAlertUp";
    arrowUp.className = "btn btn-outline-secondary btn-sm";
    arrowUp.innerHTML = '<i id="iArrowUp" class="fas fa-arrow-up"></i>';

    // Bottone Freccia Giù
    let arrowDown = document.getElementById("arrowAlertDown");
    if (!arrowDown) {
      arrowDown = document.createElement("button");
    }
    arrowDown.id = "arrowAlertDown";
    arrowDown.className = "btn btn-outline-secondary btn-sm";
    arrowDown.innerHTML = '<i id="iArrowDown" class="fas fa-arrow-down"></i>';

    // Aggiungi i bottoni al contenitore
    controlAlert.append(arrowUp);
    controlAlert.append(arrowDown);
    containerAlert.appendChild(controlAlert);

    disableNotificationMessage = false;
    arrowUp.onclick = function (e) {
      disableNotificationMessage = true;
      setCursor(messageRow, 2);
      pressKey("PageUp");
    };
    arrowDown.onclick = function (e) {
      disableNotificationMessage = true;
      setCursor(messageRow, 2);
      pressKey("PageDown");
    };
  }
};

/* -------------------------------------------------------------------------- */

showLogoCompany = function () {
  if (Boolean(properties.showLogoCompany) && !Boolean(isSignon)) {
    var containerLogoCompany = document.getElementById("containerLogoCompany");
    var logoCompany = document.getElementById("logoCompany");
    if (containerLogoCompany != null && logoCompany == null) {
      let urlLogo =
        "/profoundui/userdata/genie skins/" +
        skin +
        "/images/logo/" +
        properties.logoCompanyName;
      let logoElement = newElement("a");
      logoElement.id = "logoCompany";
      logoElement.setAttribute("tabindex", "-1");
      logoElement.style.position = "relative";
      logoElement.href = properties.logoHref;
      logoElement.target = "_blank";
      logoElement.innerHTML =
        '<img id="LogoCompanyImage" class="LogoCompanyImage"  src="' +
        urlLogo +
        '"></img>';

      // FIX crash: imposta gli stili direttamente sull’elemento creato
      logoElement.style.top = "";
      logoElement.style.left = "";

      containerLogoCompany.append(logoElement);
    }
  }
};

/* -------------------------------------------------------------------------- */

buildPlugInHeader = function (div, li, iButton, classPlugIn, textPopover) {
  let liPluginHeader = document.createElement("li");
  liPluginHeader.textContent = "";

  if (textPopover.includes("=")) {
    liPluginHeader.setAttribute(
      "id",
      "plg" + textPopover.substr(0, textPopover.lastIndexOf("="))
    );
  } else {
    liPluginHeader.setAttribute("id", "plg" + textPopover);
  }

  liPluginHeader.setAttribute("class", classPlugIn);
  liPluginHeader.setAttribute("data-toggle", "popover");
  liPluginHeader.setAttribute("data-trigger", "hover");
  liPluginHeader.setAttribute("data-placement", "right");
  liPluginHeader.setAttribute("title", textPopover);
  div.setAttribute("id", "divIconB" + iButton);

  div.onmouseover = function () {
    if ("F05=Aggiorna" == textPopover) {
      liPluginHeader.setAttribute("class", classPlugIn + " fa-spin");
    }

    if ("F18=Inserimento" == textPopover) {
      liPluginHeader.setAttribute("class", "fas fa-plus-circle");
    }

    if ("F16=Dettaglio" == textPopover) {
      liPluginHeader.setAttribute("class", "fas fa-expand-alt");
    }

    if ("F12=Precedente" == textPopover) {
      liPluginHeader.setAttribute("class", "fas fa-arrow-circle-left");
    }

    if ("Invio" == textPopover) {
      liPluginHeader.setAttribute("class", "fas fa-check-circle");
    }

    if ("F3=Fine" == textPopover) {
      liPluginHeader.setAttribute("class", "fas fa-times-circle");
    }
  };

  div.onmouseout = function () {
    liPluginHeader.setAttribute("class", classPlugIn);

    if ("F16=Dettaglio" == textPopover && document.getElementById("subfile2") != null) {
      liPluginHeader.setAttribute("class", "fas fa-expand-alt");
    }
  };

  div.appendChild(liPluginHeader);
};

/* -------------------------------------------------------------------------- */

resetFooter = function () {
  document.querySelectorAll("#containerFooterDown ul").forEach((n) => n.remove());
  document.querySelectorAll("#containerFooterUp ul").forEach((n) => n.remove());
  document.querySelectorAll("#containerFooterUp a").forEach((n) => n.remove());
};

/* -------------------------------------------------------------------------- */

function moveFooterTextToHeader() {
  const footer = document.getElementById("containerEmulatorInsideFooter");
  const footerText = document.getElementById("containerEmulatorInsideFooterText");
  const header = document.getElementById("containerEmulatorInsideHeader");
  const body = document.getElementById("containerEmulatorInsideBody");

  if (footer && footerText && header) {
    // Aggiungi le classi desiderate
    footerText.classList.add("badge", "bg-light", "text-dark");

    // Sposta il testo nell'header
    header.appendChild(footerText);

    // Nascondi il footer
    footer.style.display = "none";
  }
}

/* ========================  F U N C T I O N   K E Y  ======================== */

function cleanFunctionKeyLabels(selector) {
  const lis = document.querySelectorAll(selector);
  lis.forEach((li) => {
    // usa (o crea) un contenitore testo dedicato per NON toccare le icone
    let labelSpan = li.querySelector(".fk-label");
    if (!labelSpan) {
      // raccogli solo i nodi di testo attuali del li
      let txt = "";
      const toRemove = [];
      li.childNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          txt += n.textContent;
          toRemove.push(n);
        }
      });
      toRemove.forEach((n) => li.removeChild(n));
      labelSpan = document.createElement("span");
      labelSpan.className = "fk-label";
      labelSpan.textContent = (txt || "").trim();
      li.appendChild(labelSpan);
    }

    // pulizia “Fxx=Label” → “Label”
    const raw = (labelSpan.textContent || "").trim();
    const eq = raw.indexOf("=");
    labelSpan.textContent = (eq >= 0 ? raw.slice(eq + 1) : raw).trim();
  });
}

function applyFunctionKeyIcons(root) {
  const scope = root || document;

  const nodes = scope.querySelectorAll(
    'button, a, [role="button"], li.btn, .btn-functionKey, .ulFunctionKey > li'
  );

  nodes.forEach((btn) => {
    if (!btn || btn.dataset.iconized === "1") return;

    const label = normalizeFunctionKeyText(btn.textContent);

    // helper per aggiungere l'icona (BI → FA fallback)
    const addIcon = (btn, bi, fa) => {
      if (btn.querySelector("i")) {
        btn.dataset.iconized = "1";
        return;
      }
      const i = document.createElement("i");
      const hasBI =
        !!document.querySelector('link[href*="bootstrap-icons"]') ||
        !!document.querySelector('[class*=" bi-"], [class^="bi-"]');
      i.className = hasBI ? bi : fa;
      i.classList.add("iFunctionKey");
      btn.prepend(i);
      btn.dataset.iconized = "1";
    };

    // INVIO / CONFERMA / ENTER / OK → check
    if (/(^|\W)(INVIO|CONFERMA|ENTER|OK)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-check-lg", "fa fa-check");
      return;
    }
    // PRECEDENTE / INDIETRO / BACK → freccia sinistra
    if (/(^|\W)(PRECEDE?N?TE|INDIETRO|BACK)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-arrow-left-short", "fa fa-arrow-left");
      return;
    }
    // ESCI / ESC / ANNULLA / CHIUDI / CANCELLA → sign-out
    if (/(^|\W)(ESCI|ESC|ANNULLA|CHIUDI|CANCELLA)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-box-arrow-right", "fa fa-sign-out-alt");
      return;
    }

    // === NUOVE MAPPE RICHIESTE ===
    // AGGIORNA → refresh
    if (/(^|\W)(AGGIORNA|REFRESH|RICARICA)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-arrow-repeat", "fa fa-sync");
      return;
    }
    // INSERIMENTO → plus
    if (/(^|\W)(INSERIMENTO)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-plus-lg", "fa fa-plus");
      return;
    }
    // FINE → X
    if (/(^|\W)(FINE)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-x-lg", "fa fa-times");
      return;
    }

    // DETTAGLIO / ESPANDI → expand
    if (/(^|\W)(DETTAGLIO|DETTAGLI|ESPANDI|EXPAND)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-arrows-fullscreen", "fa fa-expand");
      return;
    }

    // STAMPA → printer
    if (/(^|\W)(STAMPA|STAMPARE|PRINT|STAMP|STAMPE)(\W|$)/.test(label)) {
      addIcon(btn, "bi bi-printer", "fa fa-print");
      return;
    }

    // RIPOSIZIONA → move
    if (/(^|\W)(RIPOSIZIONA|RIPOSIZ\.)(\$|\W)/.test(label)) {
      addIcon(btn, "bi bi-arrows-move", "fa fa-arrows-alt");
      return;
    }
  });
}

function normalizeFunctionKeyText(s) {
  return (s || "")
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // rimuove accenti
    .toUpperCase();
}

function collectFunctionKey(rootEl, opts) {
  const {
    includeIdWithW = false,
    excludeIdWithW = false,
    removeOriginalInputs = false,
  } = opts || {};

  const inputs = rootEl ? rootEl.getElementsByTagName("input") : [];
  const buttons = [];
  const dups = Object.create(null);
  let gotEnter = false;

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (!input || input.type !== "button" || input.fkey == null) continue;
    if (input.className && input.className.indexOf("hide") >= 0) continue;

    const hasW = input.id && input.id.indexOf("W") !== -1;
    if (includeIdWithW && !hasW) continue;
    if (excludeIdWithW && hasW) continue;

    input.style.visibility = "hidden";

    if (!dups[input.fkey]) {
      buttons.push({ fkey: input.fkey, text: input.value });
      dups[input.fkey] = true;
      if (String(input.fkey).toLowerCase() === "enter") gotEnter = true;
    }

    if (removeOriginalInputs) {
      // rimuovi il bottone originale dal DOM
      input.remove();
      i--;
    }
  }

  return { buttons, gotEnter };
}

function ensureFunctionKeyEnter(buttons, mode, gotEnterInitially) {
  // mode: 'window' | 'screen'
  if (mode === "window") {
    // Se lista vuota e AppCore, inserisci Enter
    if (buttons.length === 0 && Boolean(isAppCore)) {
      buttons.unshift({ fkey: "Enter", text: "Invio" });
      return true; // gotEnter
    }
    // Se ci sono bottoni ma mancava Enter, aggiungilo in testa
    if (buttons.length > 0 && !gotEnterInitially) {
      buttons.unshift({ fkey: "Enter", text: "Invio" });
      return true;
    }
    return gotEnterInitially;
  } else {
    // screen: garantisci sempre Enter se manca
    if (!buttons.some((b) => String(b.fkey).toLowerCase() === "enter")) {
      buttons.unshift({ fkey: "Enter", text: "Invio" });
      return true;
    }
    return true; // in screen lo consideriamo presente dopo l'ensure
  }
}

function applyFunctionKeyExtra(buttons, { allowCF12 = true, allowCF05 = false }) {
  if (!Boolean(isAppCore)) return;

  // CF12 se non c'è e non c'è CF03 e non siamo nel main menu
  if (
    allowCF12 &&
    buttons.find((b) => b.fkey === "CF12") === undefined &&
    buttons.find((b) => b.fkey === "CF03") === undefined &&
    !Boolean(isMainMenuAppCore)
  ) {
    const textButton = Boolean(hideFKeyNames) ? "Precedente" : "F12=Precedente";
    buttons.push({ fkey: "CF12", text: textButton });
  }

  // CF05 in programmi AppCore e se sidebar non attiva
  if (
    allowCF05 &&
    buttons.find((b) => b.fkey === "CF05") === undefined &&
    Boolean(isAppCore) &&
    Boolean(isProgramAppCore) &&
    !Boolean(sideBarIsActive())
  ) {
    const textButton = Boolean(hideFKeyNames) ? "Aggiorna" : "F05=Aggiorna";
    buttons.push({ fkey: "CF05", text: textButton });
  }
}

function setLaberForFunctionKey(button) {
  if (button.fkey === "Enter") {
    return Boolean(hideFKeyNames) ? "Invio" : "Invio";
  }
  return button.text;
}

function classForFunctionKey(fkey) {
  switch (fkey) {
    case "Enter":
      return "btn btn-success btn-md";
    case "CF03":
      return "btn btn-danger btn-md";
    case "CF15":
      return "btn btn-warning btn-md";
    case "CF18":
      return "btn btn-primary btn-md";
    case "CF16":
      return "btn btn-custom-dark btn-md";
    case "CF12":
      return "btn btn-custom-dark btn-md";
    case "CF05":
      return "btn btn-custom-dark btn-md";
    default:
      return "btn btn-custom-dark btn-md";
  }
}

function renderFunctionKey(button, handlerAttach) {
  const li = document.createElement("li");
  li.setAttribute("class", classForFunctionKey(button.fkey));
  li.classList.add("btn-functionKey");

  // label isolata in un contenitore dedicato (le icone non verranno rimosse)
  const span = document.createElement("span");
  span.className = "fk-label";
  span.textContent = setLaberForFunctionKey(button);
  li.appendChild(span);

  // aggancia gli handler specifici (screen/window)
  if (typeof handlerAttach === "function") {
    handlerAttach(li, button.fkey);
  }
  return li;
}

/**
 * Restituisce i contenitori standard per i tasti funzione.
 * mode: "screen" (schermata principale) | "window" (finestra/modale)
 */
function getFunctionKeyContainers(mode) {
  if (mode === "window") {
    const root = document.getElementById("containerFunctionKeyWindow");
    if (!root) return null;
    root.innerHTML = "";

    const ulMain = document.createElement("ul");
    ulMain.id = "ulFunctionKeyWindow";
    ulMain.classList.add(
      "ulFunctionKeyWindow",
      "d-flex",
      "row",
      "justify-content-center",
      "g-2"
    );

    return {
      mode: "window",
      root, // dove appendere i <li>
      ulMain, // ul dei bottoni
      ulPlugIn: null, // non usato in window
      header: null, // non usato in window
      cleanSelector: "#ulFunctionKeyWindow li",
    };
  }

  // default: screen
  const root = document.getElementById("containerFunctionKey");
  const header = document.getElementById("insideHeaderButtons");
  if (!root || !header) return null;

  root.innerHTML = "";
  header.innerHTML = "";

  const ulMain = document.createElement("ul");
  ulMain.id = "ulFunctionKey";
  ulMain.classList.add("ulFunctionKey", "row", "justify-content-center", "g-2");

  const ulPlugIn = document.createElement("ul");
  ulPlugIn.id = "ulMenuPlugInButtons";
  ulPlugIn.classList.add("ulMenuPlugInButtons");

  return {
    mode: "screen",
    root, // containerFunctionKey
    ulMain, // ul dei bottoni
    ulPlugIn, // ul dei plugin header (se serve)
    header, // insideHeaderButtons
    cleanSelector: "#ulFunctionKey li",
  };
}

/**
 * Crea la lista finale dei tasti funzione (già ordinata e con extra/Enter).
 * mode: "screen" | "window"
 */
function buildFunctionKeyList(rootEl, mode) {
  const isWindow = mode === "window";
  const { buttons: rawButtons, gotEnter } = collectFunctionKey(rootEl, {
    includeIdWithW: isWindow,
    excludeIdWithW: !isWindow,
    removeOriginalInputs: !isWindow, // in screen rimuoviamo gli input originali
  });

  // Copia mutabile
  const list = rawButtons.slice();

  if (isWindow) {
    // WINDOW: Enter in testa se manca (con elementi) oppure unico se lista vuota in AppCore
    if (!gotEnter && list.length > 0) {
      list.unshift({ fkey: "Enter", text: "Invio" });
    }
    if (list.length === 0 && Boolean(isAppCore)) {
      list.unshift({ fkey: "Enter", text: "Invio" });
    }
    // CF12 se assente
    if (!list.some((b) => b.fkey === "CF12")) {
      list.push({
        fkey: "CF12",
        text: Boolean(hideFKeyNames) ? "Precedente" : "F12=Precedente",
      });
    }
  } else {
    // SCREEN: extras AppCore (CF12/CF05) + Enter garantito
    if (Boolean(isAppCore)) {
      if (
        !list.some((b) => b.fkey === "CF12") &&
        !list.some((b) => b.fkey === "CF03") &&
        !Boolean(isMainMenuAppCore)
      ) {
        list.push({
          fkey: "CF12",
          text: Boolean(hideFKeyNames) ? "Precedente" : "F12=Precedente",
        });
      }
      if (
        !list.some((b) => b.fkey === "CF05") &&
        Boolean(isProgramAppCore) &&
        !Boolean(sideBarIsActive())
      ) {
        list.push({
          fkey: "CF05",
          text: Boolean(hideFKeyNames) ? "Aggiorna" : "F05=Aggiorna",
        });
      }
    }
    if (!list.some((b) => String(b.fkey).toLowerCase() === "enter")) {
      list.unshift({ fkey: "Enter", text: "Invio" });
    }
  }

  // SORT con Enter sempre in testa
  list.sort((a, b) => {
    if (a.fkey === "Enter") return -1;
    if (b.fkey === "Enter") return 1;
    return a.fkey < b.fkey ? -1 : a.fkey > b.fkey ? 1 : 0;
  });

  return list;
}

/* ------------------------------ WINDOW VERSION ---------------------------- */

moveFunctionKeyWindow = function (windowObject) {
  if (!windowObject) return;

  const ui = getFunctionKeyContainers("window");
  if (!ui) return;

  const { ulMain, root, cleanSelector } = ui;

  const buttons = buildFunctionKeyList(windowObject, "window");
  if (buttons.length === 0 && !Boolean(isAppCore)) {
    if (getDataStorage("showFunctionKey", "local") === "false") {
      cleanFunctionKeyLabels(cleanSelector);
    }
    return;
  }

  // attach handler per WINDOW
  const attachWindow = (li, fkey) => {
    li.fkey = fkey;
    li.classList.add("col", "col-auto");
    li.onclick = function (e) {
      const t = e.currentTarget || e.target;
      const k = t.fkey || (t.parentNode ? t.parentNode.fkey : null);
      if (k) pressKey(k);
    };
  };

  // render tramite renderFunctionKey
  buttons.forEach((btn) => {
    const li = renderFunctionKey(btn, attachWindow);
    ulMain.appendChild(li);
  });

  root.appendChild(ulMain);

  // ICONE: sempre visibili (niente condizione su local storage)
  applyFunctionKeyIcons(root);

  // (opzionale) “accorcia” etichette se lo switch utente è attivo
  if (getDataStorage("showFunctionKey", "local") === "false") {
    cleanFunctionKeyLabels(cleanSelector);
  }
};

/* ------------------------------ SCREEN VERSION ---------------------------- */

moveFunctionKey = function () {
  const root5250 = document.getElementById("5250");
  if (!root5250) return;
  if (Boolean(isSignon) || document.getElementById("Layout2") != null) return;

  const ui = getFunctionKeyContainers("screen");
  if (!ui) return;

  const {
    ulMain: ulFunctionKey,
    ulPlugIn: ulMenuPlugInButtons,
    root: containerFunctionKey,
    header: insideHeaderButtons,
    cleanSelector,
  } = ui;

  const buttons = buildFunctionKeyList(root5250, "screen");
  if (buttons.length === 0) {
    if (getDataStorage("showFunctionKey", "local") === "false") {
      cleanFunctionKeyLabels(cleanSelector);
    }
    return;
  }

  window.lastButtonsFunctionKey = [...buttons];

  const sidebarActive = Boolean(sideBarIsActive());
  const whitelistWhenSidebar = new Set(["Enter", "CF03"]);

  const attachScreen = (li, fkey) => {
    addEventPluginElements(li, fkey);
    // layout a griglia come prima
    li.classList.add("col", "col-auto");
  };

  buttons.forEach((btn) => {
    const isButtonValid = !sidebarActive || whitelistWhenSidebar.has(btn.fkey);
    if (!isButtonValid) return;

    const li = renderFunctionKey(btn, attachScreen);
    ulFunctionKey.appendChild(li);
  });

  if (Boolean(isProgramAppCore)) {
    insideHeaderButtons.appendChild(ulMenuPlugInButtons);
    containerFunctionKey.appendChild(ulFunctionKey);
  } else {
    containerFunctionKey.appendChild(ulFunctionKey);
  }

  if (!isWindowAppCore && !document.getElementById("RSCNMSGModal")) {
    containerFunctionKey.style.visibility = "visible";
    insideHeaderButtons.style.visibility = "visible";
  } else {
    containerFunctionKey.style.visibility = "hidden";
    // prima: $("#containerEmulatorInsideHeader").attr("style", "display: none");
    const hdrInside = document.getElementById("containerEmulatorInsideHeader");
    if (hdrInside) hdrInside.style.display = "none";
  }

  if ("F16=Dettaglio" == window.plgExpand && document.getElementById("subfile2") != null) {
    // prima: $("#plgF16").removeClass(...).addClass(...)
    const plg = document.getElementById("plgF16");
    if (plg) {
      plg.classList.remove("fas", "fa-arrows-alt-h");
      plg.classList.add("fas", "fa-expand-alt");
    }
  }

  // ICONE: sempre visibili (niente condizione su local storage)
  applyFunctionKeyIcons(containerFunctionKey);

  if (getDataStorage("showFunctionKey", "local") === "false") {
    cleanFunctionKeyLabels(cleanSelector);
  }
};
