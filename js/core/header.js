/* ================== Funzione Selettiva (badge alto) ================== */

function applyFunzioneSelettivaAlto() {
  const footer = document.getElementById("containerEmulatorInsideFooter");
  const footerText = document.getElementById("containerEmulatorInsideFooterText");
  const header = document.getElementById("containerEmulatorInsideHeader");
  const body = document.getElementById("containerEmulatorInsideBody");

  if (!footer || !footerText || !header) return;

  footerText.classList.add("badge", "bg-light", "text-dark");
  footerText.style.textAlign = "center";

  header.appendChild(footerText);
  if (footer) footer.style.display = "none";
  if (body) {
    body.style.borderBottomLeftRadius = "1rem";
    body.style.borderBottomRightRadius = "1rem";
  }
}

function initFunzioneSelettivaOnLoad() {
  applyFunzioneSelettivaAlto();
}

/* ============================ Header ============================ */

header = function () {
  createHeader();
};

createHeader = function () {
  showLogo();

  const right = document.getElementById("containerHeaderRight");
  if (right) {
    right.style.display = Boolean(isSignon) ? "none" : "inline-flex";
  }

  // Applica SEMPRE "alto"
  initFunzioneSelettivaOnLoad();

  // Applica font salvato
  initRootFontSizeFromStorage();
};

/* ============================ Logo / Ambiente ============================ */

showLogo = function () {
  const containerHeaderLeft = document.getElementById("containerHeaderLeft");
  if (!containerHeaderLeft) return;

  if (!document.getElementById("logo")) {
    if (Boolean(properties.showLogo)) {
      const logoElement = document.createElement("a");
      logoElement.style.position = "relative";
      const urlLogo = "/profoundui/userdata/genie skins/" + skin + "/images/logo/" + properties.logoName;
      logoElement.href = properties.logoHref;
      logoElement.target = "_blank";
      logoElement.setAttribute("tabindex", "-1");
      logoElement.innerHTML = '<img id="logo" class="logo" src="' + urlLogo + '">';
      containerHeaderLeft.append(logoElement);
    }
  }

  if (!document.getElementById("elementlogoProductName")) {
    const urllogoProductName = "/profoundui/userdata/genie skins/" + skin + "/images/logo/" + properties.logoProductName;
    const containerHeaderCenter = document.getElementById("containerHeaderCenter");

    const logoElementAppCore = document.createElement("a");
    logoElementAppCore.id = "elementlogoProductName";
    logoElementAppCore.style.position = "relative";
    logoElementAppCore.innerHTML = '<img id="logoProductName" class="logoProductName" src="' + urllogoProductName + '">';
    containerHeaderCenter.append(logoElementAppCore);
  }

  // Ambiente
  setEnvironmentDescription();

  // Favicon
  let favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = "/profoundui/userdata/genie skins/" + skin + "/icons/" + properties.faviconName;
};

setEnvironmentDescription = function () {
  let environmentDescription = document.getElementById("environmentDescription");
  const logoProductName = document.getElementById("logoProductName");

  if (!Boolean(isAppCore)) {
    if (environmentDescription) {
      if (logoProductName) {
        logoProductName.style.height = null;
        logoProductName.style.verticalAlign = null;
      }
      const center = document.getElementById("containerHeaderCenter");
      if (center) center.style.marginTop = null;
      environmentDescription.remove();
    }
    return;
  }

  const environmentInfo = getDataStorage("environment", "session");
  if (environmentInfo == null) return;

  if (!environmentDescription) {
    environmentDescription = document.createElement("div");
    environmentDescription.id = "environmentDescription";
    if (logoProductName) {
      logoProductName.style.height = "50%";
      logoProductName.style.verticalAlign = "top";
    }
    const center = document.getElementById("containerHeaderCenter");
    if (center) center.style.marginTop = "0.2rem";
  }

  const environmentInfoText = environmentInfo.substr(environmentInfo.length - 3, environmentInfo.length);
  switch (environmentInfoText.toUpperCase()) {
    case "SVL":
      environmentDescription.textContent = "Sviluppo";
      break;
    case "COL":
      environmentDescription.textContent = "Collaudo";
      break;
    case "PRD":
      break;
    default:
      environmentDescription.textContent = "Ambiente " + environmentInfo.trim();
  }

  const elementlogoProductName = document.getElementById("elementlogoProductName");
  if (elementlogoProductName) elementlogoProductName.append(environmentDescription);
};

/* ============================ Utilità varie ============================ */

resetEmulatorInside = function () {
  const t = document.getElementById("insideHeaderTitle");
  const f = document.getElementById("containerEmulatorInsideFooter");
  if (t) t.innerHTML = "";
  if (f) f.innerHTML = "";
};

execSwitchLabel = function () {
  document.querySelectorAll('input[name="optionSwitchLabel"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      setDataStorage("showTypeLabel", this.value, "local");
      showTypeLabel = this.value;
      pressKey('F5');
    });
  });
};

/* ====================== Densità righe ====================== */

const DENSITY_STORAGE_KEY = "rowDensityMode";

function applyRowDensity(mode) {
  const body = document.getElementById("containerEmulatorInsideBody");
  if (!body) return;

  body.classList.remove("density-compact", "density-normal", "density-comfortable");

  let cls;
  switch (mode) {
    case "compact":
      cls = "density-compact";
      break;
    case "comfortable":
      cls = "density-comfortable";
      break;
    default:
      cls = "density-normal";
      mode = "normal";
  }

  body.classList.add(cls);

  // salvo sempre la modalità “normal/compact/comfortable”
  setDataStorage(DENSITY_STORAGE_KEY, mode, "local");
}

// opzionale: da chiamare una volta al load schermata
function initRowDensityFromStorage() {
  const saved = getDataStorage(DENSITY_STORAGE_KEY, "local") || "normal";
  applyRowDensity(saved);
}


/* ====================== Font Size (per breakpoint) ====================== */

const FONT_STORAGE_BASE_KEY = "rootFontSizePx";

/** legge il breakpoint corrente da --bs-breakpoint */
function getCurrentBreakpoint() {
  const root = document.documentElement;
  const bp = getComputedStyle(root)
    .getPropertyValue("--bs-breakpoint")
    .replace(/"/g, "")
    .trim();
  return bp || "default";
}

/** costruisce la chiave LS per quel breakpoint */
function getFontStorageKeyForBreakpoint(bp) {
  return FONT_STORAGE_BASE_KEY + "_" + (bp || "default");
}

function applyRootFontSize(sizePx, breakpoint) {
  const root = document.documentElement;
  if (!root) return;

  let newSize = parseFloat(sizePx);
  if (isNaN(newSize)) return;
  if (newSize < 9) newSize = 9; // minimo di sicurezza

  root.style.fontSize = newSize + "px";

  // salvo per il breakpoint corrente
  const bp = breakpoint || getCurrentBreakpoint();
  const storageKey = getFontStorageKeyForBreakpoint(bp);
  setDataStorage(storageKey, String(newSize), "local");
}

/** inizializza font al load in base al breakpoint corrente */
function initRootFontSizeFromStorage() {
  const bp = getCurrentBreakpoint();
  const storageKey = getFontStorageKeyForBreakpoint(bp);
  const saved = getDataStorage(storageKey, "local");

  if (saved != null && saved !== "") {
    const n = parseFloat(saved);
    if (!isNaN(n)) {
      applyRootFontSize(n, bp);
      return;
    }
  }

  // se non c'è niente in storage, uso la dimensione attuale del root come default
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const current = parseFloat(computed.fontSize) || 14;
  applyRootFontSize(current, bp);
}

/** cambia il font del root di deltaPx (+1/-1) sul breakpoint corrente */
function changeRootFontSize(deltaPx) {
  const root = document.documentElement;
  if (!root) return;

  const computed = getComputedStyle(root);
  const current = parseFloat(computed.fontSize) || 14;
  const next = current + deltaPx;

  applyRootFontSize(next); // usa breakpoint corrente + salva per quel bp
}

/* ====================== Header Right (icone, menu info) ====================== */

handlecontainerHeaderRight = function () {
  if (menuInfoItems.length > 0) {
    buildContainerHeaderRight();
    resetMenuInfoItems();
    populateMenuInfoItems();
  } else {
    removeMenuInfoItems();
  }
};

buildContainerHeaderRight = function () {
  const container = document.getElementById("containerHeaderRight");
  if (!container) return;

  /* --- Icona Refresh --- */
  let iconRefresh = document.getElementById("iconRefresh");
  if (!iconRefresh) {
    iconRefresh = document.createElement("div");
    iconRefresh.id = "iconRefresh";
    iconRefresh.title = "Aggiorna";
    const i = document.createElement("i");
    i.className = "fas fa-sync";
    iconRefresh.appendChild(i);
    container.appendChild(iconRefresh);
    iconRefresh.addEventListener("click", function () {
      try {
        resetBackgroundImage();
        pui.refresh();
        showBootstrapToast("Schermata aggiornata", "success");
      } catch (e) {
        try { consoleLog.warn(e); } catch { }
        showBootstrapToast("Errore durante l'aggiornamento", "danger");
      }
    });
  }
  iconRefresh.style.visibility = "hidden";
  if (Boolean(isAppCore)) {
    if (Boolean(isMainMenuAppCore)) iconRefresh.style.visibility = "visible";
  } else {
    iconRefresh.style.visibility = "visible";
  }

  /* --- Icona Snapshot --- */
  let iconSnapshot = document.getElementById("iconSnapshot");
  if (!iconSnapshot) {
    iconSnapshot = document.createElement("div");
    iconSnapshot.id = "iconSnapshot";
    iconSnapshot.title = "Screenshot";
    const i = document.createElement("i");
    i.className = "far fa-image";
    iconSnapshot.appendChild(i);
    container.appendChild(iconSnapshot);

    iconSnapshot.addEventListener("click", function () {
      try {
        htmlSnapshot.save();
        showBootstrapToast("Snapshot salvato correttamente", "success");
      } catch (e) {
        try { consoleLog.warn(e); } catch { }
        showBootstrapToast("Errore durante il salvataggio dello snapshot", "danger");
      }
    });


  }

  /* --- Icona Snapshot via Mail (bundle leggero) --- */
  let iconSnapshotShare = document.getElementById("iconSnapshotShare");
  if (!iconSnapshotShare) {
    iconSnapshotShare = document.createElement("div");
    iconSnapshotShare.id = "iconSnapshotShare";
    iconSnapshotShare.title = "Condividi snapshot";
    const i = document.createElement("i");
    i.className = "fas fa-share";
    iconSnapshotShare.appendChild(i);
    container.appendChild(iconSnapshotShare);

    iconSnapshotShare.addEventListener("click", function (e) {
      const provider = e.altKey ? "gmail" : "outlook";
      (
        emailUtil && emailUtil.sendSupportBundle
          ? emailUtil.sendSupportBundle({
            provider,
            webShare: "never",
            htmlSelector: "#containerEmulatorInside"
          })
          : emailUtil.sendSnapshot({ provider })
      )
        .then(() => {
          showBootstrapToast("Condivisione avviata correttamente", "success");
        })
        .catch(err => {

          try {
            consoleLog.warn("Send bundle", "Errore", err?.message || String(err));
          } catch { }
          showBootstrapToast("Errore durante la condivisione", "danger");
        });
    });
  }

  /* --- Icona Json View --- */
  let iconJsonView = document.getElementById("iconJsonView");
  if (!iconJsonView) {
    iconJsonView = document.createElement("div");
    iconJsonView.id = "iconJsonView";
    iconJsonView.title = "Json view";
    const i = document.createElement("i");
    i.className = "fas fa fa-code";
    iconJsonView.appendChild(i);
    container.appendChild(iconJsonView);

    iconJsonView.addEventListener("click", function () {
      try {
        handleJsonView();
        showBootstrapToast("Json view aperta", "info");
      } catch (e) {
        try { consoleLog.warn(e); } catch { }
        showBootstrapToast("Errore apertura Json view", "danger");
      }
    });
  }

  /* --- Icona Menu (Attn) --- */
  let iconMenu = document.getElementById("iconMenu");
  if (!iconMenu) {
    iconMenu = document.createElement("div");
    iconMenu.id = "iconMenu";
    iconMenu.title = "Funzioni";
    const i = document.createElement("i");
    i.className = "far fa-list-alt";
    iconMenu.appendChild(i);
    container.appendChild(iconMenu);

    iconMenu.addEventListener("click", function () {
      try {
        pressKey('Attn');
        showBootstrapToast("Menu funzioni aperto", "secondary");
      } catch (e) {
        try { consoleLog.warn(e); } catch { }
        showBootstrapToast("Errore apertura menu", "danger");
      }
    });
  }

  /* --- Icona Storage --- */
  let iconStorage = document.getElementById("iconStorage");
  if (!iconStorage) {
    iconStorage = document.createElement("div");
    iconStorage.id = "iconStorage";
    iconStorage.title = "Storage";
    const i = document.createElement("i");
    iconStorage.appendChild(i);
    container.appendChild(iconStorage);

    /* --- Icona Storage --- */

    iconStorage.addEventListener("click", function () {
      try {
        localCache?.clearAll?.();
        if (isMainMenuAppCore) {
          clearDataStorageByPrefix("session");
          clearDataStorageByPrefix("cookie");
        }
        showBootstrapToast("Storage pulito correttamente", "warning");
      } catch (e) {
        try { consoleLog.warn(e); } catch { }
        showBootstrapToast("Errore pulizia storage", "danger");
      }
    });
  }
  {
    const i = iconStorage.querySelector("i");
    if (i) i.className = "fa " + (isMainMenuAppCore ? "fa-database" : "fa-memory");
  }

  /* --- Icona Signoff --- */
  let iconSignoff = document.getElementById("iconSignoff");
  if (!iconSignoff) {
    iconSignoff = document.createElement("div");
    iconSignoff.id = "iconSignoff";
    iconSignoff.title = "Signoff";
    const i = document.createElement("i");
    i.className = "fa fa-power-off";
    iconSignoff.appendChild(i);
    container.appendChild(iconSignoff);

    iconSignoff.addEventListener("click", function () {
      showBootstrapToast("Disconnessione in corso...", "dark");
      setTimeout(() => {
        try {
          window.location.href = getUrl.href();
        } catch (e) {
          try { consoleLog.warn(e); } catch { }
          showBootstrapToast("Errore durante il signoff", "danger");
        }
      }, 300);
    });
  }

  /* --- Offcanvas Info / Impostazioni --- */
  let iconEmulatorInfo = document.getElementById("iconEmulatorInfo");
  if (!iconEmulatorInfo) {
    iconEmulatorInfo = document.createElement("div");
    iconEmulatorInfo.id = "iconEmulatorInfo";
    iconEmulatorInfo.className = "info";

    const btn = document.createElement("button");
    btn.className = "btn btn-white fas fa-ellipsis-v";
    btn.type = "button";
    btn.id = "MenuInfoItemsButton";
    btn.setAttribute("data-bs-toggle", "offcanvas");
    btn.setAttribute("data-bs-target", "#offcanvasMenuInfoItems");
    btn.setAttribute("aria-controls", "offcanvasMenuInfoItems");
    btn.setAttribute("aria-label", "Apri informazioni e impostazioni");
    iconEmulatorInfo.appendChild(btn);

    let offcanvas = document.getElementById("offcanvasMenuInfoItems");
    if (!offcanvas) {
      offcanvas = document.createElement("div");
      offcanvas.id = "offcanvasMenuInfoItems";
      offcanvas.className = "offcanvas offcanvas-end menu-info-offcanvas";
      offcanvas.tabIndex = -1;
      offcanvas.setAttribute("aria-labelledby", "offcanvasMenuInfoItemsLabel");

      offcanvas.innerHTML = `
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasMenuInfoItemsLabel">Informazioni e impostazioni</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Chiudi"></button>
        </div>
        <div class="offcanvas-body">
          <div id="ulMenuInfoItems" class="menu-info-panel"></div>
        </div>
      `;

      document.body.appendChild(offcanvas);
    }

    const ulOps = document.createElement("div");
    ulOps.id = "ulEmulatorOpDropDown";
    ulOps.style.display = "none";
    iconEmulatorInfo.appendChild(ulOps);

    container.appendChild(iconEmulatorInfo);
    container.style.setProperty("display", "inline-flex", "important");
  }
};

/* ========= Reset/Populate voci dropdown (senza jQuery) ========= */

resetMenuInfoItems = function () {
  const panel = document.getElementById("ulMenuInfoItems");
  const ul2 = document.getElementById("ulEmulatorOpDropDown");

  if (panel) panel.innerHTML = "";
  if (ul2) ul2.innerHTML = "";
};

populateMenuInfoItems = function () {
  const ul = document.getElementById("ulMenuInfoItems");
  if (!ul) return;

  ul.className = "menu-info-panel";
  ul.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "menuWrapper";

  const nav = document.createElement("div");
  nav.className = "nav flex-column nav-pills";
  nav.id = "menuNav";
  nav.setAttribute("role", "tablist");
  nav.setAttribute("aria-orientation", "vertical");

  function makeNavBtn(id, label, active = false) {
    const b = document.createElement("button");
    b.className = "nav-link" + (active ? " active" : "");
    b.id = id + "-tab";
    b.type = "button";
    b.role = "tab";
    b.setAttribute("data-bs-toggle", "pill");
    b.setAttribute("data-bs-target", "#" + id);
    b.setAttribute("aria-controls", id);
    b.setAttribute("aria-selected", active ? "true" : "false");
    b.textContent = label;
    return b;
  }

  nav.append(
    makeNavBtn("tab-info", "Info", true),
    makeNavBtn("tab-app", "Info Applicativo"),
    makeNavBtn("tab-settings", "Impostazioni Utente"),
    makeNavBtn("tab-help", "Aiuto")
  );

  const content = document.createElement("div");
  content.className = "tab-content flex-grow-1";
  content.id = "menuNavContent";

  function makePane(id, active = false) {
    const pane = document.createElement("div");
    pane.className = "tab-pane fade" + (active ? " show active" : "");
    pane.id = id;
    pane.role = "tabpanel";
    pane.setAttribute("aria-labelledby", id + "-tab");
    pane.style.minWidth = "0";
    return pane;
  }

  const paneInfo = makePane("tab-info", true);
  const paneApp = makePane("tab-app");
  const paneSet = makePane("tab-settings");
  const paneHelp = makePane("tab-help");

  function row(iconHtml, innerHtml) {
    const r = document.createElement("div");
    r.className = "dropdown-item d-flex align-items-center";
    r.style.width = "100%";
    r.innerHTML = iconHtml + innerHtml;
    return r;
  }

  function takeItem(keyword, iconHtml) {
    if (!Array.isArray(menuInfoItems)) return null;
    for (let i = 0; i < menuInfoItems.length; i++) {
      const it = menuInfoItems[i];
      if (typeof it === "string" && it.includes(keyword)) {
        return row(iconHtml, it);
      }
    }
    return null;
  }

  const sysName = takeItem("Sistema", '<div class="iconUlMenuInfoItems"><i class="fas fa-desktop"></i></div>');
  const userName = takeItem("Utente", '<div class="iconUlMenuInfoItems"><i class="fa fa-user"></i></div>');
  const jobName = takeItem("Lavoro", '<div class="iconUlMenuInfoItems"><i class="fa fa-solid fa-laptop"></i></div>');
  [sysName, userName, jobName].forEach(x => { if (x) paneInfo.appendChild(x); });

  const company = takeItem("Societa", '<div class="iconUlMenuInfoItems"><i class="fas fa-building"></i></div>');
  const environment = takeItem("Ambiente", '<div class="iconUlMenuInfoItems"><i class="fab fa-envira"></i></div>');
  const programName = takeItem("Programma", '<div class="iconUlMenuInfoItems"><i class="fas fa-microchip"></i></div>');
  const applicationFunction = takeItem("Funzione applicativa", '<div class="iconUlMenuInfoItems"><i class="fas fa-screwdriver"></i></div>');
  const selectionFunction = takeItem("Funzione selettiva", '<div class="iconUlMenuInfoItems"><i class="fas fa-seedling"></i></div>');

  function buildMenuAppCoreRow() {
    const name = getMenuAppCore.name();
    const icon = '<div class="iconUlMenuInfoItems"><i class="fas fa-bars"></i></div>';
    const inner = '<div class="labelMenuInfoItems">Menu AppCore</div><div class="valueMenuInfoItems">' + name + '</div>';
    return row(icon, inner);
  }

  if (company) paneApp.appendChild(company);
  if (environment) paneApp.appendChild(environment);
  if (Boolean(isMenuAppCore)) paneApp.appendChild(buildMenuAppCoreRow());
  if (programName) paneApp.appendChild(programName);
  if (applicationFunction) paneApp.appendChild(applicationFunction);
  if (selectionFunction) paneApp.appendChild(selectionFunction);


  // Versione applicazione
  {
    const versionRow = row(
      '<div class="iconUlMenuInfoItems"><i class="fas fa-code-branch"></i></div>',
      '<div class="labelMenuInfoItems">Versione applicativo</div>' +
      '<div class="valueMenuInfoItems text-primary text-decoration-underline" style="cursor:pointer;">' +
      getAppVersion() +
      '</div>'
    );

    versionRow.style.cursor = "pointer";

    versionRow.addEventListener("click", async function () {

      try {
        const changelogUrl = "/profoundui/userdata/genie skins/" + pui.skin + "/docs/Version/CHANGELOG.md";
        const response = await fetch(changelogUrl);

        if (!response.ok) {
          throw new Error("Errore caricamento changelog");
        }

        const changelogText = await response.text();

        showChangelogModal(changelogText);

      } catch (err) {

        consoleLog?.warn?.(err);

        showBootstrapToast(
          "Errore apertura changelog",
          "danger"
        );
      }
    });

    paneApp.appendChild(versionRow);
  }


  // 1) Tipo label
  {
    const current = getDataStorage("showTypeLabel", "local") || "outLabel";

    const rowEl = document.createElement("div");
    rowEl.className = "dropdown-item d-flex align-items-center";
    rowEl.style.gap = ".75rem";

    const icon = document.createElement("div");
    icon.className = "iconUlMenuInfoItems";
    icon.innerHTML = '<i class="fas fa-vest"></i>';

    const label = document.createElement("div");
    label.className = "labelMenuInfoItems";
    label.textContent = "Tipo label";

    const value = document.createElement("div");
    value.className = "valueMenuInfoItems";

    const group = document.createElement("div");
    group.className = "btn-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Tipo label");

    const btnOutside = document.createElement("button");
    btnOutside.type = "button";
    btnOutside.className = "btn btn-sm btn-outline-primary";
    btnOutside.textContent = "Sopra";

    const btnMiddle = document.createElement("button");
    btnMiddle.type = "button";
    btnMiddle.className = "btn btn-sm btn-outline-primary";
    btnMiddle.textContent = "In mezzo";

    const btnInside = document.createElement("button");
    btnInside.type = "button";
    btnInside.className = "btn btn-sm btn-outline-primary";
    btnInside.textContent = "Sotto";

    function updateActive(sel) {
      [btnOutside, btnMiddle, btnInside].forEach(b => b.classList.remove("active"));
      if (sel === "outLabel") btnOutside.classList.add("active");
      if (sel === "middleLabel") btnMiddle.classList.add("active");
      if (sel === "insideLabel") btnInside.classList.add("active");
    }

    btnOutside.addEventListener("click", () => {
      setDataStorage("showTypeLabel", "outLabel", "local");
      showTypeLabel = "outLabel";
      pressKey('F5');
      updateActive("outLabel");
    });
    btnMiddle.addEventListener("click", () => {
      setDataStorage("showTypeLabel", "middleLabel", "local");
      showTypeLabel = "middleLabel";
      pressKey('F5');
      updateActive("middleLabel");
    });
    btnInside.addEventListener("click", () => {
      setDataStorage("showTypeLabel", "insideLabel", "local");
      showTypeLabel = "insideLabel";
      pressKey('F5');
      updateActive("insideLabel");
    });

    updateActive(current);

    group.append(btnOutside, btnMiddle, btnInside);
    value.appendChild(group);
    rowEl.append(icon, label, value);
    paneSet.appendChild(rowEl);
  }

  // 1-bis) Densità righe
  {
    const currentDensity = getDataStorage(DENSITY_STORAGE_KEY, "local") || "normal";

    const rowEl = document.createElement("div");
    rowEl.className = "dropdown-item d-flex align-items-center justify-content-between";
    rowEl.style.gap = ".75rem";

    const icon = document.createElement("div");
    icon.className = "iconUlMenuInfoItems";
    icon.innerHTML = '<i class="fas fa-grip-lines"></i>';

    const label = document.createElement("div");
    label.className = "labelMenuInfoItems";
    label.textContent = "Densità";

    const value = document.createElement("div");
    value.className = "valueMenuInfoItems";

    const group = document.createElement("div");
    group.className = "btn-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Densità righe");

    const btnCompact = document.createElement("button");
    btnCompact.type = "button";
    btnCompact.className = "btn btn-sm btn-outline-primary";
    btnCompact.textContent = "Compatta";

    const btnNormal = document.createElement("button");
    btnNormal.type = "button";
    btnNormal.className = "btn btn-sm btn-outline-primary";
    btnNormal.textContent = "Normale";

    const btnComfort = document.createElement("button");
    btnComfort.type = "button";
    btnComfort.className = "btn btn-sm btn-outline-primary";
    btnComfort.textContent = "Ampia";

    function updateDensityActive(mode) {
      [btnCompact, btnNormal, btnComfort].forEach(b => b.classList.remove("active"));
      if (mode === "compact") btnCompact.classList.add("active");
      if (mode === "normal") btnNormal.classList.add("active");
      if (mode === "comfortable") btnComfort.classList.add("active");
    }

    btnCompact.addEventListener("click", () => {
      applyRowDensity("compact");
      updateDensityActive("compact");
    });

    btnNormal.addEventListener("click", () => {
      applyRowDensity("normal");
      updateDensityActive("normal");
    });

    btnComfort.addEventListener("click", () => {
      applyRowDensity("comfortable");
      updateDensityActive("comfortable");
    });


    // stato iniziale
    applyRowDensity(currentDensity);
    updateDensityActive(currentDensity);

    group.append(btnCompact, btnNormal, btnComfort);
    value.appendChild(group);
    rowEl.append(icon, label, value);
    paneSet.appendChild(rowEl);
  }

  // 1-ter) Dimensione testo (font +/- per breakpoint)
  {
    // valore corrente da mostrare nel bottone centrale
    let currentFont = (() => {
      const bp = getCurrentBreakpoint();
      const storageKey = getFontStorageKeyForBreakpoint(bp);
      const saved = getDataStorage(storageKey, "local");

      if (saved != null && saved !== "") {
        const n = parseFloat(saved);
        if (!isNaN(n)) return n;
      }

      // fallback: font-size attuale del root
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      return parseFloat(computed.fontSize) || 14;
    })();

    const rowEl = document.createElement("div");
    rowEl.className = "dropdown-item d-flex align-items-center justify-content-between";
    rowEl.style.gap = ".75rem";

    const icon = document.createElement("div");
    icon.className = "iconUlMenuInfoItems";
    icon.innerHTML = '<i class="fas fa-text-height"></i>';

    const label = document.createElement("div");
    label.className = "labelMenuInfoItems";
    label.textContent = "Dimensione testo";

    const value = document.createElement("div");
    value.className = "valueMenuInfoItems";

    const group = document.createElement("div");
    group.className = "btn-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Dimensione testo");

    const btnMinus = document.createElement("button");
    btnMinus.type = "button";
    btnMinus.className = "btn btn-sm btn-outline-primary";
    btnMinus.textContent = "−"; // minus

    const btnValue = document.createElement("button");
    btnValue.type = "button";
    btnValue.className = "btn btn-sm btn-outline-primary disabled";
    btnValue.style.pointerEvents = "none";
    btnValue.style.minWidth = "4.5rem"; // spazio fisso
    btnValue.textContent = Math.round(currentFont) + " px";

    const btnPlus = document.createElement("button");
    btnPlus.type = "button";
    btnPlus.className = "btn btn-sm btn-outline-primary";
    btnPlus.textContent = "+";  // plus

    btnMinus.addEventListener("click", () => {
      changeRootFontSize(-1);   // gestisce breakpoint + salvataggio
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const cur = parseFloat(computed.fontSize) || currentFont;
      currentFont = cur;
      btnValue.textContent = Math.round(cur) + " px";
    });

    btnPlus.addEventListener("click", () => {
      changeRootFontSize(1);    // gestisce breakpoint + salvataggio
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const cur = parseFloat(computed.fontSize) || currentFont;
      currentFont = cur;
      btnValue.textContent = Math.round(cur) + " px";
    });

    group.append(btnMinus, btnValue, btnPlus);
    value.appendChild(group);
    rowEl.append(icon, label, value);
    paneSet.appendChild(rowEl);
  }


  // 2) Etichette tecniche (switch)
  {
    function findLabelAssociated(elem) {
      const group = elem.closest('.input-group');
      if (group?.parentElement?.querySelector('label')) return group.parentElement.querySelector('label');

      const floating = elem.closest('.form-floating');
      if (floating?.querySelector('label')) return floating.querySelector('label');

      const id = elem.getAttribute('id');
      if (id) {
        const byFor = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (byFor) return byFor;
      }
      return null;
    }

    function isEffectivelyHidden(el) {
      if (!el || el.nodeType !== 1) return true;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return true;
      if (el.offsetParent === null && style.position !== "fixed") return true;
      return false;
    }

    function normLabelText(s) {
      return (s || "").replace(/\u00A0/g, " ").trim();
    }
    function isEmptyOrNbsp(s) {
      return normLabelText(s) === "";
    }

    const rowEl = document.createElement("div");
    rowEl.className = "dropdown-item d-flex align-items-center";
    rowEl.innerHTML =
      '<div class="iconUlMenuInfoItems"><i class="fas fa-tags"></i></div>' +
      '<div class="labelMenuInfoItems">Etichette tecniche</div>' +
      '<div class="valueMenuInfoItems"><div class="form-check form-switch" style="margin:0;"><input class="form-check-input" type="checkbox" role="switch" id="switchShowFldName"></div></div>';

    paneSet.appendChild(rowEl);

    const switchInput = rowEl.querySelector("#switchShowFldName");
    switchInput.addEventListener("change", function () {
      const showing = switchInput.checked;

      document.querySelectorAll('[fldname]').forEach(elem => {

        if (elem.matches('td')) return;

        // Se l'elemento è hidden (tipico input display:none con widget visibile),
        // uso come "anchor" il wrapper visibile per trovare correttamente la label.
        let anchor = elem;
        if (isEffectivelyHidden(anchor)) {
          const group = elem.closest('.input-group') || elem.closest('.labelGroupMiddleLabel');
          if (!group || isEffectivelyHidden(group)) return;
          anchor = group;
        }

        const lbl = findLabelAssociated(anchor);
        //if (!lbl) return;
        if (lbl) {
          // Se devo ripristinare, NON skippare la label anche se sembra vuota:
          // la devo poter riportare a nbsp.
          if (showing && isEffectivelyHidden(lbl)) return;

          const nameAttr = elem.getAttribute('name') || '';
          const fldtext = elem.getAttribute('fldtext') || '';

          // Salva SEMPRE l'originale la prima volta (anche se è vuoto/nbsp),
          // preferendo fldtext quando esiste.
          if (lbl.dataset.labelOriginal == null) {
            const current = lbl.textContent; // preserva anche \u00A0
            const preferred = normLabelText(fldtext) ? fldtext : current;
            lbl.dataset.labelOriginal = preferred; // può essere anche "" o "\u00A0"
          }

          if (showing) {
            lbl.textContent = nameAttr;
          } else {
            const original = lbl.dataset.labelOriginal;
            lbl.textContent = isEmptyOrNbsp(original) ? '\u00A0' : original;
          }

          lbl.style.color = '';
          lbl.style.zIndex = '';
        } else {
          // Gestisco solo elementi che sono davvero label/rendered text
          const isDirectLabel =
            elem.matches('.labelField, .labelFieldCustom, label, span, div') ||
            elem.getAttribute('flduse') === 'L';

          if (!isDirectLabel) return;

          if (showing && isEffectivelyHidden(elem)) return;

          const nameAttr = elem.getAttribute('name') || '';
          const fldtext = elem.getAttribute('fldtext') || '';

          if (elem.dataset.labelOriginal == null) {
            const current = elem.textContent;
            const preferred = normLabelText(fldtext) ? fldtext : current;
            elem.dataset.labelOriginal = preferred;
          }

          if (showing) {
            elem.textContent = nameAttr;
          } else {
            const original = elem.dataset.labelOriginal;
            elem.textContent = isEmptyOrNbsp(original) ? '\u00A0' : original;
          }

          elem.style.color = '';
          elem.style.zIndex = '';
        }
      });

      document.querySelectorAll('th[name]').forEach(th => {
        if (isEffectivelyHidden(th)) return;

        const nameAttr = th.getAttribute('name') || '';

        if (th.dataset.labelOriginal == null) {
          // per th salvo SEMPRE il testo originale (anche se vuoto)
          th.dataset.labelOriginal = th.textContent;
        }

        th.textContent = showing ? nameAttr : (isEmptyOrNbsp(th.dataset.labelOriginal) ? '\u00A0' : th.dataset.labelOriginal);

        const charCount = th.textContent.length;
        th.style.minWidth = `${(charCount * 0.6) + 1}rem`;
        th.style.whiteSpace = 'nowrap';
      });
    });
  }

  // 3) Log Console - livello minimo
  {
    const savedEnabled = getDataStorage("showConsoleLog", "local");
    if (savedEnabled !== null) {
      properties.showConsoleLog = (savedEnabled === "true");
    }

    const savedLevel = getDataStorage("minConsoleLevel", "local");
    if (savedLevel) {
      properties.minConsoleLevel = savedLevel;
    }

    const currentLevel = (properties.minConsoleLevel || "error").toLowerCase();

    const rowEl = document.createElement("div");
    rowEl.className = "dropdown-item d-flex align-items-center";
    rowEl.innerHTML =
      '<div class="iconUlMenuInfoItems"><i class="fas fa-terminal"></i></div>' +
      '<div class="labelMenuInfoItems">Log Console</div>' +
      '<div class="valueMenuInfoItems valueMenuInfoItemsConsole">' +
      '<select id="selectMinConsoleLevel" class="form-select form-select-sm border-primary text-primary console-level-select">' +
      '<option value="">Tutti</option>' +
      '<option value="debug">Debug</option>' +
      '<option value="log">Log / Info</option>' +
      '<option value="warn">Warn</option>' +
      '<option value="error">Error</option>' +
      '<option value="off">Disattivato</option>' +
      '</select>' +
      '</div>';

    paneSet.appendChild(rowEl);

    const selectMinConsoleLevel = rowEl.querySelector("#selectMinConsoleLevel");

    if (properties.showConsoleLog === false) {
      selectMinConsoleLevel.value = "off";
    } else {
      selectMinConsoleLevel.value = currentLevel;
    }

    selectMinConsoleLevel.addEventListener("change", function () {
      const selected = selectMinConsoleLevel.value;

      if (selected === "off") {
        properties.showConsoleLog = false;
        setDataStorage("showConsoleLog", "false", "local");
        try { consoleLog.debug("Show console log DISATTIVATO"); } catch { }
        return;
      }

      properties.showConsoleLog = true;
      properties.minConsoleLevel = selected;

      setDataStorage("showConsoleLog", "true", "local");
      setDataStorage("minConsoleLevel", selected, "local");

      try {
        consoleLog.debug("Min console level impostato a " + (selected || "tutti"));
      } catch { }
    });
  }

  // 4) Tasto funzione
  {
    const STORAGE_FUNCTION_KEY = "showFunctionKey";
    const saved = getDataStorage(STORAGE_FUNCTION_KEY, "local");
    properties.showFunctionKey = saved === "true";

    const rowEl = document.createElement("div");
    rowEl.className = "dropdown-item d-flex align-items-center";
    rowEl.innerHTML =
      '<div class="iconUlMenuInfoItems"><i class="fas fa-fill"></i></div>' +
      '<div class="labelMenuInfoItems">Etichetta tasto funzione</div>' +
      '<div class="valueMenuInfoItems"><div class="form-check form-switch" style="margin:0;">' +
      '<input class="form-check-input" type="checkbox" role="switch" id="switchShowFunctionKey">' +
      '</div></div>';
    paneSet.appendChild(rowEl);

    const switchShowFunctionKey = rowEl.querySelector("#switchShowFunctionKey");
    switchShowFunctionKey.checked = !!properties.showFunctionKey;

    switchShowFunctionKey.addEventListener("change", function () {
      properties.showFunctionKey = switchShowFunctionKey.checked;
      setDataStorage(STORAGE_FUNCTION_KEY, properties.showFunctionKey.toString(), "local");
      const status = properties.showFunctionKey ? "ATTIVATO" : "DISATTIVATO";
      try { consoleLog.debug("Show function key " + status); } catch { }
      setTimeout(() => pressKey("F5"), 0);
    });
  }

  // PANE Aiuto
  {
    let genieVersion = "N/D";
    try {
      if (window.pui) {
        if (pui.version) genieVersion = pui.version;
        else if (pui.genie && pui.genie.version) genieVersion = pui.genie.version;
        else if (pui.baseVersion && pui.fixPackVersion) genieVersion = pui.baseVersion + "." + pui.fixPackVersion;
      }
    } catch { }

    const versionRow = document.createElement("div");
    versionRow.className = "dropdown-item d-flex align-items-center";
    versionRow.style.width = "100%";
    versionRow.innerHTML =
      '<div class="iconUlMenuInfoItems"><i class="fas fa-question-circle"></i></div>' +
      '<div class="labelMenuInfoItems">Versione</div><div class="valueMenuInfoItems">' + genieVersion + '</div>';

    const paneHelp = document.getElementById("tab-help") || document.createElement("div"); // safety
    if (!paneHelp.id) {
      paneHelp.id = 'tab-help';
      paneHelp.className = 'tab-pane fade show active';
    }
    paneHelp.appendChild(versionRow);
  }

  content.append(paneInfo, paneApp, paneSet, paneHelp);
  wrapper.append(nav, content);
  ul.appendChild(wrapper);
};

removeMenuInfoItems = function () {
  const iconEmulatorInfo = document.getElementById("iconEmulatorInfo");
  const offcanvas = document.getElementById("offcanvasMenuInfoItems");

  if (iconEmulatorInfo) iconEmulatorInfo.remove();
  if (offcanvas) offcanvas.remove();
};

function showBootstrapToast(message, type = "success") {
  let container = document.getElementById("containerToast");

  if (!container) {
    container = document.createElement("div");
    container.id = "containerToast";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "99999";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fas fa-check-circle me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, {
    delay: 2500,
    autohide: true
  });

  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

function showChangelogModal(content) {

  let modalEl = document.getElementById("modalChangelog");

  if (!modalEl) {

    modalEl = document.createElement("div");
    modalEl.id = "modalChangelog";
    modalEl.className = "modal fade";

    modalEl.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">
              Changelog applicativo
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal">
            </button>
          </div>

          <div class="modal-body">
            <pre id="modalChangelogContent"
                 style="
                   white-space: pre-wrap;
                   font-size: .9rem;
                   margin:0;
                 ">
            </pre>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modalEl);
  }

  const body = modalEl.querySelector("#modalChangelogContent");

  body.textContent = content;

  const modal = new bootstrap.Modal(modalEl);

  modal.show();
}